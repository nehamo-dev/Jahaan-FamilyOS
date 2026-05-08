import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingShell />
    </OnboardingProvider>
  );
}
