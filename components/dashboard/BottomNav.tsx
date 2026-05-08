"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LayoutGrid, CheckSquare, Users } from "lucide-react";

const NAV = [
  { href: "/dashboard",         label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/pillars", label: "Pillars",  icon: LayoutGrid },
  { href: "/dashboard/tasks",   label: "Tasks",    icon: CheckSquare },
  { href: "/dashboard/family",  label: "Family",   icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-[rgba(0,0,0,0.07)] pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around pt-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-4 py-1">
              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                className={active ? "text-primary" : "text-content-tertiary"}
              />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-content-tertiary"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
