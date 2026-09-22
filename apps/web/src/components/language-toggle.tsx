"use client";

import { FlipLink, Pill } from "@/components/flip-link";
import { usePathname } from "next/navigation";

export function LanguageToggle() {
  const pathname = usePathname();
  if (/^\/projects\/.+/.test(pathname)) return null;  
  return (
    <nav className="fixed left-6 top-6 z-50">
      <Pill>
        <FlipLink href="#" label="FR/EN" />
      </Pill>
    </nav>
  );
}
