import { Reveal } from "./reveal";
import { feedHref } from "@/lib/app-url";

// Closing call to action: invites people back into the atlas and the feed.
export function SectionClosing() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Go and see what the city is making.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={feedHref()}
              className="rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition hover:bg-accent"
            >
              Open the feed
            </a>
            <a
              href="/about"
              className="rounded-full border border-line px-7 py-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              About Grounded Art
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
