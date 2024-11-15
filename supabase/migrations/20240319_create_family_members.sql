-- Create family_members table
create table public.family_members (
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

-- Enable RLS
alter table public.family_members enable row level security;

-- Create policy to allow users to manage their own family members
create policy "Users can manage their family members"
    on public.family_members
    for all
    using (
        tree_id in (
            select id from public.family_trees
            where user_id = auth.uid()
        )
    );

-- Create indexes for better performance
create index family_members_tree_id_idx on public.family_members(tree_id);
create index family_members_parent_ids_idx on public.family_members using gin(parent_ids);
create index family_members_spouse_ids_idx on public.family_members using gin(spouse_ids);