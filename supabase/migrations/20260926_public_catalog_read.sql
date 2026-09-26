-- Public visitors must not evaluate the authenticated-only staff helper.
-- Existing authenticated staff-management policies retain staff access.
begin;

alter policy "published products are public" on public.products
  using (active);

alter policy "approved reviews are public" on public.product_reviews
  using (approved or user_id = (select auth.uid()));

-- Validate both SELECT policies with the actual anonymous role before commit.
set local role anon;
select count(*) as visible_products,
       count(*) filter (where not active) as hidden_products_exposed
from public.products;
select count(*) filter (where not approved) as unapproved_reviews_exposed
from public.product_reviews;
reset role;
commit;
