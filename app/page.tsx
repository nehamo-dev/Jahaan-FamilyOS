import { Cake, GraduationCap, PalmtreeIcon, Wrench, Sparkles, User, Baby } from "lucide-react";
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
  { icon: User,  bg: "#EEEDFE", color: "#534AB7", size: 18 },
  { icon: User,  bg: "#EEEDFE", color: "#534AB7", size: 18 },
  { icon: Baby,  bg: "#E1F5EE", color: "#0F6E56", size: 16 },
  { icon: Baby,  bg: "#E1F5EE", color: "#0F6E56", size: 16 },
  { icon: Baby,  bg: "#E1F5EE", color: "#0F6E56", size: 16 },
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
          <p className="text-[16px] text-content-secondary text-center">
            your family, all in one place
          </p>

          {/* Avatar cluster */}
          <div className="flex items-center mt-1">
            {avatars.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="w-10 h-10 rounded-pill flex items-center justify-center border-2 border-[#F7F7F5]"
                  style={{
                    backgroundColor: a.bg,
                    marginLeft: i === 0 ? 0 : "-8px",
                    zIndex: avatars.length - i,
                    position: "relative",
                  }}
                >
                  <Icon size={a.size} strokeWidth={1.5} style={{ color: a.color }} />
                </div>
              );
            })}
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
              <p className="text-[14px] text-content-primary">
                <span className="font-medium">{label}</span>
                <span className="text-content-tertiary"> · </span>
                <span className="text-content-secondary">{description}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ── Bottom zone ── */}
        <div className="w-full flex flex-col items-center gap-3 pb-4">
          <p className="text-[12px] text-content-tertiary">3-minute setup</p>
          <GoogleSignInButton />
          <p className="text-[11px] text-content-tertiary text-center">
            We&apos;ll use this to connect your calendar.
          </p>
        </div>

      </div>
    </main>
  );
}
