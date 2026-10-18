"use client";

import { RevealButton } from "@/components/reveal-button";
import { ShaderBackground } from "@/components/shader-background";
import { useLanguage } from "@/i18n/language-provider";

export function Home() {
  const { t } = useLanguage();
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <ShaderBackground />

      <main className="relative z-10 flex flex-col items-center gap-6 px-6 text-center text-white sm:px-12">
        <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-6xl">
          {t.home.title}
        </h1>
        <p className="font-serif italic max-w-xl text-lg text-white/80 sm:text-xl">
          {t.home.intro}
        </p>
        <RevealButton href="/about" label={t.home.cta} />
      </main>
    </div>
  );
}