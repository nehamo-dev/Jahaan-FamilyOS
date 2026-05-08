-- ────────────────────────────────────────────
-- Jahaan FamilyOS — Supabase Schema
-- Run this entire file in the SQL editor
-- ────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── 1. CREATE ALL TABLES ──────────────────────

create table families (
  id          uuid primary key default uuid_generate_v4(),
  created_by  uuid references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now()
);

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

create table child_schools (
  id                uuid primary key default uuid_generate_v4(),
  family_member_id  uuid references family_members(id) on delete cascade not null,
  school_name       text not null,
  grade             text not null,
  created_at        timestamptz default now()
);

create table family_settings (
  id              uuid primary key default uuid_generate_v4(),
  family_id       uuid references families(id) on delete cascade not null unique,
  week_start      text check (week_start in ('monday','sunday')) default 'monday',
  reminder_days   int default 3,
  timezone        text default 'America/Los_Angeles',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

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

create table task_comments (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid references tasks(id) on delete cascade not null,
  author_id  uuid references family_members(id) on delete set null,
  body       text not null,
  created_at timestamptz default now()
);

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

create table notification_preferences (
  id       uuid primary key default uuid_generate_v4(),
  user_id  uuid references auth.users(id) on delete cascade not null,
  type     text check (type in ('celebrations','school','vacations','household','kids-activities','tasks','push')) not null,
  enabled  bool default true,
  unique(user_id, type)
);

create table gmail_scan_logs (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  run_at             timestamptz default now(),
  emails_scanned     int default 0,
  events_extracted   int default 0,
  tasks_suggested    int default 0,
  notifications_sent int default 0
);

create table processed_emails (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  gmail_message_id  text not null,
  processed_at      timestamptz default now(),
  unique(user_id, gmail_message_id)
);


-- ── 2. ENABLE RLS ON ALL TABLES ──────────────

alter table families                enable row level security;
alter table family_members          enable row level security;
alter table member_invites          enable row level security;
alter table user_calendars          enable row level security;
alter table calendar_events         enable row level security;
alter table child_schools           enable row level security;
alter table family_settings         enable row level security;
alter table user_integrations       enable row level security;
alter table tasks                   enable row level security;
alter table task_comments           enable row level security;
alter table suggested_tasks         enable row level security;
alter table notification_preferences enable row level security;
alter table gmail_scan_logs         enable row level security;
alter table processed_emails        enable row level security;


-- ── 3. RLS POLICIES (all tables exist now) ───

-- families
create policy "family members can view family" on families
  for select using (
    id in (select family_id from family_members where user_id = auth.uid())
  );
create policy "creator can manage family" on families
  for all using (created_by = auth.uid());

-- family_members
create policy "family members can view members" on family_members
  for select using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );
create policy "creator can seed themselves as first member" on family_members
  for insert with check (
    user_id = auth.uid()
    and family_id in (select id from families where created_by = auth.uid())
  );

create policy "parents can manage members" on family_members
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- member_invites
create policy "parents can manage invites" on member_invites
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- user_calendars
create policy "owner only calendars" on user_calendars
  for all using (user_id = auth.uid());

-- calendar_events
create policy "family members can view events" on calendar_events
  for select using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );
create policy "owner can manage events" on calendar_events
  for all using (user_id = auth.uid());

-- child_schools
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

-- family_settings
create policy "family members can view settings" on family_settings
  for select using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );
create policy "parents can manage settings" on family_settings
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- user_integrations
create policy "owner only integrations" on user_integrations
  for all using (user_id = auth.uid());

-- tasks
create policy "family members can view tasks" on tasks
  for select using (
    family_id in (select family_id from family_members where user_id = auth.uid())
  );
create policy "parents and caregivers can manage tasks" on tasks
  for all using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role in ('parent','caregiver')
    )
  );

-- task_comments
create policy "family members can manage comments" on task_comments
  for all using (
    task_id in (
      select id from tasks
      where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- suggested_tasks
create policy "parents can view suggestions" on suggested_tasks
  for select using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );
create policy "parents can update suggestions" on suggested_tasks
  for update using (
    family_id in (
      select family_id from family_members
      where user_id = auth.uid() and role = 'parent'
    )
  );

-- notification_preferences
create policy "owner only notifications" on notification_preferences
  for all using (user_id = auth.uid());

-- gmail_scan_logs
create policy "owner only scan logs" on gmail_scan_logs
  for select using (user_id = auth.uid());

-- processed_emails
create policy "owner only processed emails" on processed_emails
  for all using (user_id = auth.uid());


-- ── 4. TRIGGERS ──────────────────────────────

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
