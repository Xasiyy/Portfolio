"use client";

import { FlipLink, Pill } from "@/components/flip-link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  if (/^\/projects\/.+/.test(pathname)) return null;
  return (
    <nav className="fixed inset-x-0 top-6 z-50 flex justify-center">
      <Pill>
        <FlipLink href="/about" label="About me" />
        <FlipLink href="/projects" label="Projects" />
        <FlipLink href="#" label="Contact" />
      </Pill>
    </nav>
  );
}
