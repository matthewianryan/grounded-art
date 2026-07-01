import type { FeedDisplayImage } from "@/lib/feed-display";

interface PostImageMasonryProps {
  images: FeedDisplayImage[];
  alt: string;
}

/**
 * Full-dimension post images, never cropped. A single image renders at its true aspect ratio.
 * Multiple images flow into a responsive CSS multi-column masonry that preserves each aspect
 * ratio and adjusts columns to the viewport. Dimensions reserve an aspect box to avoid layout
 * shift; images without dimensions fall back to natural size inside a min-height placeholder.
 */
export function PostImageMasonry({ images, alt }: PostImageMasonryProps) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <figure className="overflow-hidden rounded-card border border-line bg-line/20">
        <PostImage image={images[0]} alt={alt} />
        {images[0].attribution && <Attribution text={images[0].attribution} />}
      </figure>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {images.map((image, index) => (
        <figure
          key={image.url}
          className="break-inside-avoid overflow-hidden rounded-card border border-line bg-line/20"
        >
          <PostImage image={image} alt={`${alt} image ${index + 1}`} />
          {image.attribution && <Attribution text={image.attribution} />}
        </figure>
      ))}
    </div>
  );
}

function PostImage({ image, alt }: { image: FeedDisplayImage; alt: string }) {
  const hasDimensions = image.width != null && image.height != null && image.height > 0;

  if (hasDimensions) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.url}
        alt={alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        className="h-auto w-full"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        loading="lazy"
      />
    );
  }

  // No dimensions: load at natural size inside a min-height placeholder so there is no hard jump.
  return (
    <div className="min-h-48">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={alt} className="h-auto w-full" loading="lazy" />
    </div>
  );
}

function Attribution({ text }: { text: string }) {
  return (
    <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">{text}</figcaption>
  );
}
