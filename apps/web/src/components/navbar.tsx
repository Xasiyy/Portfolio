"use client";

import { FlipLink, Pill } from "@/components/flip-link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/language-provider";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  if (/^\/projects\/.+/.test(pathname)) return null;
  return (
    <nav className="fixed inset-x-0 top-6 z-50 flex justify-center">
      <Pill>
        <FlipLink href="/about" label={t.nav.about} />
        <FlipLink href="/projects" label={t.nav.projects} />
        <FlipLink href="/contact" label={t.nav.contact} />
      </Pill>
    </nav>
  );
}
