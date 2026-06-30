"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, SplitText, DrawSVGPlugin);

// The featured works that cross-dissolve in the hero frame. Slow and intentional, never
// competing with the work itself.
const FEATURED = [
  { src: "/images/featured-musicians.jpg", alt: "A bold, colourful painting of musicians and figures." },
  { src: "/images/gallery-moody.jpg", alt: "A quiet gallery hung with paintings in low light." },
  { src: "/images/feed-portrait.jpg", alt: "A portrait of a woman framed by trailing ivy." },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Cross-dissolve between featured works, paused for reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % FEATURED.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Hide the animated parts up front so there is no flash before the timeline runs.
      gsap.set(".hero-headline", { autoAlpha: 0 });
      gsap.set([".hero-kicker", ".hero-sub", ".hero-cta"], { autoAlpha: 0, y: 12 });
      gsap.set(".hero-frame", { autoAlpha: 0, scale: 1.03 });
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
          .to(".hero-frame", { autoAlpha: 1, scale: 1, duration: 1.2 }, "-=0.9")
          .to(".hero-rule path", { drawSVG: "100%", duration: 0.9 }, "-=0.7")
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
    <section
      ref={root}
      className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24"
    >
      <div>
        <p className="hero-kicker mb-6 text-sm uppercase tracking-[0.22em] text-muted">
          Cape Town
        </p>
        <h1 className="hero-headline font-display text-5xl leading-[1.1] sm:text-6xl lg:text-7xl">
          Where the city&apos;s art lives.
        </h1>
        <svg
          className="hero-rule mt-7 w-40 max-w-full text-accent"
          viewBox="0 0 160 2"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 1H160" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="hero-sub mt-7 max-w-md text-lg leading-relaxed text-muted">
          Every gallery, exhibition, and opening in one place, kept current.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#feed"
            className="hero-cta rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-accent"
          >
            See what is on
          </a>
          <a
            href="#atlas"
            className="hero-cta rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
          >
            Explore the atlas
          </a>
        </div>
      </div>

      <div className="hero-frame relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-line/40">
        {FEATURED.map((work, i) => (
          <Image
            key={work.src}
            src={work.src}
            alt={work.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
      </div>
    </section>
  );
}
