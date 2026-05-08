import { Mail } from "lucide-react";
import { StepHero } from "../StepHero";

export function Step5Gmail() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Mail}
        title="Connect Gmail"
        subtitle="Jahaan scans your inbox for school emails, bookings, and reminders — and adds them to the right place automatically."
      />
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-text-tertiary text-sm text-center">
        Gmail connect — Phase 7
      </div>
    </div>
  );
}
