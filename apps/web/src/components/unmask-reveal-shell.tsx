"use client";

import { useReducedMotion } from "motion/react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1578301978693-1781dacf0a5a?w=800&h=1000&fit=crop";

export function UnmaskRevealShell() {
  const reduce = useReducedMotion();

  if (reduce) {
    return <StaticReveal />;
  }

  return <StickyUnmaskReveal />;
}

function StaticReveal() {
  return (
    <div className="space-y-6">
      <PreviewCard />
      <DetailSurface />
    </div>
  );
}

function StickyUnmaskReveal() {
  return (
    <div className="relative" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen">
        <div className="relative h-full">
          <div className="absolute inset-0 z-0 overflow-y-auto pt-[45vh]">
            <div className="mx-auto max-w-lg px-6 pb-24">
              <DetailSurface />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto max-w-lg px-6 pt-16">
            <div className="pointer-events-auto">
              <PreviewCard />
            </div>
            <p className="mt-6 text-center text-xs text-muted">Scroll to reveal full detail</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard() {
  return (
    <article className="overflow-hidden rounded-card border border-line bg-card-bg shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PLACEHOLDER_IMAGE}
        alt=""
        className="aspect-[4/5] w-full object-cover"
        loading="lazy"
      />
      <div className="border-t border-line p-4">
        <p className="font-display text-lg text-ink">Thandiwe Maseko</p>
        <p className="mt-1 text-sm text-muted">Opening this week</p>
      </div>
    </article>
  );
}

function DetailSurface() {
  return (
    <article className="rounded-card border border-line bg-card-bg p-5 shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PLACEHOLDER_IMAGE}
        alt=""
        className="aspect-[4/3] w-full rounded-card object-cover"
        loading="lazy"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl text-ink">Thandiwe Maseko</h2>
        <span className="inline-flex items-center rounded-badge border border-badge-border bg-badge-bg px-2 py-0.5 text-xs text-badge-fg">
          Gallery brand
        </span>
        <span className="inline-flex items-center rounded-badge border border-badge-border bg-badge-bg px-2 py-0.5 text-xs text-badge-fg">
          Pin
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        A quiet study in light and form. The work sits between memory and place, drawn from
        walks through the city and the coast.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <ActionPill label="View map" active />
        <ActionPill label="Save" />
        <ActionPill label="Share" />
      </div>
    </article>
  );
}

function ActionPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-action border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-ink bg-action-active-bg text-ink"
          : "border-action-border text-action-fg"
      }`}
    >
      {label}
    </span>
  );
}

export function WalletPreview() {
  return (
    <div className="rounded-card border border-line bg-card-bg p-5 shadow-card">
      <p className="text-xs uppercase tracking-[0.16em] text-wallet-muted">Wallet</p>
      <p className="mt-2 font-display text-4xl text-wallet-balance">12</p>
      <p className="mt-1 text-sm text-wallet-muted">points earned</p>
      <ul className="mt-6 space-y-3 border-t border-line pt-4">
        <li className="flex items-baseline justify-between text-sm">
          <span className="text-muted">Verified check-in</span>
          <span className="text-wallet-credit">+1</span>
        </li>
        <li className="flex items-baseline justify-between text-sm">
          <span className="text-muted">Verified check-in</span>
          <span className="text-wallet-credit">+1</span>
        </li>
      </ul>
    </div>
  );
}
