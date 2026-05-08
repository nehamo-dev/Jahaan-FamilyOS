import { Settings } from "lucide-react";
import { StepHero } from "../StepHero";
import { SettingsCard } from "./SettingsCard";

export function Step3Settings() {
  return (
    <div className="flex flex-col gap-6">
      <StepHero
        icon={Settings}
        title="A few quick preferences"
        subtitle="You can change these anytime in settings."
      />
      <SettingsCard />
    </div>
  );
}
