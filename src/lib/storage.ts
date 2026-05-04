import type { ClothingItem } from "../types";

const KEY_ITEMS = "ww2.wardrobe.items.v1";
const KEY_CITY = "ww2.settings.city.v1";

export function loadItems(): ClothingItem[] {
  try {
    const raw = localStorage.getItem(KEY_ITEMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveItems(items: ClothingItem[]): void {
  try {
    localStorage.setItem(KEY_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items", e);
  }
}

export function loadCity(): string | null {
  return localStorage.getItem(KEY_CITY);
}

export function saveCity(city: string): void {
  localStorage.setItem(KEY_CITY, city);
}
