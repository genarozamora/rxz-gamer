-- Variantes reales por color y stock para RXZ Gamer.

alter table public.products
  add column if not exists variants jsonb not null default '[]'::jsonb;

alter table public.products
  drop constraint if exists products_variants_is_array;
alter table public.products
  add constraint products_variants_is_array check (jsonb_typeof(variants) = 'array');

alter table public.order_items add column if not exists variant_id text;
alter table public.order_items add column if not exists variant_label text;

update public.products set
  name = 'X3 Pro 8K Wireless Gaming Mouse',
  subtitle = 'PAW3395 • 26.000 DPI • 4K/8K Hz',
  stock = 3,
  description = 'Mouse gamer ultraliviano de alto rendimiento con sensor PixArt PAW3395, conectividad triple y polling de hasta 4K inalámbrico y 8K cableado.',
  images = '["https://e-topshop.com.ua/image/cache/catalog/mouse/ASX3/Pro/black-800x800.jpeg","https://attackshark.com/cdn/shop/files/1_4K_logo_d23c047c-0870-4d14-981a-82735559aa68.jpg?v=1712546749&width=2048","https://taskrevolution.com/cdn/shop/files/MouseX3PRO_3.webp?v=1719776150&width=1946"]'::jsonb,
  variants = '[{"id":"black","label":"Negro","color":"#17191d","stock":1,"image":"https://e-topshop.com.ua/image/cache/catalog/mouse/ASX3/Pro/black-800x800.jpeg"},{"id":"white","label":"Blanco","color":"#f4f4f3","stock":1,"image":"https://attackshark.com/cdn/shop/files/1_4K_logo_d23c047c-0870-4d14-981a-82735559aa68.jpg?v=1712546749&width=2048"},{"id":"red","label":"Rojo","color":"#df2635","stock":1,"image":"https://taskrevolution.com/cdn/shop/files/MouseX3PRO_3.webp?v=1719776150&width=1946"}]'::jsonb,
  features = '["Sensor PixArt PAW3395","Hasta 26.000 DPI programables","Polling rate de hasta 4000 Hz inalámbrico y 8000 Hz cableado","Peso aproximado de 59 g","Conexión Bluetooth 5.2, 2.4 GHz y USB-C","Switches Kailh Black Mamba de hasta 80 millones de clics","Autonomía declarada de hasta 200 horas","Patines PTFE","Software y configurador web"]'::jsonb,
  specs = '[{"label":"Modelo","value":"X3 Pro 8K"},{"label":"Sensor","value":"PixArt PAW3395"},{"label":"DPI máximo","value":"26.000 DPI"},{"label":"Polling rate","value":"Hasta 4000 Hz inalámbrico / 8000 Hz cableado"},{"label":"Velocidad máxima","value":"650 IPS"},{"label":"Aceleración máxima","value":"50 G"},{"label":"Peso","value":"59 g ± 3 g"},{"label":"Conectividad","value":"Bluetooth 5.2 / 2.4 GHz / USB-C"},{"label":"Batería","value":"300 mAh"},{"label":"Autonomía declarada","value":"Hasta 200 horas"},{"label":"Switches","value":"Kailh Black Mamba"},{"label":"Durabilidad","value":"Hasta 80 millones de clics"},{"label":"Dimensiones","value":"118,5 × 61 × 39,7 mm"},{"label":"Pies","value":"PTFE"},{"label":"Incluye","value":"Mouse, receptor inalámbrico, cable USB-C y manual"}]'::jsonb,
  updated_at = now()
where id = 1;

update public.products set
  stock = 2,
  description = 'Control inalámbrico multiplataforma con sticks y gatillos Hall Effect, polling de alta velocidad y botones traseros configurables. Esta publicación incluye base de carga RGB y receptor USB 2.4 GHz.',
  variants = '[{"id":"midnight-gray","label":"Negro (Midnight Gray)","color":"#30343b","stock":1,"image":"/gamesir-nova2-lite.png"},{"id":"luminous-white","label":"Blanco (Luminous White)","color":"#f2f3f4","stock":1,"image":"https://gamesir.com/cdn/shop/files/10_5bd11b1c-e7fa-4b78-b551-6785e3c99861.png?v=1748246138"}]'::jsonb,
  features = features || '["Combo RXZ: base de carga RGB y receptor USB incluidos"]'::jsonb,
  specs = specs || '[{"label":"Incluye","value":"Control, base de carga RGB, receptor USB 2.4 GHz, cable USB-C y manual"}]'::jsonb,
  updated_at = now()
where id = 3;

update public.products set
  stock = 4,
  variants = '[{"id":"black-contour","label":"Black Contour","color":"#14181d","stock":3,"image":"/aula-f75-he-alibaba-3.jpg"},{"id":"gradient-gray","label":"Gradient Gray","color":"#9ca3af","stock":1,"image":"/aula-f75-he-alibaba-1.jpg"}]'::jsonb,
  specs = specs || '[{"label":"Incluye","value":"Teclado, receptor USB 2.4 GHz, cable USB-C, extractor y manual"}]'::jsonb,
  updated_at = now()
where id = 6;

insert into public.products (
  id, slug, brand, name, category, subtitle, description, price, old_price,
  stock, badge, images, features, specs, variants, active
) values (
  7, 'easysmx-d10-wireless-gaming-controller', 'EASYSMX', 'D10 Wireless Gaming Controller',
  'Controles', 'TMR • 1000 Hz • Base de carga incluida',
  'Control inalámbrico multiplataforma con sticks TMR, gatillos de doble modo, botones mecánicos y base inteligente de carga. Incluye receptor USB 2.4 GHz.',
  89990, 109990, 1, 'COMBO COMPLETO',
  '["https://www.easysmx.com/cdn/shop/files/D10_-1000X1000_b7bff737-127f-492d-8436-120915dce879_1024x1024.png?v=1747905818","https://cdn.qeemat.com.pk/product/11116/easysmx-d10-wireless-gaming-controller-black.png"]'::jsonb,
  '["Sticks TMR anti-drift de alta precisión","Polling rate de 1000 Hz por cable y 2.4 GHz","Gatillos Hall Effect con bloqueo y modo microswitch","D-pad EasyPos de 8 direcciones y botones mecánicos","2 botones traseros programables","Vibración regulable en 4 niveles y RGB personalizable","Giroscopio de 6 ejes en Nintendo Switch","Base de carga inteligente con reconexión automática","Receptor USB 2.4 GHz incluido"]'::jsonb,
  '[{"label":"Modelo","value":"EasySMX D10"},{"label":"Plataformas","value":"PC / Steam Deck / Switch / Android / iOS"},{"label":"Conectividad","value":"2.4 GHz / Bluetooth / USB-C"},{"label":"Joysticks","value":"TMR"},{"label":"Gatillos","value":"Hall Effect + microswitch con bloqueo de 2 posiciones"},{"label":"Polling rate","value":"Hasta 1000 Hz por cable y receptor 2.4 GHz"},{"label":"Batería","value":"1000 mAh"},{"label":"Peso","value":"256 g"},{"label":"Dimensiones","value":"156 × 103 × 63,6 mm"},{"label":"Incluye","value":"Control, base de carga, receptor USB 2.4 GHz, cable USB-C y manual"}]'::jsonb,
  '[{"id":"space-black","label":"Negro (Space Black)","color":"#101216","stock":1,"image":"https://www.easysmx.com/cdn/shop/files/D10_-1000X1000_b7bff737-127f-492d-8436-120915dce879_1024x1024.png?v=1747905818"}]'::jsonb,
  true
)
on conflict (id) do update set
  slug = excluded.slug, brand = excluded.brand, name = excluded.name,
  category = excluded.category, subtitle = excluded.subtitle,
  description = excluded.description, stock = excluded.stock, badge = excluded.badge,
  images = excluded.images, features = excluded.features, specs = excluded.specs,
  variants = excluded.variants, active = true, updated_at = now();

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
  v_auth_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_line record; v_product public.products%rowtype; v_order public.orders%rowtype;
  v_variant jsonb; v_variant_label text; v_variant_stock integer;
  v_total numeric(12,2) := 0;
begin
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

create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_item record;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    for v_item in select product_id::bigint product_id, variant_id, sum(quantity)::integer quantity from public.order_items where order_id = new.id group by product_id,variant_id loop
      if v_item.variant_id is not null then
        update public.products p set
          variants = (select jsonb_agg(case when value->>'id' = v_item.variant_id then jsonb_set(value,'{stock}',to_jsonb((value->>'stock')::integer + v_item.quantity)) else value end) from jsonb_array_elements(p.variants)),
          stock = stock + v_item.quantity, updated_at = now()
        where p.id = v_item.product_id;
      else
        update public.products set stock = stock + v_item.quantity, updated_at = now() where id = v_item.product_id;
      end if;
    end loop;
  end if;
  return new;
end;
$$;
revoke all on function public.restore_cancelled_order_stock() from public, anon, authenticated;
