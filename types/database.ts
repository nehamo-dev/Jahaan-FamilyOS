export type Role = "parent" | "child" | "caregiver";
export type InviteStatus = "pending" | "accepted";
export type Provider = "google_calendar" | "gmail";
export type Pillar =
  | "celebrations"
  | "school"
  | "vacations"
  | "household"
  | "kids-activities"
  | "none";
export type TaskStatus = "todo" | "in-progress" | "done" | "skipped";
export type TaskPriority = "low" | "medium" | "high";
export type EventSource = "gcal_sync" | "gmail_scan";
export type WeekStart = "monday" | "sunday";

type TableDef<R, I, U> = { Row: R; Insert: I; Update: U; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      families:                 TableDef<Family,               Omit<Family, "id" | "created_at">,                    Partial<Omit<Family, "id">>>;
      family_members:           TableDef<FamilyMember,         Omit<FamilyMember, "id" | "created_at">,              Partial<Omit<FamilyMember, "id">>>;
      member_invites:           TableDef<MemberInvite,         Omit<MemberInvite, "id">,                             Partial<Omit<MemberInvite, "id">>>;
      user_calendars:           TableDef<UserCalendar,         Omit<UserCalendar, "id" | "created_at">,              Partial<Omit<UserCalendar, "id">>>;
      calendar_events:          TableDef<CalendarEvent,        Omit<CalendarEvent, "id" | "created_at">,             Partial<Omit<CalendarEvent, "id">>>;
      child_schools:            TableDef<ChildSchool,          Omit<ChildSchool, "id" | "created_at">,               Partial<Omit<ChildSchool, "id">>>;
      family_settings:          TableDef<FamilySettings,       Omit<FamilySettings, "id" | "created_at" | "updated_at">, Partial<Omit<FamilySettings, "id">>>;
      user_integrations:        TableDef<UserIntegration,      Omit<UserIntegration, "id" | "created_at">,           Partial<Omit<UserIntegration, "id">>>;
      tasks:                    TableDef<Task,                  Omit<Task, "id" | "created_at" | "updated_at">,       Partial<Omit<Task, "id">>>;
      task_comments:            TableDef<TaskComment,          Omit<TaskComment, "id" | "created_at">,               Partial<Omit<TaskComment, "id">>>;
      suggested_tasks:          TableDef<SuggestedTask,        Omit<SuggestedTask, "id" | "created_at">,             Partial<Omit<SuggestedTask, "id">>>;
      notification_preferences: TableDef<NotificationPreference, Omit<NotificationPreference, "id">,                 Partial<Omit<NotificationPreference, "id">>>;
      gmail_scan_logs:          TableDef<GmailScanLog,         Omit<GmailScanLog, "id">,                             Partial<Omit<GmailScanLog, "id">>>;
      processed_emails:         TableDef<ProcessedEmail,       Omit<ProcessedEmail, "id">,                           Partial<Omit<ProcessedEmail, "id">>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface Family {
  id: string;
  created_by: string;
  name: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string | null;
  family_id: string;
  name: string;
  role: Role;
  birthday: string | null;
  avatar_color: string;
  created_at: string;
}

export interface MemberInvite {
  id: string;
  family_id: string;
  family_member_id: string;
  email: string;
  role: Role;
  status: InviteStatus;
  invited_at: string;
  accepted_at: string | null;
}

export interface UserCalendar {
  id: string;
  user_id: string;
  family_id: string;
  calendar_id: string;
  calendar_name: string;
  color: string;
  provider: "google";
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  family_id: string;
  gcal_event_id: string | null;
  title: string;
  start_at: string;
  end_at: string;
  pillar: Pillar | null;
  source: EventSource;
  assigned_members: string[];
  raw_json: Record<string, unknown> | null;
  created_at: string;
}

export interface ChildSchool {
  id: string;
  family_member_id: string;
  school_name: string;
  grade: string;
  created_at: string;
}

export interface FamilySettings {
  id: string;
  family_id: string;
  week_start: WeekStart;
  reminder_days: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  provider: Provider;
  access_token: string;
  refresh_token: string | null;
  scope: string;
  expires_at: string;
  created_at: string;
}

export interface Task {
  id: string;
  family_id: string;
  created_by: string;
  title: string;
  description: string | null;
  pillar: Pillar;
  calendar_event_id: string | null;
  assigned_to: string[];
  due_date: string | null;
  reminder_at: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  recurrence: Record<string, unknown> | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface SuggestedTask {
  id: string;
  family_id: string;
  title: string;
  suggested_assignee_role: Role | null;
  suggested_due_date: string | null;
  pillar: Pillar;
  confidence: number;
  source_email_id: string | null;
  accepted: boolean;
  dismissed: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type:
    | "celebrations"
    | "school"
    | "vacations"
    | "household"
    | "kids-activities"
    | "tasks"
    | "push";
  enabled: boolean;
}

export interface GmailScanLog {
  id: string;
  user_id: string;
  run_at: string;
  emails_scanned: number;
  events_extracted: number;
  tasks_suggested: number;
  notifications_sent: number;
}

export interface ProcessedEmail {
  id: string;
  user_id: string;
  gmail_message_id: string;
  processed_at: string;
}
