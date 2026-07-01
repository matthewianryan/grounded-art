import Link from "next/link";
import { notFound } from "next/navigation";
import { getGallery } from "@/lib/api";
import { GalleryProfileView } from "@/components/gallery-profile-view";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let gallery;
  try {
    gallery = await getGallery(slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap gap-3">
        <Link href="/feed" className="text-sm text-muted transition hover:text-ink">
          Back to feed
        </Link>
        {gallery.latitude != null && gallery.longitude != null ? (
          <Link
            href={`/map?gallery=${encodeURIComponent(gallery.slug)}`}
            className="text-sm text-muted transition hover:text-ink"
          >
            View on map
          </Link>
        ) : null}
      </div>

      <div className="mt-8">
        <GalleryProfileView gallery={gallery} />
      </div>
    </main>
  );
}
