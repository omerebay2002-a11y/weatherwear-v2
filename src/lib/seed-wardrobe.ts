// Seed data extracted from user's previous wardrobe (wardrobe.pdf, 67 items, 35 identifiable).
// Pre-filled with sensible defaults — user can edit each item via the wardrobe.

import type { ClothingItem } from "../types";

type Seed = Omit<ClothingItem, "id" | "createdAt" | "source">;

export const SEED_ITEMS: Seed[] = [
  // ─── Accessories ──────────────────────────────────────
  { name: "Oakley Frogskins", category: "accessory", brand: "Oakley", model: "Frogskins", color: "שחור", colorHex: "#1a1a1a", season: "all", formality: "casual", material: "synthetic" },
  { name: "Garmin fenix 6 Pro Solar", category: "accessory", brand: "Garmin", model: "fenix 6 Pro Solar", color: "שחור", colorHex: "#2a2a2a", season: "all", formality: "sport", material: "synthetic" },
  { name: "Smartwool Full Cushion", category: "socks", brand: "Smartwool", model: "Full Cushion", color: "אפור", colorHex: "#7a7a7a", season: "winter", formality: "casual", material: "wool" },

  // ─── Bag ──────────────────────────────────────
  { name: "Patagonia Black Hole Pack 25L", category: "bag", brand: "Patagonia", model: "Black Hole 25L", color: "שחור", colorHex: "#1c1c1c", season: "all", formality: "casual", material: "synthetic" },

  // ─── Shoes ──────────────────────────────────────
  { name: "Porsche Legacy Court Classic Lux", category: "shoes", brand: "Porsche", model: "Legacy Court Classic Lux", color: "לבן", colorHex: "#f5f5f5", season: "all", formality: "smart", material: "leather" },
  { name: "Nike Air Jordan 1 Low", category: "shoes", brand: "Nike", model: "Air Jordan 1 Low", color: "שחור-לבן", colorHex: "#1a1a1a", season: "all", formality: "casual", material: "leather" },
  { name: "Salomon XT-6 Black", category: "shoes", brand: "Salomon", model: "XT-6", color: "שחור", colorHex: "#0d0d0d", season: "all", formality: "sport", material: "synthetic" },
  { name: "Adidas Ultraboost 22", category: "shoes", brand: "Adidas", model: "Ultraboost 22", color: "שחור", colorHex: "#1f1f1f", season: "all", formality: "sport", material: "synthetic" },
  { name: "Puma CA Pro Classic", category: "shoes", brand: "Puma", model: "CA Pro Classic", color: "לבן", colorHex: "#f0f0f0", season: "all", formality: "casual", material: "leather" },
  { name: "New Balance 990v6 Grey", category: "shoes", brand: "New Balance", model: "990v6", color: "אפור", colorHex: "#9a9a9a", season: "all", formality: "casual", material: "synthetic" },

  // ─── Bottoms ──────────────────────────────────────
  { name: "Carhartt WIP Aviation Pant", category: "bottom", brand: "Carhartt WIP", model: "Aviation Pant", color: "ירוק זית", colorHex: "#5a6648", season: "all", formality: "casual", material: "cotton" },
  { name: "Dickies 874 Work Pant", category: "bottom", brand: "Dickies", model: "874 Work Pant", color: "חאקי", colorHex: "#8a7a5a", season: "all", formality: "casual", material: "cotton" },
  { name: "Levi's 501 '93 Straight Jeans", category: "bottom", brand: "Levi's", model: "501 '93 Straight", color: "כחול ג'ינס", colorHex: "#2a4d6e", season: "all", formality: "casual", material: "denim" },
  { name: "Brushed Jersey Pants", category: "bottom", color: "אפור", colorHex: "#5a5a5a", season: "winter", formality: "casual", material: "cotton" },
  { name: "Gramicci Loose Tapered Pants", category: "bottom", brand: "Gramicci", model: "Loose Tapered", color: "חום", colorHex: "#6e4f33", season: "all", formality: "casual", material: "cotton" },

  // ─── Outerwear ──────────────────────────────────────
  { name: "Levi's Trucker Jacket", category: "outerwear", brand: "Levi's", model: "Trucker", color: "כחול ג'ינס", colorHex: "#3a5a78", season: "all", formality: "casual", material: "denim" },
  { name: "Arc'teryx Atom Hoody", category: "outerwear", brand: "Arc'teryx", model: "Atom Hoody", color: "שחור", colorHex: "#1c1c1c", season: "winter", formality: "sport", material: "synthetic" },
  { name: "Barbour Ashby Wax Jacket", category: "outerwear", brand: "Barbour", model: "Ashby Wax", color: "ירוק זית", colorHex: "#3d4a30", season: "winter", formality: "smart", material: "synthetic" },
  { name: "Stone Island Crinkle Reps NY Down", category: "outerwear", brand: "Stone Island", model: "Crinkle Reps NY Down", color: "שחור", colorHex: "#1a1a1a", season: "winter", formality: "smart", material: "synthetic" },
  { name: "Uniqlo Ultra Stretch Dry Jacket", category: "outerwear", brand: "Uniqlo", model: "Ultra Stretch Dry", color: "שחור", colorHex: "#202020", season: "summer", formality: "sport", material: "synthetic" },
  { name: "Uniqlo Ultra Stretch Active Jacket", category: "outerwear", brand: "Uniqlo", model: "Ultra Stretch Active", color: "שחור", colorHex: "#202020", season: "all", formality: "sport", material: "synthetic" },
  { name: "Utility Jacket", category: "outerwear", color: "ירוק זית", colorHex: "#5a6648", season: "all", formality: "casual", material: "cotton" },
  { name: "Schott NYC 626vn Perfecto", category: "outerwear", brand: "Schott NYC", model: "626vn", color: "שחור", colorHex: "#0a0a0a", season: "winter", formality: "smart", material: "leather" },
  { name: "Carhartt WIP Hubbard Sherpa Shirt Jac", category: "outerwear", brand: "Carhartt WIP", model: "Hubbard Sherpa", color: "חום", colorHex: "#7a5a3a", season: "winter", formality: "casual", material: "cotton" },
  { name: "Patagonia Torrentshell 3L", category: "outerwear", brand: "Patagonia", model: "Torrentshell 3L", color: "שחור", colorHex: "#222222", season: "winter", formality: "sport", material: "synthetic" },

  // ─── Tops ──────────────────────────────────────
  { name: "Stüssy Crew White", category: "top", brand: "Stüssy", model: "Crew", color: "לבן", colorHex: "#f5f5f5", season: "all", formality: "casual", material: "cotton" },
  { name: "Carhartt WIP Chase", category: "top", brand: "Carhartt WIP", model: "Chase", color: "אפור", colorHex: "#7a7a7a", season: "all", formality: "casual", material: "cotton" },
  { name: "Dickies Sacramento Shirt", category: "top", brand: "Dickies", model: "Sacramento", color: "אדום משבצות", colorHex: "#8a3030", season: "winter", formality: "casual", material: "cotton" },
  { name: "Nike Sportswear Club Fleece", category: "top", brand: "Nike", model: "Sportswear Club Fleece", color: "אפור", colorHex: "#7a7a7a", season: "winter", formality: "sport", material: "cotton" },
  { name: "Stüssy Basic Appliqué Hoodie", category: "top", brand: "Stüssy", model: "Basic Appliqué Hoodie", color: "שחור", colorHex: "#1c1c1c", season: "winter", formality: "casual", material: "cotton" },
  { name: "Ralph Lauren Slim Fit", category: "top", brand: "Ralph Lauren", model: "Slim Fit", color: "כחול", colorHex: "#3a5a8a", season: "all", formality: "smart", material: "cotton" },
  { name: "Uniqlo Heattech Crew Neck Long Sleeve", category: "top", brand: "Uniqlo", model: "Heattech Crew Long", color: "שחור", colorHex: "#1c1c1c", season: "winter", formality: "casual", material: "synthetic" },
  { name: "Adidas Adicolor Classics Trefoil", category: "top", brand: "Adidas", model: "Adicolor Classics Trefoil", color: "שחור", colorHex: "#222222", season: "all", formality: "casual", material: "cotton" },
  { name: "Patagonia P-6 Logo Responsibili-Tee", category: "top", brand: "Patagonia", model: "P-6 Logo Responsibili-Tee", color: "שחור", colorHex: "#222222", season: "summer", formality: "casual", material: "cotton" },
  { name: "Uniqlo U Crew Neck Short Sleeve", category: "top", brand: "Uniqlo", model: "U Crew Short", color: "לבן", colorHex: "#f0f0f0", season: "summer", formality: "casual", material: "cotton" },
];
