import { Suspense } from "react";
import { Mail } from "lucide-react";
import { StepHero } from "../StepHero";
import { GmailConnectCard } from "./GmailConnectCard";

export function Step3Gmail() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Mail}
        title="Connect Gmail"
        subtitle="Jahaan scans your inbox for school emails, bookings, and reminders — and adds them to the right place automatically."
      />
      <Suspense fallback={<div className="h-[120px] rounded-card bg-white border border-[rgba(0,0,0,0.08)] animate-pulse" />}>
        <GmailConnectCard />
      </Suspense>
    </div>
  );
}
