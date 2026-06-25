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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image load failed: ${src.slice(0, 60)}`));
    img.src = src;
  });
}
