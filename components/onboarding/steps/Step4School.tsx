import { GraduationCap } from "lucide-react";
import { StepHero } from "../StepHero";

export function Step4School() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={GraduationCap}
        title="School and invites"
        subtitle="Set up schools for your kids and invite others to join."
      />
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-content-tertiary text-sm text-center">
        School setup + invites — Phase 6
      </div>
    </div>
  );
}
