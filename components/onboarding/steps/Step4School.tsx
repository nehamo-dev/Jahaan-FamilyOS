import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { StepHero } from "../StepHero";
import { SchoolCard } from "./SchoolCard";

export function Step4School() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={GraduationCap}
        title="School details"
        subtitle="Add schools for your kids so Jahaan can organize their events."
      />
      <Suspense fallback={<div className="h-[120px] rounded-card bg-white border border-[rgba(0,0,0,0.08)] animate-pulse" />}>
        <SchoolCard />
      </Suspense>
    </div>
  );
}
