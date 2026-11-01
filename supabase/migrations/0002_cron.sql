-- ============================================================================
-- Blood MVP | 0002_cron.sql   (SUPABASE ONLY - not run by run_db_tests.sh)
-- Needs: Database > Extensions: pg_cron, pg_net (enable them in the dashboard first)
-- Needs two Vault secrets (create ONCE in the SQL editor; replace the values):
--   select vault.create_secret('https://YOUR-APP.vercel.app', 'app_url');
--   select vault.create_secret('PUT-A-LONG-RANDOM-STRING-HERE', 'cron_secret');
-- The same cron_secret value must be set in the app as CRON_SECRET.
-- ============================================================================
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Calls the app's /api/internal/tick ONLY when some request is due (so idle = zero cost).
create or replace function public.call_tick() returns void
language plpgsql security definer set search_path = public, extensions as $$
declare v_url text; v_secret text;
begin
  if not exists (select 1 from public.requests where status = 'searching' and next_tick_at <= now()) then
    return;
  end if;
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'app_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'cron_secret';
  if v_url is null or v_secret is null then
    raise warning 'call_tick: vault secrets app_url / cron_secret are missing';
    return;
  end if;
  perform net.http_post(
    url     := v_url || '/api/internal/tick',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_secret),
    body    := '{}'::jsonb,
    timeout_milliseconds := 8000);
end $$;
revoke all on function public.call_tick() from public, anon, authenticated;

-- Expire very old requests and stop their pending contacts.
create or replace function public.expire_old_requests() returns void
language plpgsql security definer set search_path = public as $$
begin
  with e as (
    update public.requests
       set status = 'expired', closed_at = now(), close_reason = 'needed_by_passed'
     where status in ('searching','waiting_requester','enough_donors')
       and needed_by < now() - interval '6 hours'
    returning id)
  update public.request_contacts set status = 'cancelled'
   where request_id in (select id from e) and status in ('queued','contacting');
end $$;
revoke all on function public.expire_old_requests() from public, anon, authenticated;

-- Schedules. If your pg_cron version does not support '30 seconds', use '* * * * *' (every minute).
select cron.schedule('blood-tick',    '30 seconds', 'select public.call_tick()');
select cron.schedule('blood-expire',  '*/10 * * * *', 'select public.expire_old_requests()');
select cron.schedule('blood-cleanup', '0 3 * * *', $$
  delete from public.rate_limits   where window_start < now() - interval '2 days';
  delete from public.webhook_events where received_at < now() - interval '30 days';
  delete from public.message_events where created_at  < now() - interval '90 days';
$$);
