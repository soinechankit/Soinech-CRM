-- Sales CRM Database Schema

-- Drop existing policies first (ignore errors if they don't exist)
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "services_select_all" on public.services;
drop policy if exists "services_insert_admin" on public.services;
drop policy if exists "services_update_admin" on public.services;
drop policy if exists "leads_select_own_or_manager" on public.leads;
drop policy if exists "leads_insert_authenticated" on public.leads;
drop policy if exists "leads_update_own_or_manager" on public.leads;
drop policy if exists "leads_delete_admin" on public.leads;
drop policy if exists "lead_history_select" on public.lead_status_history;
drop policy if exists "lead_history_insert" on public.lead_status_history;
drop policy if exists "lead_notes_select" on public.lead_notes;
drop policy if exists "lead_notes_insert" on public.lead_notes;
drop policy if exists "lead_notes_update_own" on public.lead_notes;
drop policy if exists "deals_select_own_or_manager" on public.deals;
drop policy if exists "deals_insert_authenticated" on public.deals;
drop policy if exists "deals_update_own_or_manager" on public.deals;
drop policy if exists "follow_ups_select_own_or_manager" on public.follow_ups;
drop policy if exists "follow_ups_insert_authenticated" on public.follow_ups;
drop policy if exists "follow_ups_update_own" on public.follow_ups;

-- Profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'sales_executive' check (role in ('sales_executive', 'sales_manager', 'admin', 'finance')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Services catalog
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  base_price numeric(12,2),
  pricing_type text not null default 'fixed' check (pricing_type in ('fixed', 'custom')),
  delivery_days integer,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text,
  phone text,
  industry text,
  location text,
  lead_source text not null check (lead_source in ('google_ads', 'meta_ads', 'referral', 'cold_call', 'website_organic', 'other')),
  status text not null default 'new' check (status in ('new', 'contacted', 'meeting_done', 'proposal_sent', 'won', 'lost')),
  assigned_to uuid references public.profiles(id),
  next_follow_up timestamptz,
  expected_value numeric(12,2),
  lost_reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lead status history for audit trail
create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz default now()
);

-- Lead notes/communication log
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  note_type text not null default 'general' check (note_type in ('general', 'call', 'meeting', 'email', 'whatsapp')),
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deals/Pipeline
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  deal_name text not null,
  deal_value numeric(12,2) not null,
  probability integer default 50 check (probability >= 0 and probability <= 100),
  stage text not null default 'qualification' check (stage in ('qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date date,
  actual_close_date date,
  lost_reason text,
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Follow-up reminders
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz not null,
  is_completed boolean default false,
  completed_at timestamptz,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.lead_notes enable row level security;
alter table public.deals enable row level security;
alter table public.follow_ups enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- RLS Policies for services (all authenticated users can view)
create policy "services_select_all" on public.services for select using (true);
create policy "services_insert_admin" on public.services for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
);
create policy "services_update_admin" on public.services for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
);

-- RLS Policies for leads
create policy "leads_select_own_or_manager" on public.leads for select using (
  assigned_to = auth.uid() or
  created_by = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager', 'finance'))
);
create policy "leads_insert_authenticated" on public.leads for insert with check (auth.uid() is not null);
create policy "leads_update_own_or_manager" on public.leads for update using (
  assigned_to = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
);
create policy "leads_delete_admin" on public.leads for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RLS Policies for lead_status_history
create policy "lead_history_select" on public.lead_status_history for select using (
  exists (select 1 from public.leads where leads.id = lead_id and (
    leads.assigned_to = auth.uid() or
    leads.created_by = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
  ))
);
create policy "lead_history_insert" on public.lead_status_history for insert with check (auth.uid() is not null);

-- RLS Policies for lead_notes
create policy "lead_notes_select" on public.lead_notes for select using (
  exists (select 1 from public.leads where leads.id = lead_id and (
    leads.assigned_to = auth.uid() or
    leads.created_by = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
  ))
);
create policy "lead_notes_insert" on public.lead_notes for insert with check (auth.uid() is not null);
create policy "lead_notes_update_own" on public.lead_notes for update using (created_by = auth.uid());

-- RLS Policies for deals
create policy "deals_select_own_or_manager" on public.deals for select using (
  assigned_to = auth.uid() or
  created_by = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager', 'finance'))
);
create policy "deals_insert_authenticated" on public.deals for insert with check (auth.uid() is not null);
create policy "deals_update_own_or_manager" on public.deals for update using (
  assigned_to = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
);

-- RLS Policies for follow_ups
create policy "follow_ups_select_own_or_manager" on public.follow_ups for select using (
  assigned_to = auth.uid() or
  created_by = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
);
create policy "follow_ups_insert_authenticated" on public.follow_ups for insert with check (auth.uid() is not null);
create policy "follow_ups_update_own" on public.follow_ups for update using (
  assigned_to = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sales_manager'))
);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'sales_executive')
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

-- Trigger to log lead status changes
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.status is distinct from new.status then
    insert into public.lead_status_history (lead_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists on_lead_status_change on public.leads;
create trigger on_lead_status_change
  after update on public.leads
  for each row
  execute function public.log_lead_status_change();

-- Insert default services
insert into public.services (name, description, category, base_price, pricing_type, delivery_days) values
  ('Website Development', 'Custom responsive website development', 'Web Development', 50000, 'custom', 30),
  ('E-commerce Website', 'Full-featured online store', 'Web Development', 100000, 'custom', 45),
  ('Mobile App Development', 'iOS and Android app development', 'App Development', 150000, 'custom', 60),
  ('SEO Services', 'Search engine optimization package', 'Digital Marketing', 15000, 'fixed', 30),
  ('Social Media Marketing', 'Social media management and ads', 'Digital Marketing', 20000, 'fixed', 30),
  ('Google Ads Management', 'PPC campaign management', 'Digital Marketing', 25000, 'fixed', 30),
  ('Brand Identity Design', 'Logo and brand guidelines', 'Branding & Design', 30000, 'fixed', 14),
  ('UI/UX Design', 'User interface and experience design', 'Branding & Design', 40000, 'custom', 21),
  ('IT Support Package', 'Monthly IT support and maintenance', 'IT Support', 10000, 'fixed', 30),
  ('Cloud Infrastructure', 'Cloud setup and management', 'IT Support', 50000, 'custom', 14)
on conflict do nothing;
