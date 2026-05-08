import { Users } from "lucide-react";
import { StepHero } from "../StepHero";
import { FamilyMembersCard } from "./FamilyMembersCard";

export function Step2FamilyMembers() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Users}
        title="Who's in the family?"
        subtitle="Add everyone — parents, kids, caregivers. You can always add more later."
      />
      <FamilyMembersCard />
    </div>
  );
}
