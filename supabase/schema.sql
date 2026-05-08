-- ────────────────────────────────────────────
-- Jahaan FamilyOS — Supabase Schema
-- ────────────────────────────────────────────

-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- ── families ──
create table families (
  id          uuid primary key default uuid_generate_v4(),
  created_by  uuid references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now()
);
alter table families enable row level security;
create policy "family members can view" on families
  for select using (
    id in (
      select family_id from family_members
      where user_id = auth.uid()
    )
  );
create policy "creator can manage" on families
  for all using (created_by = auth.uid());

-- ── family_members ──
create table family_members (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete set null,
  family_id     uuid references families(id) on delete cascade not null,
  name          text not null,
  role          text check (role in ('parent','child','caregiver')) not null,
  birthday      date,
  avatar_color  text not null default '#EEEDFE',
  created_at    timestamptz default now()
);
alter table family_members enable row level security;
create policy "family members can view" on family_members
  for select using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid()
    )
  );
create policy "parents can manage" on family_members
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- ── member_invites ──
create table member_invites (
  id                uuid primary key default uuid_generate_v4(),
  family_id         uuid references families(id) on delete cascade not null,
  family_member_id  uuid references family_members(id) on delete cascade not null,
  email             text not null,
  role              text check (role in ('parent','child','caregiver')) not null,
  status            text check (status in ('pending','accepted')) default 'pending',
  invited_at        timestamptz default now(),
  accepted_at       timestamptz
);
alter table member_invites enable row level security;
create policy "family parents can manage invites" on member_invites
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- ── user_calendars ──
create table user_calendars (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  family_id      uuid references families(id) on delete cascade not null,
  calendar_id    text not null,
  calendar_name  text not null,
  color          text not null default '#5B4FCF',
  provider       text check (provider in ('google')) default 'google',
  created_at     timestamptz default now()
);
alter table user_calendars enable row level security;
create policy "owner only" on user_calendars
  for all using (user_id = auth.uid());

-- ── calendar_events ──
create table calendar_events (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  family_id         uuid references families(id) on delete cascade not null,
  gcal_event_id     text,
  title             text not null,
  start_at          timestamptz not null,
  end_at            timestamptz not null,
  pillar            text check (pillar in ('celebrations','school','vacations','household','kids-activities','none')),
  source            text check (source in ('gcal_sync','gmail_scan')) not null,
  assigned_members  uuid[] default '{}',
  raw_json          jsonb,
  created_at        timestamptz default now()
);
alter table calendar_events enable row level security;
create policy "family members can view events" on calendar_events
  for select using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );
create policy "owner can manage events" on calendar_events
  for all using (user_id = auth.uid());

-- ── child_schools ──
create table child_schools (
  id                uuid primary key default uuid_generate_v4(),
  family_member_id  uuid references family_members(id) on delete cascade not null,
  school_name       text not null,
  grade             text not null,
  created_at        timestamptz default now()
);
alter table child_schools enable row level security;
create policy "family members can view schools" on child_schools
  for select using (
    family_member_id in (
      select id from family_members
      where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );
create policy "parents can manage schools" on child_schools
  for all using (
    family_member_id in (
      select id from family_members
      where family_id in (
        select family_id from family_members
        where user_id = auth.uid() and role = 'parent'
      )
    )
  );

-- ── family_settings ──
create table family_settings (
  id              uuid primary key default uuid_generate_v4(),
  family_id       uuid references families(id) on delete cascade not null unique,
  week_start      text check (week_start in ('monday','sunday')) default 'monday',
  reminder_days   int default 3,
  timezone        text default 'America/Los_Angeles',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table family_settings enable row level security;
create policy "family members can view settings" on family_settings
  for select using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );
create policy "parents can manage settings" on family_settings
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- ── user_integrations ──
create table user_integrations (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  provider       text check (provider in ('google_calendar','gmail')) not null,
  access_token   text not null,
  refresh_token  text,
  scope          text not null,
  expires_at     timestamptz not null,
  created_at     timestamptz default now(),
  unique(user_id, provider)
);
alter table user_integrations enable row level security;
create policy "owner only" on user_integrations
  for all using (user_id = auth.uid());

-- ── tasks ──
create table tasks (
  id                 uuid primary key default uuid_generate_v4(),
  family_id          uuid references families(id) on delete cascade not null,
  created_by         uuid references family_members(id) on delete set null,
  title              text not null,
  description        text,
  pillar             text check (pillar in ('celebrations','school','vacations','household','kids-activities','none')) default 'none',
  calendar_event_id  uuid references calendar_events(id) on delete set null,
  assigned_to        uuid[] default '{}',
  due_date           timestamptz,
  reminder_at        timestamptz,
  status             text check (status in ('todo','in-progress','done','skipped')) default 'todo',
  priority           text check (priority in ('low','medium','high')) default 'medium',
  recurrence         jsonb,
  completed_at       timestamptz,
  completed_by       uuid references family_members(id) on delete set null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table tasks enable row level security;
create policy "family members can view tasks" on tasks
  for select using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );
create policy "parents and caregivers can manage tasks" on tasks
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role in ('parent','caregiver')
    )
  );

-- ── task_comments ──
create table task_comments (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid references tasks(id) on delete cascade not null,
  author_id  uuid references family_members(id) on delete set null,
  body       text not null,
  created_at timestamptz default now()
);
alter table task_comments enable row level security;
create policy "family members can manage comments" on task_comments
  for all using (
    task_id in (
      select id from tasks
      where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ── suggested_tasks ──
create table suggested_tasks (
  id                      uuid primary key default uuid_generate_v4(),
  family_id               uuid references families(id) on delete cascade not null,
  title                   text not null,
  suggested_assignee_role text check (suggested_assignee_role in ('parent','child','caregiver')),
  suggested_due_date      timestamptz,
  pillar                  text check (pillar in ('celebrations','school','vacations','household','kids-activities','none')),
  confidence              float check (confidence between 0 and 1) not null,
  source_email_id         text,
  accepted                bool default false,
  dismissed               bool default false,
  created_at              timestamptz default now()
);
alter table suggested_tasks enable row level security;
create policy "parents can view suggestions" on suggested_tasks
  for select using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );
create policy "parents can manage suggestions" on suggested_tasks
  for update using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- ── notification_preferences ──
create table notification_preferences (
  id       uuid primary key default uuid_generate_v4(),
  user_id  uuid references auth.users(id) on delete cascade not null,
  type     text check (type in ('celebrations','school','vacations','household','kids-activities','tasks','push')) not null,
  enabled  bool default true,
  unique(user_id, type)
);
alter table notification_preferences enable row level security;
create policy "owner only" on notification_preferences
  for all using (user_id = auth.uid());

-- ── gmail_scan_logs ──
create table gmail_scan_logs (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  run_at            timestamptz default now(),
  emails_scanned    int default 0,
  events_extracted  int default 0,
  tasks_suggested   int default 0,
  notifications_sent int default 0
);
alter table gmail_scan_logs enable row level security;
create policy "owner only" on gmail_scan_logs
  for select using (user_id = auth.uid());

-- ── processed_emails ──
create table processed_emails (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  gmail_message_id    text not null,
  processed_at        timestamptz default now(),
  unique(user_id, gmail_message_id)
);
alter table processed_emails enable row level security;
create policy "owner only" on processed_emails
  for all using (user_id = auth.uid());

-- ── updated_at trigger ──
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

create trigger family_settings_updated_at
  before update on family_settings
  for each row execute function update_updated_at();
