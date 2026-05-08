export default function PillarPage({ params }: { params: { pillar: string } }) {
  return (
    <main className="flex items-center justify-center min-h-[60vh]">
      <p className="text-content-tertiary text-sm capitalize">{params.pillar} — coming soon</p>
    </main>
  );
}
