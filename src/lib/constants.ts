import type { ClothingCategory, ClothingItem, Material, Season } from "../types";

export const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  top: "חולצות",
  bottom: "מכנסיים",
  dress: "שמלות",
  outerwear: "מעילים",
  underwear: "תחתונים",
  socks: "גרביים",
  shoes: "נעליים",
  bag: "תיקים",
  accessory: "תכשיטים",
};

export const CATEGORY_EMOJI: Record<ClothingCategory, string> = {
  top: "👚",
  bottom: "👖",
  dress: "👗",
  outerwear: "🧥",
  underwear: "🩲",
  socks: "🧦",
  shoes: "👟",
  bag: "👜",
  accessory: "💍",
};

export const CATEGORIES: { v: ClothingCategory; label: string }[] = [
  { v: "outerwear", label: "מעיל" },
  { v: "top", label: "חולצה" },
  { v: "dress", label: "שמלה" },
  { v: "bottom", label: "מכנסיים" },
  { v: "underwear", label: "תחתונים" },
  { v: "socks", label: "גרביים" },
  { v: "shoes", label: "נעליים" },
  { v: "bag", label: "תיק" },
  { v: "accessory", label: "תכשיטים" },
];

export const MATERIAL_LABEL: Record<NonNullable<ClothingItem["material"]>, string> = {
  cotton: "כותנה",
  denim: "ג׳ינס",
  wool: "צמר",
  linen: "פשתן",
  silk: "משי",
  leather: "עור",
  synthetic: "סינתטי",
  other: "אחר",
};

export const MATERIALS: { v: Material; label: string }[] = [
  { v: "cotton", label: "כותנה" },
  { v: "denim", label: "ג׳ינס" },
  { v: "wool", label: "צמר" },
  { v: "linen", label: "פשתן" },
  { v: "silk", label: "משי" },
  { v: "leather", label: "עור" },
  { v: "synthetic", label: "סינתטי" },
];

export const SEASON_LABEL: Record<ClothingItem["season"], string> = {
  summer: "קיץ",
  winter: "חורף",
  all: "כל השנה",
};

export const SEASONS: { v: Season; label: string }[] = [
  { v: "summer", label: "קיץ" },
  { v: "all", label: "כל השנה" },
  { v: "winter", label: "חורף" },
];

export const COLORS: { name: string; hex: string }[] = [
  { name: "שחור", hex: "#1A1410" },
  { name: "לבן", hex: "#FAF6EE" },
  { name: "אפור", hex: "#6B6B6B" },
  { name: "חום", hex: "#5C3E22" },
  { name: "חאקי", hex: "#948169" },
  { name: "בז׳", hex: "#C9B898" },
  { name: "ורוד עתיק", hex: "#D9B0B0" },
  { name: "כחול ג׳ינס", hex: "#3F5878" },
  { name: "ירוק זית", hex: "#6B7553" },
  { name: "ירוק מנטה", hex: "#9BAE94" },
  { name: "אדום יין", hex: "#6F2A2A" },
  { name: "צהוב חרדל", hex: "#B89742" },
];
