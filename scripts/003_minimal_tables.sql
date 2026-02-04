-- Minimal CRM Tables

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text default 'sales_executive' check (role in ('admin', 'sales_manager', 'sales_executive')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_price decimal(12,2) not null default 0,
  category text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.services enable row level security;

create policy "services_select_all" on public.services for select using (true);
create policy "services_insert_all" on public.services for insert with check (true);
create policy "services_update_all" on public.services for update using (true);

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text,
  phone text,
  source text check (source in ('website', 'referral', 'cold_call', 'linkedin', 'advertisement', 'other')),
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  notes text,
  expected_value decimal(12,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "leads_select_all" on public.leads for select using (true);
create policy "leads_insert_all" on public.leads for insert with check (true);
create policy "leads_update_all" on public.leads for update using (true);
create policy "leads_delete_all" on public.leads for delete using (true);

-- Lead notes table
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.lead_notes enable row level security;

create policy "lead_notes_select_all" on public.lead_notes for select using (true);
create policy "lead_notes_insert_all" on public.lead_notes for insert with check (true);

-- Deals table
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  title text not null,
  value decimal(12,2) not null default 0,
  stage text default 'qualification' check (stage in ('qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability integer default 20 check (probability >= 0 and probability <= 100),
  expected_close_date date,
  assigned_to uuid references public.profiles(id),
  notes text,
  lost_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.deals enable row level security;

create policy "deals_select_all" on public.deals for select using (true);
create policy "deals_insert_all" on public.deals for insert with check (true);
create policy "deals_update_all" on public.deals for update using (true);

-- Follow-ups table
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  title text not null,
  description text,
  type text default 'call' check (type in ('call', 'email', 'meeting', 'task', 'other')),
  due_date timestamptz not null,
  completed boolean default false,
  completed_at timestamptz,
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.follow_ups enable row level security;

create policy "follow_ups_select_all" on public.follow_ups for select using (true);
create policy "follow_ups_insert_all" on public.follow_ups for insert with check (true);
create policy "follow_ups_update_all" on public.follow_ups for update using (true);

-- Trigger function for auto profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
