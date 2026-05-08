"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check } from "lucide-react";

interface Child {
  id: string;
  name: string;
  avatar_color: string;
}

interface SchoolEntry {
  memberId: string;
  schoolName: string;
  grade: string;
  saved: boolean;
  saving: boolean;
}

export function SchoolCard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [entries, setEntries] = useState<SchoolEntry[]>([]);

  useEffect(() => { init(); }, []);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: fam } = await supabase
      .from("families")
      .select("id")
      .eq("created_by", user.id)
      .maybeSingle();

    if (!fam) { setLoading(false); return; }

    const { data: kids } = await supabase
      .from("family_members")
      .select("id, name, avatar_color")
      .eq("family_id", fam.id)
      .eq("role", "child")
      .order("created_at");

    const kidList = (kids as Child[]) ?? [];
    setChildren(kidList);

    // Load existing school entries
    if (kidList.length > 0) {
      const { data: schools } = await supabase
        .from("child_schools")
        .select("family_member_id, school_name, grade")
        .in("family_member_id", kidList.map((k) => k.id));

      setEntries(
        kidList.map((k) => {
          const existing = schools?.find((s) => s.family_member_id === k.id);
          return {
            memberId: k.id,
            schoolName: existing?.school_name ?? "",
            grade: existing?.grade ?? "",
            saved: !!existing,
            saving: false,
          };
        })
      );
    }
    setLoading(false);
  }

  function update(memberId: string, field: "schoolName" | "grade", value: string) {
    setEntries((prev) =>
      prev.map((e) => e.memberId === memberId ? { ...e, [field]: value, saved: false } : e)
    );
  }

  async function save(memberId: string) {
    const entry = entries.find((e) => e.memberId === memberId);
    if (!entry || !entry.schoolName.trim()) return;
    setEntries((prev) => prev.map((e) => e.memberId === memberId ? { ...e, saving: true } : e));

    const supabase = createClient();
    await supabase.from("child_schools").upsert(
      { family_member_id: memberId, school_name: entry.schoolName.trim(), grade: entry.grade.trim() },
      { onConflict: "family_member_id" }
    );
    setEntries((prev) => prev.map((e) => e.memberId === memberId ? { ...e, saving: false, saved: true } : e));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-content-tertiary" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-center">
        <p className="text-[14px] text-content-secondary">No kids added yet.</p>
        <p className="text-[12px] text-content-tertiary mt-1">Go back and add children to set up their schools.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const child = children.find((c) => c.id === entry.memberId)!;
        return (
          <div key={entry.memberId} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-pill flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                style={{ backgroundColor: child.avatar_color }}
              >
                {child.name[0].toUpperCase()}
              </div>
              <p className="text-[14px] font-medium text-content-primary">{child.name}</p>
              {entry.saved && <Check size={14} strokeWidth={2} className="text-success ml-auto" />}
            </div>
            <input
              type="text"
              value={entry.schoolName}
              onChange={(e) => update(entry.memberId, "schoolName", e.target.value)}
              onBlur={() => save(entry.memberId)}
              placeholder="School name"
              className="w-full h-10 px-3 rounded-input border border-[rgba(0,0,0,0.12)] text-[14px] text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(91,79,207,0.15)]"
            />
            <input
              type="text"
              value={entry.grade}
              onChange={(e) => update(entry.memberId, "grade", e.target.value)}
              onBlur={() => save(entry.memberId)}
              placeholder="Grade (e.g. 3rd, K, 10)"
              className="w-full h-10 px-3 rounded-input border border-[rgba(0,0,0,0.12)] text-[14px] text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(91,79,207,0.15)]"
            />
          </div>
        );
      })}
      <p className="text-[12px] text-content-tertiary text-center">You can skip this and add schools later.</p>
    </div>
  );
}
