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

-- Enable RLS for user_profiles
alter table public.user_profiles enable row level security;

-- Create policies for user_profiles
create policy "Profiles are viewable by everyone"
    on public.user_profiles
    for select
    using (true);

create policy "Users can update their own profile"
    on public.user_profiles
    for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on public.user_profiles
    for insert
    with check (auth.uid() = id);

-- Create trigger function for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for user_profiles
drop trigger if exists update_user_profiles_updated_at on public.user_profiles;
create trigger update_user_profiles_updated_at
    before update on public.user_profiles
    for each row
    execute function handle_updated_at();