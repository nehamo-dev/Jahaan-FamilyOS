"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  role: string;
  avatar_color: string;
  user_id: string | null;
}

interface FamilySettings {
  timezone: string;
  week_start: string;
}

const ROLE_LABELS: Record<string, string> = { parent: "Parent", child: "Child", caregiver: "Caregiver" };

export function FamilyView() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: fam } = await supabase.from("families").select("id").eq("created_by", user.id).maybeSingle();
      if (!fam) { setLoading(false); return; }

      const [{ data: mems }, { data: sett }] = await Promise.all([
        supabase.from("family_members").select("id, name, role, avatar_color, user_id").eq("family_id", fam.id).order("created_at"),
        supabase.from("family_settings").select("timezone, week_start").eq("family_id", fam.id).maybeSingle(),
      ]);

      setMembers((mems as Member[]) ?? []);
      if (sett) setSettings(sett as FamilySettings);
      setLoading(false);
    }
    init();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-content-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 pt-[max(20px,env(safe-area-inset-top))] pb-6">
      <h1 className="text-[18px] font-semibold text-content-primary mb-5">Family</h1>

      {/* Members */}
      <section className="mb-5">
        <p className="text-[12px] font-semibold text-content-tertiary uppercase tracking-wide mb-2">Members</p>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.id} className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-pill flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0"
                style={{ backgroundColor: m.avatar_color }}
              >
                {m.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-content-primary">
                  {m.name}
                  {m.user_id === currentUserId && (
                    <span className="ml-2 text-[11px] text-content-tertiary font-normal">You</span>
                  )}
                </p>
                <p className="text-[12px] text-content-tertiary">{ROLE_LABELS[m.role] ?? m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      {settings && (
        <section className="mb-5">
          <p className="text-[12px] font-semibold text-content-tertiary uppercase tracking-wide mb-2">Settings</p>
          <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card divide-y divide-[rgba(0,0,0,0.06)]">
            <div className="px-4 py-3 flex items-center justify-between">
              <p className="text-[14px] text-content-primary">Time zone</p>
              <p className="text-[13px] text-content-tertiary">{settings.timezone.replace("_", " ")}</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <p className="text-[14px] text-content-primary">Week starts</p>
              <p className="text-[13px] text-content-tertiary capitalize">{settings.week_start}</p>
            </div>
          </div>
        </section>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full h-11 bg-white border border-[rgba(0,0,0,0.07)] rounded-card flex items-center justify-center gap-2 text-[14px] text-danger font-medium active:scale-[0.98] transition-all"
      >
        <LogOut size={16} strokeWidth={1.5} />
        Sign out
      </button>
    </div>
  );
}
