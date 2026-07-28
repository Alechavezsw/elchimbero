-- Image columns + event coordinates + public uploads bucket

alter table public.pharmacies add column if not exists image_url text;
alter table public.kiosks add column if not exists image_url text;
alter table public.jobs add column if not exists image_url text;
alter table public.events add column if not exists latitude numeric;
alter table public.events add column if not exists longitude numeric;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "uploads_public_read" on storage.objects;
drop policy if exists "uploads_auth_insert" on storage.objects;
drop policy if exists "uploads_auth_update" on storage.objects;
drop policy if exists "uploads_auth_delete" on storage.objects;

create policy "uploads_public_read"
on storage.objects for select
using (bucket_id = 'uploads');

create policy "uploads_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'uploads');

create policy "uploads_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'uploads');

create policy "uploads_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'uploads');
