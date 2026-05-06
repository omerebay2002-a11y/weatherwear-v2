// ─────────────────────────────────────────────────────────
// Shared types — kept tight, only what v2 actually uses
// ─────────────────────────────────────────────────────────

export type ClothingCategory =
  | "top"        // חולצות
  | "bottom"     // מכנסיים
  | "dress"      // שמלות
  | "outerwear"  // מעילים
  | "underwear"  // תחתונים
  | "socks"      // גרביים
  | "shoes"      // נעליים
  | "bag"        // תיקים
  | "accessory"; // תכשיטים

export type Material =
  | "cotton"   // כותנה
  | "denim"    // ג׳ינס
  | "wool"     // צמר
  | "linen"    // פשתן
  | "silk"     // משי
  | "leather"  // עור
  | "synthetic" // סינתטי
  | "other";

export type Season = "summer" | "winter" | "all";

export type Formality = "casual" | "smart" | "formal" | "sport";

export interface ClothingItem {
  id: string;
  name: string;            // human-friendly: "ג׳ינס Levi's 501 כחול"
  category: ClothingCategory;
  color: string;           // human-friendly Hebrew color name
  colorHex: string;        // #aabbcc
  material?: Material;
  brand?: string;
  model?: string;          // e.g. "501"
  season: Season;
  formality?: Formality;
  imageUrl?: string;       // data URL (camera) or remote
  createdAt: number;
  // Source — how was it added
  source: "photo" | "voice" | "type";
}

// ─────────────────────────────────────────────────────────
// Weather (Open-Meteo)
// ─────────────────────────────────────────────────────────

export type WeatherCode =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

export interface WeatherSnapshot {
  city: string;
  lat: number;
  lon: number;
  current: {
    tempC: number;
    code: WeatherCode;
    feelsLikeC?: number;
  };
  hourly: { hour: string; tempC: number; code: WeatherCode }[];
  daily: { date: string; minC: number; maxC: number; code: WeatherCode }[];
  fetchedAt: number;
}

// ─────────────────────────────────────────────────────────
// Outfit
// ─────────────────────────────────────────────────────────

export type Occasion = "work" | "evening" | "casual" | "sport";
export type WhenChoice = "now" | "tomorrow-morning" | "tomorrow-evening";

export interface Outfit {
  itemIds: string[];
  explanation: string; // 1-2 sentence Hebrew
}

// ─────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}
