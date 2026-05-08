import { PillarDetail } from "@/components/dashboard/PillarDetail";

export default async function PillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  return <PillarDetail pillar={pillar} />;
}
