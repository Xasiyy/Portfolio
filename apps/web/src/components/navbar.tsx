"use client";

import { FlipLink, Pill } from "@/components/flip-link";

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-6 z-50 flex justify-center">
      <Pill>
        <FlipLink href="#" label="About me" />
        <FlipLink href="#" label="Projects" />
        <FlipLink href="#" label="Contact" />
      </Pill>
    </nav>
  );
}
