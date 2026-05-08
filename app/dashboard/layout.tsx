import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-app mx-auto pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
