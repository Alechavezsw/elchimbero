-- Contaduría El Chimbero: productos, clientes, suscripciones, cobros y banners

create table if not exists public.billing_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  default_price numeric not null default 0,
  billing_period text not null default 'monthly'
    check (billing_period in ('monthly', 'one_time')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.billing_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  whatsapp text,
  business_id uuid references public.businesses(id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists billing_clients_business_idx on public.billing_clients(business_id);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.billing_clients(id) on delete cascade,
  product_code text not null references public.billing_products(code),
  business_id uuid references public.businesses(id) on delete set null,
  entity_type text,
  entity_id uuid,
  amount numeric not null default 0,
  status text not null default 'active'
    check (status in ('active', 'paused', 'cancelled')),
  start_date date not null default (timezone('utc'::text, now()))::date,
  next_billing_date date,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists billing_subscriptions_client_idx on public.billing_subscriptions(client_id);
create index if not exists billing_subscriptions_status_idx on public.billing_subscriptions(status);
create index if not exists billing_subscriptions_product_idx on public.billing_subscriptions(product_code);

create table if not exists public.billing_charges (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.billing_clients(id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  product_code text not null,
  description text not null,
  amount numeric not null default 0,
  period_label text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  payment_method text
    check (payment_method is null or payment_method in ('efectivo', 'transferencia', 'mercadopago', 'otro')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists billing_charges_status_idx on public.billing_charges(status);
create index if not exists billing_charges_client_idx on public.billing_charges(client_id);
create index if not exists billing_charges_due_idx on public.billing_charges(due_date);

create table if not exists public.ad_banners (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.billing_clients(id) on delete set null,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  title text not null,
  image_url text not null,
  link_url text,
  placement text not null default 'home_mid'
    check (placement in ('home_top', 'home_mid', 'guia_top')),
  is_active boolean not null default true,
  starts_at date,
  ends_at date,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists ad_banners_active_idx on public.ad_banners(is_active, placement);

-- Seed productos cobrables
insert into public.billing_products (code, name, description, default_price, billing_period)
values
  ('guia_comercial', 'Guía Comercial', 'Ficha destacada / presencia en la guía de comercios', 15000, 'monthly'),
  ('delivery', 'Delivery Chimbero', 'Tienda online + panel de pedidos (estilo Fudo)', 35000, 'monthly'),
  ('farmacia_turno', 'Farmacia de Turno', 'Publicación en cronograma de farmacias de guardia', 12000, 'monthly'),
  ('kiosco_abierto', 'Kiosco Abierto / 24hs', 'Listado en kioscos abiertos tarde/noche', 10000, 'monthly'),
  ('turnos', 'Sistema de Turnos', 'Agenda de reservas / turnos para el comercio', 25000, 'monthly'),
  ('banner', 'Publicidad Banner (Hacele Banners)', 'Banner publicitario en la app', 20000, 'monthly'),
  ('clasificado_destacado', 'Clasificado Destacado', 'Anuncio destacado en listado y home (mayor visibilidad)', 8000, 'monthly')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  default_price = excluded.default_price,
  billing_period = excluded.billing_period,
  is_active = true;

alter table public.billing_products enable row level security;
alter table public.billing_clients enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_charges enable row level security;
alter table public.ad_banners enable row level security;

-- Admin-only management
drop policy if exists "billing_products_admin_all" on public.billing_products;
drop policy if exists "billing_products_public_read" on public.billing_products;
create policy "billing_products_public_read" on public.billing_products for select using (true);
create policy "billing_products_admin_all" on public.billing_products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "billing_clients_admin_all" on public.billing_clients;
create policy "billing_clients_admin_all" on public.billing_clients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "billing_subscriptions_admin_all" on public.billing_subscriptions;
create policy "billing_subscriptions_admin_all" on public.billing_subscriptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "billing_charges_admin_all" on public.billing_charges;
create policy "billing_charges_admin_all" on public.billing_charges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Banners: public read active; admin manage
drop policy if exists "ad_banners_public_read" on public.ad_banners;
drop policy if exists "ad_banners_admin_all" on public.ad_banners;
create policy "ad_banners_public_read" on public.ad_banners for select
  using (
    is_active = true
    and (starts_at is null or starts_at <= (timezone('utc'::text, now()))::date)
    and (ends_at is null or ends_at >= (timezone('utc'::text, now()))::date)
  );
create policy "ad_banners_admin_all" on public.ad_banners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
