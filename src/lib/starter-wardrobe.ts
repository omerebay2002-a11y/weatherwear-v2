import type { ClothingItem } from "../types";

// A real starter wardrobe (women) with actual garment images, so the closet is
// never empty and shows real clothes from the first second. Images live in
// public/catalog/. Seeded once (offline) when the wardrobe is empty.
type StarterItem = Omit<ClothingItem, "id" | "createdAt" | "source">;

export const STARTER_WARDROBE: StarterItem[] = [
  { name: "ג׳ינס כחול בהיר", category: "bottom", color: "כחול ג׳ינס", colorHex: "#7FA6CC", season: "all", formality: "casual", material: "denim", imageUrl: "/catalog/jeans-blue.jpg" },
  { name: "טישרט לבנה", category: "top", color: "לבן", colorHex: "#F5F5F0", season: "all", formality: "casual", material: "cotton", imageUrl: "/catalog/tee-white.jpg" },
  { name: "גופייה שחורה", category: "top", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", material: "cotton", imageUrl: "/catalog/tank-black.jpg" },
  { name: "חולצה מכופתרת לבנה", category: "top", color: "לבן", colorHex: "#FAFAF5", season: "all", formality: "smart", material: "cotton", imageUrl: "/catalog/shirt-white.jpg" },
  { name: "סוודר בז׳", category: "top", color: "בז׳", colorHex: "#C9B796", season: "winter", formality: "casual", material: "wool", imageUrl: "/catalog/sweater-beige.jpg" },
  { name: "שמלה שחורה קטנה", category: "dress", color: "שחור", colorHex: "#1A1A1A", season: "all", formality: "smart", material: "synthetic", imageUrl: "/catalog/dress-black.jpg" },
  { name: "שמלת מידי פרחונית", category: "dress", color: "פרחוני", colorHex: "#C98B86", season: "summer", formality: "casual", material: "synthetic", imageUrl: "/catalog/dress-floral.jpg" },
  { name: "ז׳קט ג׳ינס", category: "outerwear", color: "כחול ג׳ינס", colorHex: "#4A6A9D", season: "all", formality: "casual", material: "denim", imageUrl: "/catalog/jacket-denim.jpg" },
  { name: "מעיל טרנץ׳ בז׳", category: "outerwear", color: "בז׳", colorHex: "#C2A878", season: "all", formality: "smart", material: "cotton", imageUrl: "/catalog/trench-beige.jpg" },
  { name: "סניקרס לבנות", category: "shoes", color: "לבן", colorHex: "#F2F0EA", season: "all", formality: "casual", material: "leather", imageUrl: "/catalog/sneakers-white.jpg" },
  { name: "סנדלי עקב בז׳", category: "shoes", color: "בז׳", colorHex: "#CBB089", season: "summer", formality: "smart", material: "leather", imageUrl: "/catalog/sandals-beige.jpg" },
  { name: "תיק טוט עור", category: "bag", color: "טאן", colorHex: "#B08A5A", season: "all", formality: "casual", material: "leather", imageUrl: "/catalog/tote-tan.jpg" },
];
