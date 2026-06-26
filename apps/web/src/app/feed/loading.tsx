// Shown while the feed page streams in. Mirrors the page frame so the layout does not jump.
export default function FeedLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Feed</h1>
      <p className="mt-4 max-w-xl text-muted">
        Recent exhibitions, openings, and gallery posts from across Cape Town, kept current.
      </p>

      <div className="mt-10 animate-pulse space-y-6" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-t border-line py-6 first:border-t-0 first:pt-0">
            <div className="h-3 w-32 rounded bg-line" />
            <div className="mt-3 h-6 w-3/4 rounded bg-line" />
            <div className="mt-3 h-3 w-40 rounded bg-line" />
          </div>
        ))}
      </div>
    </main>
  );
}
