// Single source of truth for the avatar figure standing in the room.
// The selfie flow (WardrobeIllustration) and the try-on flow (ItemDetailDialog)
// both write here; the room reads it. Backed by localStorage + a window event so
// any component updates live, with no extra provider.
import { useEffect, useState } from "react";
import { loadProfile } from "./profile";

const KEY = "avatar_render_url";
const EVENT = "ww2:avatar-render";

// Faceless boutique-mannequin fallback until the user makes a personal avatar.
const FIGURE: Record<"woman" | "man" | "mixed", string> = {
  woman: "/avatar-woman.png",
  man: "/avatar-woman.png", // TODO: dedicated /avatar-man.png cutout
  mixed: "/avatar-woman.png",
};

/** The default figure for the current profile (no selfie / try-on yet). */
export function defaultFigureSrc(): string {
  return FIGURE[loadProfile()?.wardrobeFor ?? "woman"] ?? "/avatar-woman.png";
}

export function getAvatarRender(): string | null {
  return localStorage.getItem(KEY);
}

// ── Outfit mode ───────────────────────────────────────────────────────────────
// The figure wears either a one-piece DRESS or SEPARATES (top + bottom). The base
// mannequin already provides a default top + bottom, so applying a top/bottom to
// the base yields a complete look. Switching between a dress and separates means
// rebuilding from the base (you can't layer a shirt onto a dress).
const MODE_KEY = "avatar_outfit_mode";
export type OutfitMode = "separates" | "dress";

export function getOutfitMode(): OutfitMode {
  return localStorage.getItem(MODE_KEY) === "dress" ? "dress" : "separates";
}
export function setOutfitMode(mode: OutfitMode): void {
  localStorage.setItem(MODE_KEY, mode);
}

// ── Live dressing status (ephemeral) ─────────────────────────────────────────
// Set while a try-on runs so the ROOM can show an elegant "designing the look"
// overlay (instead of the user staring at a spinner in a sheet). Not persisted.
const DRESS_EVENT = "ww2:dressing";
const DRESS_ERR_EVENT = "ww2:dressing-error";

export function setDressing(on: boolean): void {
  window.dispatchEvent(new CustomEvent(DRESS_EVENT, { detail: on }));
}
export function setDressingError(message: string | null): void {
  window.dispatchEvent(new CustomEvent(DRESS_ERR_EVENT, { detail: message }));
}

export function useDressing(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const h = (e: Event) => setOn(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener(DRESS_EVENT, h);
    return () => window.removeEventListener(DRESS_EVENT, h);
  }, []);
  return on;
}
export function useDressingError(): string | null {
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: Event) => setErr((e as CustomEvent<string | null>).detail ?? null);
    window.addEventListener(DRESS_ERR_EVENT, h);
    return () => window.removeEventListener(DRESS_ERR_EVENT, h);
  }, []);
  return err;
}

export function setAvatarRender(url: string | null): void {
  if (url) localStorage.setItem(KEY, url);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: url }));
}

/** Live-updating avatar render URL (null = use the default mannequin). */
export function useAvatarRender(): [string | null, (url: string | null) => void] {
  const [url, setUrl] = useState<string | null>(() => getAvatarRender());
  useEffect(() => {
    const handler = (e: Event) =>
      setUrl((e as CustomEvent<string | null>).detail ?? getAvatarRender());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);
  return [url, setAvatarRender];
}

/**
 * Normalize an image into something fal can ingest, kept small. Same-origin and
 * data-URL images are downscaled to a ~1024px JPEG data URL — this both keeps
 * the request well under the edge body limit and lets generation work on
 * auth-protected previews (fal can't fetch behind Vercel auth). Remote URLs
 * (e.g. a prior fal render) pass through untouched (cross-origin canvas would
 * taint), and fal fetches them directly.
 */
export async function toFalImage(src: string, maxDim = 1024, quality = 0.9): Promise<string> {
  const isRemote = /^https?:\/\//i.test(src) && !src.startsWith(window.location.origin);
  if (isRemote) return src;

  const img = await loadImage(src);
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  // White matte so transparent cutouts (PNG) flatten cleanly for try-on.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

// Locked base-figure placement, measured from /avatar-woman.png on the 768×1376
// room canvas (the size Omer approved). Dressed/selfie results are fit to THIS
// exact box so the figure is ALWAYS whole and the SAME size as the default
// mannequin — never zoomed-in or cut off, however the AI framed its output.
const ROOM_W = 768;
const ROOM_H = 1376;
const BASE_CX = 554; // figure horizontal center
const BASE_BOTTOM = 1192; // feet line
const BASE_HEIGHT = 737; // head-to-toe height (~53.6% of room height)

/**
 * Re-place a dressed/rendered figure at the exact base-figure box: crop to the
 * figure's bounding box, scale to the base height, and anchor to the base
 * center-x and feet line. Result is a room-shaped (768×1376) transparent PNG
 * that renders (object-cover) identically to the default mannequin. Best-effort:
 * on any failure (CORS / no pixels) the original URL is returned unchanged.
 */
export async function fitFigureToBase(srcUrl: string): Promise<string> {
  try {
    const img = await loadImage(srcUrl);
    const sw = img.naturalWidth || img.width;
    const sh = img.naturalHeight || img.height;
    if (!sw || !sh) return srcUrl;

    const src = document.createElement("canvas");
    src.width = sw;
    src.height = sh;
    const sctx = src.getContext("2d");
    if (!sctx) return srcUrl;
    sctx.drawImage(img, 0, 0);

    const data = sctx.getImageData(0, 0, sw, sh).data;
    let minX = sw, minY = sh, maxX = 0, maxY = 0, found = false;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        if (data[(y * sw + x) * 4 + 3] > 16) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!found) return srcUrl;

    const fw = maxX - minX + 1;
    const fh = maxY - minY + 1;
    const scale = BASE_HEIGHT / fh; // match the base figure's height exactly
    const dw = fw * scale;
    const dh = fh * scale;
    const dx = BASE_CX - dw / 2;
    const dy = BASE_BOTTOM - dh;

    const out = document.createElement("canvas");
    out.width = ROOM_W;
    out.height = ROOM_H;
    const octx = out.getContext("2d");
    if (!octx) return srcUrl;
    octx.drawImage(img, minX, minY, fw, fh, dx, dy, dw, dh);
    return out.toDataURL("image/png");
  } catch {
    return srcUrl;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image load failed: ${src.slice(0, 60)}`));
    img.src = src;
  });
}
