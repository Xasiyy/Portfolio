"use client";

import { use, useEffect, useRef, useState } from "react";
import { createSandbox, getSandboxUrl, getTerminalSandboxUrl } from "@/lib/api";
import { Sansation } from "next/font/google";
import { useLanguage } from "@/i18n/language-provider";

type SandboxVariant = "graphical" | "terminal";
type SandboxSize = "default" | "large";
type SandboxError = "launchFailed" | "rateLimited" | "full";

export function SandboxModal({
  projectId,
  onClose,
  variant = "graphical",
  size = "default",
}: {
  projectId: string;
  onClose: () => void;
  variant?: SandboxVariant;
  size?: SandboxSize;
}) {
  const { t } = useLanguage();
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [errorCode, setErrorCode] = useState<SandboxError | null>(null);

  const started = useRef(false);

  useEffect(() => {
    if (started.current)
      return;
    started.current = true;
    createSandbox(projectId)
      .then((data) => setSandboxId(data.sandboxId))
      .catch((err) => {
        const code = (err as Error).message;
        setErrorCode(code === "rateLimited" || code === "full" ? code: "launchFailed");
      });
  }, [projectId]);

  useEffect(() => {
    if (!sandboxId) return;
    setReady(false);
    const timer = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(timer);
  }, [sandboxId, attempt]);

  const src = sandboxId ? variant === "terminal" ? getTerminalSandboxUrl(sandboxId): getSandboxUrl(sandboxId): undefined;

  const aspectClass = variant === "terminal" ? "aspect-video" : "aspect-[4/3]";
  const sizeClass = size === "large" ? "" : "w-full max-w-2xl";
  const sizeStyle = size === "large" ? { width: "min(95vw, calc(90vh * 4 / 3))"} : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
      className={`relative ${sizeClass} overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl`}
      style={sizeStyle}
      >

        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label={t.sandbox.close}
        >
          ✕
        </button>

        {errorCode && (
          <p className={`flex ${aspectClass} items-center justify-center px-6 text-center text-white/70`}>{t.sandbox.launchFailed}</p>
        )}

        {!errorCode && (!sandboxId || !ready) && (
          <p className={`flex ${aspectClass} items-center justify-center px-6 text-center text-white/70`}>
            {!sandboxId
              ? t.sandbox.compiling
              : variant === "terminal"
                ? t.sandbox.startingTerminal
                : t.sandbox.startingDisplay}
          </p>
        )}

        {sandboxId && ready && src && (
          <div className="relative">
            <iframe key={attempt} src={src} className={`${aspectClass} w-full`} />
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/70 hover:bg-black/80"
            >
              {t.sandbox.retry}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
