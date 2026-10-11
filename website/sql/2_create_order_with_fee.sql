-- Lets checkout save the distance-based delivery-fee ESTIMATE on the order
-- so it shows up pre-filled in Admin > Orders (where it can be changed).
--
-- Wraps the existing create_order() instead of replacing it, so nothing
-- about the original function changes. Run once in the Supabase SQL editor.
--
-- The fee is clamped to 0–100 and only applied to delivery orders, so a
-- tampered request can't set an arbitrary amount.

create or replace function public.create_order_with_fee(
  p_customer_name text,
  p_customer_phone text,
  p_collection_type text,
  p_delivery_address text,
  p_notes text,
  p_total_amount numeric,
  p_items jsonb,
  p_delivery_fee numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_fee numeric := greatest(0, least(coalesce(p_delivery_fee, 0), 100));
begin
  select * into r
  from public.create_order(
    p_customer_name,
    p_customer_phone,
    p_collection_type,
    p_delivery_address,
    p_notes,
    p_total_amount,
    p_items
  );

  if p_collection_type = 'delivery' and v_fee > 0 then
    update public.orders
       set delivery_fee = v_fee
     where id = r.order_id;
  end if;

  return jsonb_build_object(
    'order_id', r.order_id,
    'order_number', r.order_number
  );
end;
$$;

revoke all on function public.create_order_with_fee(
  text, text, text, text, text, numeric, jsonb, numeric
) from public;
grant execute on function public.create_order_with_fee(
  text, text, text, text, text, numeric, jsonb, numeric
) to anon, authenticated;
