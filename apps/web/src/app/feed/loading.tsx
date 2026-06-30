// Shown while the feed page streams in. Mirrors the carousel frame so the layout does not jump.
export default function FeedLoading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="ga-display-section">Feed</h1>
      <p className="ga-body-intro mt-6 max-w-xl">
        Recent exhibitions, openings, and gallery posts from across Cape Town, kept current.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-line" />
        ))}
      </div>

      <div
        className="mt-10 flex min-h-[60svh] animate-pulse items-center justify-center md:min-h-[680px]"
        aria-hidden="true"
      >
        <div className="h-96 w-72 rounded-card bg-line" />
      </div>
    </main>
  );
}
