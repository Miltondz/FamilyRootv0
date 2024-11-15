-- Create user_profiles table
create table public.user_profiles (
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

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create policy to allow users to view any profile
create policy "Profiles are viewable by everyone"
    on public.user_profiles
    for select
    using (true);

-- Create policy to allow users to update their own profile
create policy "Users can update their own profile"
    on public.user_profiles
    for update
    using (auth.uid() = id);

-- Create policy to allow users to insert their own profile
create policy "Users can insert their own profile"
    on public.user_profiles
    for insert
    with check (auth.uid() = id);

-- Create trigger to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
    before update on public.user_profiles
    for each row
    execute function handle_updated_at();