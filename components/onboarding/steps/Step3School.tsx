import { GraduationCap } from "lucide-react";
import { StepHero } from "../StepHero";
import { SchoolCard } from "./SchoolCard";

export function Step3School() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={GraduationCap}
        title="School details"
        subtitle="Add schools for your kids so Jahaan can organize their events."
      />
      <SchoolCard />
    </div>
  );
}
