"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { FtClockContentEn, FtClockContentFr } from "./ftclock-content";
import { getProjects } from "@/lib/api";
import { ShinyButton } from "@/components/shiny-button";

export function FtClockDetail() {
  const { lang, t } = useLanguage();
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "Ftclock") ?? null);
    });
  }, []);

  if (!project)
    return <p className="mx-auto max-w-3xl px-6 py-24">{t.common.loading}</p>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#333333" }}>
      <Link
        href="/projects"
        aria-label={t.common.backToProjects}
        className="fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 shadow-lg backdrop-blur-md transition hover:bg-black/70"
      >
        ←
      </Link>

      <main className="mx-auto max-w-3xl px-6 py-24 text-white/80">
        <h1 className="font-serif text-4xl mb-8 text-white">ft_Clock</h1>

        {lang === "fr" ? <FtClockContentFr /> : <FtClockContentEn />}

        {project.liveUrl && (
          <div className="mt-16 mb-16 flex justify-center">
            <ShinyButton
              onClick={() => window.open(project.liveUrl, "_blank", "noopener,noreferrer")}
              backgroundColor="#333333"
            >
              {t.projectPage.visitSite}
            </ShinyButton>
          </div>
        )}

        <p className="mb-3 mt-8 font-black text-white/70">{t.projectPage.repository}</p>
        <a
          href="https://github.com/Xasiyy/ft_Clock"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
          style={{ backgroundColor: "#333333" }}
        >
          <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.920.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">ft_Clock</span>
            <span className="text-xs text-white/50 transition group-hover:text-violet-300">
              {t.projectPage.viewOnGithub}
            </span>
          </div>
        </a>
      </main>
    </div>
  );
}
