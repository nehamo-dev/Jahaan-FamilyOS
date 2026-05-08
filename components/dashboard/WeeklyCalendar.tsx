"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, CalendarDays, CheckSquare, Plus } from "lucide-react";

interface CalEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  pillar: string | null;
}

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  pillar: string;
  status: string;
}

const PILLAR_COLORS: Record<string, string> = {
  celebrations:      "#D4537E",
  school:            "#5B4FCF",
  vacations:         "#1D9E75",
  household:         "#BA7517",
  "kids-activities": "#D85A30",
};

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDayHeader(d: Date, today: Date) {
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, addDays(today, 1))) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function WeeklyCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFamily() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: fam } = await supabase
        .from("families").select("id").eq("created_by", user.id).maybeSingle();
      if (fam) setFamilyId(fam.id);
      setLoading(false);
    }
    loadFamily();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!familyId) return;
    loadWeekData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId, weekStart]);

  async function loadWeekData() {
    const supabase = createClient();
    const from = weekStart.toISOString();
    const to = addDays(weekStart, 7).toISOString();

    const [{ data: evts }, { data: tsks }] = await Promise.all([
      supabase.from("calendar_events")
        .select("id, title, start_at, end_at, pillar")
        .eq("family_id", familyId!)
        .gte("start_at", from).lt("start_at", to)
        .order("start_at"),
      supabase.from("tasks")
        .select("id, title, due_date, pillar, status")
        .eq("family_id", familyId!)
        .gte("due_date", from).lt("due_date", to)
        .neq("status", "done"),
    ]);

    setEvents(evts ?? []);
    setTasks(tsks ?? []);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthLabel = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const hasAnything = events.length > 0 || tasks.length > 0;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[max(20px,env(safe-area-inset-top))] pb-4 border-b border-[rgba(0,0,0,0.06)]">
        <h1 className="text-[18px] font-semibold text-content-primary">{monthLabel}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)] active:scale-95 transition-all"
          >
            <ChevronLeft size={18} strokeWidth={1.5} className="text-content-secondary" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(today))}
            className="px-3 h-7 rounded-pill text-[12px] font-medium text-primary bg-primary-light active:scale-95 transition-all"
          >
            This week
          </button>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)] active:scale-95 transition-all"
          >
            <ChevronRight size={18} strokeWidth={1.5} className="text-content-secondary" />
          </button>
        </div>
      </div>

      {/* Week at a glance strip */}
      <div className="flex px-3 py-3 border-b border-[rgba(0,0,0,0.06)] gap-1">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dayEvents = events.filter((e) => isSameDay(new Date(e.start_at), day));
          const dayTasks = tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), day));
          const count = dayEvents.length + dayTasks.length;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-content-tertiary"}`}>
                {["M","T","W","T","F","S","S"][i]}
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isToday ? "bg-primary" : ""}`}>
                <span className={`text-[13px] font-semibold ${isToday ? "text-white" : "text-content-primary"}`}>
                  {day.getDate()}
                </span>
              </div>
              {count > 0
                ? <div className="flex gap-0.5 flex-wrap justify-center">
                    {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-primary opacity-60" />
                    ))}
                  </div>
                : <div className="h-1.5" />
              }
            </div>
          );
        })}
      </div>

      {/* Full week content */}
      <div className="px-5 pt-4 flex flex-col gap-5 pb-6">
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-card bg-white border border-[rgba(0,0,0,0.07)] animate-pulse" />)}
          </div>
        )}

        {!loading && !hasAnything && (
          <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-6 flex flex-col items-center gap-2 text-center">
            <CalendarDays size={28} strokeWidth={1.5} className="text-content-tertiary" />
            <p className="text-[14px] text-content-secondary">Nothing scheduled this week</p>
            <p className="text-[12px] text-content-tertiary">Tap + to add something</p>
          </div>
        )}

        {!loading && weekDays.map((day, i) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.start_at), day));
          const dayTasks = tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), day));
          if (dayEvents.length === 0 && dayTasks.length === 0) return null;

          const isToday = isSameDay(day, today);

          return (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className={`text-[13px] font-semibold ${isToday ? "text-primary" : "text-content-secondary"}`}>
                  {formatDayHeader(day, today)}
                </p>
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
              </div>

              {dayEvents.map((e) => (
                <div key={e.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: PILLAR_COLORS[e.pillar ?? ""] ?? "#A0A0A0" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-content-primary truncate">{e.title}</p>
                    <p className="text-[12px] text-content-tertiary">{formatTime(e.start_at)}</p>
                  </div>
                </div>
              ))}

              {dayTasks.map((t) => (
                <div key={t.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: PILLAR_COLORS[t.pillar] ?? "#A0A0A0" }} />
                  <CheckSquare size={15} strokeWidth={1.5} className="text-content-tertiary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-content-primary truncate">{t.title}</p>
                    <p className="text-[12px] text-content-tertiary capitalize">{t.pillar.replace("-", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-float active:scale-95 transition-all z-10">
        <Plus size={22} strokeWidth={2} className="text-white" />
      </button>
    </div>
  );
}
