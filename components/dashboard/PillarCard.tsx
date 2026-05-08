import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface PillarCardProps {
  pillarKey: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  eventCount: number;
  taskCount: number;
}

export function PillarCard({ pillarKey, label, icon: Icon, color, bg, eventCount, taskCount }: PillarCardProps) {
  const total = eventCount + taskCount;

  return (
    <Link
      href={`/dashboard/pillars/${pillarKey}`}
      className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card p-4 flex flex-col gap-3 active:scale-[0.98] transition-all"
    >
      <div
        className="w-10 h-10 rounded-pill flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <Icon size={20} strokeWidth={1.5} style={{ color }} />
      </div>
      <div>
        <p className="text-[14px] font-medium text-content-primary">{label}</p>
        <p className="text-[12px] text-content-tertiary mt-0.5">
          {total === 0 ? "Nothing upcoming" : `${total} upcoming`}
        </p>
      </div>
    </Link>
  );
}
