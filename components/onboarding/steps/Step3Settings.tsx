import { Settings } from "lucide-react";
import { StepHero } from "../StepHero";

export function Step3Settings() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Settings}
        title="A few quick preferences"
        subtitle="You can change these anytime in settings."
      />
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-text-tertiary text-sm text-center">
        Default settings — Phase 5
      </div>
    </div>
  );
}
