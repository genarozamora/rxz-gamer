-- Close unnecessary function privileges reported by Supabase Security Advisor.
begin;

alter function public.generate_order_number() set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;

revoke all on function public.generate_order_number() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.restore_cancelled_order_stock() from public, anon, authenticated;
revoke all on function public.touch_support_conversation() from public, anon, authenticated;
revoke all on function public.prevent_cancelled_order_reopen() from public, anon, authenticated;
revoke all on function public.limit_support_message_rate() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;

-- These are deliberately exposed: they are narrow API entry points protected
-- by authentication, ownership checks, validation and/or rate limiting.
revoke all on function public.is_support_staff() from public, anon;
grant execute on function public.is_support_staff() to authenticated;

revoke all on function public.create_store_order(text,text,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.create_store_order(text,text,text,text,text,text,text,jsonb) to authenticated;

revoke all on function public.submit_payment_receipt(uuid,text) from public, anon;
grant execute on function public.submit_payment_receipt(uuid,text) to authenticated;

revoke all on function public.create_return_request(text,text,text,text) from public;
grant execute on function public.create_return_request(text,text,text,text) to anon, authenticated;

commit;
