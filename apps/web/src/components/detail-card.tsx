"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { FeedItem, FeedItemType, Gallery } from "@/lib/types";
import { formatDateRange } from "@/lib/format";
import { resolveActionRowContext } from "@/lib/action-row";
import {
  evaluateCheckIn,
  GeolocationError,
  getUserPosition,
} from "@/lib/check-in";
import { galleryKey } from "@/lib/user-actions";
import { useUserActions } from "@/components/user-actions-provider";
import { CheckInCelebration } from "@/components/check-in-celebration";
import {
  CheckInStatus,
  type CheckInStatusVariant,
} from "@/components/check-in-status";

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
}

export function DetailCard({ item, gallery }: DetailCardProps) {
  const actions = resolveActionRowContext(item, gallery);

  return (
    <article className="rounded-sm border border-line bg-paper p-5">
      {item ? <FeedDetailContent item={item} gallery={gallery} /> : null}
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
  const dates = formatDateRange(item.starts_on, item.ends_on);

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted">
        <span className="uppercase tracking-[0.16em]">{TYPE_LABELS[item.type]}</span>
        {dates && (
          <>
            <span aria-hidden="true">·</span>
            <span>{dates}</span>
          </>
        )}
      </div>

      <h1 className="mt-2 font-display text-2xl leading-snug tracking-tight">{item.title}</h1>

      <FeedAttribution item={item} gallery={gallery} />

      {item.image_url && (
        <div className="mt-4 overflow-hidden rounded-sm border border-line bg-line/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt="" className="aspect-square w-full max-w-xs object-cover" />
        </div>
      )}

      {item.body && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{item.body}</p>
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
    return <p className="mt-1 text-sm text-ink">{gallery.name}</p>;
  }
  if (item.creative_name) {
    return (
      <p className="mt-1 text-sm text-ink">
        {item.creative_name}
        {item.location_text && <span className="text-muted">, {item.location_text}</span>}
      </p>
    );
  }
  if (item.location_text) {
    return <p className="mt-1 text-sm text-muted">{item.location_text}</p>;
  }
  return null;
}

function GalleryDetailContent({ gallery }: { gallery: Gallery }) {
  const hours = formatHours(gallery.hours);

  return (
    <>
      <h2 className="font-display text-2xl leading-snug tracking-tight">{gallery.name}</h2>
      {gallery.suburb && <p className="mt-1 text-sm text-muted">{gallery.suburb}</p>}

      <ul className="mt-4 space-y-2 text-sm text-muted">
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

  const [checkingIn, setCheckingIn] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [statusVariant, setStatusVariant] = useState<CheckInStatusVariant | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  const gallerySlug = gallery?.slug ?? actions.mapGallerySlug ?? undefined;
  const galleryName = gallery?.name ?? "this gallery";

  const saved = item
    ? isFeedItemSaved(item.slug, gallerySlug)
    : gallerySlug
      ? isSaved(galleryKey(gallerySlug))
      : false;

  const checkedIn = gallerySlug ? isCheckedIn(gallerySlug) : false;

  async function handleCheckIn() {
    if (!gallery || gallery.latitude == null || gallery.longitude == null) return;

    setCheckingIn(true);
    setStatusVariant(null);
    setStatusMessage(undefined);

    try {
      const position = await getUserPosition();
      const result = evaluateCheckIn(position, gallery);

      if (result.status === "success") {
        markCheckedIn(gallery.slug);
        setCelebrating(true);
      } else if (result.status === "out_of_range") {
        setStatusVariant("out_of_range");
      } else if (result.status === "unavailable") {
        setStatusVariant("unavailable");
        setStatusMessage(result.message);
      }
    } catch (error) {
      if (error instanceof GeolocationError) {
        setStatusVariant(
          error.code === "permission_denied" ? "permission_denied" : "unavailable",
        );
        if (error.code === "unavailable") setStatusMessage(error.message);
      } else {
        setStatusVariant("unavailable");
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

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
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
      </div>

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
          onDismiss={() => setCelebrating(false)}
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
}: {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  const className = `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
    pressed
      ? "border-ink bg-ink/5 text-ink"
      : "border-line text-muted hover:border-ink hover:text-ink"
  } ${disabled ? "opacity-60" : ""}`;

  if (href) {
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
