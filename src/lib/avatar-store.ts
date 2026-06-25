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
 * Normalize an image into something fal can ingest. Same-origin images are
 * inlined to a data URL so generation works on auth-protected preview
 * deployments (fal can't fetch behind Vercel auth); remote URLs pass through.
 */
export async function toFalImage(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const isAbsolute = /^https?:\/\//i.test(src);
  if (isAbsolute && !src.startsWith(window.location.origin)) return src;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`fetch ${src} failed (${res.status})`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
