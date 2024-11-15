-- Enable storage extension if not already enabled
create extension if not exists "storage" schema "extensions";

-- Create avatars bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB in bytes
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies for the avatars bucket
drop policy if exists "Avatars are publicly accessible" on storage.objects;
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Users can upload avatars" on storage.objects;
create policy "Users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );

drop policy if exists "Users can update their own avatars" on storage.objects;
create policy "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );

drop policy if exists "Users can delete their own avatars" on storage.objects;
create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );