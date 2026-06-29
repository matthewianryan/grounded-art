import { CarouselShell } from "@/components/shells/carousel-shell";
import { UnmaskShell } from "@/components/shells/unmask-shell";
import {
  PlaceholderActionRow,
  PlaceholderBadge,
  PlaceholderPostCard,
  PlaceholderWalletSummary,
} from "@/components/shells/shell-placeholders";

export const metadata = {
  title: "Shells | Grounded Art",
  description: "Phase 0 interaction shells for the v2 redesign.",
};

export default function ShellsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Phase 0 shells</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Isolated Grounded Art shells for the feed carousel and the swipe-up reveal. Placeholder
        content only, re-skinned to shared tokens.
      </p>

      <section className="mt-16" aria-labelledby="token-preview-heading">
        <h2 id="token-preview-heading" className="font-display text-2xl tracking-tight">
          Token preview
        </h2>
        <p className="mt-2 text-sm text-muted">
          Semantic tokens for the new surfaces: card, badge, action row, and wallet.
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <PlaceholderPostCard artist="Lerato Mokoena" label="Art post" />
          <PlaceholderWalletSummary />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PlaceholderBadge>Brand</PlaceholderBadge>
          <PlaceholderBadge>Pin</PlaceholderBadge>
          <PlaceholderActionRow />
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-16" aria-labelledby="carousel-heading">
        <h2 id="carousel-heading" className="font-display text-2xl tracking-tight">
          Carousel shell
        </h2>
        <p className="mt-2 text-sm text-muted">
          Drag-driven browse with the centre item active. Reduced motion falls back to horizontal
          scroll-snap.
        </p>
        <div className="mt-8">
          <CarouselShell labelledBy="carousel-heading" />
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-16" aria-labelledby="unmask-heading">
        <h2 id="unmask-heading" className="font-display text-2xl tracking-tight">
          Unmask shell
        </h2>
        <p className="mt-2 text-sm text-muted">
          Sticky mask with the detail beneath. Touch locks to the dominant axis so the carousel
          and the reveal do not fight.
        </p>
        <div className="mt-8">
          <UnmaskShell />
        </div>
      </section>
    </main>
  );
}
