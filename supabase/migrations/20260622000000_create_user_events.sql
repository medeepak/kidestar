-- Create user_events table for tracking visitor funnel and user actions
create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  event_name text not null,
  page_path text not null,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.user_events enable row level security;

-- Allow insert access to anyone (anon and authenticated) so that anonymous landings and logged-in user actions can be tracked
create policy "Allow insert access for all" on public.user_events
  for insert to anon, authenticated
  with check (true);

-- Allow users to view their own tracked events (anon cannot view any events, authenticated users can view theirs)
create policy "Allow users to view own events" on public.user_events
  for select to authenticated
  using (user_id = auth.uid());

-- Indexes for performance on funnel queries
create index if not exists user_events_session_id_idx on public.user_events(session_id);
create index if not exists user_events_user_id_idx on public.user_events(user_id);
create index if not exists user_events_event_name_idx on public.user_events(event_name);
create index if not exists user_events_created_at_idx on public.user_events(created_at);
