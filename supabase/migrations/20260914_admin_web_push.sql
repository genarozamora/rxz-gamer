begin;
create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, user_agent text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.admin_push_deliveries (
  order_id uuid primary key references public.orders(id) on delete cascade, created_at timestamptz not null default now()
);
alter table public.admin_push_subscriptions enable row level security;
alter table public.admin_push_deliveries enable row level security;
revoke all on public.admin_push_subscriptions, public.admin_push_deliveries from anon, authenticated;
commit;
