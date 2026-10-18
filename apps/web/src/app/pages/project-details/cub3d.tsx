"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { SandboxModal } from "@/components/sandbox-modal";
import { ShinyButton } from "@/components/shiny-button";
import { useLanguage } from "@/i18n/language-provider";
import { Cub3DContentEn, Cub3DContentFr } from "./cub3d-content";

export function Cub3DDetail() {
  const { lang, t } = useLanguage();
  const [project, setProject] = useState<any | null>(null);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "Cub3D") ?? null);
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
        <h1 className="font-serif text-4xl mb-8 text-white">Cub3D</h1>

        <div className="space-y-6 leading-relaxed">
          {lang === "fr" ? <Cub3DContentFr /> : <Cub3DContentEn />}
        </div>

        {project.repoUrl && (
          <div className="mt-16 mb-16 flex justify-center">
            <ShinyButton onClick={() => setShowSandbox(true)} backgroundColor="#333333">
              {t.projectPage.test}
            </ShinyButton>
          </div>
        )}

        {showSandbox && <SandboxModal projectId={project.id} onClose={() => setShowSandbox(false)} />}

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/50">
          <p className="mb-3 font-black text-white/70">{t.projectPage.documents}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <a href="https://www.youtube.com/watch?v=gYRrGTC7GtA&t=3s" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                {lang === "fr" ? "Vidéo 3DSage" : "3DSage video"}
              </a>
            </li>
            <li>
              <a href="https://github.com/3DSage/OpenGL-Raycaster_v1" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                github.com/3DSage/OpenGL-Raycaster_v1
              </a>
            </li>
            <li>
              <a href="https://harm-smits.github.io/42docs/libs/minilibx" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                harm-smits.github.io/42docs/libs/minilibx
              </a>
            </li>
          </ul>

          <p className="mb-3 mt-8 font-black text-white/70">{t.projectPage.collaborators}</p>
          <a
            href="https://github.com/abollia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur-md transition hover:bg-black/70"
          >
            <img src="https://github.com/abollia.png" alt="abollia" className="h-7 w-7 rounded-full" />
            <span className="text-sm font-medium text-violet-400">abollia</span>
          </a>
        </div>

        <p className="mb-3 font-black text-white/70">{t.projectPage.repository}</p>
        <a
          href="https://github.com/Xasiyy/Cub3D"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
          style={{ backgroundColor: "#333333" }}
        >
          <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">Cube3D</span>
            <span className="text-xs text-white/50 transition group-hover:text-violet-300">
              {t.projectPage.viewOnGithub}
            </span>
          </div>
        </a>
      </main>
    </div>
  );
}
