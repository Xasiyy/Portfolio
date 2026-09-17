"use client";

import { useEffect, useRef } from "react";

const POS: Record<string, string> = {
  idle: "0% 0%",
  tail_mid: "33.3333% 0%",
  tail_full: "66.6667% 0%",
  ear_a: "0% 100%",
  ear_b: "33.3333% 100%",
  wink_mid: "66.6667% 100%",
  wink_full: "100% 100%",
};

const SEQS: Record<string, string[]> = {
  queue: ["tail_mid", "tail_full"],
  oreille: ["ear_a", "ear_b"],
  clin: ["wink_mid", "wink_full"],
};

export function CatAvatar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameTimeout: ReturnType<typeof setTimeout>;
    let scheduleTimeout: ReturnType<typeof setTimeout>;

    function play(seq: string[], i = 0) {
      const el = ref.current;
      if (!el) return;
      if (i >= seq.length) {
        el.style.backgroundPosition = POS.idle;
        schedule();
        return;
      }
      el.style.backgroundPosition = POS[seq[i]];
      frameTimeout = setTimeout(() => play(seq, i + 1), 150);
    }

    function schedule() {
      const keys = Object.keys(SEQS);
      scheduleTimeout = setTimeout(
        () => play(SEQS[keys[Math.floor(Math.random() * keys.length)]]),
        2000 + Math.random() * 1000
      );
    }

    schedule();

    return () => {
      clearTimeout(frameTimeout);
      clearTimeout(scheduleTimeout);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="h-[223px] w-[170px] bg-no-repeat [image-rendering:pixelated]"
      style={{
        backgroundImage: "url('/avatar.png')",
        backgroundSize: "400% 200%",
        backgroundPosition: POS.idle,
      }}
    />
  );
}
