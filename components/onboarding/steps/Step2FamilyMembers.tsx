import { Users } from "lucide-react";
import { StepHero } from "../StepHero";

export function Step2FamilyMembers() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Users}
        title="Who's in the family?"
        subtitle="Add everyone — parents, kids, caregivers. You can always add more later."
      />
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-text-tertiary text-sm text-center">
        Family members — Phase 4
      </div>
    </div>
  );
}
