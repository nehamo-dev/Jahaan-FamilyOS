"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2 } from "lucide-react";

const PILLARS = [
  { key: "celebrations",    label: "Celebrations", color: "#D4537E" },
  { key: "school",          label: "School",       color: "#5B4FCF" },
  { key: "vacations",       label: "Vacations",    color: "#1D9E75" },
  { key: "household",       label: "Household",    color: "#BA7517" },
  { key: "kids-activities", label: "Kids",         color: "#D85A30" },
  { key: "none",            label: "General",      color: "#A0A0A0" },
] as const;

type PillarKey = typeof PILLARS[number]["key"];

interface Member { id: string; name: string; avatar_color: string; }

interface Props {
  open: boolean;
  defaultDate?: string; // ISO date string
  onClose: () => void;
  onSaved: () => void;
}

export function AddTaskSheet({ open, defaultDate, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState<PillarKey>("none");
  const [dueDate, setDueDate] = useState(defaultDate ?? "");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(""); setPillar("none"); setDueDate(defaultDate ?? ""); setAssignedTo([]);
      setTimeout(() => inputRef.current?.focus(), 100);
      loadFamily();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadFamily() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: fam } = await supabase.from("families").select("id").eq("created_by", user.id).maybeSingle();
    if (!fam) return;
    setFamilyId(fam.id);
    const { data: mems } = await supabase.from("family_members").select("id, name, avatar_color").eq("family_id", fam.id).order("created_at");
    setMembers((mems as Member[]) ?? []);
  }

  async function handleSave() {
    if (!title.trim() || !familyId) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current user's member id for created_by
    const { data: self } = await supabase.from("family_members").select("id").eq("family_id", familyId).eq("user_id", user.id).maybeSingle();

    await supabase.from("tasks").insert({
      family_id: familyId,
      created_by: self?.id ?? null,
      title: title.trim(),
      pillar,
      due_date: dueDate || null,
      assigned_to: assignedTo,
      status: "todo",
      priority: "medium",
    });

    setSaving(false);
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white rounded-t-sheet z-30 px-5 pt-4 pb-[max(32px,env(safe-area-inset-bottom))]">
        {/* Handle */}
        <div className="w-10 h-1 bg-[rgba(0,0,0,0.12)] rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-content-primary">Add task</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-content-tertiary">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Title */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="What needs to happen?"
            className="w-full h-11 px-3 rounded-input border border-[rgba(0,0,0,0.12)] text-[15px] text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(91,79,207,0.15)]"
          />

          {/* Pillar pills */}
          <div className="flex gap-2 flex-wrap">
            {PILLARS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPillar(p.key)}
                className="h-7 px-3 rounded-pill text-[12px] font-medium transition-all"
                style={pillar === p.key
                  ? { backgroundColor: p.color, color: "#fff" }
                  : { backgroundColor: "#F7F7F5", color: "#6B6B6B" }
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Due date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-11 px-3 rounded-input border border-[rgba(0,0,0,0.12)] text-[14px] text-content-primary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(91,79,207,0.15)]"
          />

          {/* Assignees */}
          {members.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {members.map((m) => {
                const selected = assignedTo.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => setAssignedTo((prev) =>
                      selected ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                    )}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-pill text-[12px] font-medium border transition-all"
                    style={selected
                      ? { backgroundColor: m.avatar_color, borderColor: m.avatar_color, color: "#fff" }
                      : { backgroundColor: "#F7F7F5", borderColor: "transparent", color: "#6B6B6B" }
                    }
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: selected ? "rgba(255,255,255,0.3)" : m.avatar_color, color: "#fff" }}>
                      {m.name[0].toUpperCase()}
                    </span>
                    {m.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full h-12 bg-primary text-white rounded-card text-[15px] font-medium flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all mt-1"
          >
            {saving ? <Loader2 size={18} strokeWidth={1.5} className="animate-spin" /> : "Save task"}
          </button>
        </div>
      </div>
    </>
  );
}
