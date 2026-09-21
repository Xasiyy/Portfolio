"use client";

import { getProjects } from "@/lib/api";
import { ProjectTimeline } from "@/components/project-timeline";
import { useEffect, useState } from "react";
import { ShaderBackgroundStatic } from "@/components/shader-background-static";

export function Projects() {
  const  [projects, setProjects] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
    .then(setProjects)
    .catch(() => setError("Impossible to load projects"));
  }, []);

  if (error) 
    return <p className="mx-auto max-w-3xl px-6 py-24">{error}</p>;

  if (!projects)
    return <p className="mx-auto max-w-3xl px-6 py-24">Chargement…</p>;

  const sorted = [...projects].sort((a, b) => {
      const dateA = a.completedAt ?? a.createdAt;
      const dateB = b.completedAt ?? b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <ShaderBackgroundStatic />

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-serif text-4xl mt-12 mb-12">Mes projets</h1>
        <ProjectTimeline projects={sorted} />
      </main>
    </div>
  );

}
