/** Shared carousel dimensions so the stage, hit target, and expanded overlay stay aligned. */

export const FEED_CAROUSEL_STAGE_CLASS = "h-[min(82svh,840px)] min-h-[680px]";

export const FEED_CAROUSEL_CARD_CLASS = "w-[clamp(18rem,34vw,28rem)]";

export const FEED_CAROUSEL_HIT_CLASS =
  "h-[min(68vh,660px)] w-[clamp(18rem,34vw,28rem)]";

/** Half of the minimum card width (18rem / 2 = 9rem) for scroll-snap centre padding. */
export const FEED_CAROUSEL_SNAP_PADDING_CLASS = "px-[max(1rem,calc(50%-9rem))]";

export const FEED_CAROUSEL_PLANE_HEIGHT_FACTOR = 1100;
export const FEED_CAROUSEL_PLANE_WIDTH_FACTOR = 585;
