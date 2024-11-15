import { supabase } from './supabase';

export async function initializeStorage() {
  try {
    // Create the avatars bucket with private access
    const { error: bucketError } = await supabase.storage.createBucket('avatars', {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    // Ignore error if bucket already exists
    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.warn('Error creating bucket:', bucketError);
    }

    // Set up storage policies through SQL
    const { error: policyError } = await supabase.rpc('setup_storage_policies', {
      sql: `
        -- Enable RLS for storage
        alter table storage.objects enable row level security;

        -- Drop existing policies if they exist
        drop policy if exists "Avatar access policy" on storage.objects;
        drop policy if exists "Avatar insert policy" on storage.objects;
        drop policy if exists "Avatar update policy" on storage.objects;
        drop policy if exists "Avatar delete policy" on storage.objects;

        -- Create new policies for private avatar access
        create policy "Avatar access policy"
          on storage.objects for select
          using (bucket_id = 'avatars');

        create policy "Avatar insert policy"
          on storage.objects for insert
          with check (
            bucket_id = 'avatars'
            and auth.uid() = owner
          );

        create policy "Avatar update policy"
          on storage.objects for update
          using (
            bucket_id = 'avatars'
            and auth.uid() = owner
          );

        create policy "Avatar delete policy"
          on storage.objects for delete
          using (
            bucket_id = 'avatars'
            and auth.uid() = owner
          );
      `
    });

    if (policyError) {
      console.warn('Error setting up storage policies:', policyError);
    }

    return true;
  } catch (error) {
    console.error('Storage initialization error:', error);
    return false;
  }
}