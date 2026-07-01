import type { ReactNode } from "react";

export const ICON_BUTTON =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_6px_16px_-6px_rgb(22_19_14/0.35)] backdrop-blur transition";

export function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function FeedIcon() {
  return (
    <Icon>
      <path d="M12 3.5 3.5 8 12 12.5 20.5 8 12 3.5z" />
      <path d="M4 12.5 12 17l8-4.5" />
    </Icon>
  );
}

export function BookmarkIcon() {
  return (
    <Icon>
      <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.5L6 20V5.5a1 1 0 0 1 1-1z" />
    </Icon>
  );
}

export function GridIcon() {
  return (
    <Icon>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </Icon>
  );
}

export function AllViewsIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4v16" />
    </Icon>
  );
}

export function WeekendIcon() {
  return (
    <Icon>
      <rect x="4" y="5.5" width="16" height="14" rx="1.5" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
    </Icon>
  );
}

export function OpeningSoonIcon() {
  return (
    <Icon>
      <path d="M12 21c4-4.5 6-7.6 6-10.5A6 6 0 0 0 6 10.5C6 13.4 8 16.5 12 21z" />
      <path d="M12 7v3.5l2.5 1.5" />
    </Icon>
  );
}

export function ClosingSoonIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
}
