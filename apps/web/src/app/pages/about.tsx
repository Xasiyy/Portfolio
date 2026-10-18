"use client";

import { CatAvatar } from "@/components/cat-avatar";
import { useLanguage } from "@/i18n/language-provider";

export function AboutMe() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen bg-[url('/bg.jpeg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen flex-col gap-10 px-[10px] pt-32 pb-16 text-white lg:flex-row lg:gap-10">
        <aside className="flex flex-col items-center gap-8 pl-[70px] pr-[120px] lg:w-[28%] lg:items-start lg:self-start">
          <CatAvatar />

          <div className="flex w-full flex-col gap-6">
            {t.about.skillGroups.map((group) => (
              <div key={group.title} className="flex w-full flex-col gap-3">
                <h2 className="font-serif text-lg">{group.title}</h2>
                <ul className="flex flex-wrap gap-2 lg:flex-col">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex w-full flex-1 flex-col mr-[200px] mt-[20px] lg:justify-center">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
            <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-6xl">
              {t.about.title}
            </h1>
            {t.about.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-lg text-white/80">
                {paragraph}
              </p>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
