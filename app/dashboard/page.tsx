import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Cake, GraduationCap, PalmtreeIcon, Wrench, Sparkles } from "lucide-react";
import { PillarCard } from "@/components/dashboard/PillarCard";
import { UpcomingSection } from "@/components/dashboard/UpcomingSection";
import { MemberAvatars } from "@/components/dashboard/MemberAvatars";

const PILLARS = [
  { key: "celebrations",    label: "Celebrations", icon: Cake,          color: "#D4537E", bg: "#FCEEF3" },
  { key: "school",          label: "School",       icon: GraduationCap, color: "#5B4FCF", bg: "#EEEDFE" },
  { key: "vacations",       label: "Vacations",    icon: PalmtreeIcon,  color: "#1D9E75", bg: "#E1F5EE" },
  { key: "household",       label: "Household",    icon: Wrench,        color: "#BA7517", bg: "#FDF3E1" },
  { key: "kids-activities", label: "Kids",         icon: Sparkles,      color: "#D85A30", bg: "#FDEEE8" },
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  // Load family
  const { data: family } = await supabase
    .from("families")
    .select("id, name")
    .eq("created_by", user.id)
    .maybeSingle();

  // Load members
  const members = family ? await supabase
    .from("family_members")
    .select("id, name, role, avatar_color")
    .eq("family_id", family.id)
    .order("created_at")
    .then(({ data }) => data ?? []) : [];

  // Load upcoming events (next 14 days)
  const now = new Date().toISOString();
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString();
  const events = family ? await supabase
    .from("calendar_events")
    .select("id, title, start_at, end_at, pillar")
    .eq("family_id", family.id)
    .gte("start_at", now)
    .lte("start_at", in14)
    .order("start_at")
    .limit(20)
    .then(({ data }) => data ?? []) : [];

  // Load pending tasks
  const tasks = family ? await supabase
    .from("tasks")
    .select("id, title, due_date, pillar, status, priority")
    .eq("family_id", family.id)
    .eq("status", "todo")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(10)
    .then(({ data }) => data ?? []) : [];

  // Event counts per pillar
  const eventCounts = Object.fromEntries(
    PILLARS.map((p) => [p.key, events.filter((e) => e.pillar === p.key).length])
  );
  const taskCounts = Object.fromEntries(
    PILLARS.map((p) => [p.key, tasks.filter((t) => t.pillar === p.key).length])
  );

  return (
    <main className="flex flex-col px-5 pt-[max(24px,env(safe-area-inset-top))]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-content-primary tracking-[-0.01em]">
            {greeting()}, {firstName}
          </h1>
          <p className="text-[13px] text-content-tertiary mt-0.5">{formatDate()}</p>
        </div>
        <MemberAvatars members={members} />
      </div>

      {/* Pillar grid */}
      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {PILLARS.map((p) => (
            <PillarCard
              key={p.key}
              pillarKey={p.key}
              label={p.label}
              icon={p.icon}
              color={p.color}
              bg={p.bg}
              eventCount={eventCounts[p.key] ?? 0}
              taskCount={taskCounts[p.key] ?? 0}
            />
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <UpcomingSection events={events} tasks={tasks} />
    </main>
  );
}
