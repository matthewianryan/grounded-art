"use client";

// App-level error boundary. Catches runtime errors thrown while rendering a route segment
// (for example the profile, wallet, saved, and check-in pages, whose server fetches re-throw
// when the API is unreachable) and shows a calm, on-brand recovery surface instead of an
// unhandled crash. The root layout stays mounted, so the nav and footer remain in place.
import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="ga-kicker">Something went wrong</p>
      <h1 className="ga-display-sub mt-5">We could not load this just now</h1>
      <p className="ga-body mt-3">
        This is on us, not you. Try again in a moment, or head back to the feed to keep browsing.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex rounded-full border border-accent bg-accent px-5 py-2 text-sm text-paper transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/feed"
          className="inline-flex rounded-full border border-line px-5 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          Back to feed
        </Link>
      </div>
    </main>
  );
}
