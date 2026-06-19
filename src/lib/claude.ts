// Frontend client for /api/* serverless functions.
// All Claude calls happen server-side; this just wraps fetch with typed JSON.

import type { ChatMessage, ClothingItem, Outfit, WeatherSnapshot, Occasion, WhenChoice } from "../types";

interface AnalyzeFromImageInput {
  mode: "image";
  imageBase64: string; // data: prefix OK
}
interface AnalyzeFromTextInput {
  mode: "text";
  text: string;
}
type AnalyzeInput = AnalyzeFromImageInput | AnalyzeFromTextInput;

export interface AnalyzedClothing {
  name: string;
  category: ClothingItem["category"];
  color: string;
  colorHex: string;
  material?: ClothingItem["material"];
  brand?: string;
  model?: string;
  season: ClothingItem["season"];
  formality?: ClothingItem["formality"];
}

export async function analyzeClothing(input: AnalyzeInput): Promise<AnalyzedClothing> {
  const r = await fetch("/api/analyze-clothing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Analyze failed (${r.status}): ${text}`);
  }
  return (await r.json()) as AnalyzedClothing;
}

export interface AnalyzeStyleInput {
  wardrobeFor: string;
  ageRange: string;
  styles: string[];
  images: string[]; // data URLs, already downscaled
}

/** Onboarding: analyze outfit photos → list of items the user likely owns. */
export async function analyzeStyle(input: AnalyzeStyleInput): Promise<AnalyzedClothing[]> {
  const r = await fetch("/api/analyze-style", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Style analysis failed (${r.status}): ${text}`);
  }
  const data = (await r.json()) as { items: AnalyzedClothing[] };
  return data.items ?? [];
}

export interface SuggestOutfitInput {
  weather: WeatherSnapshot;
  occasion: Occasion;
  when: WhenChoice;
  wardrobe: ClothingItem[];
}

export async function suggestOutfit(input: SuggestOutfitInput): Promise<Outfit> {
  const r = await fetch("/api/suggest-outfit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Suggest failed (${r.status}): ${text}`);
  }
  return (await r.json()) as Outfit;
}

export interface GenerateAvatarItem {
  name?: string;
  category: ClothingItem["category"];
  color?: string;
  colorHex?: string;
  material?: ClothingItem["material"];
}

/** Renders the user (from a selfie) standing in the room, returns a transparent
 *  cutout image URL. Pass roomUrl to composite into the room (best blend). */
export async function generateAvatar(
  selfie: string,
  items: GenerateAvatarItem[],
  roomUrl?: string
): Promise<string> {
  const r = await fetch("/api/generate-avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selfie, items, roomUrl }),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Avatar failed (${r.status}): ${text}`);
  }
  const { imageUrl } = (await r.json()) as { imageUrl: string };
  return imageUrl;
}

/** Streams a chat response. Yields text deltas. */
export async function* chatStream(
  messages: ChatMessage[],
  context: { weather: WeatherSnapshot; wardrobe: ClothingItem[] }
): AsyncGenerator<string, void, unknown> {
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });
  if (!r.ok || !r.body) {
    const text = await r.text().catch(() => "");
    throw new Error(`Chat failed (${r.status}): ${text}`);
  }
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
