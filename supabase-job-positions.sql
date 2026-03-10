-- Run this in your Supabase SQL Editor
-- Creates the job_positions table that admins manage

create table if not exists job_positions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text not null default 'Remote',
  type text not null default 'Full-time',
  short_description text not null,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: anyone can read active positions, only service_role (admin) can write
alter table job_positions enable row level security;

create policy "Public can read active positions"
  on job_positions for select
  using (is_active = true);

-- Admins insert/update/delete via Supabase dashboard (using service role key)
-- or via a separate admin panel using the service_role key (never expose to frontend)

-- Example: insert a position from Supabase dashboard
-- insert into job_positions (title, department, location, type, short_description, description)
-- values (
--   'AI/ML Engineer',
--   'Engineering',
--   'Remote / Badlapur',
--   'Full-time',
--   'Build and deploy AI models that power our B2B automation products.',
--   'You will work closely with the product team to design, train, and integrate ML models into our SaaS platform. Experience with Python, PyTorch/TensorFlow, and REST APIs required. Knowledge of LLMs and prompt engineering is a strong plus.'
-- );
