"use client";

import { CatAvatar } from "@/components/cat-avatar";
import { useLanguage } from "@/i18n/language-provider";

export function AboutMe() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen bg-[url('/bg.jpeg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen flex-col gap-12 px-6 pt-28 pb-16 text-white sm:px-10 lg:flex-row lg:gap-10 lg:px-[10px] lg:pt-32">
        <aside className="order-2 flex flex-col items-center gap-8 lg:order-1 lg:w-[28%] lg:items-start lg:self-start lg:pl-[70px] lg:pr-[120px]">
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

        <main className="order-1 flex w-full flex-1 flex-col lg:order-2 lg:mr-[200px] lg:mt-[20px] lg:justify-center">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-10">
            <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-6xl">
              {t.about.title}
            </h1>
            {t.about.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-white/80 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
