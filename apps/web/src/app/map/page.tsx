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
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center px-6">
        <p className="text-sm text-muted">
          The gallery map could not be loaded right now. Please try again shortly.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] overflow-hidden">
      <GalleryMap galleries={galleries} initialGallerySlug={initialGallerySlug} />
    </main>
  );
}
