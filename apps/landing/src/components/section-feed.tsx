import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";

// A snapshot of the feed: recent openings, exhibitions, and posts. The copy is illustrative of
// the kind of content the feed gathers, kept restrained so the work leads.
const ITEMS = [
  {
    src: "/images/feed-bold.jpg",
    alt: "A bold graphic mural in orange and blue.",
    tag: "Opening",
    title: "New Work, New Voices",
    place: "Salon Ninety One, Kloof Street",
    when: "This Thursday",
  },
  {
    src: "/images/feed-prints.jpg",
    alt: "A vaulted gallery hung with colourful prints.",
    tag: "Exhibition",
    title: "On Paper",
    place: "SMITH, Buitenkant Street",
    when: "Until 12 July",
  },
  {
    src: "/images/feed-portrait.jpg",
    alt: "A portrait of a woman framed by trailing ivy.",
    tag: "Post",
    title: "In the studio with a new face",
    place: "Woodstock",
    when: "2 days ago",
  },
  {
    src: "/images/feed-mono.jpg",
    alt: "A textured black and white abstract painting.",
    tag: "Exhibition",
    title: "Quiet Ground",
    place: "Goodman Gallery, Sir Lowry Road",
    when: "Opens Saturday",
  },
];

export function SectionFeed() {
  return (
    <section id="feed" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="max-w-2xl">
          <p className="ga-kicker">The feed</p>
          <h2 className="ga-display-section mt-5">
            What is happening, right now.
          </h2>
          <p className="ga-body-intro mt-6">
            Openings, exhibitions, and posts from across Cape Town, gathered into one place and
            refreshed often, so what you see is what is on this week.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
          >
            Send us an opening
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <Reveal as="div" key={item.title} delay={i * 0.06}>
              <article className="group">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-line/40">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="ga-meta mt-4 text-accent">
                  {item.tag}
                </p>
                <h3 className="ga-display-card mt-2">{item.title}</h3>
                <p className="ga-body mt-1">{item.place}</p>
                <p className="ga-body mt-0.5">{item.when}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
