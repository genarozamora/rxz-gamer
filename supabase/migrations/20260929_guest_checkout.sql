begin;

create or replace function public.create_store_order(
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_shipping_address text, p_shipping_city text, p_shipping_province text,
  p_shipping_postal_code text, p_items jsonb
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_auth_email text;
  v_is_anonymous boolean := coalesce((auth.jwt()->>'is_anonymous')::boolean, false);
  v_line record; v_product public.products%rowtype; v_order public.orders%rowtype;
  v_variant jsonb; v_variant_label text; v_variant_stock integer;
  v_total numeric(12,2) := 0;
begin
  v_auth_email := case when v_is_anonymous then lower(trim(p_customer_email)) else lower(coalesce(auth.jwt()->>'email', '')) end;
  if v_auth_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_auth_email) > 254 then raise exception 'Ingresá un email válido.'; end if;
  if v_user_id is null then raise exception 'Tenés que iniciar sesión.'; end if;
  if (select count(*) from public.orders o where o.user_id = v_user_id and o.status in ('pending_payment','receipt_uploaded','payment_rejected') and o.created_at > now() - interval '24 hours') >= 3 then
    raise exception 'Ya tenés varias reservas activas. Completalas antes de crear otra.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 20 then raise exception 'El carrito no es válido.'; end if;
  if lower(trim(p_customer_email)) <> v_auth_email then raise exception 'El correo no coincide con tu cuenta.'; end if;
  if char_length(trim(p_customer_name)) not between 2 and 120 or char_length(trim(p_customer_phone)) not between 8 and 30 or char_length(trim(p_shipping_address)) not between 5 and 250 or char_length(trim(p_shipping_city)) not between 2 and 120 or char_length(trim(p_shipping_province)) not between 2 and 120 or char_length(trim(p_shipping_postal_code)) not between 3 and 10 then raise exception 'Los datos de envío no son válidos.'; end if;

  for v_line in
    select (x->>'product_id')::bigint product_id, nullif(x->>'variant_id','') variant_id,
           sum((x->>'quantity')::integer)::integer quantity
    from jsonb_array_elements(p_items) x
    where jsonb_typeof(x) = 'object' and (x->>'product_id') ~ '^[0-9]+$' and (x->>'quantity') ~ '^[0-9]+$'
    group by (x->>'product_id')::bigint, nullif(x->>'variant_id','')
  loop
    if v_line.quantity not between 1 and 10 then raise exception 'Cantidad inválida.'; end if;
    select * into v_product from public.products where id = v_line.product_id and active = true for update;
    if not found then raise exception 'Uno de los productos ya no está disponible.'; end if;
    if jsonb_array_length(v_product.variants) > 0 then
      if v_line.variant_id is null then raise exception 'Tenés que elegir una variante para %.', v_product.name; end if;
      select value into v_variant from jsonb_array_elements(v_product.variants) where value->>'id' = v_line.variant_id;
      if v_variant is null then raise exception 'La variante elegida ya no está disponible.'; end if;
      v_variant_stock := (v_variant->>'stock')::integer;
      if v_variant_stock < v_line.quantity then raise exception 'Stock insuficiente para % (%).', v_product.name, v_variant->>'label'; end if;
    elsif v_product.stock < v_line.quantity then
      raise exception 'Stock insuficiente para %.', v_product.name;
    end if;
    v_total := v_total + v_product.price * v_line.quantity;
  end loop;
  if v_total <= 0 then raise exception 'El carrito no es válido.'; end if;

  insert into public.orders (user_id,status,subtotal,shipping_cost,total,customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_province,shipping_postal_code)
  values (v_user_id,'pending_payment',v_total,0,v_total,trim(p_customer_name),v_auth_email,trim(p_customer_phone),trim(p_shipping_address),trim(p_shipping_city),trim(p_shipping_province),upper(trim(p_shipping_postal_code))) returning * into v_order;

  for v_line in
    select (x->>'product_id')::bigint product_id, nullif(x->>'variant_id','') variant_id,
           sum((x->>'quantity')::integer)::integer quantity
    from jsonb_array_elements(p_items) x
    group by (x->>'product_id')::bigint, nullif(x->>'variant_id','')
  loop
    select * into v_product from public.products where id = v_line.product_id for update;
    v_variant_label := null;
    if v_line.variant_id is not null then
      select value->>'label' into v_variant_label from jsonb_array_elements(v_product.variants) where value->>'id' = v_line.variant_id;
      update public.products p set
        variants = (select jsonb_agg(case when value->>'id' = v_line.variant_id then jsonb_set(value,'{stock}',to_jsonb((value->>'stock')::integer - v_line.quantity)) else value end) from jsonb_array_elements(p.variants)),
        stock = stock - v_line.quantity, updated_at = now()
      where p.id = v_product.id;
    else
      update public.products set stock = stock - v_line.quantity, updated_at = now() where id = v_product.id;
    end if;
    insert into public.order_items (order_id,product_id,product_name,quantity,unit_price,variant_id,variant_label)
    values (v_order.id,v_product.id::text,concat_ws(' ',v_product.brand,v_product.name),v_line.quantity,v_product.price,v_line.variant_id,v_variant_label);
  end loop;
  return query select v_order.id,v_order.order_number,v_total;
end;
$$;
revoke all on function public.create_store_order(text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.create_store_order(text,text,text,text,text,text,text,jsonb) to authenticated;

commit;
