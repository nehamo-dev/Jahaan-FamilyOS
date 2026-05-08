"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

export function ReconnectCalendarBanner() {
  const [loading, setLoading] = useState(false);

  async function reconnect() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    setLoading(false);
  }

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CalendarDays size={18} strokeWidth={1.5} className="text-content-tertiary flex-shrink-0" />
        <p className="text-[13px] font-medium text-content-primary">Calendar not connected</p>
      </div>
      <p className="text-[12px] text-content-secondary">
        Jahaan needs access to your Google Calendar to show your events here.
      </p>
      <button
        onClick={reconnect}
        disabled={loading}
        className="w-full h-10 bg-primary text-white rounded-card text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
      >
        {loading
          ? <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
          : "Connect Google Calendar"
        }
      </button>
    </div>
  );
}
