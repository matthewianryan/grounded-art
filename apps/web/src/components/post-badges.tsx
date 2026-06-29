import type { PostBadgeInfo } from "@/lib/feed-display";

export function PostBadges({ badges }: { badges: PostBadgeInfo }) {
  if (!badges.showBrand && !badges.showPin) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {badges.showBrand && badges.brandName && (
        <span className="inline-flex items-center rounded-badge border border-badge-border bg-badge-bg px-2 py-0.5 text-xs text-badge-fg">
          {badges.brandName}
        </span>
      )}
      {badges.showPin && (
        <span
          className="inline-flex items-center rounded-badge border border-badge-border bg-badge-bg px-2 py-0.5 text-xs text-badge-fg"
          aria-label="Has location"
        >
          <PinIcon />
        </span>
      )}
    </span>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
