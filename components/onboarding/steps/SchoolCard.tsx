"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check, Sparkles } from "lucide-react";

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

interface SchoolSuggestion {
  name: string;
  domain: string;
}

export function SchoolCard() {
  const searchParams = useSearchParams();
  const gmailConnected = searchParams.get("gmail") === "connected";

  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [entries, setEntries] = useState<SchoolEntry[]>([]);
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (kidList.length > 0) {
      const { data: schools } = await supabase
        .from("child_schools")
        .select("family_member_id, school_name, grade")
        .in("family_member_id", kidList.map((k) => k.id));

      setEntries(
        kidList.map((k) => {
          const existing = schools?.find((s) => s.family_member_id === k.id);
          return { memberId: k.id, schoolName: existing?.school_name ?? "", grade: existing?.grade ?? "", saved: !!existing, saving: false };
        })
      );
    }

    setLoading(false);

    // Auto-detect if Gmail just connected and no schools saved yet
    if (gmailConnected && kidList.length > 0) {
      detectSchools();
    }
  }

  async function detectSchools() {
    setDetecting(true);
    try {
      const res = await fetch("/api/detect-schools");
      const { schools } = await res.json();
      setSuggestions(schools ?? []);
    } catch {}
    setDetecting(false);
  }

  function applySuggestion(memberId: string, name: string) {
    setEntries((prev) =>
      prev.map((e) => e.memberId === memberId ? { ...e, schoolName: name, saved: false } : e)
    );
    setSuggestions([]);
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
      {/* Detecting banner */}
      {detecting && (
        <div className="bg-primary-light rounded-card p-3 flex items-center gap-2">
          <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-primary flex-shrink-0" />
          <p className="text-[13px] text-primary">Looking for schools in your Gmail…</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-primary-light rounded-card p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} strokeWidth={1.5} className="text-primary flex-shrink-0" />
            <p className="text-[13px] font-medium text-primary">Found in your Gmail — tap to apply</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {suggestions.map((s) => (
              <button
                key={s.domain}
                onClick={() => entries.length === 1
                  ? applySuggestion(entries[0].memberId, s.name)
                  : setEntries((prev) => prev.map((e) => ({ ...e, schoolName: s.name, saved: false })))
                }
                className="px-3 h-8 bg-white rounded-pill text-[13px] font-medium text-content-primary border border-[rgba(0,0,0,0.08)] active:scale-[0.98] transition-all"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
              {entry.saving && <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-content-tertiary ml-auto" />}
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
