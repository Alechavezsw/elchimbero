-- Clasificados destacados (servicio cobrable)

alter table public.classifieds
  add column if not exists is_featured boolean default false,
  add column if not exists featured_until date;

create index if not exists classifieds_featured_idx on public.classifieds(is_featured) where is_featured = true;

insert into public.billing_products (code, name, description, default_price, billing_period)
values (
  'clasificado_destacado',
  'Clasificado Destacado',
  'Anuncio destacado en listado y home (mayor visibilidad)',
  8000,
  'monthly'
)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  default_price = excluded.default_price,
  billing_period = excluded.billing_period,
  is_active = true;
