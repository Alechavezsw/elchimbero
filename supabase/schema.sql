-- Esquema de Base de Datos para El Chimbero
-- Departamento de Chimbas, San Juan, Argentina

-- 1. Tabla de Perfiles (profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para profiles
alter table public.profiles enable row level security;

create policy "Perfiles publicos son visibles por todos" on public.profiles
  for select using (true);

create policy "Usuarios pueden actualizar su propio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Trigger para crear el perfil automaticamente al registrar un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Crear el trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Tabla de Comercios (Guia Comercial)
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  description text,
  category text not null,
  address text not null,
  neighborhood text not null,
  phone text,
  whatsapp text,
  latitude numeric,
  longitude numeric,
  image_url text,
  hours jsonb,
  status text default 'approved'::text check (status in ('pending', 'approved', 'rejected')),
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para businesses
alter table public.businesses enable row level security;

create policy "Comercios aprobados son visibles por todos" on public.businesses
  for select using (status = 'approved');

create policy "Usuarios autenticados pueden registrar un comercio" on public.businesses
  for insert with check (auth.uid() = owner_id);

create policy "Duenos pueden actualizar su propio comercio" on public.businesses
  for update using (auth.uid() = owner_id);

create policy "Duenos pueden eliminar su propio comercio" on public.businesses
  for delete using (auth.uid() = owner_id);


-- 3. Tabla de Clasificados
create table if not exists public.classifieds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric not null default 0,
  category text not null check (category in ('sale', 'rent', 'service', 'job', 'other')),
  condition text not null check (condition in ('new', 'used', 'not_applicable')),
  image_url text,
  whatsapp text,
  status text default 'active'::text check (status in ('active', 'sold', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para classifieds
alter table public.classifieds enable row level security;

create policy "Clasificados activos son visibles por todos" on public.classifieds
  for select using (status = 'active');

create policy "Usuarios autenticados pueden registrar un clasificado" on public.classifieds
  for insert with check (auth.uid() = user_id);

create policy "Propietarios pueden actualizar su propio clasificado" on public.classifieds
  for update using (auth.uid() = user_id);

create policy "Propietarios pueden eliminar su propio clasificado" on public.classifieds
  for delete using (auth.uid() = user_id);


-- 4. Tabla de Farmacias (Farmacias de Turno)
create table if not exists public.pharmacies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  phone text,
  latitude numeric,
  longitude numeric,
  duty_dates date[] default '{}'::date[] not null,
  is_open_24h boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para pharmacies
alter table public.pharmacies enable row level security;

create policy "Farmacias son visibles por todos" on public.pharmacies
  for select using (true);

create policy "Usuarios autenticados pueden editar farmacias" on public.pharmacies
  for all using (auth.uid() is not null);


-- 5. Tabla de Kioscos 24h / Abiertos Tarde
create table if not exists public.kiosks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  neighborhood text not null,
  phone text,
  latitude numeric,
  longitude numeric,
  is_open_24h boolean default true,
  hours_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para kiosks
alter table public.kiosks enable row level security;

create policy "Kioscos son visibles por todos" on public.kiosks
  for select using (true);

create policy "Usuarios autenticados pueden editar kioscos" on public.kiosks
  for all using (auth.uid() is not null);
