import Link from "next/link";

export default function GalleryNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="ga-display-sub">Gallery not found</h1>
      <p className="ga-body mt-3">
        This gallery may have moved, opted out, or is no longer available.
      </p>
      <Link href="/map" className="mt-6 inline-block text-sm text-accent transition hover:text-ink">
        Back to map
      </Link>
    </main>
  );
}
