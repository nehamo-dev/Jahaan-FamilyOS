"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Circle, Plus, Loader2 } from "lucide-react";
import { AddTaskSheet } from "./AddTaskSheet";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  pillar: string;
  status: string;
  priority: string;
  assigned_to: string[];
}

const PILLAR_COLORS: Record<string, string> = {
  celebrations:      "#D4537E",
  school:            "#5B4FCF",
  vacations:         "#1D9E75",
  household:         "#BA7517",
  "kids-activities": "#D85A30",
  none:              "#A0A0A0",
};

const FILTERS = ["Todo", "Done", "All"] as const;
type Filter = typeof FILTERS[number];

function formatDue(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: "Overdue", color: "#C0392B" };
  if (diff === 0) return { label: "Today", color: "#BA7517" };
  if (diff === 1) return { label: "Tomorrow", color: "#1D9E75" };
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "#A0A0A0" };
}

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("Todo");
  const [sheetOpen, setSheetOpen] = useState(false);

  const loadTasks = useCallback(async (fid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tasks")
      .select("id, title, due_date, pillar, status, priority, assigned_to")
      .eq("family_id", fid)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    setTasks((data as Task[]) ?? []);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: fam } = await supabase.from("families").select("id").eq("created_by", user.id).maybeSingle();
      if (!fam) { setLoading(false); return; }
      setFamilyId(fam.id);
      await loadTasks(fam.id);
      setLoading(false);
    }
    init();
  }, [loadTasks]);

  async function toggleTask(task: Task) {
    const supabase = createClient();
    const newStatus = task.status === "done" ? "todo" : "done";
    await supabase.from("tasks").update({
      status: newStatus,
      completed_at: newStatus === "done" ? new Date().toISOString() : null,
    }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
  }

  const filtered = tasks.filter((t) =>
    filter === "All" ? true : filter === "Done" ? t.status === "done" : t.status !== "done"
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[max(20px,env(safe-area-inset-top))] pb-4 border-b border-[rgba(0,0,0,0.06)]">
        <h1 className="text-[18px] font-semibold text-content-primary">Tasks</h1>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2} className="text-white" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-5 py-3 border-b border-[rgba(0,0,0,0.06)]">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 h-8 rounded-pill text-[13px] font-medium transition-all ${
              filter === f ? "bg-primary text-white" : "bg-[#F7F7F5] text-content-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="px-5 pt-4 flex flex-col gap-2 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-content-tertiary" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-6 text-center">
            <p className="text-[14px] text-content-secondary">No tasks here</p>
            <p className="text-[12px] text-content-tertiary mt-1">Tap + to add one</p>
          </div>
        )}

        {filtered.map((task) => {
          const due = formatDue(task.due_date);
          const done = task.status === "done";
          return (
            <div key={task.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
              <button onClick={() => toggleTask(task)} className="flex-shrink-0 active:scale-95 transition-all">
                {done
                  ? <CheckCircle2 size={22} strokeWidth={1.5} className="text-success" />
                  : <Circle size={22} strokeWidth={1.5} className="text-content-tertiary" />
                }
              </button>
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: PILLAR_COLORS[task.pillar] ?? "#A0A0A0" }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-medium truncate ${done ? "text-content-tertiary line-through" : "text-content-primary"}`}>
                  {task.title}
                </p>
                {due && (
                  <p className="text-[12px] mt-0.5" style={{ color: done ? "#A0A0A0" : due.color }}>
                    {due.label}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={() => familyId && loadTasks(familyId)}
      />
    </div>
  );
}
