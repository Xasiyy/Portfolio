"use client";

import { FlipButton, Pill } from "@/components/flip-link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/language-provider";

export function LanguageToggle() {
  const pathname = usePathname();
  const { lang, toggleLang } = useLanguage();
  if (/^\/projects\/.+/.test(pathname)) return null;
  return (
    <nav className="fixed left-6 top-6 z-50">
      <Pill>
        <FlipButton onClick={toggleLang} label={lang === "fr" ? "EN" : "FR"} />
      </Pill>
    </nav>
  );
}
