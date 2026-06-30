"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FeedItem, FeedItemType, Gallery } from "@/lib/types";
import { formatDateRange } from "@/lib/format";
import {
  feedCarouselImage,
  feedDisplayName,
  postBadges,
  toFeedGalleryContext,
} from "@/lib/feed-display";
import { resolveActionRowContext } from "@/lib/action-row";
import { currentReturnTo, signInHref } from "@/lib/auth-gate";
import {
  evaluateCheckIn,
  GeolocationError,
  getUserPosition,
} from "@/lib/check-in";
import { galleryDirectionsUrl } from "@/lib/maps";
import { requestCheckInChallenge, submitCheckIn } from "@/lib/api-client";
import { galleryKey } from "@/lib/user-actions";
import { useAuth } from "@/components/auth-provider";
import { useUserActions } from "@/components/user-actions-provider";
import { CheckInCelebration } from "@/components/check-in-celebration";
import {
  CheckInStatus,
  type CheckInStatusVariant,
} from "@/components/check-in-status";
import { PostBadges } from "@/components/post-badges";
import { FeedPostImage } from "@/components/feed-post-card";

const TYPE_LABELS: Record<FeedItemType, string> = {
  exhibition: "Exhibition",
  opening: "Opening",
  event: "Event",
  post: "Post",
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export interface DetailCardProps {
  item?: FeedItem;
  gallery?: Gallery;
  variant?: "default" | "feed";
}

export function DetailCard({ item, gallery, variant = "default" }: DetailCardProps) {
  const actions = resolveActionRowContext(item, gallery);
  const isFeed = variant === "feed" && item;

  return (
    <article
      className={`${isFeed ? "rounded-card border border-line bg-card-bg p-5 shadow-card" : "rounded-sm border border-line bg-paper p-5"}`}
    >
      {item ? (
        isFeed ? (
          <FeedDetailContent item={item} gallery={gallery} />
        ) : (
          <LegacyFeedDetailContent item={item} gallery={gallery} />
        )
      ) : null}
      {gallery && !item ? <GalleryDetailContent gallery={gallery} /> : null}

      <ActionRow item={item} gallery={gallery} actions={actions} />
    </article>
  );
}

function FeedDetailContent({
  item,
  gallery,
}: {
  item: FeedItem;
  gallery: Gallery | undefined;
}) {
  const galleryContext = gallery ? toFeedGalleryContext(gallery) : undefined;
  const displayName = feedDisplayName(item);
  const badges = postBadges(item, galleryContext);
  const imageUrl = feedCarouselImage(item, galleryContext);
  const dates = formatDateRange(item.starts_on, item.ends_on);

  return (
    <>
      <div className="overflow-hidden rounded-card">
        <FeedPostImage
          imageUrl={imageUrl}
          displayName={displayName}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      <div className="ga-meta mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span>{TYPE_LABELS[item.type]}</span>
        {dates && (
          <>
            <span aria-hidden="true">·</span>
            <span>{dates}</span>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="ga-display-card">{displayName}</h1>
        <PostBadges badges={badges} />
      </div>

      {gallery && <p className="ga-body mt-2">{gallery.name}</p>}

      {item.body && (
        <p className="ga-body-intro mt-4 max-w-2xl">{item.body}</p>
      )}
    </>
  );
}

function LegacyFeedDetailContent({
  item,
  gallery,
}: {
  item: FeedItem;
  gallery: Gallery | undefined;
}) {
  const dates = formatDateRange(item.starts_on, item.ends_on);

  return (
    <>
      <div className="ga-meta flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span>{TYPE_LABELS[item.type]}</span>
        {dates && (
          <>
            <span aria-hidden="true">·</span>
            <span>{dates}</span>
          </>
        )}
      </div>

      <h1 className="ga-display-card mt-2">{item.title}</h1>

      <FeedAttribution item={item} gallery={gallery} />

      {item.image_url && (
        <div className="mt-4 overflow-hidden rounded-sm border border-line bg-line/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt="" className="aspect-square w-full max-w-xs object-cover" />
        </div>
      )}

      {item.body && (
        <p className="ga-body-intro mt-3 max-w-2xl">{item.body}</p>
      )}
    </>
  );
}

function FeedAttribution({
  item,
  gallery,
}: {
  item: FeedItem;
  gallery: Gallery | undefined;
}) {
  if (gallery) {
    return <p className="ga-body mt-1 text-ink">{gallery.name}</p>;
  }
  if (item.creative_name) {
    return (
      <p className="ga-body mt-1 text-ink">
        {item.creative_name}
        {item.location_text && <span className="text-muted">, {item.location_text}</span>}
      </p>
    );
  }
  if (item.location_text) {
    return <p className="ga-body mt-1">{item.location_text}</p>;
  }
  return null;
}

function GalleryDetailContent({ gallery }: { gallery: Gallery }) {
  const hours = formatHours(gallery.hours);

  return (
    <>
      <h2 className="ga-display-card">{gallery.name}</h2>
      {gallery.suburb && <p className="ga-body mt-1">{gallery.suburb}</p>}

      <ul className="ga-body mt-4 space-y-2">
        {gallery.formatted_address && (
          <li className="flex gap-2">
            <PinIcon />
            <span>{gallery.formatted_address}</span>
          </li>
        )}
        {hours && (
          <li className="flex gap-2">
            <ClockIcon />
            <span>{hours}</span>
          </li>
        )}
        {gallery.website_url && (
          <li className="flex gap-2">
            <GlobeIcon />
            <a
              href={gallery.website_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent transition hover:text-ink"
            >
              {formatWebsiteHost(gallery.website_url)}
            </a>
          </li>
        )}
      </ul>
    </>
  );
}

function ActionRow({
  item,
  gallery,
  actions,
}: {
  item: FeedItem | undefined;
  gallery: Gallery | undefined;
  actions: ReturnType<typeof resolveActionRowContext>;
}) {
  const {
    isSaved,
    isFeedItemSaved,
    toggleSaveFeedItem,
    toggleSaveGallery,
    isCheckedIn,
    markCheckedIn,
  } = useUserActions();
  const { isSignedIn, ready: authReady } = useAuth();

  const [checkingIn, setCheckingIn] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationBalance, setCelebrationBalance] = useState<number | undefined>();
  const [statusVariant, setStatusVariant] = useState<CheckInStatusVariant | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const challengeTokenRef = useRef<string | null>(null);

  const gallerySlug = gallery?.slug ?? actions.mapGallerySlug ?? undefined;
  const galleryName = gallery?.name ?? "this gallery";

  useEffect(() => {
    if (!authReady || !isSignedIn || !gallerySlug) {
      challengeTokenRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const challenge = await requestCheckInChallenge(gallerySlug);
        if (!cancelled) {
          challengeTokenRef.current = challenge.challenge_token;
        }
      } catch {
        if (!cancelled) {
          challengeTokenRef.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, isSignedIn, gallerySlug]);

  const saved = item
    ? isFeedItemSaved(item.slug, gallerySlug)
    : gallerySlug
      ? isSaved(galleryKey(gallerySlug))
      : false;

  const checkedIn = gallerySlug ? isCheckedIn(gallerySlug) : false;
  const directionsUrl = gallery && actions.directions ? galleryDirectionsUrl(gallery) : null;

  async function handleCheckIn() {
    if (!gallery || gallery.latitude == null || gallery.longitude == null) return;

    if (!authReady || !isSignedIn) {
      const returnTo = gallerySlug
        ? `/app/map?gallery=${encodeURIComponent(gallerySlug)}`
        : currentReturnTo();
      window.location.assign(signInHref(returnTo));
      return;
    }

    setCheckingIn(true);
    setStatusVariant(null);
    setStatusMessage(undefined);

    try {
      const position = await getUserPosition();
      const clientResult = evaluateCheckIn(position, gallery);

      if (clientResult.status === "out_of_range") {
        setStatusVariant("out_of_range");
        return;
      }

      if (clientResult.status === "unavailable") {
        setStatusVariant("unavailable");
        setStatusMessage(clientResult.message);
        return;
      }

      let challengeToken = challengeTokenRef.current;
      if (!challengeToken) {
        try {
          const challenge = await requestCheckInChallenge(gallery.slug);
          challengeToken = challenge.challenge_token;
          challengeTokenRef.current = challengeToken;
        } catch {
          setStatusVariant("unavailable");
          setStatusMessage("Could not start check-in. Try again in a moment.");
          return;
        }
      }

      const result = await submitCheckIn({
        gallery_slug: gallery.slug,
        latitude: position.lat,
        longitude: position.lng,
        challenge_token: challengeToken,
      });

      markCheckedIn(gallery.slug);
      challengeTokenRef.current = null;

      if (result.verified && result.point_awarded) {
        setCelebrationBalance(result.balance);
        setCelebrating(true);
      } else if (result.verified && result.already_earned_today) {
        setStatusVariant("already_earned_today");
      } else if (!result.verified) {
        setStatusVariant("verification_failed");
      }
    } catch (error) {
      if (error instanceof GeolocationError) {
        setStatusVariant(
          error.code === "permission_denied" ? "permission_denied" : "unavailable",
        );
        if (error.code === "unavailable") setStatusMessage(error.message);
      } else {
        setStatusVariant("unavailable");
        setStatusMessage("Could not complete check-in. Try again in a moment.");
      }
    } finally {
      setCheckingIn(false);
    }
  }

  function handleSave() {
    if (item) {
      toggleSaveFeedItem(item.slug, gallerySlug);
    } else if (gallerySlug) {
      toggleSaveGallery(gallerySlug);
    }
  }

  async function handleShare() {
    if (typeof window === "undefined") return;

    setShareMessage(null);

    const url =
      !item && gallerySlug
        ? `${window.location.origin}/app/map?gallery=${encodeURIComponent(gallerySlug)}`
        : window.location.href;
    const title = item?.title ?? gallery?.name ?? "Grounded Art";

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied.");
    } catch {
      setShareMessage("Could not copy the link.");
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {!item && directionsUrl && (
          <ActionPill
            label="Directions"
            icon={<DirectionsIcon />}
            href={directionsUrl}
            external
          />
        )}

        <ActionPill
          label={saved ? "Saved" : "Save"}
          icon={saved ? undefined : <BookmarkIcon />}
          onClick={handleSave}
          pressed={saved}
        />

        {actions.goToArtist && actions.artistUrl && (
          <ActionPill
            label="Go to artist"
            icon={item?.creative_name ? <PersonIcon /> : <ExternalLinkIcon />}
            href={actions.artistUrl}
          />
        )}

        {actions.viewOnMap && actions.mapGallerySlug && (
          <ActionPill
            label="View on map"
            icon={<PinIcon />}
            href={`/map?gallery=${encodeURIComponent(actions.mapGallerySlug)}`}
          />
        )}

        {actions.checkIn && gallery && (
          <ActionPill
            label={checkedIn ? "Checked in" : "Check in"}
            icon={checkedIn ? undefined : <TargetIcon />}
            onClick={checkedIn ? undefined : handleCheckIn}
            disabled={checkingIn || checkedIn}
            pressed={checkedIn}
          />
        )}

        {actions.share && (
          <ActionPill
            label="Share"
            icon={<ShareIcon />}
            onClick={handleShare}
          />
        )}
      </div>

      {shareMessage && (
        <p className="mt-3 text-sm text-muted" role="status">
          {shareMessage}
        </p>
      )}

      {statusVariant && (
        <CheckInStatus
          variant={statusVariant}
          message={statusMessage}
          onDismiss={() => setStatusVariant(null)}
        />
      )}

      {celebrating && (
        <CheckInCelebration
          galleryName={galleryName}
          balance={celebrationBalance}
          pointAwarded={celebrationBalance !== undefined}
          onDismiss={() => {
            setCelebrating(false);
            setCelebrationBalance(undefined);
          }}
        />
      )}
    </>
  );
}

function ActionPill({
  label,
  icon,
  href,
  onClick,
  disabled,
  pressed,
  external,
}: {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  external?: boolean;
}) {
  const className = `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
    pressed
      ? "border-ink bg-ink/5 text-ink"
      : "border-line text-muted hover:border-ink hover:text-ink"
  } ${disabled ? "opacity-60" : ""}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
          {icon}
          {label}
        </a>
      );
    }

    return (
      <Link href={href} className={className}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {icon}
      {label}
    </button>
  );
}

function formatHours(hours: Gallery["hours"]): string | null {
  if (!hours) return null;
  const parts = DAY_ORDER.filter((d) => hours[d]).map((d) => `${DAY_LABELS[d]} ${hours[d]}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatWebsiteHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 4h6v6M10 14L20 4M18 14v6H4V6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l9 9-9 9-9-9 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13h4a2 2 0 002-2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 8l2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.6 10.6l6.8-4.2M8.6 13.4l6.8 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12h16M12 4c2.5 2.7 2.5 14.3 0 16M12 4c-2.5 2.7-2.5 14.3 0 16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
