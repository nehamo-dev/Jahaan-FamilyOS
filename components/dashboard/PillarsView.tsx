import Link from "next/link";
import { Cake, GraduationCap, PalmtreeIcon, Wrench, Sparkles } from "lucide-react";

const PILLARS = [
  { key: "celebrations",    label: "Celebrations", icon: Cake,          color: "#D4537E", bg: "#FCEEF3", description: "Birthdays and milestones" },
  { key: "school",          label: "School",       icon: GraduationCap, color: "#5B4FCF", bg: "#EEEDFE", description: "Events, deadlines, applications" },
  { key: "vacations",       label: "Vacations",    icon: PalmtreeIcon,  color: "#1D9E75", bg: "#E1F5EE", description: "Plan and track every trip" },
  { key: "household",       label: "Household",    icon: Wrench,        color: "#BA7517", bg: "#FDF3E1", description: "Services and chores" },
  { key: "kids-activities", label: "Kids",         icon: Sparkles,      color: "#D85A30", bg: "#FDEEE8", description: "Camps, classes and carpools" },
] as const;

export function PillarsView() {
  return (
    <div className="px-5 pt-[max(20px,env(safe-area-inset-top))] pb-6">
      <h1 className="text-[18px] font-semibold text-content-primary mb-5">Pillars</h1>
      <div className="flex flex-col gap-3">
        {PILLARS.map(({ key, label, icon: Icon, color, bg, description }) => (
          <Link
            key={key}
            href={`/dashboard/pillars/${key}`}
            className="bg-white border border-[rgba(0,0,0,0.07)] rounded-card px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-pill flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={22} strokeWidth={1.5} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-content-primary">{label}</p>
              <p className="text-[12px] text-content-tertiary mt-0.5">{description}</p>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" className="text-content-tertiary flex-shrink-0">
              <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
