// Deterministic fallback outfit picker — used when Claude API is unavailable.
// Picks plausible items based on temperature + occasion. Hebrew explanations.

import type {
  ClothingItem,
  Occasion,
  Outfit,
  WeatherSnapshot,
  WhenChoice,
} from "../types";
import { temperatureFeel } from "./utils";

function pick<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

const OCCASION_FORMALITY: Record<Occasion, ClothingItem["formality"][]> = {
  work: ["smart", "formal", "casual"],
  evening: ["smart", "formal"],
  casual: ["casual", "smart"],
  sport: ["sport", "casual"],
};

export function pickOutfitOffline(
  wardrobe: ClothingItem[],
  weather: WeatherSnapshot,
  occasion: Occasion,
  when: WhenChoice
): Outfit {
  const tempForWhen =
    when === "now"
      ? weather.current.tempC
      : when === "tomorrow-morning"
      ? weather.daily?.[1]?.minC ?? weather.current.tempC
      : weather.daily?.[1]?.maxC ?? weather.current.tempC;

  const feel = temperatureFeel(tempForWhen);
  const isCold = feel === "cold" || feel === "cool";
  const isHot = feel === "hot" || feel === "warm";

  const allowedFormality = OCCASION_FORMALITY[occasion];
  const matchesFormality = (i: ClothingItem) =>
    !i.formality || allowedFormality.includes(i.formality);

  const tops = wardrobe.filter((i) => i.category === "top" && matchesFormality(i));
  const bottoms = wardrobe.filter(
    (i) => i.category === "bottom" && matchesFormality(i)
  );
  const dresses = wardrobe.filter((i) => i.category === "dress" && matchesFormality(i));
  const shoes = wardrobe.filter((i) => i.category === "shoes" && matchesFormality(i));
  const outerwear = wardrobe.filter((i) => i.category === "outerwear");
  const accessories = wardrobe.filter((i) => i.category === "accessory");

  const itemIds: string[] = [];

  // 50% chance of dress for non-sport occasions if available
  const useDress =
    occasion !== "sport" && dresses.length > 0 && Math.random() > 0.5;

  if (useDress) {
    const d = pick(dresses);
    if (d) itemIds.push(d.id);
  } else {
    const t = pick(tops);
    if (t) itemIds.push(t.id);
    const b = pick(bottoms);
    if (b) itemIds.push(b.id);
  }

  const sh = pick(shoes);
  if (sh) itemIds.push(sh.id);

  if (isCold && outerwear.length > 0) {
    const o = pick(outerwear);
    if (o) itemIds.push(o.id);
  }

  if (accessories.length > 0 && Math.random() > 0.5) {
    const a = pick(accessories);
    if (a) itemIds.push(a.id);
  }

  const explanation = explain({ tempForWhen, feel, occasion, when, isCold, isHot });

  return { itemIds, explanation };
}

function explain({
  tempForWhen,
  feel,
  occasion,
  when,
  isCold,
  isHot,
}: {
  tempForWhen: number;
  feel: ReturnType<typeof temperatureFeel>;
  occasion: Occasion;
  when: WhenChoice;
  isCold: boolean;
  isHot: boolean;
}): string {
  const whenLabel =
    when === "now"
      ? "עכשיו"
      : when === "tomorrow-morning"
      ? "מחר בבוקר"
      : "מחר בערב";
  const occasionLabel: Record<Occasion, string> = {
    work: "פגישת עבודה",
    evening: "ערב יציאה",
    casual: "יום יומיומי",
    sport: "פעילות ספורט",
  };
  const feelLabel: Record<typeof feel, string> = {
    cold: "קר",
    cool: "קריר",
    mild: "נעים",
    warm: "חמים",
    hot: "חם מאוד",
  };

  const base = `${whenLabel} · ${tempForWhen}° · ${feelLabel[feel]}`;
  const advice = isCold
    ? " — לקחתי משהו חם שמתאים ל"
    : isHot
    ? " — בחרתי קל ונושם ל"
    : " — מתאים בדיוק ל";
  return `${base}${advice}${occasionLabel[occasion]}.`;
}
