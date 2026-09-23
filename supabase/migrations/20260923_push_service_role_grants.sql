begin;

-- These tables are server-only. The service role needs explicit privileges
-- because access was intentionally revoked from browser roles.
grant select, insert, update, delete on table public.admin_push_subscriptions to service_role;
grant select, insert, update, delete on table public.admin_push_deliveries to service_role;

commit;
