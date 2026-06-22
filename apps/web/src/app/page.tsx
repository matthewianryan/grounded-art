import Link from "next/link";

export default function AppHome() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Grounded Art
      </h1>
      <p className="mt-4 text-muted">The web app.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/map"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-accent"
        >
          Map
        </Link>
        <Link
          href="/feed"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
        >
          Feed
        </Link>
      </div>
    </main>
  );
}
