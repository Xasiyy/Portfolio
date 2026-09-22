"use client";

import { useEffect, useState } from "react";
import { createSandbox, getSandboxUrl } from "@/lib/api";

export function SandboxModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    createSandbox(projectId)
      .then((data) => setSandboxId(data.sandboxId))
      .catch(() => setError("Impossible de lancer le sandbox"));
  }, [projectId]);

  useEffect(() => {
    if (!sandboxId) return;
    setReady(false);
    const timer = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(timer);
  }, [sandboxId, attempt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label="Fermer"
        >
          ✕
        </button>

        {error && (
          <p className="flex aspect-[4/3] items-center justify-center px-6 text-center text-white/70">{error}</p>
        )}

        {!error && (!sandboxId || !ready) && (
          <p className="flex aspect-[4/3] items-center justify-center px-6 text-center text-white/70">
            {!sandboxId
              ? "Compilation et lancement en cours, ça peut prendre jusqu'à une minute…"
              : "Démarrage de l'affichage…"}
          </p>
        )}

        {sandboxId && ready && (
          <div className="relative">
            <iframe key={attempt} src={getSandboxUrl(sandboxId)} className="aspect-[4/3] w-full" />
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/70 hover:bg-black/80"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

