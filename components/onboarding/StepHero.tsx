import { LucideIcon } from "lucide-react";

interface StepHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function StepHero({ icon: Icon, title, subtitle }: StepHeroProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-4 pb-2 text-center">
      <div className="w-20 h-20 rounded-pill bg-primary-light flex items-center justify-center">
        <Icon size={48} strokeWidth={1.5} className="text-primary" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-semibold text-text-primary leading-tight tracking-[-0.01em]">
          {title}
        </h1>
        <p className="text-[14px] text-text-secondary leading-relaxed max-w-[300px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
