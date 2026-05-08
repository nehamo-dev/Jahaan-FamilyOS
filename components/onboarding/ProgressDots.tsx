"use client";

import { useOnboarding } from "./OnboardingContext";

export function ProgressDots() {
  const { step, totalSteps } = useOnboarding();

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const num = i + 1;
        const isActive = num === step;
        const isDone = num < step;

        return (
          <div
            key={i}
            style={{
              width: isActive ? "18px" : "6px",
              height: "6px",
              borderRadius: "99px",
              backgroundColor: isActive ? "#5B4FCF" : isDone ? "#1D9E75" : "#E0DFF8",
              transition: "all 0.2s ease",
            }}
          />
        );
      })}
    </div>
  );
}
