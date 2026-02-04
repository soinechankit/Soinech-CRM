-- Profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'sales_executive',
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
  pricing_type text not null default 'fixed',
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
  lead_source text not null,
  status text not null default 'new',
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
  note_type text not null default 'general',
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
  probability integer default 50,
  stage text not null default 'qualification',
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
  priority text default 'medium',
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
