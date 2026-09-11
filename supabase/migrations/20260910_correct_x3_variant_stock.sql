-- Stock real del Attack Shark X3: una unidad negra y dos blancas.
update public.products
set
  variants = '[{"id":"black","label":"Negro","color":"#17191d","stock":1,"image":"/attack-shark-x3-3.jpg"},{"id":"white","label":"Blanco","color":"#f4f4f3","stock":2,"image":"/attack-shark-x3-2.jpg"}]'::jsonb,
  stock = 3,
  updated_at = now()
where id = 1;
