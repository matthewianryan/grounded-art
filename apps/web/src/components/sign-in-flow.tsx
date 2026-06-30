"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { ApiClientError, requestLoginCode, verifyLoginCode } from "@/lib/api-client";
import { navigateAfterSignIn } from "@/lib/auth-gate";
import { readSavedKeys, writeSavedKeys } from "@/lib/user-actions";

type Step = "email" | "code";

export function SignInFlow({ returnTo }: { returnTo: string }) {
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "code") {
      codeRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestLoginCode(email.trim());
      setStep("code");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.detail ?? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const savedKeys = readSavedKeys();
      await verifyLoginCode(email.trim(), code.trim(), savedKeys);
      writeSavedKeys([]);
      await refresh();
      navigateAfterSignIn(returnTo);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.detail ?? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await requestLoginCode(email.trim());
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.detail ?? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="sign-in-email" className="block text-sm text-muted">
              Email
            </label>
            <input
              id="sign-in-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-full border border-accent bg-accent px-5 py-2 text-sm text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <p className="text-sm text-muted">
            We sent a six-digit code to <span className="text-ink">{email}</span>.
          </p>
          <div>
            <label htmlFor="sign-in-code" className="block text-sm text-muted">
              Code
            </label>
            <input
              ref={codeRef}
              id="sign-in-code"
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1.5 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm tracking-[0.3em] text-ink outline-none transition focus:border-ink"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="inline-flex rounded-full border border-accent bg-accent px-5 py-2 text-sm text-paper transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              disabled={loading || resendCooldown > 0}
              onClick={() => void handleResend()}
              className="text-sm text-muted transition hover:text-ink disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="text-sm text-muted transition hover:text-ink"
            >
              Change email
            </button>
          </div>
        </form>
      )}

      <a
        href={returnTo}
        className="mt-8 inline-flex text-sm text-muted transition hover:text-ink"
      >
        Back without signing in
      </a>
    </div>
  );
}
