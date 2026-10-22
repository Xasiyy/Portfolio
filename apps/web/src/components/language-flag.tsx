"use client";

import { useLanguage } from "@/i18n/language-provider";

function FlagFr() {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="1" height="2" x="0" fill="#002395" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#ed2939" />
    </svg>
  );
}

function FlagUk() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath="url(#uk-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function LanguageFlag() {
  const { lang, toggleLang } = useLanguage();
  const label = lang === "fr" ? "Switch to English" : "Passer en français";

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={label}
      title={label}
      className="mx-1 h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/20 opacity-80 transition hover:scale-110 hover:opacity-100 md:hidden"
    >
      {lang === "fr" ? <FlagUk /> : <FlagFr />}
    </button>
  );
}
