import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";

// Galleries dotted across the preview, evoking the atlas without standing in for the real map,
// which arrives with the web app.
const NODES = [
  { top: "32%", left: "22%", label: "Bo-Kaap" },
  { top: "54%", left: "44%", label: "City Bowl" },
  { top: "44%", left: "68%", label: "Woodstock" },
  { top: "70%", left: "30%", label: "Sea Point" },
];

export function SectionAtlas() {
  return (
    <section id="atlas" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">The atlas</p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            See where art lives across the city.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            One map of Cape Town&apos;s galleries, from the City Bowl to Woodstock and the
            Atlantic Seaboard. Find the spaces near you, see what is showing, and plan a day
            of it.
          </p>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Only real, physical galleries become points on the map, so it stays a map you can
            actually walk.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
          >
            Add or update a gallery
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-line/40">
            <Image
              src="/images/atlas-bokaap.jpg"
              alt="Cape Town rooftops below Table Mountain."
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/10" />
            {NODES.map((node) => (
              <div
                key={node.label}
                className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                style={{ top: node.top, left: node.left }}
              >
                <span className="rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm">
                  {node.label}
                </span>
                <span className="mt-1 h-3 w-3 rounded-full border-2 border-paper bg-accent shadow" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
