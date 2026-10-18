"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fr, type Dictionary } from "./fr";
import { en } from "./en";

export type Lang = "fr" | "en";

const dictionaries: Record<Lang, Dictionary> = { fr, en };

type LanguageContextValue = {
  lang: Lang;
  t: Dictionary;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggleLang() {
    const next: Lang = lang === "fr" ? "en" : "fr";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé dans <LanguageProvider>");
  return ctx;
}
