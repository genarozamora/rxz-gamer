-- Oculta productos que no forman parte del catálogo confirmado.
-- Se conservan los registros para no romper pedidos, métricas ni reseñas históricas.
update public.products
set active = false,
    updated_at = now()
where id not in (1, 3, 6, 7);
