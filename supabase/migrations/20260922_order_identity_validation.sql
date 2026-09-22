begin;

-- These constraints are enforced for every new order, including calls made
-- outside the storefront. NOT VALID keeps historical rows from blocking the
-- deployment while still protecting new and updated records.
alter table public.orders
  add constraint orders_customer_name_realistic
  check (
    customer_name ~* '^[a-záéíóúüñ''.-]{2,}( [a-záéíóúüñ''.-]{2,})+$'
  ) not valid;

alter table public.orders
  add constraint orders_customer_phone_argentina
  check (
    length(regexp_replace(customer_phone, '\D', '', 'g')) between 10 and 13
    and regexp_replace(customer_phone, '\D', '', 'g') !~ '^(.)\1+$'
    and regexp_replace(customer_phone, '\D', '', 'g') not in ('0123456789', '1234567890', '9876543210', '0000000000')
  ) not valid;

alter table public.orders
  add constraint orders_shipping_address_realistic
  check (
    char_length(trim(shipping_address)) between 6 and 250
    and shipping_address ~* '[a-záéíóúüñ]'
    and shipping_address ~ '[0-9]'
  ) not valid;

alter table public.orders
  add constraint orders_shipping_city_realistic
  check (shipping_city ~* '^[a-záéíóúüñ''.-]{2,}( [a-záéíóúüñ''.-]{1,})*$') not valid;

alter table public.orders
  add constraint orders_shipping_postal_code_argentina
  check (shipping_postal_code ~* '^(\d{4}|[a-hj-np-z]\d{4}[a-z]{3})$') not valid;

commit;
