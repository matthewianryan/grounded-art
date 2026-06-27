import { notFound } from "next/navigation";
import Link from "next/link";
import { getFeedItem, listGalleries } from "@/lib/api";
import type { Gallery } from "@/lib/types";
import { DetailCard } from "@/components/detail-card";

export default async function FeedItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let item;
  try {
    item = await getFeedItem(slug);
  } catch {
    notFound();
  }

  let gallery: Gallery | undefined;
  if (item.gallery_id) {
    const galleries = await listGalleries({ limit: 200 });
    gallery = galleries.items.find((g) => g.id === item.gallery_id);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/feed"
        className="text-sm text-muted transition hover:text-ink"
      >
        Back to feed
      </Link>

      <div className="mt-8">
        <DetailCard item={item} gallery={gallery} />
      </div>
    </main>
  );
}
