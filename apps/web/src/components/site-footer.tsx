import Link from "next/link";

// Footer for the web app. Restrained, matching the landing, with the clear takedown and opt-out
// contact carried through so it is reachable from every page of the app.
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="font-display text-lg">Grounded Art</span>
          <span className="mt-2 block h-px w-7 bg-accent" aria-hidden="true" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Cape Town galleries, exhibitions, and openings in one place, kept current and made
            by people who love this city.
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Explore</span>
          <Link href="/map" className="text-muted transition hover:text-ink">
            Map
          </Link>
          <Link href="/feed" className="text-muted transition hover:text-ink">
            Feed
          </Link>
        </nav>

        <nav className="flex flex-col gap-3 text-sm">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Find us</span>
          <a
            href="https://www.instagram.com/groundedart.ct"
            target="_blank"
            rel="noreferrer"
            className="text-muted transition hover:text-ink"
          >
            Instagram
          </a>
          <a
            href="mailto:hello@grounded-art.co.za"
            className="text-muted transition hover:text-ink"
          >
            hello@grounded-art.co.za
          </a>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Made by people in Cape Town.</span>
          <span>
            Listed here and want a change? Email{" "}
            <a
              href="mailto:takedown@grounded-art.co.za"
              className="underline transition hover:text-ink"
            >
              takedown@grounded-art.co.za
            </a>{" "}
            to update or opt out.
          </span>
        </div>
      </div>
    </footer>
  );
}
