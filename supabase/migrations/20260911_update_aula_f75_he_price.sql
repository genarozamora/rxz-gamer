-- Actualiza el precio comercial del AULA F75 HE.
-- La base de datos valida nuevamente este valor al crear el pedido.

update public.products
set price = 299990,
    old_price = 349990,
    updated_at = now()
where id = 6;
