"use client";

import type React from "react";

interface InfoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoCard({ title, children, className = "" }: InfoCardProps) {
  return (
    <div
      className={`relative my-10 overflow-hidden rounded-2xl p-4 ${className}`}
      style={{
        backgroundColor: "#333333",
        boxShadow: "14px 14px 34px #262626, -14px -14px 34px #404040",
      }}
    >
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #b4a7e0 0%, #8d7dca 45%, transparent 72%)",
        }}
      />

      <div className="relative z-10 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
        {title && (
          <h3 className="mb-4 font-serif text-xl text-white">{title}</h3>
        )}
        <div className="text-white/80">{children}</div>
      </div>
    </div>
  );
}
