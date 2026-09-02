create or replace function public.create_store_order(
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_shipping_address text, p_shipping_city text, p_shipping_province text,
  p_shipping_postal_code text, p_items jsonb
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user_id uuid := auth.uid(); v_item jsonb; v_product public.products%rowtype;
  v_order public.orders%rowtype; v_quantity integer; v_total numeric := 0;
begin
  if v_user_id is null then raise exception 'Tenés que iniciar sesión.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'El carrito está vacío.'; end if;
  if char_length(trim(p_customer_name)) < 2 or char_length(trim(p_customer_phone)) < 8 then raise exception 'Los datos del cliente no son válidos.'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity < 1 then raise exception 'Cantidad inválida.'; end if;
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint and active = true for update;
    if not found then raise exception 'Uno de los productos ya no está disponible.'; end if;
    if v_product.stock < v_quantity then raise exception 'Stock insuficiente para %.', v_product.name; end if;
    v_total := v_total + (v_product.price * v_quantity);
  end loop;

  insert into public.orders (user_id,status,subtotal,shipping_cost,total,customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_province,shipping_postal_code)
  values (v_user_id,'pending_payment',v_total,0,v_total,trim(p_customer_name),trim(p_customer_email),trim(p_customer_phone),trim(p_shipping_address),trim(p_shipping_city),trim(p_shipping_province),trim(p_shipping_postal_code))
  returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint for update;
    update public.products set stock = stock - v_quantity, updated_at = now() where id = v_product.id;
    insert into public.order_items (order_id,product_id,product_name,quantity,unit_price)
    values (v_order.id,v_product.id::text,concat_ws(' ',v_product.brand,v_product.name),v_quantity,v_product.price);
  end loop;
  return query select v_order.id, v_order.order_number, v_total;
end; $$;

revoke all on function public.create_store_order(text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.create_store_order(text,text,text,text,text,text,text,jsonb) to authenticated;

create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p set stock = p.stock + grouped.quantity, updated_at = now()
    from (select product_id::bigint product_id, sum(quantity)::integer quantity from public.order_items where order_id = new.id group by product_id) grouped
    where p.id = grouped.product_id;
  end if;
  return new;
end; $$;

drop trigger if exists trg_restore_cancelled_order_stock on public.orders;
create trigger trg_restore_cancelled_order_stock after update of status on public.orders
for each row execute function public.restore_cancelled_order_stock();
