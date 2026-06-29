import type { PostBadgeInfo } from "@/lib/feed-display";
import { PostBadges } from "@/components/post-badges";

export function FeedPostImage({
  imageUrl,
  displayName,
  className = "aspect-[3/4] w-full object-cover",
}: {
  imageUrl: string | null;
  displayName: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={className} loading="lazy" draggable={false} />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-line/30 ${className}`}
      aria-hidden="true"
    >
      <span className="px-4 text-center font-display text-sm text-muted">{displayName}</span>
    </div>
  );
}

export function FeedPostCard({
  imageUrl,
  displayName,
  badges,
  compact = false,
}: {
  imageUrl: string | null;
  displayName: string;
  badges: PostBadgeInfo;
  compact?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-card border border-line bg-card-bg shadow-card">
      <FeedPostImage
        imageUrl={imageUrl}
        displayName={displayName}
        className={compact ? "aspect-[4/5] w-full object-cover" : "aspect-[3/4] w-full object-cover"}
      />
      <div className="border-t border-line p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-display text-ink ${compact ? "text-lg" : "text-sm"}`}>
            {displayName}
          </p>
          <PostBadges badges={badges} />
        </div>
      </div>
    </article>
  );
}
