// Placeholder blocks for Phase 0 shells. Token-only styling, no real data.

export const PLACEHOLDER_ITEMS = [
  { id: "1", label: "Art post", artist: "Lerato Mokoena" },
  { id: "2", label: "Event", artist: "First Thursdays" },
  { id: "3", label: "Art post", artist: "Thabo Nkosi" },
  { id: "4", label: "Announcement", artist: "Grounded Art" },
  { id: "5", label: "Art post", artist: "Zanele Dlamini" },
  { id: "6", label: "Event", artist: "Studio visit" },
  { id: "7", label: "Art post", artist: "Amahle Jacobs" },
] as const;

export function PlaceholderArtBlock({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex aspect-[3/4] w-full items-end rounded-sm border bg-surface-muted p-3 ${
        active
          ? "border-ink shadow-[0_12px_32px_color-mix(in_srgb,var(--ga-ink)_12%,transparent)]"
          : "border-card-border shadow-sm"
      }`}
      aria-hidden="true"
    >
      <span className="text-xs uppercase tracking-[0.14em] text-muted">{label}</span>
    </div>
  );
}

export function PlaceholderBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-badge-border bg-badge-bg px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-badge-fg">
      {children}
    </span>
  );
}

export function PlaceholderActionRow() {
  const actions = ["Save", "View map", "Share"];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Actions">
      {actions.map((label, index) => (
        <span
          key={label}
          className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm ${
            index === 0
              ? "border-action-pressed-border bg-action-pressed-bg text-action-pressed-fg"
              : "border-action-border text-action-fg"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function PlaceholderWalletSummary() {
  return (
    <div className="rounded-sm border border-card-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-wallet-muted">Points balance</p>
      <p className="mt-2 font-display text-4xl tracking-tight text-wallet-balance">12</p>
      <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <li className="flex justify-between text-wallet-muted">
          <span>Verified check-in</span>
          <span className="text-ink">+1</span>
        </li>
        <li className="flex justify-between text-wallet-muted">
          <span>Verified check-in</span>
          <span className="text-ink">+1</span>
        </li>
      </ul>
    </div>
  );
}

export function PlaceholderPostCard({ artist, label }: { artist: string; label: string }) {
  return (
    <article className="rounded-sm border border-card-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl tracking-tight">{artist}</h2>
        <PlaceholderBadge>Brand</PlaceholderBadge>
        <PlaceholderBadge>Pin</PlaceholderBadge>
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-4">
        <PlaceholderArtBlock label={label} active />
      </div>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
        Placeholder body copy for the full post detail. The art leads and the frame stays quiet.
      </p>
      <div className="mt-6">
        <PlaceholderActionRow />
      </div>
    </article>
  );
}
