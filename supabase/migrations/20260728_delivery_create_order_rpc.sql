-- Anonymous checkout with return payload
create or replace function public.create_delivery_order(
  p_business_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_neighborhood text,
  p_notes text,
  p_payment_method text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_biz public.businesses%rowtype;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_item jsonb;
  v_qty int;
  v_price numeric;
  v_name text;
  v_menu_item_id uuid;
  v_items jsonb := '[]'::jsonb;
  v_line jsonb;
begin
  select * into v_biz from public.businesses where id = p_business_id;
  if not found then
    raise exception 'Comercio no encontrado';
  end if;
  if not (
    v_biz.status = 'approved'
    and coalesce(v_biz.delivery_enabled, false)
    and v_biz.delivery_plan in ('trial', 'active')
  ) then
    raise exception 'Este comercio no está recibiendo pedidos de delivery ahora';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(coalesce((v_item->>'qty')::int, 0), 0);
    v_price := coalesce((v_item->>'unit_price')::numeric, 0);
    if v_qty > 0 then
      v_subtotal := v_subtotal + (v_price * v_qty);
    end if;
  end loop;

  if v_subtotal < coalesce(v_biz.delivery_min_order, 0) then
    raise exception 'El pedido no alcanza el mínimo';
  end if;

  v_delivery_fee := coalesce(v_biz.delivery_fee, 0);
  v_total := v_subtotal + v_delivery_fee;

  insert into public.orders (
    business_id, customer_name, customer_phone, customer_address,
    neighborhood, notes, payment_method, status, subtotal, delivery_fee, total
  ) values (
    p_business_id,
    trim(p_customer_name),
    regexp_replace(p_customer_phone, '\D', '', 'g'),
    trim(p_customer_address),
    coalesce(p_neighborhood, ''),
    coalesce(p_notes, ''),
    case when p_payment_method = 'transferencia' then 'transferencia' else 'efectivo' end,
    'pending',
    v_subtotal,
    v_delivery_fee,
    v_total
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(coalesce((v_item->>'qty')::int, 0), 0);
    if v_qty <= 0 then continue; end if;
    v_price := coalesce((v_item->>'unit_price')::numeric, 0);
    v_name := coalesce(v_item->>'name', 'Producto');
    v_menu_item_id := nullif(v_item->>'menu_item_id', '')::uuid;

    insert into public.order_items (order_id, menu_item_id, name, unit_price, qty)
    values (v_order_id, v_menu_item_id, v_name, v_price, v_qty)
    returning jsonb_build_object(
      'id', id,
      'order_id', order_id,
      'menu_item_id', menu_item_id,
      'name', name,
      'unit_price', unit_price,
      'qty', qty
    ) into v_line;

    v_items := v_items || jsonb_build_array(v_line);
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'business_id', p_business_id,
    'customer_name', trim(p_customer_name),
    'customer_phone', regexp_replace(p_customer_phone, '\D', '', 'g'),
    'customer_address', trim(p_customer_address),
    'neighborhood', coalesce(p_neighborhood, ''),
    'notes', coalesce(p_notes, ''),
    'payment_method', case when p_payment_method = 'transferencia' then 'transferencia' else 'efectivo' end,
    'status', 'pending',
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'items', v_items
  );
end;
$$;

grant execute on function public.create_delivery_order(uuid, text, text, text, text, text, text, jsonb) to anon, authenticated;
