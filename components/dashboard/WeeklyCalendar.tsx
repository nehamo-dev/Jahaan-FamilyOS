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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday-based
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

export function WeeklyCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selected, setSelected] = useState(today);
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

  const selectedEvents = events.filter((e) => isSameDay(new Date(e.start_at), selected));
  const selectedTasks = tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), selected));
  const hasContent = selectedEvents.length > 0 || selectedTasks.length > 0;

  const monthLabel = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col">
      {/* Month + week nav */}
      <div className="flex items-center justify-between px-5 pt-[max(20px,env(safe-area-inset-top))] pb-3">
        <h1 className="text-[18px] font-semibold text-content-primary">{monthLabel}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setWeekStart(addDays(weekStart, -7)); }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)] active:scale-95 transition-all"
          >
            <ChevronLeft size={18} strokeWidth={1.5} className="text-content-secondary" />
          </button>
          <button
            onClick={() => { setWeekStart(startOfWeek(today)); setSelected(today); }}
            className="px-3 h-7 rounded-pill text-[12px] font-medium text-primary bg-primary-light active:scale-95 transition-all"
          >
            Today
          </button>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)] active:scale-95 transition-all"
          >
            <ChevronRight size={18} strokeWidth={1.5} className="text-content-secondary" />
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div className="flex px-3 pb-3 border-b border-[rgba(0,0,0,0.06)]">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          const dayEvents = events.filter((e) => isSameDay(new Date(e.start_at), day));
          const dayTasks = tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), day));
          const hasDots = dayEvents.length > 0 || dayTasks.length > 0;

          return (
            <button
              key={i}
              onClick={() => setSelected(day)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-card transition-all active:scale-95"
              style={{ backgroundColor: isSelected ? "#5B4FCF" : "transparent" }}
            >
              <span className={`text-[11px] font-medium ${isSelected ? "text-white/70" : "text-content-tertiary"}`}>
                {DAYS[i]}
              </span>
              <span className={`text-[15px] font-semibold w-8 h-8 flex items-center justify-center rounded-full ${
                isSelected ? "text-white" : isToday ? "text-primary" : "text-content-primary"
              }`}>
                {day.getDate()}
              </span>
              {hasDots
                ? <div className="flex gap-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.6)" : (PILLAR_COLORS[e.pillar ?? ""] ?? "#A0A0A0") }} />
                    ))}
                  </div>
                : <div className="h-1" />
              }
            </button>
          );
        })}
      </div>

      {/* Selected day header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="text-[14px] font-semibold text-content-primary">
          {isSameDay(selected, today) ? "Today" : selected.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </h2>
        <button className="w-8 h-8 bg-primary rounded-full flex items-center justify-center active:scale-95 transition-all shadow-float">
          <Plus size={16} strokeWidth={2} className="text-white" />
        </button>
      </div>

      {/* Day content */}
      <div className="px-5 flex flex-col gap-2 pb-4">
        {loading && (
          <div className="h-20 rounded-card bg-white border border-[rgba(0,0,0,0.07)] animate-pulse" />
        )}

        {!loading && !hasContent && (
          <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-5 flex flex-col items-center gap-2 text-center">
            <CalendarDays size={24} strokeWidth={1.5} className="text-content-tertiary" />
            <p className="text-[13px] text-content-secondary">Nothing scheduled</p>
          </div>
        )}

        {selectedEvents.map((e) => (
          <div key={e.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
            <div className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: PILLAR_COLORS[e.pillar ?? ""] ?? "#A0A0A0" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-content-primary truncate">{e.title}</p>
              <p className="text-[12px] text-content-tertiary">{formatTime(e.start_at)}</p>
            </div>
          </div>
        ))}

        {selectedTasks.map((t) => (
          <div key={t.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
            <div className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: PILLAR_COLORS[t.pillar] ?? "#A0A0A0" }} />
            <CheckSquare size={15} strokeWidth={1.5} className="text-content-tertiary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-content-primary truncate">{t.title}</p>
              <p className="text-[12px] text-content-tertiary capitalize">{t.pillar.replace("-", " ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
