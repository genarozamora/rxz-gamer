-- Usa una vista limpia del producto para la variante Gradient Gray.
update public.products
set images = (
      select jsonb_agg(
        case
          when value #>> '{}' = '/aula-f75-he-alibaba-1.jpg'
            then to_jsonb('https://aulajapan.com/cdn/shop/files/1_343970a8-f661-4161-b9ae-0effcf8ba8f7.jpg?v=1727268139'::text)
          else value
        end
      )
      from jsonb_array_elements(images)
    ),
    variants = (
      select jsonb_agg(
        case
          when value->>'id' = 'gradient-gray'
            then jsonb_set(value, '{image}', to_jsonb('https://aulajapan.com/cdn/shop/files/1_343970a8-f661-4161-b9ae-0effcf8ba8f7.jpg?v=1727268139'::text))
          else value
        end
      )
      from jsonb_array_elements(variants)
    ),
    updated_at = now()
where id = 6;
