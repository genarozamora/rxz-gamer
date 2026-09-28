begin;

alter policy "store events can be recorded" on public.store_events
with check (
  event_name in ('product_view','view_item','select_item','add_to_cart','remove_from_cart','view_cart','begin_checkout','purchase','support_open','share_product','share_store','share_store_whatsapp','copy_store_link','campaign_visit','resume_cart','search','search_no_results','category_view','filter_use')
  and (user_id is null or user_id = (select auth.uid()))
);

commit;
