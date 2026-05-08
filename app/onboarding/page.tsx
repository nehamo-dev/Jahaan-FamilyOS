import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const initialStep = Math.min(Math.max(parseInt(params.step ?? "1") || 1, 1), 5);

  return (
    <OnboardingProvider initialStep={initialStep}>
      <OnboardingShell />
    </OnboardingProvider>
  );
}
