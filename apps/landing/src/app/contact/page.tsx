import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Grounded Art about listings, coverage, takedowns, and general questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-24">
            <div>
              <p className="ga-kicker">Contact us</p>
              <h1 className="ga-display-page mt-5">
                Tell us what we should know.
              </h1>
              <p className="ga-body-intro mt-7 max-w-md">
                Send questions, listing updates, corrections, coverage ideas, and notes from
                Cape Town&apos;s art community.
              </p>
            </div>

            <div className="border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <ContactForm />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-3">
            <div>
              <span className="block h-px w-10 bg-accent" aria-hidden="true" />
              <h2 className="ga-display-sub mt-5">General email</h2>
              <a
                href="mailto:hello@grounded-art.co.za"
                className="mt-3 inline-block text-sm text-muted underline transition hover:text-ink"
              >
                hello@grounded-art.co.za
              </a>
            </div>

            <div>
              <span className="block h-px w-10 bg-accent" aria-hidden="true" />
              <h2 className="ga-display-sub mt-5">Takedown requests</h2>
              <a
                href="mailto:takedown@grounded-art.co.za"
                className="mt-3 inline-block text-sm text-muted underline transition hover:text-ink"
              >
                takedown@grounded-art.co.za
              </a>
            </div>

            <div>
              <span className="block h-px w-10 bg-accent" aria-hidden="true" />
              <h2 className="ga-display-sub mt-5">Updates and opt-outs</h2>
              <p className="ga-body mt-3">
                Galleries and artists can ask us to update, remove, or opt out of a listing at
                any time.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
