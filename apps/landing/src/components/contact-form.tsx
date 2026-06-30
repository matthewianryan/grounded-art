"use client";

import { FormEvent, useRef, useState } from "react";
import Script from "next/script";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type FormStatus = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""),
      turnstile_token: String(formData.get("cf-turnstile-response") ?? ""),
    };

    setStatus("sending");
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      formRef.current?.reset();
      const turnstile = (
        window as typeof window & { turnstile?: { reset: () => void } }
      ).turnstile;
      turnstile?.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const disabled = status === "sending";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative space-y-5">
      {TURNSTILE_SITE_KEY ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      ) : null}

      <div
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Company
          <input
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={255}
            disabled={disabled}
            className="mt-2 w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            disabled={disabled}
            className="mt-2 w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Subject</span>
        <input
          name="subject"
          type="text"
          required
          minLength={2}
          maxLength={512}
          disabled={disabled}
          className="mt-2 w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          disabled={disabled}
          className="mt-2 w-full resize-y rounded-sm border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-ink disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      {TURNSTILE_SITE_KEY ? (
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-theme="auto"
          data-size="normal"
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending" : "Send"}
        </button>
        <p className="min-h-5 text-sm text-muted" aria-live="polite">
          {status === "sent"
            ? "Thanks. Your message reached us."
            : status === "error"
              ? "Something went wrong. Try again, or email hello@grounded-art.co.za."
              : ""}
        </p>
      </div>
    </form>
  );
}
