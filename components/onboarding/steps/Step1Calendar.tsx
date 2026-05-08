import { CalendarDays } from "lucide-react";
import { StepHero } from "../StepHero";

export function Step1Calendar() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={CalendarDays}
        title="Connect your calendar"
        subtitle="Jahaan reads your existing events and organizes them — nothing changes without you."
      />
      {/* Phase 3 will build the connection card and OAuth flow here */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-text-tertiary text-sm text-center">
        Calendar connection — coming in Phase 3
      </div>
    </div>
  );
}
