import type {
  ClothingCategory,
  Formality,
  Season,
  StylePref,
  UserProfile,
} from "../types";

// ─────────────────────────────────────────────────────────
// Onboarding catalog — the cold-start solution.
//
// A new user will not type 30 items by hand. Instead, after the
// onboarding questionnaire (+ optional outfit-photo analysis), we guess
// ~70 items they probably own and let them confirm with one tap each.
// Hitting 5–7 real items in the first minute is the retention goal.
// ─────────────────────────────────────────────────────────

export interface SeedCandidate {
  name: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  season: Season;
  formality?: Formality;
  /** real product image (pre-baked flat-lay in /public/catalog) so the seeded
   *  wardrobe shows actual clothes, not just a color swatch. */
  image?: string;
}

type Audience = "woman" | "man" | "all";

interface SeedDef extends SeedCandidate {
  /** who this item is offered to */
  audience: Audience;
  /** 1 = almost everyone owns it, 2 = common, 3 = style-dependent */
  tier: 1 | 2 | 3;
  /** offered only when one of these styles was picked (tier 3) */
  styles?: StylePref[];
}

const CATALOG: SeedDef[] = [
  // Real garment-only packshots (no models) sourced from live stores via public
  // /products.json feeds, each verified white-background so it reads like a
  // wardrobe item and is dressable. ~34 items, tagged with styles so the style
  // question actually reorders the pick grid.
  { name: "חולצה כחול", category: "top", color: "כחול", colorHex: "#3B5998", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual"], image: "/catalog/db/top-blue-0.jpg" },
  { name: "חולצה בורדו", category: "top", color: "בורדו", colorHex: "#7A2E33", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual"], image: "/catalog/db/top-red-1.jpg" },
  { name: "חולצה צהוב", category: "top", color: "צהוב", colorHex: "#E8D07A", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual"], image: "/catalog/db/top-yellow-2.jpg" },
  { name: "חולצה שחור", category: "top", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual"], image: "/catalog/db/top-black-3.jpg" },
  { name: "חולצה סגול", category: "top", color: "סגול", colorHex: "#6A4AA0", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual"], image: "/catalog/db/top-violet-4.jpg" },
  { name: "חולצה אפור", category: "top", color: "אפור", colorHex: "#9A9A9A", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual"], image: "/catalog/db/top-grey-5.jpg" },
  { name: "גופייה", category: "top", color: "מעורב", colorHex: "#9A9A9A", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["minimal", "casual"], image: "/catalog/db/top-x-6.jpg" },
  { name: "הודי חאקי", category: "top", color: "חאקי", colorHex: "#A89B7A", season: "all", formality: "casual", audience: "all", tier: 2, styles: ["street", "sporty"], image: "/catalog/db/top-khaki-7.jpg" },
  { name: "ג׳ינס כחול", category: "bottom", color: "כחול", colorHex: "#3B5998", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual", "street"], image: "/catalog/db/bottom-blue-0.jpg" },
  { name: "חצאית כחול כהה", category: "bottom", color: "כחול כהה", colorHex: "#2E3D5A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["romantic", "elegant"], image: "/catalog/db/bottom-indigo-1.jpg" },
  { name: "ג׳ינס כחול כהה", category: "bottom", color: "כחול כהה", colorHex: "#2E3D5A", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual", "street"], image: "/catalog/db/bottom-indigo-2.jpg" },
  { name: "מכנס כחול", category: "bottom", color: "כחול", colorHex: "#3B5998", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual", "street"], image: "/catalog/db/bottom-blue-3.jpg" },
  { name: "טייץ זית", category: "bottom", color: "זית", colorHex: "#6B6B4A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["sporty"], image: "/catalog/db/bottom-olive-4.jpg" },
  { name: "מכנס חום", category: "bottom", color: "חום", colorHex: "#5A3A2A", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual", "street"], image: "/catalog/db/bottom-brown-5.jpg" },
  { name: "ג׳ינס לבן", category: "bottom", color: "לבן", colorHex: "#F2F0EA", season: "all", formality: "casual", audience: "all", tier: 1, styles: ["casual", "street"], image: "/catalog/db/bottom-white-6.jpg" },
  { name: "שמלה לבנדר", category: "dress", color: "לבנדר", colorHex: "#C9B6E0", season: "all", formality: "smart", audience: "woman", tier: 2, styles: ["romantic", "elegant"], image: "/catalog/db/dress-lavender-0.jpg" },
  { name: "שמלה בורדו", category: "dress", color: "בורדו", colorHex: "#6E1F33", season: "all", formality: "smart", audience: "woman", tier: 2, styles: ["elegant", "romantic"], image: "/catalog/db/dress-burgundy-1.jpg" },
  { name: "שמלה ורוד", category: "dress", color: "ורוד", colorHex: "#E0B0B0", season: "all", formality: "smart", audience: "woman", tier: 2, styles: ["romantic", "elegant"], image: "/catalog/db/dress-blush-2.jpg" },
  { name: "שמלת ערב בורדו", category: "dress", color: "בורדו", colorHex: "#6E1F33", season: "all", formality: "smart", audience: "woman", tier: 2, styles: ["elegant", "romantic"], image: "/catalog/db/dress-burgundy-3.jpg" },
  { name: "נעליים שחור", category: "shoes", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual"], image: "/catalog/db/shoes-black-0.jpg" },
  { name: "נעליים לבן", category: "shoes", color: "לבן", colorHex: "#F2F0EA", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual"], image: "/catalog/db/shoes-white-1.jpg" },
  { name: "נעליים לבן", category: "shoes", color: "לבן", colorHex: "#F2F0EA", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual"], image: "/catalog/db/shoes-white-2.jpg" },
  { name: "נעליים שחור", category: "shoes", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual"], image: "/catalog/db/shoes-black-3.jpg" },
  { name: "נעליים ורוד", category: "shoes", color: "ורוד", colorHex: "#E39AAE", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual"], image: "/catalog/db/shoes-pink-4.jpg" },
  { name: "מגפיים שוקולד", category: "shoes", color: "שוקולד", colorHex: "#4A2E22", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["street", "elegant"], image: "/catalog/db/shoes-chocolate-5.jpg" },
  { name: "מוקסינים חום", category: "shoes", color: "חום", colorHex: "#5A3A2A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["minimal", "elegant"], image: "/catalog/db/shoes-brown-6.jpg" },
  { name: "תיק שחור", category: "bag", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual", "minimal"], image: "/catalog/db/bag-black-0.jpg" },
  { name: "תיק ברונזה", category: "bag", color: "ברונזה", colorHex: "#B08A5A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual", "minimal"], image: "/catalog/db/bag-bronze-1.jpg" },
  { name: "תיק אפור", category: "bag", color: "אפור", colorHex: "#9A9A9A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual", "minimal"], image: "/catalog/db/bag-grey-2.jpg" },
  { name: "תיק טבעי", category: "bag", color: "טבעי", colorHex: "#C9B48A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["casual", "minimal"], image: "/catalog/db/bag-natural-3.jpg" },
  { name: "משקפי שמש זהב", category: "accessory", color: "זהב", colorHex: "#C9A84C", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["street", "minimal"], image: "/catalog/db/accessory-gold-0.jpg" },
  { name: "משקפי שמש", category: "accessory", color: "מעורב", colorHex: "#9A9A9A", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["street", "minimal"], image: "/catalog/db/accessory-x-1.jpg" },
  { name: "חגורה שחור", category: "accessory", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["minimal"], image: "/catalog/db/accessory-black-2.jpg" },
  { name: "שרשרת זהב", category: "accessory", color: "זהב", colorHex: "#C9A84C", season: "all", formality: "casual", audience: "woman", tier: 2, styles: ["elegant", "romantic"], image: "/catalog/db/accessory-gold-3.jpg" },
];

/** Normalize a name for fuzzy dedup between AI results and the catalog. */
function normName(s: string): string {
  return s.replace(/[״׳'"]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Build the candidate list shown in the onboarding confirmation step.
 * AI-detected items (from the user's outfit photos) come first — they are the
 * personal hits — followed by catalog guesses matched to the profile.
 */
export function buildSeedCandidates(
  profile: Pick<UserProfile, "wardrobeFor" | "styles">,
  aiItems: SeedCandidate[] = [],
  cap = 70
): SeedCandidate[] {
  const seen = new Set<string>();
  const out: SeedCandidate[] = [];

  const push = (c: SeedCandidate) => {
    // Key on the image too: two distinct real products can share a generic name
    // (e.g. two black shoes) and both should survive. Image-less AI hits still
    // dedup by name.
    const key = `${c.category}|${normName(c.name)}|${c.image ?? ""}`;
    if (seen.has(key) || out.length >= cap) return;
    seen.add(key);
    out.push({
      name: c.name,
      category: c.category,
      color: c.color,
      colorHex: c.colorHex,
      season: c.season,
      formality: c.formality,
      image: c.image,
    });
  };

  aiItems.forEach(push); // the user's own photo hits stay first

  const audiences: Audience[] =
    profile.wardrobeFor === "mixed" ? ["all", "woman", "man"] : ["all", profile.wardrobeFor];

  let pool = CATALOG.filter((d) => audiences.includes(d.audience));
  // Safety net: never render an empty pick step — if the audience filter matched
  // nothing, fall back to the whole catalog.
  if (pool.length === 0) pool = [...CATALOG];

  // The style question actually changes the grid: items matching a chosen style
  // float to the top; then basics (tier 1). Stable within each bucket.
  const chosen = new Set(profile.styles);
  const styleMatch = (d: SeedDef) => (d.styles ?? []).some((s) => chosen.has(s));
  pool
    .map((d, i) => ({ d, i }))
    .sort((a, b) => {
      const ms = Number(styleMatch(b.d)) - Number(styleMatch(a.d)); // style-matched first
      if (ms) return ms;
      const tier = a.d.tier - b.d.tier; // then everyday basics
      return tier || a.i - b.i;
    })
    .forEach(({ d }) => push(d));

  return out;
}
