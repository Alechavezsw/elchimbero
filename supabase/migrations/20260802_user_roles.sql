-- Roles: admin (administración), business (negocio), client (cliente)

alter table public.profiles
  add column if not exists role text;

update public.profiles
set role = case
  when coalesce(is_admin, false) = true then 'admin'
  when role in ('admin', 'business', 'client') then role
  else 'client'
end
where role is null or role not in ('admin', 'business', 'client');

alter table public.profiles
  alter column role set default 'client';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'business', 'client'));

create or replace function public.sync_profile_role_flags()
returns trigger
language plpgsql
as $$
begin
  if new.role is null or new.role not in ('admin', 'business', 'client') then
    new.role := case when coalesce(new.is_admin, false) then 'admin' else 'client' end;
  end if;
  new.is_admin := (new.role = 'admin');
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_role_flags on public.profiles;
create trigger trg_sync_profile_role_flags
before insert or update of role, is_admin on public.profiles
for each row execute function public.sync_profile_role_flags();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
begin
  v_role := lower(coalesce(new.raw_user_meta_data->>'role', 'client'));
  if v_role not in ('admin', 'business', 'client') then
    v_role := 'client';
  end if;
  if v_role = 'admin' then
    v_role := 'client';
  end if;

  insert into public.profiles (id, full_name, phone, avatar_url, role, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    v_role,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or coalesce(p.is_admin, false) = true)
  )
  or exists (
    select 1 from auth.users u
    where u.id = auth.uid() and u.email = 'admin@elchimbero.com'
  );
$$;

create or replace function public.is_business()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('business', 'admin')
  )
  or public.is_admin();
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_business() to anon, authenticated;

drop policy if exists "Usuarios autenticados pueden registrar un comercio" on public.businesses;
drop policy if exists "Negocios y admin pueden registrar comercio" on public.businesses;
create policy "Negocios y admin pueden registrar comercio" on public.businesses
  for insert to authenticated
  with check (
    (auth.uid() = owner_id and public.is_business())
    or public.is_admin()
  );
