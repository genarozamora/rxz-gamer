-- RXZ Gamer security hardening.
-- Run this migration in Supabase before deploying the matching frontend.

begin;

-- Staff membership is decided only by a protected server-side function.
create or replace function public.is_support_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.support_staff s where s.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_support_staff() from public;
grant execute on function public.is_support_staff() to authenticated;

alter table public.profiles enable row level security;
alter table public.support_staff enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

-- Remove legacy policies on sensitive tables so a permissive old rule cannot
-- accidentally override the hardened rules below.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles', 'support_staff', 'orders', 'order_items',
        'support_conversations', 'support_messages'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

revoke all on public.profiles from anon, authenticated;
revoke all on public.support_staff from anon, authenticated;
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
revoke all on public.support_conversations from anon, authenticated;
revoke all on public.support_messages from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.support_staff to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select, insert, update on public.support_conversations to authenticated;
grant select, insert on public.support_messages to authenticated;

create policy "users read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_support_staff());

create policy "users verify own staff membership" on public.support_staff
for select to authenticated using (user_id = (select auth.uid()));

create policy "users read own orders" on public.orders
for select to authenticated using (user_id = (select auth.uid()) or public.is_support_staff());

create policy "staff updates orders" on public.orders
for update to authenticated using (public.is_support_staff()) with check (public.is_support_staff());

create policy "users read own order items" on public.order_items
for select to authenticated using (
  public.is_support_staff() or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  )
);

create policy "users read own support conversations" on public.support_conversations
for select to authenticated using (user_id = (select auth.uid()) or public.is_support_staff());

create policy "users create own support conversations" on public.support_conversations
for insert to authenticated with check (
  user_id = (select auth.uid()) and status = 'open'
  and char_length(trim(subject)) between 1 and 120
);

create policy "staff updates support conversations" on public.support_conversations
for update to authenticated using (public.is_support_staff()) with check (public.is_support_staff());

create policy "users read messages in allowed conversations" on public.support_messages
for select to authenticated using (
  exists (
    select 1 from public.support_conversations c
    where c.id = support_messages.conversation_id
      and (c.user_id = (select auth.uid()) or public.is_support_staff())
  )
);

create policy "users send messages in allowed conversations" on public.support_messages
for insert to authenticated with check (
  sender_id = (select auth.uid())
  and char_length(trim(message)) between 1 and 2000
  and exists (
    select 1 from public.support_conversations c
    where c.id = support_messages.conversation_id and c.status = 'open'
      and (c.user_id = (select auth.uid()) or public.is_support_staff())
  )
);

create or replace function public.limit_support_message_rate()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_support_staff() and (
    select count(*) from public.support_messages m
    where m.sender_id = auth.uid() and m.created_at > now() - interval '10 minutes'
  ) >= 20 then
    raise exception 'Demasiados mensajes. Esperá unos minutos.';
  end if;
  new.created_at := now();
  return new;
end;
$$;
revoke all on function public.limit_support_message_rate() from public;
drop trigger if exists trg_limit_support_message_rate on public.support_messages;
create trigger trg_limit_support_message_rate
before insert on public.support_messages
for each row execute function public.limit_support_message_rate();

-- Public return requests use a narrow function: the caller cannot choose the
-- management code/status, enumerate requests, or flood the same email rapidly.
revoke insert on public.return_requests from anon, authenticated;
create or replace function public.create_return_request(
  p_full_name text, p_email text, p_order_number text, p_detail text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := lower(trim(p_email));
  v_code text := 'RXZ-AR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
begin
  if char_length(trim(p_full_name)) not between 2 and 120
     or char_length(v_email) not between 5 and 200
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(trim(p_order_number)) not between 2 and 100
     or char_length(trim(p_detail)) not between 5 and 3000 then
    raise exception 'Datos inválidos.';
  end if;

  if (select count(*) from public.return_requests
      where email = v_email and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Esperá antes de enviar otra solicitud.';
  end if;

  insert into public.return_requests(request_code, full_name, email, order_number, detail, status)
  values (v_code, trim(p_full_name), v_email, trim(p_order_number), trim(p_detail), 'received');
  return v_code;
end;
$$;
revoke all on function public.create_return_request(text,text,text,text) from public;
grant execute on function public.create_return_request(text,text,text,text) to anon, authenticated;

-- A customer can only attach a receipt to their own payable order. They can no
-- longer update arbitrary order fields from a modified browser request.
create or replace function public.submit_payment_receipt(p_order_id uuid, p_receipt_path text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Tenés que iniciar sesión.'; end if;
  if char_length(p_receipt_path) > 500
     or p_receipt_path !~ ('^' || v_uid::text || '/' || p_order_id::text || '/comprobante-[0-9]+\.(jpg|jpeg|png|webp|pdf)$') then
    raise exception 'Ruta de comprobante inválida.';
  end if;

  update public.orders
  set receipt_path = p_receipt_path,
      status = 'receipt_uploaded',
      payment_rejection_reason = null
  where id = p_order_id and user_id = v_uid
    and status in ('pending_payment', 'payment_rejected');

  if not found then raise exception 'El pedido no admite un comprobante.'; end if;
end;
$$;
revoke all on function public.submit_payment_receipt(uuid, text) from public;
grant execute on function public.submit_payment_receipt(uuid, text) to authenticated;

-- Prices and totals always come from the database. Repeated product IDs are
-- grouped before stock checks, closing an overselling bypass.
create or replace function public.create_store_order(
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_shipping_address text, p_shipping_city text, p_shipping_province text,
  p_shipping_postal_code text, p_items jsonb
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_auth_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_line record;
  v_product public.products%rowtype;
  v_order public.orders%rowtype;
  v_total numeric(12,2) := 0;
begin
  if v_user_id is null then raise exception 'Tenés que iniciar sesión.'; end if;
  if (select count(*) from public.orders o
      where o.user_id = v_user_id
        and o.status in ('pending_payment','receipt_uploaded','payment_rejected')
        and o.created_at > now() - interval '24 hours') >= 3 then
    raise exception 'Ya tenés varias reservas activas. Completalas antes de crear otra.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'El carrito no es válido.';
  end if;
  if lower(trim(p_customer_email)) <> v_auth_email then raise exception 'El correo no coincide con tu cuenta.'; end if;
  if char_length(trim(p_customer_name)) not between 2 and 120
     or char_length(trim(p_customer_phone)) not between 8 and 30
     or char_length(trim(p_shipping_address)) not between 5 and 250
     or char_length(trim(p_shipping_city)) not between 2 and 120
     or char_length(trim(p_shipping_province)) not between 2 and 120
     or char_length(trim(p_shipping_postal_code)) not between 3 and 10 then
    raise exception 'Los datos de envío no son válidos.';
  end if;

  for v_line in
    select (x->>'product_id')::bigint as product_id,
           sum((x->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) x
    where jsonb_typeof(x) = 'object'
      and (x->>'product_id') ~ '^[0-9]+$'
      and (x->>'quantity') ~ '^[0-9]+$'
    group by (x->>'product_id')::bigint
  loop
    if v_line.quantity not between 1 and 10 then raise exception 'Cantidad inválida.'; end if;
    select * into v_product from public.products
      where id = v_line.product_id and active = true for update;
    if not found then raise exception 'Uno de los productos ya no está disponible.'; end if;
    if v_product.stock < v_line.quantity then raise exception 'Stock insuficiente para %.', v_product.name; end if;
    v_total := v_total + (v_product.price * v_line.quantity);
  end loop;

  if v_total <= 0 then raise exception 'El carrito no es válido.'; end if;

  insert into public.orders (
    user_id, status, subtotal, shipping_cost, total, customer_name, customer_email,
    customer_phone, shipping_address, shipping_city, shipping_province, shipping_postal_code
  ) values (
    v_user_id, 'pending_payment', v_total, 0, v_total, trim(p_customer_name),
    v_auth_email, trim(p_customer_phone), trim(p_shipping_address), trim(p_shipping_city),
    trim(p_shipping_province), upper(trim(p_shipping_postal_code))
  ) returning * into v_order;

  for v_line in
    select (x->>'product_id')::bigint as product_id,
           sum((x->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) x
    group by (x->>'product_id')::bigint
  loop
    select * into v_product from public.products where id = v_line.product_id for update;
    update public.products set stock = stock - v_line.quantity, updated_at = now()
      where id = v_product.id;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
      values (v_order.id, v_product.id::text, concat_ws(' ', v_product.brand, v_product.name), v_line.quantity, v_product.price);
  end loop;

  return query select v_order.id, v_order.order_number, v_total;
end;
$$;
revoke all on function public.create_store_order(text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.create_store_order(text,text,text,text,text,text,text,jsonb) to authenticated;

-- Prevent repeated cancellation/restoration from manufacturing stock.
create or replace function public.prevent_cancelled_order_reopen()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'Un pedido cancelado no puede reabrirse.';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_prevent_cancelled_order_reopen on public.orders;
create trigger trg_prevent_cancelled_order_reopen
before update of status on public.orders
for each row execute function public.prevent_cancelled_order_reopen();

-- Receipt files stay private and are bound to the authenticated user/order path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts', 'payment-receipts', false, 8388608,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Replace any older receipt-bucket rules. PostgreSQL combines permissive RLS
-- policies with OR, so leaving one broad legacy policy would weaken the new one.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') ilike '%payment-receipts%'
        or coalesce(with_check, '') ilike '%payment-receipts%')
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

revoke update, delete on storage.objects from authenticated;

drop policy if exists "customers upload own receipts" on storage.objects;
create policy "customers upload own receipts" on storage.objects
for insert to authenticated with check (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.orders o
    where o.id::text = (storage.foldername(name))[2]
      and o.user_id = (select auth.uid())
      and o.status in ('pending_payment','payment_rejected')
  )
);

drop policy if exists "customers read own receipts" on storage.objects;
create policy "customers read own receipts" on storage.objects
for select to authenticated using (
  bucket_id = 'payment-receipts'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_support_staff())
);

commit;
