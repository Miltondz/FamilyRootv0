-- Enable storage if not already enabled
create extension if not exists "storage" schema "extensions";

-- Create a new storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public access to the avatars bucket
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
create policy "Users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );

-- Allow users to update their own avatars
create policy "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );