export default function FeedItemLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="h-4 w-24 animate-pulse rounded bg-line" />
      <div className="mt-8 animate-pulse rounded-sm border border-line p-5">
        <div className="h-3 w-32 rounded bg-line" />
        <div className="mt-4 h-8 w-3/4 rounded bg-line" />
        <div className="mt-2 h-4 w-1/3 rounded bg-line" />
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full rounded bg-line" />
          <div className="h-3 w-5/6 rounded bg-line" />
        </div>
        <div className="mt-6 flex gap-2">
          <div className="h-9 w-20 rounded-full bg-line" />
          <div className="h-9 w-28 rounded-full bg-line" />
        </div>
      </div>
    </main>
  );
}
