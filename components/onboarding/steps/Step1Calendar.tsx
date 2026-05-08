import { Suspense } from "react";
import { CalendarDays } from "lucide-react";
import { StepHero } from "../StepHero";
import { CalendarConnectCard } from "./CalendarConnectCard";

export function Step1Calendar() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={CalendarDays}
        title="Connect your calendar"
        subtitle="Jahaan reads your existing events and organizes them — nothing changes without you."
      />
      <Suspense fallback={<div className="h-[120px] rounded-card bg-white border border-[rgba(0,0,0,0.08)] animate-pulse" />}>
        <CalendarConnectCard />
      </Suspense>
    </div>
  );
}
