-- Reemplaza la imagen roja rota del X3 Pro en galería y selector de variante.
update public.products
set images = (
      select jsonb_agg(
        case
          when value #>> '{}' like 'https://taskrevolution.com/%'
            then to_jsonb('https://m.media-amazon.com/images/I/71aZBHC2tyL._AC_SL1500_.jpg'::text)
          else value
        end
      )
      from jsonb_array_elements(images)
    ),
    variants = (
      select jsonb_agg(
        case
          when value->>'id' = 'red'
            then jsonb_set(value, '{image}', to_jsonb('https://m.media-amazon.com/images/I/71aZBHC2tyL._AC_SL1500_.jpg'::text))
          else value
        end
      )
      from jsonb_array_elements(variants)
    ),
    updated_at = now()
where id = 1;
