export type CheckInStatusVariant =
  | "out_of_range"
  | "permission_denied"
  | "unavailable"
  | "low_accuracy"
  | "already_earned_today"
  | "implausible_travel"
  | "method_not_eligible"
  | "verification_failed";

const COPY: Record<
  CheckInStatusVariant,
  { title: string; body: string }
> = {
  out_of_range: {
    title: "Not quite there yet.",
    body: "You're outside the gallery radius. Head over to check in.",
  },
  permission_denied: {
    title: "Location not shared.",
    body: "Allow location access in your browser to check in here.",
  },
  unavailable: {
    title: "Location unavailable.",
    body: "We couldn't read your position right now. Try again in a moment.",
  },
  low_accuracy: {
    title: "Location too fuzzy.",
    body: "Your location signal is too broad to award a point. Try again with a clearer signal.",
  },
  already_earned_today: {
    title: "Checked in.",
    body: "You already earned a point here today. Come back tomorrow.",
  },
  implausible_travel: {
    title: "Checked in.",
    body: "This visit was recorded, but we could not award a point from this location jump.",
  },
  method_not_eligible: {
    title: "Checked in.",
    body: "This visit was recorded, but this check-in method does not earn points right now.",
  },
  verification_failed: {
    title: "Could not verify.",
    body: "This check-in was recorded without a point. Open the gallery card and try again.",
  },
};

export function CheckInStatus({
  variant,
  message,
  onDismiss,
}: {
  variant: CheckInStatusVariant;
  message?: string;
  onDismiss?: () => void;
}) {
  const copy = COPY[variant];

  return (
    <div className="mt-4 rounded-sm border border-line bg-paper p-5 text-center">
      <div
        className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted"
        aria-hidden="true"
      >
        <LocationOffIcon />
      </div>
      <p className="ga-display-card mt-3">{copy.title}</p>
      <p className="ga-body mt-1">{message ?? copy.body}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 text-sm text-accent transition hover:text-ink"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

function LocationOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
