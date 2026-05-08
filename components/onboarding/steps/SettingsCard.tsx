"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const TZ_LABELS: Record<string, string> = {
  "America/Los_Angeles": "Pacific Time",
  "America/Denver":      "Mountain Time",
  "America/Chicago":     "Central Time",
  "America/New_York":    "Eastern Time",
  "America/Anchorage":   "Alaska Time",
  "Pacific/Honolulu":    "Hawaii Time",
  "Europe/London":       "London",
  "Europe/Paris":        "Paris / Central Europe",
  "Asia/Dubai":          "Dubai",
  "Asia/Kolkata":        "India",
  "Asia/Singapore":      "Singapore",
  "Asia/Tokyo":          "Tokyo",
  "Australia/Sydney":    "Sydney",
};

export function SettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">("monday");
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Detect browser timezone as default
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONES.includes(detected)) setTimezone(detected);

    const { data: fam } = await supabase
      .from("families")
      .select("id")
      .eq("created_by", user.id)
      .maybeSingle();

    if (!fam) { setLoading(false); return; }
    setFamilyId(fam.id);

    const { data: settings } = await supabase
      .from("family_settings")
      .select("timezone, week_start")
      .eq("family_id", fam.id)
      .maybeSingle();

    if (settings) {
      setTimezone(settings.timezone);
      setWeekStart(settings.week_start as "monday" | "sunday");
    }
    setLoading(false);
  }

  async function save(tz: string, ws: "monday" | "sunday") {
    if (!familyId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("family_settings").upsert(
      { family_id: familyId, timezone: tz, week_start: ws },
      { onConflict: "family_id" }
    );
    setSaving(false);
  }

  function handleTimezone(tz: string) {
    setTimezone(tz);
    save(tz, weekStart);
  }

  function handleWeekStart(ws: "monday" | "sunday") {
    setWeekStart(ws);
    save(timezone, ws);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-content-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Timezone */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-content-primary">Time zone</p>
          {saving && <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-content-tertiary" />}
        </div>
        <select
          value={timezone}
          onChange={(e) => handleTimezone(e.target.value)}
          className="w-full h-10 px-3 rounded-input border border-[rgba(0,0,0,0.12)] text-[14px] text-content-primary bg-white focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(91,79,207,0.15)] appearance-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{TZ_LABELS[tz]}</option>
          ))}
        </select>
      </div>

      {/* Week start */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 flex flex-col gap-3">
        <p className="text-[14px] font-medium text-content-primary">Week starts on</p>
        <div className="flex gap-2">
          {(["monday", "sunday"] as const).map((day) => (
            <button
              key={day}
              onClick={() => handleWeekStart(day)}
              className={`flex-1 h-10 rounded-card text-[14px] font-medium transition-all active:scale-[0.98] ${
                weekStart === day
                  ? "bg-primary text-white"
                  : "bg-[#F7F7F5] text-content-secondary"
              }`}
            >
              {day === "monday" ? "Monday" : "Sunday"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
