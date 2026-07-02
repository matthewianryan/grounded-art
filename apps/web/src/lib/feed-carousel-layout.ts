/** Shared carousel dimensions so the stage, hit target, and expanded overlay stay aligned. */

export const FEED_CAROUSEL_STAGE_CLASS =
  "h-[60svh] min-h-0 md:h-[min(82svh,840px)] md:min-h-[680px]";

/** Fills the feed viewport shell below the search toolbar in browse mode. */
export const FEED_CAROUSEL_STAGE_FILL_CLASS = "h-full min-h-0";

export const FEED_CAROUSEL_CARD_CLASS =
  "w-[min(78vw,22rem)] md:w-[clamp(18rem,34vw,28rem)]";

export const FEED_CAROUSEL_HIT_CLASS =
  "h-[min(52svh,560px)] w-[min(78vw,22rem)] md:h-[min(68vh,660px)] md:w-[clamp(18rem,34vw,28rem)]";

/** Half of the mobile card width is min(39vw, 11rem); desktop stays half of 18rem. */
export const FEED_CAROUSEL_SNAP_PADDING_CLASS =
  "px-[max(0.75rem,calc(50%-min(39vw,11rem)))] md:px-[max(1rem,calc(50%-9rem))]";

/**
 * Mobile flat-carousel card dimensions: proportioned off the desktop fan's own card size (see
 * feedCarouselHitStyle's desktop branch, clamp(18rem,34vw,28rem) / min(68vh,660px)), scaled down
 * ~10% so the card reads as dominant without feeling oversized on a phone.
 */
export const FEED_CAROUSEL_MOBILE_CARD_WIDTH_CLASS = "w-[clamp(16rem,30vw,25rem)]";
export const FEED_CAROUSEL_MOBILE_CARD_HEIGHT_CLASS = "h-[min(61vh,594px)]";
/** Half of the mobile card's width floor (16rem), so peeks stay proportionate to the card. */
export const FEED_CAROUSEL_MOBILE_CARD_PADDING_CLASS = "px-[max(1rem,calc(50%-8rem))]";

/** Mobile flat-carousel track height: card height above plus a little breathing room. */
export const FEED_CAROUSEL_MOBILE_CARD_STAGE_CLASS = "h-[min(63vh,610px)] min-h-0";

/**
 * Generous rounding to visually match desktop's WebGL rounded-box shader (uBorderRadius: 0.05
 * in circular-gallery-2.tsx), which has no direct CSS-px equivalent since it's computed in the
 * plane's normalized UV space — this is the closest clean Tailwind step to that look.
 */
export const FEED_CAROUSEL_MOBILE_CARD_RADIUS_CLASS = "rounded-3xl";

export const FEED_CAROUSEL_MD_BREAKPOINT = 768;

const DESKTOP_PLANE_PROFILE = { height: 1100, width: 585 };
const DESKTOP_CARD_OFFSET_X = 200;
const DESKTOP_ARC_LIFT = 14;
const DESKTOP_HIT_HEIGHT_PX = 660;
const DESKTOP_HIT_WIDTH_MAX_PX = 448;

/** Mobile cards scale from the desktop profile; this lifts them to use more of the feed stage. */
const MOBILE_CAROUSEL_SCALE_BOOST = 2;

export function feedCarouselViewportScale(viewportWidth: number): number {
  if (viewportWidth >= FEED_CAROUSEL_MD_BREAKPOINT) return 1;
  const base = viewportWidth / FEED_CAROUSEL_MD_BREAKPOINT;
  return Math.min(1, base * MOBILE_CAROUSEL_SCALE_BOOST);
}

export function feedCarouselPlaneFactors(viewportWidth: number) {
  const scale = feedCarouselViewportScale(viewportWidth);
  return {
    height: Math.round(DESKTOP_PLANE_PROFILE.height * scale),
    width: Math.round(DESKTOP_PLANE_PROFILE.width * scale),
  };
}

export function feedCarouselCardOffsetX(viewportWidth: number): number {
  return Math.round(DESKTOP_CARD_OFFSET_X * feedCarouselViewportScale(viewportWidth));
}

export function feedCarouselArcLift(viewportWidth: number): number {
  return DESKTOP_ARC_LIFT * feedCarouselViewportScale(viewportWidth);
}

export function feedCarouselHitStyle(viewportWidth: number): {
  width: string;
  height: string;
} {
  if (viewportWidth >= FEED_CAROUSEL_MD_BREAKPOINT) {
    return {
      width: "clamp(18rem, 34vw, 28rem)",
      height: "min(68vh, 660px)",
    };
  }

  const scale = feedCarouselViewportScale(viewportWidth);
  const heightPx = Math.round(DESKTOP_HIT_HEIGHT_PX * scale);
  const widthPx = Math.round(
    Math.min(DESKTOP_HIT_WIDTH_MAX_PX * scale, viewportWidth * 0.78),
  );

  return {
    width: `${widthPx}px`,
    height: `${heightPx}px`,
  };
}
