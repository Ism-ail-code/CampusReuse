-- ============================================================================
-- CampusReuse — Scheduled expiration job (requires pg_cron extension).
-- pg_cron is available on Supabase. On other hosts, the app also runs
-- expire_stale_items() defensively, so this file is optional.
-- ============================================================================

create extension if not exists pg_cron;

-- Run expiration + reminders hourly.
select cron.schedule(
  'expire-stale-items',
  '0 * * * *',
  $$ select public.expire_stale_items(); $$
);
