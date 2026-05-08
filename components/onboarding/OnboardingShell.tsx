"use client";

import { useOnboarding } from "./OnboardingContext";
import { ProgressDots } from "./ProgressDots";
import { OnboardingNav } from "./OnboardingNav";
import { StepWrapper } from "./StepWrapper";

import { Step1Calendar } from "./steps/Step1Calendar";
import { Step2FamilyMembers } from "./steps/Step2FamilyMembers";
import { Step3Gmail } from "./steps/Step3Gmail";
import { Step4School } from "./steps/Step4School";

const STEPS = [
  Step1Calendar,
  Step2FamilyMembers,
  Step3Gmail,
  Step4School,
];

export function OnboardingShell() {
  const { step } = useOnboarding();
  const StepComponent = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col max-w-app mx-auto">
      {/* Safe area + progress dots */}
      <div className="pt-[max(24px,env(safe-area-inset-top))] px-5 pb-6">
        <ProgressDots />
      </div>

      {/* Step content — scrollable */}
      <div className="flex-1 overflow-y-auto px-5">
        <StepWrapper key={step}>
          <StepComponent />
        </StepWrapper>
      </div>

      {/* Bottom nav */}
      <OnboardingNav />
    </div>
  );
}
