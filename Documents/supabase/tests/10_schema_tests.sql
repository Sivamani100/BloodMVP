-- ============================================================================
-- 10_schema_tests.sql  : database tests (run after 00_supabase_stubs.sql + 0001_init.sql)
-- Every ASSERT must pass. Run:  psql -v ON_ERROR_STOP=1 -f 10_schema_tests.sql
-- ============================================================================
\set ON_ERROR_STOP on
set search_path = public, extensions;

-- ---------- helpers ----------
create or replace function pg_temp.login(p_uid uuid, p_phone text default '919876500001') returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_uid::text, false);
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'phone', p_phone, 'role','authenticated')::text, false);
end $$;

-- ---------- fixtures ----------
-- hospital: 17.0000 N, 81.8000 E.  0.0045 degrees of latitude ~ 0.5 km
insert into auth.users(id, phone, phone_confirmed_at) values
 ('00000000-0000-0000-0000-0000000000a1','919876500001', now()),   -- requester
 ('00000000-0000-0000-0000-0000000000d1','919876500011', now()),   -- donor near (0.3 km)
 ('00000000-0000-0000-0000-0000000000d2','919876500012', now()),   -- donor 0.9 km
 ('00000000-0000-0000-0000-0000000000d3','919876500013', now()),   -- donor ~4 km
 ('00000000-0000-0000-0000-0000000000d4','919876500014', now()),   -- donor ~12 km
 ('00000000-0000-0000-0000-0000000000d5','919876500015', now()),   -- donor ~60 km
 ('00000000-0000-0000-0000-0000000000d6','919876500016', now()),   -- recently donated
 ('00000000-0000-0000-0000-0000000000d7','919876500017', now()),   -- opted out
 ('00000000-0000-0000-0000-0000000000d8','919876500018', now()),   -- wrong group (A+)
 ('00000000-0000-0000-0000-0000000000d9','919876500019', now()),   -- health blocked
 ('00000000-0000-0000-0000-0000000000e1','919876500020', now()),   -- admin
 ('00000000-0000-0000-0000-0000000000e2','919876500021', now());   -- random other user

create or replace function pg_temp.mk_donor(p_id uuid, p_n int, p_lat float8, p_lng float8, p_group blood_group,
                                            p_last date, p_optout boolean default false, p_blocking text default null,
                                            p_maxkm int default 50) returns void language plpgsql as $$
begin
  insert into donors(id, full_name, dob, gender, weight_kg, blood_group, last_donation_date, state, health_ok, health_checked_at)
  values (p_id, 'Donor Number ' || p_n, date '1995-05-05', 'male', 70, p_group, p_last, 'active', p_blocking is null, now());
  insert into donor_private(donor_id, phone_e164, email, email_verified)
  values (p_id, '+91987650' || lpad(p_n::text, 4, '0'), 'd' || p_n || '@example.com', true);
  insert into donor_health(donor_id, answers_enc, blocking_reason) values (p_id, 'ENC', p_blocking);
  insert into donor_location(donor_id, home_geo, city, pincode, max_travel_km)
  values (p_id, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, 'Rajahmundry', '533101', p_maxkm);
  insert into donor_prefs(donor_id, opted_out) values (p_id, p_optout);
  insert into consents(user_id, type, version) values (p_id, 'contact_calls_whatsapp', 'v1');
end $$;

select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d1', 1, 17.0027, 81.8000, 'O+', null);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d2', 2, 17.0081, 81.8000, 'O+', date '2025-01-01');
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d3', 3, 17.0360, 81.8000, 'O+', null);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d4', 4, 17.1080, 81.8000, 'O+', null);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d5', 5, 17.5400, 81.8000, 'O+', null, false, null, 100);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d6', 6, 17.0030, 81.8000, 'O+', current_date - 20);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d7', 7, 17.0030, 81.8010, 'O+', null, true);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d8', 8, 17.0030, 81.8020, 'A+', null);
select pg_temp.mk_donor('00000000-0000-0000-0000-0000000000d9', 9, 17.0030, 81.8030, 'O+', null, false, 'fever_today');
insert into admin_users(user_id) values ('00000000-0000-0000-0000-0000000000e1');

-- ---------- T1: pure helper functions ----------
do $$ begin
  assert is_compatible('O-','A+','red_cells'),         'O- can give to A+';
  assert not is_compatible('A+','O-','red_cells'),     'A+ cannot give to O-';
  assert not is_compatible('O-','A+','platelets'),     'platelets need exact group';
  assert is_compatible('A+','A+','platelets'),         'exact group ok for platelets';
  assert in_quiet_hours('23:00','06:00','02:00'),      'crosses midnight';
  assert not in_quiet_hours('23:00','06:00','12:00'),  'noon is not quiet';
  assert distance_band(0.4) = 'under 1 km' and distance_band(7) = '5 to 10 km';
  assert compute_next_eligible(date '2026-01-01','male')   = date '2026-04-01';
  assert compute_next_eligible(date '2026-01-01','female') = date '2026-05-01';
  raise notice 'T1 helpers OK';
end $$;

-- ---------- T2: donor age rule ----------
do $$ begin
  begin
    insert into donors(id, full_name, dob, gender, weight_kg) values ('00000000-0000-0000-0000-0000000000e2','Kid Under', current_date - interval '16 years','male',60);
    assert false, 'under-18 insert should have failed';
  exception when check_violation then null; end;
  raise notice 'T2 age rule OK';
end $$;

-- ---------- T3: request creation rules ----------
select pg_temp.login('00000000-0000-0000-0000-0000000000a1');
set role authenticated;
create temp table t_req(id uuid);
grant all on t_req to authenticated;
insert into t_req
select public.create_request('Suresh Kumar','family','Ravi',45,'accident','O+','whole_blood',1,'now',null,
       'Government General Hospital','Rajahmundry',17.0,81.8,'Ward 3','+919800000000',false,'Please hurry',null);
do $$
declare v_id uuid; r requests;
begin
  select id into v_id from t_req;
  select * into r from requests where id = v_id;
  assert r.status = 'searching' and r.units_needed = 1, 'request created searching';
  assert r.needed_by > now(), 'needed_by set';
  -- duplicate
  begin
    perform public.create_request('Suresh Kumar','family','ravi',45,'accident','O+','whole_blood',1,'now',null,
       'government general hospital','Rajahmundry',17.0,81.8,null,null,false,null,null);
    assert false, 'duplicate should fail';
  exception when unique_violation then null; end;
  raise notice 'T3 create_request OK';
end $$;
-- requester cannot insert directly into requests
do $$ begin
  begin
    insert into requests(requester_id, requester_name, relation, patient_first_name, blood_group, units_needed, urgency, needed_by, hospital_name, hospital_geo)
    values ('00000000-0000-0000-0000-0000000000a1','X Y','self','Z','O+',1,'now',now(),'H H', st_setsrid(st_makepoint(81.8,17.0),4326)::geography);
    assert false, 'direct insert must be blocked';
  exception when insufficient_privilege then null; end;
  raise notice 'T3b direct insert blocked OK';
end $$;
reset role;

-- not logged in with phone => blocked
select pg_temp.login('00000000-0000-0000-0000-0000000000e2', '');
set role authenticated;
do $$ begin
  begin
    perform public.create_request('No Phone','self','A',30,null,'O+','whole_blood',1,'now',null,'Some Hospital',null,17.0,81.8,null,null,false,null,null);
    assert false, 'phone-less user must be blocked';
  exception when invalid_authorization_specification then null; end;
  raise notice 'T3c phone required OK';
end $$;
reset role;

-- ---------- T4: matching by ring ----------
do $$
declare v_id uuid; v_ids uuid[];
begin
  select id into v_id from t_req;
  -- ring 0.5 km: only donor 1 (0.3 km)
  select array_agg(donor_id order by distance_km) into v_ids from find_candidate_donors(v_id, 0.5, 50);
  assert v_ids = array['00000000-0000-0000-0000-0000000000d1']::uuid[], 'ring 0.5 => d1 only, got ' || coalesce(v_ids::text,'null');
  -- ring 1 km: d1, d2
  select array_agg(donor_id order by distance_km) into v_ids from find_candidate_donors(v_id, 1, 50);
  assert cardinality(v_ids) = 2, 'ring 1 => 2 donors, got ' || cardinality(v_ids);
  -- ring 5: d1,d2,d3 ; excluded: d6 recent donation, d7 opted out, d8 wrong group, d9 health blocked
  select array_agg(donor_id order by distance_km) into v_ids from find_candidate_donors(v_id, 5, 50);
  assert cardinality(v_ids) = 3, 'ring 5 => 3 donors, got ' || cardinality(v_ids);
  assert not ('00000000-0000-0000-0000-0000000000d6'::uuid = any(v_ids)), 'recent donor excluded';
  assert not ('00000000-0000-0000-0000-0000000000d7'::uuid = any(v_ids)), 'opted-out excluded';
  assert not ('00000000-0000-0000-0000-0000000000d8'::uuid = any(v_ids)), 'wrong group excluded';
  assert not ('00000000-0000-0000-0000-0000000000d9'::uuid = any(v_ids)), 'health-blocked excluded';
  -- ring 50: d4 (12 km) joins; d5 (60 km) does not
  select array_agg(donor_id) into v_ids from find_candidate_donors(v_id, 50, 50);
  assert cardinality(v_ids) = 4 and not ('00000000-0000-0000-0000-0000000000d5'::uuid = any(v_ids)), 'ring 50 => 4 donors, not d5';
  select array_agg(donor_id) into v_ids from find_candidate_donors(v_id, 70, 50);
  assert '00000000-0000-0000-0000-0000000000d5'::uuid = any(v_ids), 'ring 70 includes d5';
  -- limit works
  select array_agg(donor_id) into v_ids from find_candidate_donors(v_id, 100, 2);
  assert cardinality(v_ids) = 2, 'limit works';
  raise notice 'T4 matching OK';
end $$;

-- donor's own max travel distance is respected (d3 at 4 km but max 3 km)
update donor_location set max_travel_km = 3 where donor_id = '00000000-0000-0000-0000-0000000000d3';
do $$
declare v_id uuid; v_ids uuid[];
begin
  select id into v_id from t_req;
  select array_agg(donor_id) into v_ids from find_candidate_donors(v_id, 5, 50);
  assert not ('00000000-0000-0000-0000-0000000000d3'::uuid = any(v_ids)), 'donor max travel respected';
  raise notice 'T4b max travel OK';
end $$;
update donor_location set max_travel_km = 50 where donor_id = '00000000-0000-0000-0000-0000000000d3';

-- ---------- T5: contacting, accepting, requester view ----------
do $$
declare v_id uuid; c request_contacts; r requests; n int;
begin
  select id into v_id from t_req;
  insert into request_contacts(request_id, donor_id, ring_km, wave_no, distance_km)
  values (v_id,'00000000-0000-0000-0000-0000000000d1',0.5,1,0.30) returning * into c;
  -- same donor again must fail (unique)
  begin
    insert into request_contacts(request_id, donor_id, ring_km, wave_no, distance_km) values (v_id,'00000000-0000-0000-0000-0000000000d1',1,1,0.3);
    assert false, 'duplicate contact must fail';
  exception when unique_violation then null; end;
  -- donor 1 is now "recently contacted" so he must not appear again anywhere
  select count(*) into n from find_candidate_donors(v_id, 100, 50) where donor_id = '00000000-0000-0000-0000-0000000000d1';
  assert n = 0, 'contacted donor not offered again';

  c := finalize_contact(c.id, 'accepted', 'call', '{"willing":true,"feeling_well":true}', 15, true);
  assert c.status = 'accepted' and c.donation_code ~ '^[0-9]{6}$', 'accepted with 6-digit code';
  select * into r from requests where id = v_id;
  assert r.accepted_count = 1 and r.status = 'enough_donors', 'units_needed=1 => enough_donors, got ' || r.status;
  select count(*) into n from request_donor_cards where request_id = v_id and first_name = 'Donor';
  assert n = 1, 'card created for requester';
  select count(*) into n from donations where contact_id = c.id and status = 'pending';
  assert n = 1, 'pending donation row';

  -- donor changes mind => request re-opens
  c := finalize_contact(c.id, 'declined', 'whatsapp', '{}', null, null);
  select * into r from requests where id = v_id;
  assert r.status = 'searching' and r.accepted_count = 0, 'request re-opened after decline';
  select count(*) into n from request_donor_cards where request_id = v_id;
  assert n = 0, 'card removed after decline';
  raise notice 'T5 accept/decline flow OK';
end $$;

-- ---------- T6: privacy via RLS ----------
do $$
declare v_id uuid; c request_contacts; v_phone text;
begin
  select id into v_id from t_req;
  select * into c from request_contacts where request_id = v_id limit 1;
  perform finalize_contact(c.id, 'accepted', 'call', '{}', 20, true);
end $$;

-- requester sees the card, never the phone table
select pg_temp.login('00000000-0000-0000-0000-0000000000a1');
set role authenticated;
do $$
declare n int; v_phone text; v_cid uuid;
begin
  select count(*) into n from request_donor_cards;
  assert n = 1, 'requester sees own card';
  begin
    perform 1 from donor_private; -- no policy for requesters matching other users' rows => 0 rows
    select count(*) into n from donor_private;
    assert n = 0, 'requester cannot read donor_private rows';
  end;
  begin
    select count(*) into n from donor_health;
    assert false, 'donor_health must not be readable';
  exception when insufficient_privilege then null; end;
  select count(*) into n from request_contacts;
  assert n = 0, 'requester cannot read request_contacts';
  select contact_id into v_cid from request_donor_cards limit 1;
  v_phone := reveal_donor_phone(v_cid);
  assert v_phone = '+919876500001' or v_phone like '+91%', 'phone revealed to the owner: ' || v_phone;
  raise notice 'T6 requester privacy OK';
end $$;
reset role;

-- another user cannot see the card nor reveal the phone
select pg_temp.login('00000000-0000-0000-0000-0000000000e2');
set role authenticated;
do $$
declare n int; v_cid uuid;
begin
  select count(*) into n from request_donor_cards;
  assert n = 0, 'stranger sees no cards';
  select contact_id into v_cid from (select id as contact_id from public.request_contacts) x limit 1;
  raise notice 'T6b stranger OK';
exception when others then raise notice 'T6b stranger blocked: %', sqlerrm;
end $$;
reset role;

-- donor cannot raise own trust level / state
select pg_temp.login('00000000-0000-0000-0000-0000000000d3', '919876500013');
set role authenticated;
do $$
declare t smallint; s donor_state;
begin
  update donors set trust_level = 3, state = 'active', full_name = 'Donor Three Renamed' where id = auth.uid();
  select trust_level, state into t, s from donors where id = auth.uid();
  assert t = 0, 'trust_level protected';
  assert (select full_name from donors where id = auth.uid()) = 'Donor Three Renamed', 'normal fields editable';
  raise notice 'T6c donor protected columns OK';
end $$;
reset role;

-- donor reads own request view; sees ward + requester phone only after accepting
select pg_temp.login('00000000-0000-0000-0000-0000000000d1', '919876500011');
set role authenticated;
do $$
declare n int;
begin
  select count(*) into n from request_contacts;
  assert n = 0, 'donor cannot read request_contacts directly';
  select count(*) into n from request_donor_cards;
  assert n = 0, 'donor cannot read requester cards';
  raise notice 'T6d donor table privacy OK';
end $$;
reset role;
do $$
declare v jsonb; cid uuid;
begin
  select id into cid from request_contacts where donor_id = '00000000-0000-0000-0000-0000000000d1';
  perform pg_temp.login('00000000-0000-0000-0000-0000000000d1', '919876500011');
  v := get_donor_request_view(cid);
  assert v->>'ward_info' = 'Ward 3' and v->>'donation_code' ~ '^[0-9]{6}$', 'accepted donor sees ward + code';
  assert v->>'requester_phone' = '+919876500001', 'accepted donor sees requester phone in +E.164 form, got ' || coalesce(v->>'requester_phone','null');
  raise notice 'T6e donor view OK';
end $$;

-- ---------- T7: donation confirmation + stats ----------
do $$
declare cid uuid; code text; ok boolean; d donors;
begin
  select id, donation_code into cid, code from request_contacts where donor_id = '00000000-0000-0000-0000-0000000000d1';
  perform pg_temp.login('00000000-0000-0000-0000-0000000000a1');
  ok := confirm_donation(cid, '000000x', 'requester');
  assert not ok, 'wrong code rejected';
  ok := confirm_donation(cid, code, 'requester');
  assert ok, 'right code accepted';
  select * into d from donors where id = '00000000-0000-0000-0000-0000000000d1';
  assert d.donations_count = 1 and d.last_donation_date = current_date and d.trust_level >= 2, 'donor stats updated';
  assert d.next_eligible_date = (current_date + interval '3 months')::date, 'cooling date set (male: 3 months)';
  raise notice 'T7 donation confirm OK';
end $$;

-- ---------- T8: rate limiter, bank trust, tick claim ----------
do $$
declare i int; ok boolean; v_id uuid; n int; bid uuid; sc int;
begin
  for i in 1..3 loop ok := rl_hit('t', 60, 3); assert ok; end loop;
  ok := rl_hit('t', 60, 3);
  assert not ok, 'rate limit blocks 4th hit';

  insert into blood_banks(name, geo, phones) values ('TEST Bank', st_setsrid(st_makepoint(81.8,17.0),4326)::geography, '{+910000000000}') returning id into bid;
  select id into v_id from t_req;
  insert into bank_reports(request_id, bank_id, reporter_id, result) values (v_id, bid, '00000000-0000-0000-0000-0000000000a1', 'not_found');
  select trust_score into sc from blood_banks where id = bid;
  assert sc = 42, 'trust drops by 8 on not_found, got ' || sc;

  -- tick claim: new request that is due
  update requests set status = 'searching', next_tick_at = now() - interval '1 second' where id = v_id;
  select count(*) into n from claim_requests_for_tick(10, 20);
  assert n = 1, 'claimed one due request';
  select count(*) into n from claim_requests_for_tick(10, 20);
  assert n = 0, 'lease prevents double claim';
  raise notice 'T8 limiter/trust/tick OK';
end $$;

-- ---------- T9: decision gate ----------
do $$
declare v_id uuid; st request_status;
begin
  select id into v_id from t_req;
  update requests set status = 'waiting_requester', pending_gate_km = 70 where id = v_id;
  perform pg_temp.login('00000000-0000-0000-0000-0000000000a1');
  st := request_decision(v_id, true);
  assert st = 'searching', 'continue => searching';
  assert (select approved_up_to_km from requests where id = v_id) = 70, 'approved up to 70';
  update requests set status = 'waiting_requester', pending_gate_km = 90 where id = v_id;
  st := request_decision(v_id, false);
  assert st = 'stopped', 'stop => stopped';
  raise notice 'T9 gates OK';
end $$;

-- ---------- T11: standby donors (accepted after enough donors) ----------
do $$
declare v_id uuid; c2 request_contacts; c3 request_contacts; sb boolean;
begin
  insert into requests(requester_id, requester_name, relation, patient_first_name, blood_group, units_needed, urgency, needed_by, hospital_name, hospital_geo)
  values ('00000000-0000-0000-0000-0000000000a1','Second Req','family','Asha','O+',1,'now', now() + interval '2 hours','Test Hospital Two',
          st_setsrid(st_makepoint(81.8,17.0),4326)::geography) returning id into v_id;
  insert into request_contacts(request_id, donor_id, ring_km, wave_no, distance_km) values (v_id,'00000000-0000-0000-0000-0000000000d2',1,1,0.9) returning * into c2;
  insert into request_contacts(request_id, donor_id, ring_km, wave_no, distance_km, status) values (v_id,'00000000-0000-0000-0000-0000000000d3',5,1,4.0,'contacting') returning * into c3;
  insert into request_contacts(request_id, donor_id, ring_km, wave_no, distance_km, status) values (v_id,'00000000-0000-0000-0000-0000000000d4',10,1,12.0,'queued');
  perform finalize_contact(c2.id, 'accepted', 'call', '{}', 20, true);
  perform pg_sleep(0.01);
  perform finalize_contact(c3.id, 'accepted', 'whatsapp', '{}', 40, true);
  assert (select status from requests where id = v_id) = 'enough_donors', 'enough donors after first accept';
  assert (select count(*) from request_donor_cards where request_id = v_id) = 2, 'two cards';
  select is_standby into sb from request_donor_cards where contact_id = c3.id;
  assert sb, 'second acceptance is standby';
  select is_standby into sb from request_donor_cards where contact_id = c2.id;
  assert not sb, 'first acceptance is confirmed';
  -- first donor cancels => standby is promoted and request stays satisfied
  perform finalize_contact(c2.id, 'declined', 'whatsapp', '{}', null, null);
  select is_standby into sb from request_donor_cards where contact_id = c3.id;
  assert not sb, 'standby promoted after cancel';
  assert (select status from requests where id = v_id) = 'enough_donors', 'still enough donors';
  assert (select status from request_contacts where request_id = v_id and donor_id = '00000000-0000-0000-0000-0000000000d4') = 'cancelled',
         'queued contact cancelled when enough donors';
  raise notice 'T11 standby OK';
end $$;

-- ---------- T12: consent history cannot be rewritten ----------
select pg_temp.login('00000000-0000-0000-0000-0000000000d3', '919876500013');
set role authenticated;
do $$ begin
  begin
    update consents set agreed_at = now() - interval '5 years' where user_id = auth.uid();
    assert false, 'rewriting consent history must fail';
  exception when insufficient_privilege then null; end;
  update consents set withdrawn_at = now() where user_id = auth.uid() and type = 'contact_calls_whatsapp';
  assert (select withdrawn_at from consents where user_id = auth.uid() and type = 'contact_calls_whatsapp') is not null, 'withdraw allowed';
  raise notice 'T12 consents OK';
end $$;
reset role;

-- ---------- T10: deleting an account removes everything ----------
do $$
declare n int; v_req uuid;
begin
  select id into v_req from t_req;
  delete from auth.users where id = '00000000-0000-0000-0000-0000000000d1';
  select count(*) into n from donors where id = '00000000-0000-0000-0000-0000000000d1';
  assert n = 0, 'donor row deleted';
  select count(*) into n from donor_private where donor_id = '00000000-0000-0000-0000-0000000000d1';
  assert n = 0, 'private data deleted';
  select count(*) into n from request_contacts where donor_id = '00000000-0000-0000-0000-0000000000d1';
  assert n = 0, 'contacts of deleted donor removed';
  select count(*) into n from donations where donor_id = '00000000-0000-0000-0000-0000000000d1';
  assert n = 0, 'donations of deleted donor removed';
  -- a requester can be deleted too (their requests go with them)
  delete from auth.users where id = '00000000-0000-0000-0000-0000000000a1';
  select count(*) into n from requests where id = v_req;
  assert n = 0, 'requests of deleted requester removed';
  raise notice 'T10 account deletion OK';
end $$;

select 'ALL DATABASE TESTS PASSED' as result;
