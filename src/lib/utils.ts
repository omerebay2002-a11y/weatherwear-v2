import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatHebrewDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatHebrewTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Returns text describing how cold/hot it feels */
export function temperatureFeel(c: number): "cold" | "cool" | "mild" | "warm" | "hot" {
  if (c < 8) return "cold";
  if (c < 16) return "cool";
  if (c < 22) return "mild";
  if (c < 28) return "warm";
  return "hot";
}

export const CATEGORY_LABEL: Record<string, string> = {
  top: "חולצה",
  bottom: "מכנסיים",
  dress: "שמלה",
  outerwear: "מעיל",
  shoes: "נעליים",
  bag: "תיק",
  accessory: "אקססוריז",
};
