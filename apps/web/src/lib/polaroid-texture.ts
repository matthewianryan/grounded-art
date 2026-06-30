import type { FeedCarouselItem } from "@/lib/feed-display";
import { feedGalleryImageUrl } from "@/lib/feed-display";
import type { GalleryItem } from "@/components/ui/circular-gallery-2";

const CACHE = new Map<string, string>();

const CANVAS_W = 800;
const CANVAS_H = 1000;
const PAD_X = 48;
const PAD_TOP = 48;
const CHIN_RATIO = 0.28;

function cacheKey(imageUrl: string | null, label: string, dark: boolean): string {
  return `${dark ? "d" : "l"}|${imageUrl ?? ""}|${label}`;
}

function frameColor(dark: boolean): string {
  return dark ? "#f4efe2" : "#16130e";
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

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export async function buildPolaroidTextureUrl(
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

  const chinH = Math.round(CANVAS_H * CHIN_RATIO);
  const imageTop = PAD_TOP;
  const imageLeft = PAD_X;
  const imageWidth = CANVAS_W - PAD_X * 2;
  const imageHeight = CANVAS_H - PAD_TOP - chinH;

  ctx.fillStyle = frameColor(dark);
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const sourceUrl = feedGalleryImageUrl(imageUrl, label);
  const img = await loadImage(sourceUrl);

  ctx.save();
  drawRoundedRect(ctx, imageLeft, imageTop, imageWidth, imageHeight, 12);
  ctx.clip();

  if (img) {
    const scale = Math.max(imageWidth / img.width, imageHeight / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = imageLeft + (imageWidth - dw) / 2;
    const dy = imageTop + (imageHeight - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = dark ? "#2a2419" : "#e4dbc9";
    ctx.fillRect(imageLeft, imageTop, imageWidth, imageHeight);
    ctx.fillStyle = placeholderColor(dark);
    ctx.font = "22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = label.slice(0, 40);
    ctx.fillText(text, CANVAS_W / 2, imageTop + imageHeight / 2);
  }

  ctx.restore();

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
      image: await buildPolaroidTextureUrl(item.imageUrl, item.displayName, dark),
      text: item.displayName,
    })),
  );
}

export function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}
