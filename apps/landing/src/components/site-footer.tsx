import Link from "next/link";
import { mapHref, feedHref } from "@/lib/app-url";

// Shared footer: a short blurb, the contact email, social profiles, and a clear takedown and
// opt-out contact. Kept restrained so it closes the page without competing with the work above.
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="font-display text-lg">Grounded Art</span>
          <span className="mt-2 block h-px w-7 bg-accent" aria-hidden="true" />
          <p className="ga-body mt-5 max-w-sm">
            A living atlas of Cape Town art. Every gallery, exhibition, and opening in one
            place, kept current and made by people who love this city.
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <span className="ga-meta tracking-[0.18em]">Explore</span>
          <a href={mapHref()} className="text-muted transition hover:text-ink">
            Map
          </a>
          <a href={feedHref()} className="text-muted transition hover:text-ink">
            Feed
          </a>
          <Link href="/about" className="text-muted transition hover:text-ink">
            About
          </Link>
          <Link href="/contact" className="text-muted transition hover:text-ink">
            Contact us
          </Link>
        </nav>

        <nav className="flex flex-col gap-3 text-sm">
          <span className="ga-meta tracking-[0.18em]">Find us</span>
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
            <a href="mailto:takedown@grounded-art.co.za" className="underline transition hover:text-ink">
              takedown@grounded-art.co.za
            </a>{" "}
            to update or opt out.
          </span>
        </div>
      </div>
    </footer>
  );
}
