import { Cake, GraduationCap, PalmtreeIcon, Wrench, Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";

const pillars = [
  {
    icon: Cake,
    label: "Celebrations",
    description: "birthdays and milestones",
    color: "#D4537E",
  },
  {
    icon: GraduationCap,
    label: "School",
    description: "events, deadlines, applications",
    color: "#5B4FCF",
  },
  {
    icon: PalmtreeIcon,
    label: "Vacations",
    description: "plan and track every trip",
    color: "#1D9E75",
  },
  {
    icon: Wrench,
    label: "Household",
    description: "services and chores sorted",
    color: "#BA7517",
  },
  {
    icon: Sparkles,
    label: "Kids",
    description: "camps, classes and carpools",
    color: "#D85A30",
  },
];

const avatars = [
  { initials: "NM", bg: "#EEEDFE", text: "#534AB7" },
  { initials: "RS", bg: "#E1F5EE", text: "#0F6E56" },
  { initials: "AK", bg: "#FAEEDA", text: "#633806" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-between px-5 py-10">
      <div className="w-full max-w-app mx-auto flex flex-col items-center gap-10">

        {/* ── Top zone ── */}
        <div className="flex flex-col items-center gap-4 pt-8">
          <h1 className="text-[32px] font-semibold text-primary leading-tight tracking-[-0.01em]">
            Jahaan
          </h1>
          <p className="text-[16px] text-text-secondary text-center">
            your family, all in one place
          </p>

          {/* Avatar cluster */}
          <div className="flex items-center mt-1">
            {avatars.map((a, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-pill flex items-center justify-center text-[13px] font-semibold border-2 border-[#F7F7F5]"
                style={{
                  backgroundColor: a.bg,
                  color: a.text,
                  marginLeft: i === 0 ? 0 : "-8px",
                  zIndex: avatars.length - i,
                  position: "relative",
                }}
              >
                {a.initials}
              </div>
            ))}
          </div>
        </div>

        {/* ── Value props ── */}
        <div className="w-full flex flex-col gap-3">
          {pillars.map(({ icon: Icon, label, description, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-pill flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#EEEDFE" }}
              >
                <Icon size={18} strokeWidth={1.5} style={{ color }} />
              </div>
              <p className="text-[14px] text-text-primary">
                <span className="font-medium">{label}</span>
                <span className="text-text-tertiary"> · </span>
                <span className="text-text-secondary">{description}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ── Bottom zone ── */}
        <div className="w-full flex flex-col items-center gap-3 pb-4">
          <p className="text-[12px] text-text-tertiary">3-minute setup</p>
          <GoogleSignInButton />
          <p className="text-[11px] text-text-tertiary text-center">
            We&apos;ll use this to connect your calendar.
          </p>
        </div>

      </div>
    </main>
  );
}
