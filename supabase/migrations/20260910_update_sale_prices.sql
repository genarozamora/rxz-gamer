-- Precios comerciales RXZ Gamer y galería estable del Attack Shark X3.
-- La base de datos es la fuente de verdad usada al validar cada pedido.

update public.products
set price = 89990,
    old_price = 109990,
    images = '["/attack-shark-x3-2.jpg","/attack-shark-x3-3.jpg"]'::jsonb,
    variants = '[{"id":"black","label":"Negro","color":"#17191d","stock":1,"image":"/attack-shark-x3-3.jpg"},{"id":"white","label":"Blanco","color":"#f4f4f3","stock":1,"image":"/attack-shark-x3-2.jpg"},{"id":"red","label":"Rojo","color":"#df2635","stock":1,"image":"/attack-shark-x3-3.jpg"}]'::jsonb,
    updated_at = now()
where id = 1;

update public.products
set price = 89990,
    old_price = 109990,
    updated_at = now()
where id = 3;

update public.products
set price = 310000,
    old_price = 349990,
    updated_at = now()
where id = 6;

update public.products
set price = 109990,
    old_price = 129990,
    updated_at = now()
where id = 7;
