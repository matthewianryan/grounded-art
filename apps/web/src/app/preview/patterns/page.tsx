import { CircularGalleryShell } from "@/components/circular-gallery-shell";
import { UnmaskRevealShell, WalletPreview } from "@/components/unmask-reveal-shell";

export const metadata = {
  title: "Pattern preview",
  robots: { index: false, follow: false },
};

export default function PatternPreviewPage() {
  return (
    <main className="bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl tracking-tight">Pattern preview</h1>
        <p className="mt-2 text-sm text-muted">
          Phase 0 shells for gate review. The live feed uses the production components at
          /feed.
        </p>

        <section className="mt-16">
          <h2 className="font-display text-xl">Circular gallery shell</h2>
          <p className="mt-2 text-sm text-muted">
            Original isolated shell with placeholder data.
          </p>
          <div className="mt-8">
            <CircularGalleryShell />
          </div>
        </section>

        <section className="mt-24">
          <h2 className="font-display text-xl">Unmask reveal shell</h2>
          <p className="mt-2 text-sm text-muted">
            Original sticky scroll layering shell with placeholder data.
          </p>
          <div className="mt-8">
            <UnmaskRevealShell />
          </div>
        </section>

        <section className="mt-24 border-t border-line pt-16">
          <h2 className="font-display text-xl">Wallet tokens</h2>
          <p className="mt-2 text-sm text-muted">Balance and ledger row styling.</p>
          <div className="mt-8 max-w-sm">
            <WalletPreview />
          </div>
        </section>
      </div>
    </main>
  );
}
