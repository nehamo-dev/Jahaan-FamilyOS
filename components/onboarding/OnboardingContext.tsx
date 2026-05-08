"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface OnboardingContextType {
  step: number;
  totalSteps: number;
  next: () => void;
  back: () => void;
  goTo: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children, initialStep = 1 }: { children: React.ReactNode; initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  const totalSteps = 4;

  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps)), [totalSteps]);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goTo = useCallback((s: number) => setStep(s), []);

  return (
    <OnboardingContext.Provider value={{ step, totalSteps, next, back, goTo }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
