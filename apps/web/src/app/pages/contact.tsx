"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, Clock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendContact } from "@/lib/api";
import { useLanguage } from "@/i18n/language-provider";
import type { Dictionary } from "@/i18n/fr";

type Status = "idle" | "sending" | "sent" | "error";
type ErrorCode = keyof Dictionary["errors"];

const fieldClass =
  "h-11 rounded-lg bg-black/40 text-white focus-visible:ring-offset-0";

export function ContactPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode>("sendFailed");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("sending");
    try {
      await sendContact(data);
      setStatus("sent");
      form.reset();
    } catch (err) {
      // une erreur réseau (serveur injoignable) n'a pas de code connu : on affiche sendFailed
      const code = (err as Error).message;
      setErrorCode(code === "rateLimited" ? "rateLimited" : "sendFailed");
      setStatus("error");
    }
  }

  return (
    <section
      className="flex min-h-screen items-center justify-center px-6 py-28"
      style={{ backgroundColor: "#333333" }}
    >
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-white/5 text-violet-300">
            <Mail className="size-5" />
          </span>
          <h1 className="font-serif text-4xl text-white">{t.contact.title}</h1>
          <p className="max-w-md text-balance text-white/60">
            {t.contact.intro}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative mt-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-md sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.contact.firstName} name="firstName" placeholder="Ada" autoComplete="given-name" maxLength={100} />
            <Field label={t.contact.lastName} name="lastName" placeholder="Lovelace" autoComplete="family-name" maxLength={100} />
          </div>

          <Field
            label={t.contact.email}
            name="email"
            type="email"
            placeholder={t.contact.emailPlaceholder}
            autoComplete="email"
            maxLength={254}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-message" className="text-sm font-medium text-white">
              {t.contact.message}
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              maxLength={5000}
              rows={5}
              placeholder={t.contact.messagePlaceholder}
              className="flex w-full rounded-lg border border-input bg-black/40 px-3 py-2 text-sm text-white shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px]"
          />

          <Button
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="h-11 w-full rounded-lg bg-violet-500 text-white hover:bg-violet-400"
          >
            {status === "sending" ? t.contact.sending : t.contact.send}
            {status !== "sending" && <ArrowRight className="ml-2 size-4" />}
          </Button>

          {status === "sent" && (
            <p className="flex items-center justify-center gap-2 text-sm text-violet-300">
              <CircleCheck className="size-4" />
              {t.contact.sent}
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-sm text-red-400">{t.errors[errorCode]}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" />
              {t.contact.responseTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-emerald-500" />
              {t.contact.privacy}
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = `contact-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required
        className={fieldClass}
      />
    </div>
  );
}
