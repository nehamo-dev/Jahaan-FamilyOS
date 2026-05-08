"use client";

import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function GmailConnectCard() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("gmail") === "connected";
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    const supabase = createClient();
    const calendarParam = searchParams.get("calendar") === "connected" ? "&calendar=connected" : "";
    const next = encodeURIComponent(`/onboarding?step=3&gmail=connected${calendarParam}`);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        scopes: "https://www.googleapis.com/auth/gmail.readonly",
      },
    });
    setLoading(false);
  }

  if (connected) {
    return (
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 flex items-center gap-3">
        <CheckCircle2 size={22} strokeWidth={1.5} className="text-success flex-shrink-0" />
        <div>
          <p className="text-[14px] font-medium text-content-primary">Gmail connected</p>
          <p className="text-[12px] text-content-secondary mt-0.5">We&apos;ll use this to find schools and events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" className="flex-shrink-0" aria-hidden>
          <rect width="32" height="32" rx="6" fill="#fff"/>
          <path d="M6 10.5A1.5 1.5 0 0 1 7.5 9h17A1.5 1.5 0 0 1 26 10.5v11A1.5 1.5 0 0 1 24.5 23h-17A1.5 1.5 0 0 1 6 21.5v-11z" fill="#fff" stroke="#E0E0E0" strokeWidth="1"/>
          <path d="M6 11l10 7 10-7" stroke="#EA4335" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-content-primary">Gmail</p>
          <p className="text-[12px] text-content-secondary mt-0.5">Read-only · finds schools, events & reminders</p>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full h-12 bg-white border border-[rgba(0,0,0,0.12)] rounded-card flex items-center px-4 gap-3 hover:bg-[#F7F7F5] active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0" aria-hidden>
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.583 9 3.583z" fill="#EA4335"/>
        </svg>
        <span className="flex-1 text-center text-[15px] font-medium text-content-primary">
          {loading
            ? <span className="inline-block w-4 h-4 border-2 border-content-tertiary border-t-transparent rounded-full animate-spin" />
            : "Connect Gmail"
          }
        </span>
      </button>

      <p className="text-[12px] text-content-tertiary text-center">
        You can skip this and connect later in Settings.
      </p>
    </div>
  );
}
