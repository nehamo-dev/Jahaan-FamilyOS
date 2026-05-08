"use client";

import { useEffect, useState } from "react";

export function StepWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
      className="flex flex-col gap-6"
    >
      {children}
    </div>
  );
}
