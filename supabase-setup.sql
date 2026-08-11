create table if not exists public.radio_config (
  id integer primary key,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.radio_config (id, config)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.radio_config enable row level security;

-- No public policies are required.
-- The Vercel serverless API uses SUPABASE_SERVICE_ROLE_KEY on the server only.
