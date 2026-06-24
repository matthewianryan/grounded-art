import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";

// A teaser for the about page: curated and human-made, grounded in Cape Town.
export function SectionHumanLocal() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Human and local</p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            Made by people, not an algorithm.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Grounded Art is put together by hand, by people who go to the openings and know the
            spaces. It is built on real relationships with Cape Town galleries and artists, not
            scraped and forgotten.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink transition hover:text-accent"
          >
            Read our story
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-line/40">
            <Image
              src="/images/human-breest.jpg"
              alt="A Love Thy Neighbour wall on Bree Street, Cape Town."
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
