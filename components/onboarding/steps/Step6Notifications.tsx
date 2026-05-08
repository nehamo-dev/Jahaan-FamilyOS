import { Bell } from "lucide-react";
import { StepHero } from "../StepHero";

export function Step6Notifications() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Bell}
        title="Stay in the loop"
        subtitle="Choose what Jahaan reminds you about."
      />
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-text-tertiary text-sm text-center">
        Notification preferences — Phase 8
      </div>
    </div>
  );
}
