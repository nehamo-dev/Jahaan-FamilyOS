"use client";

import { useOnboarding } from "./OnboardingContext";
import { useRouter } from "next/navigation";

export function OnboardingNav() {
  const { step, totalSteps, next, back } = useOnboarding();
  const router = useRouter();
  const isFirst = step === 1;
  const isLast = step === totalSteps;

  function handleNext() {
    if (isLast) {
      router.push("/dashboard");
    } else {
      next();
    }
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      {!isFirst && (
        <button
          onClick={back}
          className="h-11 px-5 rounded-card border border-[rgba(0,0,0,0.12)] text-content-secondary text-[15px] font-medium tracking-[0.005em] active:scale-[0.98] transition-all duration-150"
        >
          Back
        </button>
      )}
      <button
        onClick={handleNext}
        className="flex-1 h-12 bg-primary text-white rounded-card text-[15px] font-medium tracking-[0.005em] active:scale-[0.98] transition-all duration-150 hover:bg-primary-dark"
      >
        {isLast ? "Go to Jahaan" : "Next"}
      </button>
    </div>
  );
}
