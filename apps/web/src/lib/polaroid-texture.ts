import type { FeedCarouselItem } from "@/lib/feed-display";
import { feedGalleryImageUrl } from "@/lib/feed-display";
import type { GalleryItem } from "@/components/ui/circular-gallery-2";

const CACHE = new Map<string, string>();

const CANVAS_W = 800;
const CANVAS_H = 1000;

function cacheKey(imageUrl: string | null, label: string, dark: boolean): string {
  return `${dark ? "d" : "l"}|${imageUrl ?? ""}|${label}`;
}

function placeholderColor(dark: boolean): string {
  return dark ? "#968a75" : "#968a75";
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Frameless 4:5 portrait texture for the WebGL carousel: image cover-cropped edge to edge. */
export async function buildGalleryTextureUrl(
  imageUrl: string | null,
  label: string,
  dark: boolean,
): Promise<string> {
  const key = cacheKey(imageUrl, label, dark);
  const cached = CACHE.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return feedGalleryImageUrl(imageUrl, label);

  const sourceUrl = feedGalleryImageUrl(imageUrl, label);
  const img = await loadImage(sourceUrl);

  if (img) {
    const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (CANVAS_W - dw) / 2;
    const dy = (CANVAS_H - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = dark ? "#2a2419" : "#e4dbc9";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = placeholderColor(dark);
    ctx.font = "22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = label.slice(0, 40);
    ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2);
  }

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  CACHE.set(key, dataUrl);
  return dataUrl;
}

export async function buildFeedGalleryItems(
  items: FeedCarouselItem[],
  dark: boolean,
): Promise<GalleryItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      image: await buildGalleryTextureUrl(item.imageUrl, item.displayName, dark),
      text: item.displayName,
    })),
  );
}

export function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}
