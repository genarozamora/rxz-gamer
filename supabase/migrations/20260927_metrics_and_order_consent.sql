begin;
alter policy "store events can be recorded" on public.store_events
with check (
  event_name in ('product_view','add_to_cart','begin_checkout','purchase','support_open','share_product','share_store','share_store_whatsapp','copy_store_link','campaign_visit','resume_cart')
  and (user_id is null or user_id = (select auth.uid()))
);

alter table public.orders add column if not exists terms_accepted_at timestamptz;
alter table public.orders add column if not exists terms_version text;

create or replace function public.create_store_order(
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_shipping_address text, p_shipping_city text, p_shipping_province text,
  p_shipping_postal_code text, p_items jsonb, p_accepted_terms boolean
) returns table(order_id uuid, order_number text, total numeric)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_created record;
begin
  if auth.uid() is null then raise exception 'Tenés que iniciar sesión.'; end if;
  if p_accepted_terms is distinct from true then raise exception 'Aceptá los Términos y condiciones y la Política de privacidad para confirmar el pedido.'; end if;
  select * into v_created from public.create_store_order(p_customer_name,p_customer_email,p_customer_phone,p_shipping_address,p_shipping_city,p_shipping_province,p_shipping_postal_code,p_items);
  update public.orders set terms_accepted_at = now(), terms_version = '2026-09-27' where id = v_created.order_id;
  return query select v_created.order_id::uuid, v_created.order_number::text, v_created.total::numeric;
end;
$$;
revoke all on function public.create_store_order(text,text,text,text,text,text,text,jsonb,boolean) from public, anon;
grant execute on function public.create_store_order(text,text,text,text,text,text,text,jsonb,boolean) to authenticated;
commit;

-- Apply after deploying the checkout that sends p_accepted_terms.
-- The security-definer wrapper remains the only customer entry point.
revoke execute on function public.create_store_order(text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
