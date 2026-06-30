"use client";

import { motion, useReducedMotion } from "motion/react";

export function CheckInCelebration({
  galleryName,
  balance,
  pointAwarded = true,
  onDismiss,
}: {
  galleryName: string;
  balance?: number;
  pointAwarded?: boolean;
  onDismiss: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
      role="dialog"
      aria-labelledby="checkin-success-title"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-sm border border-line bg-paper p-8 text-center shadow-lg">
        {reduce ? (
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent/10 text-accent"
            aria-hidden="true"
          >
            <CheckIcon />
          </div>
        ) : (
          <motion.div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent/10 text-accent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <CheckIcon />
          </motion.div>
        )}

        <h2
          id="checkin-success-title"
          className="mt-5 font-display text-xl tracking-tight"
        >
          You&apos;re here.
        </h2>
        {pointAwarded && balance !== undefined ? (
          <p className="mt-2 text-sm text-muted">
            You earned 1 point. Your balance is{" "}
            <span className="font-display text-wallet-balance">{balance}</span>.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Nice one. Enjoy the show at {galleryName}.
          </p>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink hover:text-ink"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5L10 17.5L19 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
