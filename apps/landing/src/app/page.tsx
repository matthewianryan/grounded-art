export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight">
          Grounded Art
        </span>
        <nav className="flex gap-6 text-sm text-muted">
          <a href="/app/atlas" className="transition hover:text-ink">
            Atlas
          </a>
          <a href="/app/feed" className="transition hover:text-ink">
            Feed
          </a>
          <a href="#about" className="transition hover:text-ink">
            About
          </a>
        </nav>
      </header>

      <section className="py-24">
        <p className="mb-6 text-sm uppercase tracking-[0.2em] text-muted">
          Cape Town
        </p>
        <h1 className="max-w-3xl font-display text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
          A living atlas of local art, galleries, and artists.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted">
          Every gallery, exhibition, and opening in one place, kept current.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/app/atlas"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-accent"
          >
            Explore the atlas
          </a>
          <a
            href="/app/feed"
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
          >
            See what&apos;s on
          </a>
        </div>
      </section>

      <footer className="border-t border-line pt-6 text-sm text-muted">
        Made by people in Cape Town.
      </footer>
    </main>
  );
}
