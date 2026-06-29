// Shown while the feed page streams in. Mirrors the carousel frame so the layout does not jump.
export default function FeedLoading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Feed</h1>
      <p className="mt-4 max-w-xl text-muted">
        Recent exhibitions, openings, and gallery posts from across Cape Town, kept current.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-line" />
        ))}
      </div>

      <div className="mt-10 flex h-[28rem] animate-pulse items-center justify-center" aria-hidden="true">
        <div className="h-80 w-56 rounded-card bg-line" />
      </div>
    </main>
  );
}
