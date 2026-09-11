-- El Attack Shark X3 se ofrece únicamente en negro y blanco.
update public.products
set
  variants = '[{"id":"black","label":"Negro","color":"#17191d","stock":1,"image":"/attack-shark-x3-3.jpg"},{"id":"white","label":"Blanco","color":"#f4f4f3","stock":1,"image":"/attack-shark-x3-2.jpg"}]'::jsonb,
  updated_at = now()
where id = 1;
