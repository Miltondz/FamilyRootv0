import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    // Initialize database tables
    await supabase.rpc('create_tables', {
      sql: `
        -- Create family_trees table
        create table if not exists public.family_trees (
          id uuid default gen_random_uuid() primary key,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          name text not null,
          user_id uuid references auth.users(id) on delete cascade not null
        );

        alter table public.family_trees enable row level security;

        drop policy if exists "Users can manage their own family trees" on public.family_trees;
        create policy "Users can manage their own family trees"
          on public.family_trees
          for all
          using (user_id = auth.uid());

        create index if not exists family_trees_user_id_idx on public.family_trees(user_id);

        -- Create family_members table
        create table if not exists public.family_members (
          id uuid default gen_random_uuid() primary key,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          tree_id uuid references public.family_trees(id) on delete cascade not null,
          first_name text not null,
          last_name text not null,
          birth_date date,
          death_date date,
          gender text,
          photo_url text,
          notes text,
          parent_ids uuid[],
          spouse_ids uuid[]
        );

        alter table public.family_members enable row level security;

        drop policy if exists "Users can manage their family members" on public.family_members;
        create policy "Users can manage their family members"
          on public.family_members
          for all
          using (
            tree_id in (
              select id from public.family_trees
              where user_id = auth.uid()
            )
          );

        create index if not exists family_members_tree_id_idx on public.family_members(tree_id);
        create index if not exists family_members_parent_ids_idx on public.family_members using gin(parent_ids);
        create index if not exists family_members_spouse_ids_idx on public.family_members using gin(spouse_ids);

        -- Create user_profiles table
        create table if not exists public.user_profiles (
          id uuid primary key references auth.users(id) on delete cascade,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
          full_name text,
          avatar_url text,
          bio text,
          twitter_url text,
          linkedin_url text,
          facebook_url text,
          website_url text
        );

        alter table public.user_profiles enable row level security;

        -- Drop existing policies
        drop policy if exists "Profiles are viewable by everyone" on public.user_profiles;
        drop policy if exists "Users can update their own profile" on public.user_profiles;
        drop policy if exists "Users can insert their own profile" on public.user_profiles;

        -- Create new policies with correct permissions
        create policy "Anyone can view profiles"
          on public.user_profiles for select
          using (true);

        create policy "Users can insert their own profile"
          on public.user_profiles for insert
          with check (auth.uid() = id);

        create policy "Users can update own profile"
          on public.user_profiles for update
          using (auth.uid() = id);

        -- Create or replace the updated_at trigger function
        create or replace function handle_updated_at()
        returns trigger as $$
        begin
          new.updated_at = now();
          return new;
        end;
        $$ language plpgsql;

        -- Create the trigger if it doesn't exist
        drop trigger if exists update_user_profiles_updated_at on public.user_profiles;
        create trigger update_user_profiles_updated_at
          before update on public.user_profiles
          for each row
          execute function handle_updated_at();
      `
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}