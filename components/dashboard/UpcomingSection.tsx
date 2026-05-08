import { CalendarDays, CheckSquare } from "lucide-react";

interface Event {
  id: string;
  title: string;
  start_at: string;
  pillar: string | null;
}

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  pillar: string;
  priority: string;
}

const PILLAR_COLORS: Record<string, string> = {
  celebrations:    "#D4537E",
  school:          "#5B4FCF",
  vacations:       "#1D9E75",
  household:       "#BA7517",
  "kids-activities": "#D85A30",
};

function formatEventDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function UpcomingSection({ events, tasks }: { events: Event[]; tasks: Task[] }) {
  const hasContent = events.length > 0 || tasks.length > 0;

  return (
    <section>
      <h2 className="text-[15px] font-semibold text-content-primary mb-3">Coming up</h2>

      {!hasContent && (
        <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-5 flex flex-col items-center gap-2 text-center">
          <CalendarDays size={28} strokeWidth={1.5} className="text-content-tertiary" />
          <p className="text-[14px] text-content-secondary">Nothing scheduled yet</p>
          <p className="text-[12px] text-content-tertiary">Connect your calendar to see events here</p>
        </div>
      )}

      {hasContent && (
        <div className="flex flex-col gap-2">
          {events.map((e) => (
            <div key={e.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
              <div
                className="w-1.5 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: PILLAR_COLORS[e.pillar ?? ""] ?? "#A0A0A0" }}
              />
              <CalendarDays size={15} strokeWidth={1.5} className="text-content-tertiary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-content-primary truncate">{e.title}</p>
                <p className="text-[12px] text-content-tertiary">{formatEventDate(e.start_at)}</p>
              </div>
            </div>
          ))}

          {tasks.map((t) => (
            <div key={t.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
              <div
                className="w-1.5 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: PILLAR_COLORS[t.pillar] ?? "#A0A0A0" }}
              />
              <CheckSquare size={15} strokeWidth={1.5} className="text-content-tertiary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-content-primary truncate">{t.title}</p>
                <p className="text-[12px] text-content-tertiary">
                  {t.due_date ? formatEventDate(t.due_date) : "No due date"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
