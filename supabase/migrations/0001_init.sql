-- ============================================================================
-- Blood MVP  |  0001_init.sql
-- Tables, enums, triggers, Row Level Security (RLS), and SQL functions.
-- Works on Supabase (Postgres 15+ with PostGIS). Tested on PostgreSQL 16 + PostGIS 3.4.
-- RULE: every table has RLS ON. No policy = no access for browser users.
-- The server (service_role key) bypasses RLS and is used ONLY inside server code.
-- ============================================================================

create extension if not exists postgis with schema extensions;
set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------
create type public.blood_group     as enum ('A+','A-','B+','B-','O+','O-','AB+','AB-');
create type public.blood_component as enum ('whole_blood','red_cells','platelets','plasma');
create type public.urgency_level   as enum ('now','six_hours','twenty_four_hours','planned');
-- draft = signing up | pending = signed up, waiting for welcome check | active = can be contacted
create type public.donor_state     as enum ('draft','pending','active','suspended','deleted');
-- enough_donors = enough donors confirmed (search stopped) | completed = donation(s) done / closed by requester
create type public.request_status  as enum ('searching','waiting_requester','enough_donors','completed','stopped','cancelled','expired','frozen');
create type public.contact_status  as enum ('queued','contacting','accepted','declined','not_eligible','no_answer','needs_human','cancelled','on_the_way','arrived','donated','no_show');

-- ---------------------------------------------------------------------------
-- 2. SMALL HELPERS
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- admins -------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

create policy admin_users_select_self_or_admin on public.admin_users
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- app settings (kill switch, limits). Server reads with service_role. Admin can edit. --
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy app_settings_admin_all on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.app_settings(key, value) values
  ('kill_switch',           '{"enabled": false}'),
  ('voice_enabled',         '{"enabled": true}'),
  ('whatsapp_enabled',      '{"enabled": true}'),
  ('max_contacts_per_request','{"value": 30}'),
  ('wave_minutes',          '{"now": 3, "six_hours": 8, "twenty_four_hours": 20, "planned": 60}'),
  ('rings_km',              '[0.5,1,2,3,5,10,15,20,30,40,50,70,90,100]'),
  ('gates_km',              '[70,90,100]');

-- simple fixed-window rate limiter -------------------------------------------
create table public.rate_limits (
  key          text        not null,
  window_start timestamptz not null,
  hits         int         not null default 1,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;   -- no policies: server/RPC only

create or replace function public.rl_hit(p_key text, p_window_seconds int, p_max int) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits  int;
begin
  insert into public.rate_limits(key, window_start, hits) values (p_key, v_start, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;
  return v_hits <= p_max;
end $$;

-- audit log -----------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  action      text not null,
  target_type text,
  target_id   text,
  meta        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy audit_logs_admin_select on public.audit_logs
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. DONORS
-- ---------------------------------------------------------------------------
create table public.donors (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text not null check (char_length(btrim(full_name)) between 2 and 80),
  first_name         text generated always as (split_part(btrim(full_name), ' ', 1)) stored,
  dob                date not null,
  gender             text not null check (gender in ('male','female','other')),
  weight_kg          numeric(5,1) not null check (weight_kg between 30 and 250),
  blood_group        public.blood_group,                    -- null = "I'm not sure"
  group_confidence   text not null default 'self_declared'
                     check (group_confidence in ('self_declared','card_seen','bank_confirmed')),
  last_donation_date date,                                  -- null = never donated
  donations_count    int  not null default 0,
  languages          text[] not null default '{en}',
  state              public.donor_state not null default 'draft',
  trust_level        smallint not null default 0 check (trust_level between 0 and 3),
  reliability_score  numeric(4,3) not null default 0.500 check (reliability_score between 0 and 1),
  health_ok          boolean not null default false,        -- result of the latest health quick-check
  health_checked_at  timestamptz,
  next_eligible_date date,                                  -- null = eligible now
  paused_until       timestamptz,
  also_platelets     boolean not null default false,
  welcome_verified_at timestamptz,                          -- welcome call / WhatsApp YES
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table public.donors enable row level security;

create or replace function public.compute_next_eligible(p_last date, p_gender text) returns date
language sql immutable as $$
  select case
    when p_last is null then null
    when p_gender = 'male' then (p_last + interval '3 months')::date
    else (p_last + interval '4 months')::date           -- female / other: the longer gap
  end;
$$;

-- BEFORE trigger #1 (runs first by name): stop browser users from touching protected columns
-- NOTE: not SECURITY DEFINER on purpose. current_user is 'authenticated' for browser requests,
-- and the function owner (postgres) inside our trusted SECURITY DEFINER functions / service_role code.
create or replace function public.donors_a_protect() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated','anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.state := 'draft'; new.trust_level := 0; new.reliability_score := 0.500;
      new.donations_count := 0; new.group_confidence := 'self_declared';
      new.health_ok := false; new.health_checked_at := null; new.welcome_verified_at := null;
    else
      new.state := old.state; new.trust_level := old.trust_level;
      new.reliability_score := old.reliability_score; new.donations_count := old.donations_count;
      new.group_confidence := old.group_confidence; new.health_ok := old.health_ok;
      new.health_checked_at := old.health_checked_at; new.welcome_verified_at := old.welcome_verified_at;
    end if;
  end if;
  return new;
end $$;

-- BEFORE trigger #2: age rule + next eligible date + updated_at
create or replace function public.donors_b_rules() returns trigger
language plpgsql as $$
declare v_age int;
begin
  v_age := date_part('year', age(current_date, new.dob));
  if v_age < 18 or v_age > 65 then
    raise exception 'donor age must be between 18 and 65' using errcode = '23514';
  end if;
  new.next_eligible_date := public.compute_next_eligible(new.last_donation_date, new.gender);
  new.updated_at := now();
  return new;
end $$;

create trigger donors_a_protect before insert or update on public.donors
  for each row execute function public.donors_a_protect();
create trigger donors_b_rules before insert or update on public.donors
  for each row execute function public.donors_b_rules();

create policy donors_select_own on public.donors
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy donors_insert_own on public.donors
  for insert to authenticated with check (id = auth.uid());
create policy donors_update_own on public.donors
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- private contact data (never shown to other users) -------------------------------
create table public.donor_private (
  donor_id        uuid primary key references public.donors(id) on delete cascade,
  phone_e164      text not null unique check (phone_e164 ~ '^\+91[6-9][0-9]{9}$'),
  whatsapp_e164   text check (whatsapp_e164 ~ '^\+91[6-9][0-9]{9}$'),
  email           text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  email_verified  boolean not null default false,
  emergency_name_enc  text,        -- encrypted by the app (AES-256-GCM)
  emergency_phone_enc text,        -- encrypted by the app
  created_at      timestamptz not null default now()
);
alter table public.donor_private enable row level security;
create policy donor_private_select_own on public.donor_private
  for select to authenticated using (donor_id = auth.uid() or public.is_admin());
-- no insert/update policies: phone/email changes go through the server (re-verification needed)

-- health answers: ENCRYPTED BLOB written by the server. No browser access at all. ---
create table public.donor_health (
  donor_id        uuid primary key references public.donors(id) on delete cascade,
  answers_enc     text not null,                 -- AES-256-GCM(JSON) done in server code
  blocking_reason text,                          -- short code, e.g. 'fever_today'; null = OK
  answered_at     timestamptz not null default now(),
  valid_until     timestamptz not null default (now() + interval '6 months')
);
alter table public.donor_health enable row level security;     -- no policies on purpose

create table public.donor_location (
  donor_id      uuid primary key references public.donors(id) on delete cascade,
  home_geo      geography(Point,4326) not null,
  area          text,
  city          text,
  pincode       text check (pincode ~ '^[0-9]{6}$'),
  max_travel_km int  not null default 10 check (max_travel_km in (3,5,10,25,50,100)),
  transport     text check (transport in ('walk','bike','car','bus')),
  updated_at    timestamptz not null default now()
);
create index donor_location_geo_idx on public.donor_location using gist (home_geo);
alter table public.donor_location enable row level security;
create trigger donor_location_updated before update on public.donor_location
  for each row execute function public.set_updated_at();
create policy donor_location_select_own on public.donor_location
  for select to authenticated using (donor_id = auth.uid() or public.is_admin());
create policy donor_location_insert_own on public.donor_location
  for insert to authenticated with check (donor_id = auth.uid());
create policy donor_location_update_own on public.donor_location
  for update to authenticated using (donor_id = auth.uid()) with check (donor_id = auth.uid());

create table public.donor_prefs (
  donor_id                uuid primary key references public.donors(id) on delete cascade,
  quiet_start             time,                         -- India time, e.g. 23:00
  quiet_end               time,                         -- India time, e.g. 06:00
  allow_critical_in_quiet boolean not null default true,
  max_requests_per_month  int not null default 4 check (max_requests_per_month between 1 and 20),
  opted_out               boolean not null default false,   -- replied STOP
  opted_out_at            timestamptz
);
alter table public.donor_prefs enable row level security;
create policy donor_prefs_select_own on public.donor_prefs
  for select to authenticated using (donor_id = auth.uid() or public.is_admin());
create policy donor_prefs_insert_own on public.donor_prefs
  for insert to authenticated with check (donor_id = auth.uid());
create policy donor_prefs_update_own on public.donor_prefs
  for update to authenticated using (donor_id = auth.uid()) with check (donor_id = auth.uid());

-- consent records (append-only for users) ---------------------------------------------
create table public.consents (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in
               ('contact_calls_whatsapp','share_phone_after_yes','data_storage',
                'call_recording','no_money_and_final_check','age_18')),
  version      text not null,
  channel      text not null default 'web',
  agreed_at    timestamptz not null default now(),
  withdrawn_at timestamptz
);
create index consents_user_idx on public.consents(user_id, type);
alter table public.consents enable row level security;
create policy consents_select_own on public.consents
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy consents_insert_own on public.consents
  for insert to authenticated with check (user_id = auth.uid() and withdrawn_at is null);
create policy consents_update_own_withdraw on public.consents
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. BLOOD BANKS
-- ---------------------------------------------------------------------------
create table public.blood_banks (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  address      text,
  city         text,
  district     text,
  state        text not null default 'Andhra Pradesh',
  geo          geography(Point,4326) not null,
  phones       text[] not null default '{}',
  bank_type    text check (bank_type in ('government','private','red_cross','hospital')),
  is_24x7      boolean not null default false,
  hours        text,
  licence_no   text,
  eraktkosh_id text,
  trust_score  int not null default 50 check (trust_score between 0 and 100),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index blood_banks_geo_idx on public.blood_banks using gist (geo);
alter table public.blood_banks enable row level security;
create policy blood_banks_public_read on public.blood_banks
  for select to anon, authenticated using (active);
create policy blood_banks_admin_write on public.blood_banks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.bank_stock (
  bank_id     uuid not null references public.blood_banks(id) on delete cascade,
  blood_group public.blood_group not null,
  component   public.blood_component not null,
  units       int not null check (units >= 0),
  updated_at  timestamptz not null default now(),
  source      text not null check (source in ('eraktkosh','bank','admin_call','user_report')),
  updated_by  uuid,
  primary key (bank_id, blood_group, component)
);
alter table public.bank_stock enable row level security;
create policy bank_stock_public_read on public.bank_stock
  for select to anon, authenticated using (true);
create policy bank_stock_admin_write on public.bank_stock
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. REQUESTS
-- ---------------------------------------------------------------------------
create table public.requests (
  id                 uuid primary key default gen_random_uuid(),
  requester_id       uuid not null references auth.users(id) on delete cascade,
  requester_name     text not null check (char_length(btrim(requester_name)) between 2 and 60),
  relation           text not null check (relation in ('self','family','friend','hospital_staff')),
  patient_first_name text not null check (char_length(btrim(patient_first_name)) between 1 and 40),
  patient_age        smallint check (patient_age between 0 and 120),
  reason             text check (reason in ('accident','surgery','delivery','cancer','thalassemia','dengue','other')),
  blood_group        public.blood_group not null,
  component          public.blood_component not null default 'whole_blood',
  units_needed       smallint not null check (units_needed between 1 and 10),
  urgency            public.urgency_level not null,
  needed_by          timestamptz not null,
  hospital_name      text not null check (char_length(btrim(hospital_name)) between 2 and 120),
  hospital_area      text,
  hospital_geo       geography(Point,4326) not null,
  ward_info          text check (char_length(ward_info) <= 120),        -- shown to donors only after they accept
  hospital_phone     text,                                              -- shown to donors only after they accept
  allow_compatible   boolean not null default false,
  note               text check (char_length(note) <= 300),
  slip_path          text,                                              -- private storage path of the doctor's slip
  slip_verified      boolean not null default false,                    -- set by admin only
  status             public.request_status not null default 'searching',
  current_ring_km    numeric not null default 0,
  wave_no            int not null default 0,
  wave_expires_at    timestamptz,
  next_tick_at       timestamptz not null default now(),
  approved_up_to_km  numeric not null default 50,
  pending_gate_km    numeric,
  exhausted_at       timestamptz,
  accepted_count     int not null default 0,
  contacts_count     int not null default 0,
  created_at         timestamptz not null default now(),
  closed_at          timestamptz,
  close_reason       text
);
create index requests_active_idx on public.requests (next_tick_at) where status = 'searching';
create index requests_requester_idx on public.requests (requester_id, created_at desc);
create index requests_geo_idx on public.requests using gist (hospital_geo);
alter table public.requests enable row level security;
create policy requests_select_own on public.requests
  for select to authenticated using (requester_id = auth.uid() or public.is_admin());
create policy requests_admin_update on public.requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- NO insert policy: creation only via public.create_request()

create table public.request_contacts (
  id                  uuid primary key default gen_random_uuid(),
  request_id          uuid not null references public.requests(id) on delete cascade,
  donor_id            uuid not null references public.donors(id) on delete cascade,
  ring_km             numeric not null,
  wave_no             int not null,
  distance_km         numeric(6,2) not null,
  status              public.contact_status not null default 'queued',
  wa_status           text not null default 'pending'
                      check (wa_status in ('pending','sent','delivered','read','failed','skipped')),
  wa_message_id       text,
  call_status         text not null default 'pending'
                      check (call_status in ('pending','dialing','ringing','answered','completed','no_answer','busy','failed','skipped')),
  call_sid            text,
  answers             jsonb not null default '{}',          -- eligibility answers from the call (sensitive)
  decided_via         text check (decided_via in ('call','whatsapp','admin')),
  decided_at          timestamptz,
  eta_minutes         int,
  share_phone_consent boolean not null default false,
  donation_code       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (request_id, donor_id)
);
create index request_contacts_donor_idx on public.request_contacts (donor_id, created_at desc);
create index request_contacts_queue_idx on public.request_contacts (request_id, status);
create unique index request_contacts_wa_msg_idx on public.request_contacts (wa_message_id) where wa_message_id is not null;
create unique index request_contacts_call_sid_idx on public.request_contacts (call_sid) where call_sid is not null;
alter table public.request_contacts enable row level security;
create trigger request_contacts_updated before update on public.request_contacts
  for each row execute function public.set_updated_at();
create policy request_contacts_admin_select on public.request_contacts
  for select to authenticated using (public.is_admin());
-- donors read their own contact rows only through public.get_donor_request_view()

-- what the REQUESTER is allowed to see about accepted donors (no phone, no address) --------
create table public.request_donor_cards (
  contact_id    uuid primary key references public.request_contacts(id) on delete cascade,
  request_id    uuid not null references public.requests(id) on delete cascade,
  first_name    text not null,
  blood_group   public.blood_group not null,
  distance_band text not null,
  eta_minutes   int,
  trust_level   smallint not null,
  donations_count int not null,
  status        public.contact_status not null,
  is_standby    boolean not null default false,       -- accepted AFTER enough donors were already confirmed
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index request_donor_cards_req_idx on public.request_donor_cards (request_id);
alter table public.request_donor_cards enable row level security;
create policy request_donor_cards_select_owner on public.request_donor_cards
  for select to authenticated
  using (public.is_admin() or exists (select 1 from public.requests r
                                      where r.id = request_donor_cards.request_id and r.requester_id = auth.uid()));

-- donations (proof) ------------------------------------------------------------------
create table public.donations (
  id           uuid primary key default gen_random_uuid(),
  contact_id   uuid not null unique references public.request_contacts(id) on delete cascade,
  donor_id     uuid not null references public.donors(id) on delete cascade,
  request_id   uuid not null references public.requests(id) on delete cascade,
  bank_id      uuid references public.blood_banks(id),
  code         text not null,
  status       text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  confirmed_by text check (confirmed_by in ('requester','bank','admin')),
  confirmed_at timestamptz,
  proof_path   text,
  created_at   timestamptz not null default now()
);
alter table public.donations enable row level security;
create policy donations_select_involved on public.donations
  for select to authenticated
  using (donor_id = auth.uid() or public.is_admin()
         or exists (select 1 from public.requests r where r.id = donations.request_id and r.requester_id = auth.uid()));

-- bank feedback from requesters ("was the stock there?") ----------------------------------
create table public.bank_reports (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references public.requests(id) on delete cascade,
  bank_id     uuid not null references public.blood_banks(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  result      text not null check (result in ('found','not_found')),
  created_at  timestamptz not null default now(),
  unique (request_id, bank_id, reporter_id)
);
alter table public.bank_reports enable row level security;
create policy bank_reports_select_own on public.bank_reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
create policy bank_reports_insert_own on public.bank_reports
  for insert to authenticated
  with check (reporter_id = auth.uid()
              and exists (select 1 from public.requests r where r.id = request_id and r.requester_id = auth.uid()));

create or replace function public.bank_reports_apply_trust() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.blood_banks
     set trust_score = greatest(0, least(100, trust_score + case when new.result = 'found' then 3 else -8 end))
   where id = new.bank_id;
  return new;
end $$;
create trigger bank_reports_trust after insert on public.bank_reports
  for each row execute function public.bank_reports_apply_trust();

-- logs -----------------------------------------------------------------------------------
create table public.message_events (
  id          bigint generated always as identity primary key,
  contact_id  uuid references public.request_contacts(id) on delete set null,
  direction   text not null check (direction in ('out','in')),
  channel     text not null check (channel in ('whatsapp','voice')),
  provider_id text,                       -- WhatsApp message id / call SID
  kind        text not null,              -- e.g. 'template_sent','button_reply','status_update','call_step'
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index message_events_contact_idx on public.message_events (contact_id, created_at);
alter table public.message_events enable row level security;
create policy message_events_admin_select on public.message_events
  for select to authenticated using (public.is_admin());

create table public.webhook_events (          -- idempotency: the same provider event is processed once
  provider    text not null,
  event_id    text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);
alter table public.webhook_events enable row level security;

create table public.abuse_reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('request','donor','bank')),
  target_id   text not null,
  reason      text not null check (char_length(reason) between 3 and 500),
  status      text not null default 'open' check (status in ('open','reviewing','closed')),
  created_at  timestamptz not null default now()
);
alter table public.abuse_reports enable row level security;
create policy abuse_reports_insert_any_user on public.abuse_reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy abuse_reports_admin_all on public.abuse_reports
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. PURE HELPER FUNCTIONS (matching rules)
-- ---------------------------------------------------------------------------
-- Which donor groups can give to a patient group (red cells / whole blood only).
create or replace function public.is_compatible(p_donor public.blood_group, p_patient public.blood_group,
                                                p_component public.blood_component) returns boolean
language sql immutable as $$
  select case
    when p_donor = p_patient then true
    when p_component not in ('whole_blood','red_cells') then false      -- platelets/plasma: exact group only
    else exists (
      select 1 from (values
        ('O-','O-'),
        ('O+','O+'),('O+','O-'),
        ('A-','A-'),('A-','O-'),
        ('A+','A+'),('A+','A-'),('A+','O+'),('A+','O-'),
        ('B-','B-'),('B-','O-'),
        ('B+','B+'),('B+','B-'),('B+','O+'),('B+','O-'),
        ('AB-','AB-'),('AB-','A-'),('AB-','B-'),('AB-','O-'),
        ('AB+','AB+'),('AB+','AB-'),('AB+','A+'),('AB+','A-'),('AB+','B+'),('AB+','B-'),('AB+','O+'),('AB+','O-')
      ) v(patient, donor)
      where v.patient = p_patient::text and v.donor = p_donor::text)
  end;
$$;

create or replace function public.in_quiet_hours(p_start time, p_end time, p_now time) returns boolean
language sql immutable as $$
  select case
    when p_start is null or p_end is null then false
    when p_start = p_end then false
    when p_start < p_end then p_now >= p_start and p_now < p_end
    else p_now >= p_start or p_now < p_end                       -- window crosses midnight
  end;
$$;

create or replace function public.distance_band(p_km numeric) returns text
language sql immutable as $$
  select case
    when p_km < 1  then 'under 1 km'
    when p_km < 3  then '1 to 3 km'
    when p_km < 5  then '3 to 5 km'
    when p_km < 10 then '5 to 10 km'
    when p_km < 25 then '10 to 25 km'
    when p_km < 50 then '25 to 50 km'
    else '50+ km'
  end;
$$;

-- ---------------------------------------------------------------------------
-- 7. TRIGGERS THAT KEEP THE REQUESTER'S VIEW IN SYNC
-- ---------------------------------------------------------------------------
create or replace function public.refresh_request_progress(p_request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_accepted int; v_contacts int; r public.requests;
begin
  select count(*) filter (where status in ('accepted','on_the_way','arrived','donated')),
         count(*)
    into v_accepted, v_contacts
    from public.request_contacts where request_id = p_request_id;

  update public.requests set accepted_count = v_accepted, contacts_count = v_contacts
   where id = p_request_id returning * into r;

  if r.status = 'searching' and v_accepted >= r.units_needed then
    update public.requests set status = 'enough_donors' where id = p_request_id;
    -- stop contacting NEW people. Donors already being contacted may still answer (they become standby).
    update public.request_contacts set status = 'cancelled'
     where request_id = p_request_id and status = 'queued';
  elsif r.status = 'enough_donors' and v_accepted < r.units_needed then
    update public.requests set status = 'searching', next_tick_at = now() where id = p_request_id;
  end if;
end $$;

create or replace function public.request_contacts_after_change() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare d public.donors; v_units int;
begin
  if new.status in ('accepted','on_the_way','arrived','donated') then
    select * into d from public.donors where id = new.donor_id;
    insert into public.request_donor_cards(contact_id, request_id, first_name, blood_group, distance_band,
                                           eta_minutes, trust_level, donations_count, status)
    values (new.id, new.request_id, d.first_name, coalesce(d.blood_group, 'O+'),
            public.distance_band(new.distance_km), new.eta_minutes, d.trust_level, d.donations_count, new.status)
    on conflict (contact_id) do update
       set status = excluded.status, eta_minutes = excluded.eta_minutes, updated_at = now();
  else
    delete from public.request_donor_cards where contact_id = new.id;
  end if;

  -- first N accepted (by time) are "confirmed", the rest are "standby"; recompute for the whole request
  select units_needed into v_units from public.requests where id = new.request_id;
  update public.request_donor_cards k
     set is_standby = (sub.rn > v_units)
    from (select c.id, row_number() over (order by coalesce(c.decided_at, c.created_at), c.id) as rn
            from public.request_contacts c
           where c.request_id = new.request_id
             and c.status in ('accepted','on_the_way','arrived','donated')) sub
   where k.contact_id = sub.id and k.request_id = new.request_id and k.is_standby is distinct from (sub.rn > v_units);

  perform public.refresh_request_progress(new.request_id);
  return null;
end $$;
create trigger request_contacts_after_change
  after insert or update of status, eta_minutes on public.request_contacts
  for each row execute function public.request_contacts_after_change();

create or replace function public.request_contacts_after_delete() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_units int;
begin
  select units_needed into v_units from public.requests where id = old.request_id;
  if v_units is not null then
    update public.request_donor_cards k
       set is_standby = (sub.rn > v_units)
      from (select c.id, row_number() over (order by coalesce(c.decided_at, c.created_at), c.id) as rn
              from public.request_contacts c
             where c.request_id = old.request_id
               and c.status in ('accepted','on_the_way','arrived','donated')) sub
     where k.contact_id = sub.id and k.request_id = old.request_id;
  end if;
  perform public.refresh_request_progress(old.request_id);
  return null;
end $$;
create trigger request_contacts_after_delete
  after delete on public.request_contacts
  for each row execute function public.request_contacts_after_delete();

-- ---------------------------------------------------------------------------
-- 8. MATCHING: who should we contact for this request and ring?   (server only)
-- ---------------------------------------------------------------------------
create or replace function public.find_candidate_donors(p_request_id uuid, p_ring_km numeric, p_limit int)
returns table (donor_id uuid, distance_km numeric)
language sql stable security definer set search_path = public, extensions as $$
  select d.id,
         round((st_distance(l.home_geo, r.hospital_geo) / 1000.0)::numeric, 2)
    from public.requests r
    join public.donors d          on d.state = 'active'
    join public.donor_location l  on l.donor_id = d.id
    join public.donor_prefs p     on p.donor_id = d.id
   where r.id = p_request_id
     and d.blood_group is not null
     and ( d.blood_group = r.blood_group
           or (r.allow_compatible and public.is_compatible(d.blood_group, r.blood_group, r.component)) )
     and (r.component not in ('platelets') or d.also_platelets)
     and d.health_ok
     and exists (select 1 from public.donor_health h
                  where h.donor_id = d.id and h.blocking_reason is null and h.valid_until > now())
     and (d.next_eligible_date is null or d.next_eligible_date <= current_date)
     and (d.paused_until is null or d.paused_until <= now())
     and not p.opted_out
     and d.id <> r.requester_id
     and st_dwithin(l.home_geo, r.hospital_geo, least(p_ring_km, l.max_travel_km) * 1000.0)
     and not ( public.in_quiet_hours(p.quiet_start, p.quiet_end,
                                     (now() at time zone 'Asia/Kolkata')::time)
               and not (r.urgency = 'now' and p.allow_critical_in_quiet) )
     and exists (select 1 from public.consents c
                  where c.user_id = d.id and c.type = 'contact_calls_whatsapp' and c.withdrawn_at is null)
     and not exists (select 1 from public.request_contacts c1
                      where c1.request_id = r.id and c1.donor_id = d.id)
     and not exists (select 1 from public.request_contacts c2          -- fatigue: one request per 6 hours
                      where c2.donor_id = d.id and c2.created_at > now() - interval '6 hours'
                        and c2.status <> 'cancelled')
     and (select count(*) from public.request_contacts c3               -- fatigue: max 3 per week
           where c3.donor_id = d.id and c3.created_at > now() - interval '7 days'
             and c3.status <> 'cancelled') < 3
     and (select count(*) from public.request_contacts c4               -- donor's own monthly cap
           where c4.donor_id = d.id and c4.created_at > now() - interval '30 days'
             and c4.status <> 'cancelled') < p.max_requests_per_month
     and not exists (select 1 from public.request_contacts c5           -- already helping someone
                      where c5.donor_id = d.id and c5.status in ('accepted','on_the_way','arrived'))
   order by (d.blood_group = r.blood_group) desc,
            st_distance(l.home_geo, r.hospital_geo) asc,
            d.reliability_score desc
   limit p_limit;
$$;

-- ---------------------------------------------------------------------------
-- 9. REQUEST FUNCTIONS (called by the app)
-- ---------------------------------------------------------------------------
create or replace function public.create_request(
  p_requester_name text, p_relation text, p_patient_first_name text, p_patient_age int, p_reason text,
  p_blood_group public.blood_group, p_component public.blood_component, p_units int,
  p_urgency public.urgency_level, p_needed_by timestamptz,
  p_hospital_name text, p_hospital_area text, p_lat double precision, p_lng double precision,
  p_ward_info text, p_hospital_phone text, p_allow_compatible boolean, p_note text, p_slip_path text
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
  v_needed timestamptz;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if coalesce(auth.jwt() ->> 'phone', '') = '' then
    raise exception 'phone verification required' using errcode = '28000';
  end if;
  if coalesce((select (value ->> 'enabled')::boolean from public.app_settings where key = 'kill_switch'), false) then
    raise exception 'service paused' using errcode = '55000';
  end if;
  if not public.rl_hit('create_request:' || v_uid::text, 86400, 3) then
    raise exception 'too many requests today' using errcode = '54000';
  end if;
  if p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'invalid location' using errcode = '22023';
  end if;
  if exists (select 1 from public.requests
              where requester_id = v_uid and status in ('searching','waiting_requester','enough_donors')
                and lower(patient_first_name) = lower(btrim(p_patient_first_name))
                and lower(hospital_name) = lower(btrim(p_hospital_name))) then
    raise exception 'duplicate active request' using errcode = '23505';
  end if;

  v_needed := coalesce(p_needed_by, now() + case p_urgency
                when 'now' then interval '2 hours' when 'six_hours' then interval '6 hours'
                when 'twenty_four_hours' then interval '24 hours' else interval '72 hours' end);

  insert into public.requests(requester_id, requester_name, relation, patient_first_name, patient_age, reason,
         blood_group, component, units_needed, urgency, needed_by, hospital_name, hospital_area, hospital_geo,
         ward_info, hospital_phone, allow_compatible, note, slip_path)
  values (v_uid, btrim(p_requester_name), p_relation, btrim(p_patient_first_name), p_patient_age, p_reason,
          p_blood_group, p_component, p_units, p_urgency, v_needed, btrim(p_hospital_name), p_hospital_area,
          st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
          p_ward_info, p_hospital_phone, coalesce(p_allow_compatible, false), p_note, p_slip_path)
  returning id into v_id;

  insert into public.audit_logs(actor_id, action, target_type, target_id) values (v_uid, 'create_request', 'request', v_id::text);
  return v_id;
end $$;

-- the requester answers a "continue searching?" popup
create or replace function public.request_decision(p_request_id uuid, p_continue boolean) returns public.request_status
language plpgsql security definer set search_path = public as $$
declare r public.requests;
begin
  select * into r from public.requests where id = p_request_id and requester_id = auth.uid() for update;
  if not found then raise exception 'not found' using errcode = '42501'; end if;
  if r.status <> 'waiting_requester' then return r.status; end if;
  if p_continue then
    update public.requests
       set status = 'searching', approved_up_to_km = coalesce(pending_gate_km, approved_up_to_km),
           pending_gate_km = null, next_tick_at = now()
     where id = p_request_id returning * into r;
  else
    update public.requests set status = 'stopped', closed_at = now(), close_reason = 'requester_stopped_at_gate'
     where id = p_request_id returning * into r;
    update public.request_contacts set status = 'cancelled' where request_id = p_request_id and status in ('queued','contacting');
  end if;
  return r.status;
end $$;

create or replace function public.cancel_request(p_request_id uuid, p_reason text default 'requester_cancelled')
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.requests
     set status = case when p_reason = 'got_blood' then 'completed'::public.request_status else 'cancelled' end,
         closed_at = now(), close_reason = p_reason
   where id = p_request_id and requester_id = auth.uid()
     and status in ('searching','waiting_requester','enough_donors');
  if not found then raise exception 'not found or already closed' using errcode = '42501'; end if;
  update public.request_contacts set status = 'cancelled'
   where request_id = p_request_id and status in ('queued','contacting');
end $$;

-- the requester taps "Call" on an accepted donor: we reveal the phone number (and log it)
create or replace function public.reveal_donor_phone(p_contact_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v_phone text;
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if not public.rl_hit('reveal:' || auth.uid()::text, 3600, 30) then
    raise exception 'too many lookups' using errcode = '54000';
  end if;
  select dp.phone_e164 into v_phone
    from public.request_contacts c
    join public.requests r       on r.id = c.request_id
    join public.donor_private dp on dp.donor_id = c.donor_id
   where c.id = p_contact_id and r.requester_id = auth.uid()
     and c.status in ('accepted','on_the_way','arrived') and c.share_phone_consent;
  if v_phone is null then raise exception 'not allowed' using errcode = '42501'; end if;
  insert into public.audit_logs(actor_id, action, target_type, target_id) values (auth.uid(), 'reveal_phone', 'contact', p_contact_id::text);
  return v_phone;
end $$;

-- what a donor may see about a request they were contacted for
create or replace function public.get_donor_request_view(p_contact_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare c public.request_contacts; r public.requests; v_accepted boolean; v_phone text;
begin
  select * into c from public.request_contacts where id = p_contact_id and donor_id = auth.uid();
  if not found then raise exception 'not found' using errcode = '42501'; end if;
  select * into r from public.requests where id = c.request_id;
  v_accepted := c.status in ('accepted','on_the_way','arrived','donated');
  if v_accepted then
    select u.phone into v_phone from auth.users u where u.id = r.requester_id;
  end if;
  return jsonb_build_object(
    'contact_id', c.id, 'status', c.status, 'request_status', r.status,
    'patient_first_name', r.patient_first_name, 'patient_age', r.patient_age, 'reason', r.reason,
    'blood_group', r.blood_group, 'component', r.component, 'units_needed', r.units_needed,
    'urgency', r.urgency, 'needed_by', r.needed_by,
    'hospital_name', r.hospital_name, 'hospital_area', r.hospital_area,
    'requester_name', r.requester_name, 'relation', r.relation, 'note', r.note,
    'slip_verified', r.slip_verified,
    'hospital_lat', case when v_accepted then st_y(r.hospital_geo::geometry) end,
    'hospital_lng', case when v_accepted then st_x(r.hospital_geo::geometry) end,
    'ward_info',    case when v_accepted then r.ward_info end,
    'hospital_phone', case when v_accepted then r.hospital_phone end,
    'requester_phone', case when v_accepted then (case when v_phone like '+%' then v_phone else '+' || v_phone end) end,
    'donation_code', case when v_accepted then c.donation_code end);
end $$;

-- ---------------------------------------------------------------------------
-- 10. ENGINE FUNCTIONS (called ONLY by server code with the service_role key)
-- ---------------------------------------------------------------------------
-- Claim requests that are due for work. "skip locked" => two ticks never grab the same request.
create or replace function public.claim_requests_for_tick(p_limit int default 10, p_lease_seconds int default 20)
returns setof public.requests
language plpgsql security definer set search_path = public as $$
begin
  return query
    with due as (
      select id from public.requests
       where status = 'searching' and next_tick_at <= now()
       order by next_tick_at
       limit p_limit
       for update skip locked)
    update public.requests r
       set next_tick_at = now() + make_interval(secs => p_lease_seconds)
      from due where r.id = due.id
    returning r.*;
end $$;

-- Latest answer wins, terminal states are final. Returns the updated contact.
create or replace function public.finalize_contact(
  p_contact_id uuid, p_status public.contact_status, p_via text,
  p_answers jsonb default '{}', p_eta int default null, p_share_phone boolean default null
) returns public.request_contacts
language plpgsql security definer set search_path = public as $$
declare c public.request_contacts; v_req_status public.request_status; v_code text;
begin
  select * into c from public.request_contacts where id = p_contact_id for update;
  if not found then raise exception 'contact not found'; end if;
  if c.status in ('donated','cancelled','no_show') then return c; end if;            -- final already

  select status into v_req_status from public.requests where id = c.request_id;
  if p_status = 'accepted' and v_req_status not in ('searching','waiting_requester','enough_donors') then
    update public.request_contacts set status = 'cancelled', decided_via = p_via, decided_at = now()
     where id = p_contact_id returning * into c;
    return c;
  end if;

  if p_status = 'accepted' then
    -- cap: confirmed + standby may not exceed 2x units needed
    if (select count(*) from public.request_contacts x
         where x.request_id = c.request_id and x.id <> c.id
           and x.status in ('accepted','on_the_way','arrived','donated'))
       >= (select units_needed from public.requests where id = c.request_id) * 2 then
      update public.request_contacts set status = 'cancelled', decided_via = p_via, decided_at = now()
       where id = p_contact_id returning * into c;
      return c;
    end if;
  end if;

  if p_status = 'accepted' and c.donation_code is null then
    v_code := lpad((('x' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 7))::bit(28)::int % 1000000)::text, 6, '0');
  end if;

  update public.request_contacts
     set status = p_status, decided_via = p_via, decided_at = clock_timestamp(),
         answers = answers || coalesce(p_answers, '{}'::jsonb),
         eta_minutes = coalesce(p_eta, eta_minutes),
         share_phone_consent = coalesce(p_share_phone, share_phone_consent),
         donation_code = coalesce(donation_code, v_code)
   where id = p_contact_id returning * into c;

  if p_status = 'accepted' then
    insert into public.donations(contact_id, donor_id, request_id, code)
    values (c.id, c.donor_id, c.request_id, c.donation_code)
    on conflict (contact_id) do nothing;
  end if;
  return c;
end $$;

-- Requester or admin confirms a donation using the donation code.
create or replace function public.confirm_donation(p_contact_id uuid, p_code text, p_by text default 'requester')
returns boolean language plpgsql security definer set search_path = public as $$
declare c public.request_contacts; ok boolean;
begin
  select c0.* into c from public.request_contacts c0
    join public.requests r on r.id = c0.request_id
   where c0.id = p_contact_id and (r.requester_id = auth.uid() or public.is_admin() or auth.uid() is null)
   for update of c0;
  if not found then raise exception 'not allowed' using errcode = '42501'; end if;
  if c.donation_code is distinct from p_code then return false; end if;
  update public.donations set status = 'confirmed', confirmed_by = p_by, confirmed_at = now() where contact_id = p_contact_id;
  update public.request_contacts set status = 'donated' where id = p_contact_id;
  update public.donors set last_donation_date = current_date, donations_count = donations_count + 1,
         trust_level = greatest(trust_level, 2)
   where id = c.donor_id;
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- 11. PERMISSIONS (who may call which function)
-- ---------------------------------------------------------------------------
revoke all on function public.find_candidate_donors(uuid, numeric, int) from public, anon, authenticated;
revoke all on function public.claim_requests_for_tick(int, int)         from public, anon, authenticated;
revoke all on function public.finalize_contact(uuid, public.contact_status, text, jsonb, int, boolean) from public, anon, authenticated;
revoke all on function public.rl_hit(text, int, int)                    from public, anon, authenticated;
revoke all on function public.refresh_request_progress(uuid)            from public, anon, authenticated;
grant execute on function public.find_candidate_donors(uuid, numeric, int) to service_role;
grant execute on function public.claim_requests_for_tick(int, int)         to service_role;
grant execute on function public.finalize_contact(uuid, public.contact_status, text, jsonb, int, boolean) to service_role;
grant execute on function public.rl_hit(text, int, int)                    to service_role;
grant execute on function public.refresh_request_progress(uuid)            to service_role;

revoke all on function public.create_request(text,text,text,int,text,public.blood_group,public.blood_component,int,public.urgency_level,timestamptz,text,text,double precision,double precision,text,text,boolean,text,text) from public, anon;
grant execute on function public.create_request(text,text,text,int,text,public.blood_group,public.blood_component,int,public.urgency_level,timestamptz,text,text,double precision,double precision,text,text,boolean,text,text) to authenticated;
revoke all on function public.request_decision(uuid, boolean)            from public, anon;
grant execute on function public.request_decision(uuid, boolean)            to authenticated;
revoke all on function public.cancel_request(uuid, text)                 from public, anon;
grant execute on function public.cancel_request(uuid, text)                 to authenticated;
revoke all on function public.reveal_donor_phone(uuid)                   from public, anon;
grant execute on function public.reveal_donor_phone(uuid)                   to authenticated;
revoke all on function public.get_donor_request_view(uuid)               from public, anon;
grant execute on function public.get_donor_request_view(uuid)               to authenticated;
revoke all on function public.confirm_donation(uuid, text, text)        from public, anon;
grant execute on function public.confirm_donation(uuid, text, text)        to authenticated, service_role;

-- table privileges: RLS decides rows; GRANTs decide the door. Only what the browser needs.
grant select on public.blood_banks, public.bank_stock to anon;
grant select, insert, update on public.donors, public.donor_location, public.donor_prefs to authenticated;
grant select on public.donor_private, public.requests, public.request_donor_cards, public.donations to authenticated;
grant select, insert on public.consents to authenticated;
grant update (withdrawn_at) on public.consents to authenticated;   -- users may only withdraw, never rewrite history
grant select, insert on public.bank_reports, public.abuse_reports to authenticated;
grant select on public.blood_banks, public.bank_stock to authenticated;
-- admin writes: RLS policies above allow only admins; the GRANT just opens the door
grant insert, update, delete on public.blood_banks, public.bank_stock to authenticated;
grant update on public.requests, public.abuse_reports to authenticated;
grant select on public.admin_users, public.audit_logs, public.request_contacts, public.message_events to authenticated;
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 12. REALTIME (Supabase only; harmless elsewhere)
-- The requester's browser listens to these two tables. RLS still applies.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.requests, public.request_donor_cards;
  end if;
end $$;
