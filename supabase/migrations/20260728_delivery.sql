-- Delivery Chimbero MVP: flags, menu, orders, RLS

-- Business delivery settings
alter table public.businesses
  add column if not exists delivery_enabled boolean default false,
  add column if not exists delivery_plan text default null
    check (delivery_plan is null or delivery_plan in ('trial', 'active', 'paused')),
  add column if not exists delivery_min_order numeric default 0,
  add column if not exists delivery_fee numeric default 0,
  add column if not exists delivery_eta_minutes int default 45,
  add column if not exists delivery_zones text default '';

-- Helper: owns business or is admin
create or replace function public.is_business_owner(biz_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.is_admin()
    or exists (
      select 1 from public.businesses b
      where b.id = biz_id and b.owner_id = auth.uid()
    );
$$;

create or replace function public.business_has_public_delivery(biz_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = biz_id
      and b.status = 'approved'
      and coalesce(b.delivery_enabled, false) = true
      and b.delivery_plan in ('trial', 'active')
  );
$$;

-- Menu categories
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists menu_categories_business_idx on public.menu_categories(business_id);

-- Menu items
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists menu_items_business_idx on public.menu_items(business_id);
create index if not exists menu_items_category_idx on public.menu_items(category_id);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  neighborhood text,
  notes text,
  payment_method text not null default 'efectivo'
    check (payment_method in ('efectivo', 'transferencia')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists orders_business_idx on public.orders(business_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- Order line items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  unit_price numeric not null default 0,
  qty int not null default 1 check (qty > 0)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- RLS
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Menu categories policies
drop policy if exists "menu_categories_public_read" on public.menu_categories;
drop policy if exists "menu_categories_owner_all" on public.menu_categories;

create policy "menu_categories_public_read"
on public.menu_categories for select
using (
  public.business_has_public_delivery(business_id)
  or public.is_business_owner(business_id)
);

create policy "menu_categories_owner_all"
on public.menu_categories for all
to authenticated
using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

-- Menu items policies
drop policy if exists "menu_items_public_read" on public.menu_items;
drop policy if exists "menu_items_owner_all" on public.menu_items;

create policy "menu_items_public_read"
on public.menu_items for select
using (
  public.business_has_public_delivery(business_id)
  or public.is_business_owner(business_id)
);

create policy "menu_items_owner_all"
on public.menu_items for all
to authenticated
using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

-- Orders: public insert when delivery open; owner/admin read+update
drop policy if exists "orders_public_insert" on public.orders;
drop policy if exists "orders_owner_select" on public.orders;
drop policy if exists "orders_owner_update" on public.orders;

create policy "orders_public_insert"
on public.orders for insert
with check (public.business_has_public_delivery(business_id));

create policy "orders_owner_select"
on public.orders for select
to authenticated
using (public.is_business_owner(business_id));

create policy "orders_owner_update"
on public.orders for update
to authenticated
using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

-- Order items: insert with order (anon can insert if parent order exists for open delivery)
drop policy if exists "order_items_public_insert" on public.order_items;
drop policy if exists "order_items_owner_select" on public.order_items;

create policy "order_items_public_insert"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and public.business_has_public_delivery(o.business_id)
  )
);

create policy "order_items_owner_select"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and public.is_business_owner(o.business_id)
  )
);

-- See also: create_delivery_order RPC (security definer) for anon checkout returns.
