/** Shared carousel dimensions so the stage, hit target, and expanded overlay stay aligned. */

export const FEED_CAROUSEL_STAGE_CLASS =
  "h-[60svh] min-h-0 md:h-[min(82svh,840px)] md:min-h-[680px]";

export const FEED_CAROUSEL_CARD_CLASS =
  "w-[min(78vw,22rem)] md:w-[clamp(18rem,34vw,28rem)]";

export const FEED_CAROUSEL_HIT_CLASS =
  "h-[min(52svh,560px)] w-[min(78vw,22rem)] md:h-[min(68vh,660px)] md:w-[clamp(18rem,34vw,28rem)]";

/** Half of the mobile card width is min(39vw, 11rem); desktop stays half of 18rem. */
export const FEED_CAROUSEL_SNAP_PADDING_CLASS =
  "px-[max(0.75rem,calc(50%-min(39vw,11rem)))] md:px-[max(1rem,calc(50%-9rem))]";

export const FEED_CAROUSEL_MD_BREAKPOINT = 768;

export function feedCarouselPlaneFactors(viewportWidth: number) {
  if (viewportWidth >= FEED_CAROUSEL_MD_BREAKPOINT) {
    return { height: 1100, width: 585 };
  }

  const t = Math.min(1, Math.max(0, viewportWidth / FEED_CAROUSEL_MD_BREAKPOINT));
  return {
    height: Math.round(680 + (1100 - 680) * t),
    width: Math.round(360 + (585 - 360) * t),
  };
}
