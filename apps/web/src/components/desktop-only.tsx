"use client";

import { useIsDesktop } from "@/lib/use-is-desktop";
import { useLanguage } from "@/i18n/language-provider";

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  const { t } = useLanguage();

  if (isDesktop === null) return null;

  if (!isDesktop)
    return (
      <p className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center text-sm text-white/60">
        {t.projectPage.desktopOnly}
      </p>
    );

  return <>{children}</>;
}
