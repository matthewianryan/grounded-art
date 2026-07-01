import Link from "next/link";

export default function FeedItemNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="ga-display-sub">Post not found</h1>
      <p className="ga-body mt-3">
        This feed item may have moved or is no longer available.
      </p>
      <Link href="/feed" className="mt-6 inline-block text-sm text-accent transition hover:text-ink">
        Back to feed
      </Link>
    </main>
  );
}
