"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2 } from "lucide-react";
import type { Role } from "@/types/database";

const AVATAR_COLORS = ["#5B4FCF", "#D4537E", "#1D9E75", "#BA7517", "#D85A30", "#2196F3"];
const ROLE_LABELS: Record<Role, string> = { parent: "Parent", child: "Child", caregiver: "Caregiver" };

interface Member {
  id: string;
  name: string;
  role: Role;
  avatar_color: string;
  user_id: string | null;
}

export function FamilyMembersCard() {
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("child");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Find or create family
    let fid: string;
    const { data: existing } = await supabase
      .from("families")
      .select("id")
      .eq("created_by", user.id)
      .maybeSingle();

    if (existing) {
      fid = existing.id;
    } else {
      const { data: created, error: famErr } = await supabase
        .from("families")
        .insert({ created_by: user.id, name: "My Family" })
        .select("id")
        .single();
      if (famErr || !created) { setError(`Could not create family: ${famErr?.message ?? "no data returned"}`); setLoading(false); return; }
      fid = created.id;
    }
    setFamilyId(fid);

    // Seed self as first parent if not present
    const { data: selfMember } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", fid)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!selfMember) {
      const { error: seedErr } = await supabase.from("family_members").insert({
        family_id: fid,
        user_id: user.id,
        name: (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "Me",
        role: "parent" as Role,
        avatar_color: AVATAR_COLORS[0],
      });
      if (seedErr) { setError(`Could not add you as member: ${seedErr.message}`); setLoading(false); return; }
    }

    const { data: all } = await supabase
      .from("family_members")
      .select("id, name, role, avatar_color, user_id")
      .eq("family_id", fid)
      .order("created_at");

    setMembers((all as Member[]) ?? []);
    setLoading(false);
  }

  async function addMember() {
    if (!newName.trim() || !familyId) return;
    setAdding(true);
    const supabase = createClient();
    const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length];
    const { data, error: insErr } = await supabase
      .from("family_members")
      .insert({ family_id: familyId, user_id: null, name: newName.trim(), role: newRole, avatar_color: color })
      .select("id, name, role, avatar_color, user_id")
      .single();
    if (insErr) { setError(`Add member failed: ${insErr.message}`); }
    else if (data) { setMembers((m) => [...m, data as Member]); setNewName(""); setNewRole("child"); }
    setAdding(false);
  }

  async function removeMember(id: string) {
    const supabase = createClient();
    await supabase.from("family_members").delete().eq("id", id);
    setMembers((m) => m.filter((x) => x.id !== id));
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
      {error && (
        <p className="text-[13px] text-danger text-center">{error}</p>
      )}

      {members.map((m) => (
        <div key={m.id} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-pill flex items-center justify-center flex-shrink-0 text-white text-[13px] font-semibold"
            style={{ backgroundColor: m.avatar_color }}
          >
            {m.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-content-primary">{m.name}</p>
                <p className="text-[12px] text-content-tertiary">{ROLE_LABELS[m.role]}</p>
          {/* TODO: show invite status badge here once member_invites flow is built */}
          </div>
          {m.user_id !== currentUserId && (
            <button
              onClick={() => removeMember(m.id)}
              className="p-1 text-content-tertiary hover:text-danger transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      {/* Add member form */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-3 flex flex-col gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMember()}
          placeholder="Name"
          className="w-full h-10 px-3 rounded-input border border-[rgba(0,0,0,0.12)] text-[14px] text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(91,79,207,0.15)]"
        />
        <div className="flex gap-2">
          {(["parent", "child", "caregiver"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setNewRole(r)}
              className={`flex-1 h-8 rounded-pill text-[12px] font-medium transition-all ${
                newRole === r ? "bg-primary text-white" : "bg-[#F7F7F5] text-content-secondary"
              }`}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <button
          onClick={addMember}
          disabled={!newName.trim() || adding}
          className="w-full h-10 bg-primary-light text-primary rounded-card text-[14px] font-medium flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {adding
            ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
            : <Plus size={16} strokeWidth={1.5} />
          }
          Add member
        </button>
      </div>
    </div>
  );
}
