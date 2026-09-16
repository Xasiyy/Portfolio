"use client";

import { FlipLink, Pill } from "@/components/flip-link";

export function LanguageToggle() {
  return (
    <nav className="fixed left-6 top-6 z-50">
      <Pill>
        <FlipLink href="#" label="FR/EN" />
      </Pill>
    </nav>
  );
}
