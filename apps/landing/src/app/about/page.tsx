import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Grounded Art is a curated, human-made atlas of Cape Town art, built on real relationships with the city's galleries and artists.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    title: "Curated by people",
    body: "A person chooses what gets featured. We go to the openings, we know the spaces, and we put our names to what we show you.",
  },
  {
    title: "Grounded in Cape Town",
    body: "This is built for one city and made by people who live in it. The City Bowl, Woodstock, the Atlantic Seaboard, the studios in between.",
  },
  {
    title: "Kept honest and current",
    body: "We refresh often and link back to the galleries and artists themselves, so the credit and the traffic go where they belong.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">About</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.1] sm:text-6xl">
              We are the people who actually go.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              Grounded Art started with a simple frustration. Cape Town makes some of the most
              exciting art anywhere, and finding it meant trawling a dozen Instagram accounts,
              out-of-date listings, and word of mouth. So we built the thing we wished existed.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-line/40">
              <Image
                src="/images/gallery-moody.jpg"
                alt="A quiet gallery hung with paintings in low light."
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-3xl">
              <h2 className="font-display text-3xl leading-snug sm:text-4xl">
                A curated front over a real directory.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Underneath Grounded Art sits a working directory of Cape Town&apos;s galleries.
                On top of it sits a human layer of highlights, the openings and the work we
                think you should not miss. The map shows you where art lives. The feed shows you
                what is happening now. Neither is an afterthought.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                We are not trying to be a social network or a search engine. We are trying to be
                the most reliable, best-looking way to find real art in this city, made by hand
                and kept current.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {VALUES.map((value, i) => (
                <Reveal as="div" key={value.title} delay={i * 0.08}>
                  <span className="block h-px w-10 bg-accent" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-xl">{value.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{value.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <Reveal>
              <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
                Come and find something you love.
              </h2>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/#feed"
                  className="rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition hover:bg-accent"
                >
                  See what is on
                </Link>
                <Link
                  href="/#atlas"
                  className="rounded-full border border-line px-7 py-3 text-sm font-medium text-ink transition hover:border-ink"
                >
                  Explore the atlas
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
