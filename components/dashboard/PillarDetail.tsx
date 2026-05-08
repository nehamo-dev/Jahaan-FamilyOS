"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, CalendarDays, CheckCircle2, Circle, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { AddTaskSheet } from "./AddTaskSheet";

interface CalEvent { id: string; title: string; start_at: string; end_at: string; }
interface Task { id: string; title: string; due_date: string | null; status: string; }

const PILLAR_META: Record<string, { label: string; color: string; bg: string }> = {
  celebrations:      { label: "Celebrations", color: "#D4537E", bg: "#FCEEF3" },
  school:            { label: "School",       color: "#5B4FCF", bg: "#EEEDFE" },
  vacations:         { label: "Vacations",    color: "#1D9E75", bg: "#E1F5EE" },
  household:         { label: "Household",    color: "#BA7517", bg: "#FDF3E1" },
  "kids-activities": { label: "Kids",         color: "#D85A30", bg: "#FDEEE8" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function PillarDetail({ pillar }: { pillar: string }) {
  const meta = PILLAR_META[pillar] ?? { label: pillar, color: "#5B4FCF", bg: "#EEEDFE" };
  const [tab, setTab] = useState<"events" | "tasks">("events");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const loadData = useCallback(async (fid: string) => {
    const supabase = createClient();
    const now = new Date().toISOString();
    const [{ data: evts }, { data: tsks }] = await Promise.all([
      supabase.from("calendar_events")
        .select("id, title, start_at, end_at")
        .eq("family_id", fid).eq("pillar", pillar)
        .gte("start_at", now).order("start_at").limit(30),
      supabase.from("tasks")
        .select("id, title, due_date, status")
        .eq("family_id", fid).eq("pillar", pillar)
        .order("due_date", { ascending: true, nullsFirst: false }),
    ]);
    setEvents(evts ?? []);
    setTasks(tsks ?? []);
  }, [pillar]);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: fam } = await supabase.from("families").select("id").eq("created_by", user.id).maybeSingle();
      if (!fam) { setLoading(false); return; }
      setFamilyId(fam.id);
      await loadData(fam.id);
      setLoading(false);
    }
    init();
  }, [loadData]);

  async function toggleTask(id: string, current: string) {
    const supabase = createClient();
    const newStatus = current === "done" ? "todo" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  }

  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-[max(20px,env(safe-area-inset-top))] pb-4"
        style={{ backgroundColor: meta.bg }}
      >
        <Link href="/dashboard/pillars" className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
          <ChevronLeft size={18} strokeWidth={1.5} style={{ color: meta.color }} />
        </Link>
        <h1 className="flex-1 text-[18px] font-semibold" style={{ color: meta.color }}>{meta.label}</h1>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
          style={{ backgroundColor: meta.color }}
        >
          <Plus size={16} strokeWidth={2} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(0,0,0,0.06)]">
        {(["events", "tasks"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[14px] font-medium transition-all ${
              tab === t ? "border-b-2 text-content-primary" : "text-content-tertiary"
            }`}
            style={tab === t ? { borderColor: meta.color } : {}}
          >
            {t === "events" ? `Events (${events.length})` : `Tasks (${tasks.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pt-4 flex flex-col gap-2 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-content-tertiary" />
          </div>
        )}

        {!loading && tab === "events" && (
          <>
            {events.length === 0 && (
              <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-6 text-center">
                <CalendarDays size={24} strokeWidth={1.5} className="text-content-tertiary mx-auto mb-2" />
                <p className="text-[14px] text-content-secondary">No upcoming events</p>
              </div>
            )}
            {events.map((e) => (
              <div key={e.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-content-primary truncate">{e.title}</p>
                  <p className="text-[12px] text-content-tertiary">{formatDate(e.start_at)} · {formatTime(e.start_at)}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && tab === "tasks" && (
          <>
            {tasks.length === 0 && (
              <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-6 text-center">
                <p className="text-[14px] text-content-secondary">No tasks yet</p>
                <p className="text-[12px] text-content-tertiary mt-1">Tap + to add one</p>
              </div>
            )}
            {pendingTasks.map((t) => (
              <div key={t.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
                <button onClick={() => toggleTask(t.id, t.status)} className="flex-shrink-0 active:scale-95 transition-all">
                  <Circle size={22} strokeWidth={1.5} className="text-content-tertiary" />
                </button>
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-content-primary truncate">{t.title}</p>
                  {t.due_date && <p className="text-[12px] text-content-tertiary">{formatDate(t.due_date)}</p>}
                </div>
              </div>
            ))}
            {doneTasks.length > 0 && (
              <>
                <p className="text-[12px] font-semibold text-content-tertiary uppercase tracking-wide mt-2">Completed</p>
                {doneTasks.map((t) => (
                  <div key={t.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3 opacity-60">
                    <button onClick={() => toggleTask(t.id, t.status)} className="flex-shrink-0 active:scale-95 transition-all">
                      <CheckCircle2 size={22} strokeWidth={1.5} className="text-success" />
                    </button>
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                    <p className="text-[14px] text-content-tertiary line-through truncate flex-1">{t.title}</p>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      <AddTaskSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={() => familyId && loadData(familyId)}
      />
    </div>
  );
}
