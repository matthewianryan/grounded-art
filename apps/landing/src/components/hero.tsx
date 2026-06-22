"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ThemeToggle } from "./theme-toggle";

gsap.registerPlugin(useGSAP, SplitText, DrawSVGPlugin);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Hide the animated parts up front so there is no flash before the timeline runs.
      gsap.set(".hero-headline", { autoAlpha: 0 });
      gsap.set([".hero-kicker", ".hero-sub", ".hero-cta"], { autoAlpha: 0, y: 12 });
      gsap.set(".hero-rule path", { drawSVG: "0%" });

      let split: SplitText | undefined;
      let tl: gsap.core.Timeline | undefined;
      let cancelled = false;

      const run = () => {
        if (cancelled) return;

        gsap.set(".hero-headline", { autoAlpha: 1 });
        split = SplitText.create(".hero-headline", {
          type: "lines",
          mask: "lines",
          linesClass: "hero-line",
        });

        tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(".hero-kicker", { autoAlpha: 1, y: 0, duration: 0.6 })
          .from(split.lines, { yPercent: 115, duration: 0.9, stagger: 0.12 }, "-=0.3")
          .to(".hero-rule path", { drawSVG: "100%", duration: 0.9 }, "-=0.45")
          .to(".hero-sub", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.55")
          .to(".hero-cta", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.4");
      };

      // Wait for the webfont so SplitText measures line breaks correctly.
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      fonts.then(run);

      return () => {
        cancelled = true;
        tl?.kill();
        split?.revert();
      };
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-8"
    >
      <header className="flex items-center justify-between">
        <Link href="/" className="inline-flex flex-col" aria-label="Grounded Art home">
          <span className="font-display text-xl leading-none">Grounded Art</span>
          <span className="mt-1.5 h-px w-8 bg-accent" aria-hidden="true" />
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a href="/app/atlas" className="transition hover:text-ink">
            Atlas
          </a>
          <a href="/app/feed" className="transition hover:text-ink">
            Feed
          </a>
          <Link href="/about" className="transition hover:text-ink">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <section className="py-16">
        <p className="hero-kicker mb-6 text-sm uppercase tracking-[0.22em] text-muted">
          Cape Town
        </p>
        <h1 className="hero-headline max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
          A living atlas of local art, galleries, and artists.
        </h1>
        <svg
          className="hero-rule mt-8 w-40 max-w-full text-accent"
          viewBox="0 0 160 2"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 1H160" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="hero-sub mt-8 max-w-xl text-lg text-muted">
          Every gallery, exhibition, and opening in one place, kept current.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/app/atlas"
            className="hero-cta rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-accent"
          >
            Explore the atlas
          </a>
          <a
            href="/app/feed"
            className="hero-cta rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
          >
            See what&apos;s on
          </a>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 text-sm text-muted">
        <span>Made by people in Cape Town.</span>
        <a href="mailto:hello@grounded-art.co.za" className="transition hover:text-ink">
          hello@grounded-art.co.za
        </a>
      </footer>
    </main>
  );
}
