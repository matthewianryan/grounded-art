import { listGalleries } from "@/lib/api";
import { GalleryMap } from "@/components/gallery-map";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ gallery?: string }>;
}) {
  const params = await searchParams;
  const initialGallerySlug = params.gallery;

  let galleries;
  try {
    const page = await listGalleries({ limit: 200 });
    galleries = page.items;
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-4xl tracking-tight">Map</h1>
        <p className="mt-4 text-sm text-muted">
          The gallery map could not be loaded right now. Please try again shortly.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl tracking-tight">Map</h1>
      <p className="mt-4 max-w-xl text-muted">
        Cape Town galleries on a clean map. Select a node to see details and check in when
        you are there.
      </p>

      <div className="mt-10">
        <GalleryMap galleries={galleries} initialGallerySlug={initialGallerySlug} />
      </div>
    </main>
  );
}
