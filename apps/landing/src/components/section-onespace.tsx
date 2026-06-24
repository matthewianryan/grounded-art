import { Reveal } from "./reveal";

// Why Grounded Art exists: everything in one place, and kept current. Text-led, no imagery, so
// it reads as a clear statement between the two image-heavy previews.
const POINTS = [
  {
    title: "One place, not fifty tabs",
    body: "Galleries, events, and posts live together here instead of being scattered across separate accounts and feeds. You stop hunting and start looking.",
  },
  {
    title: "Current, not from last year",
    body: "Information and images are refreshed often, so what you see reflects what is open and on now, not a listing that went stale three seasons ago.",
  },
];

export function SectionOneSpace() {
  return (
    <section className="border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="max-w-3xl">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Cape Town&apos;s art scene, finally gathered in one space.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-16">
          {POINTS.map((point, i) => (
            <Reveal as="div" key={point.title} delay={i * 0.1}>
              <span className="block h-px w-10 bg-accent" aria-hidden="true" />
              <h3 className="mt-6 font-display text-2xl">{point.title}</h3>
              <p className="mt-4 leading-relaxed text-paper/70">{point.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
