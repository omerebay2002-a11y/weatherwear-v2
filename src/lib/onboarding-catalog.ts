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
  // Real garments pulled from live young-women fashion stores (Princess Polly /
  // Edikted) — actual products the user recognizes, each with a real image so the
  // pick step is a photo grid and every picked item is dressable.
  // ── Bottoms ────────────────────────────────────────────────────────
  { name: "ג׳ינס כחול", category: "bottom", color: "כחול ג׳ינס", colorHex: "#3B5998", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/blue-jeans.jpg" },
  { name: "מכנס שחור", category: "bottom", color: "שחור", colorHex: "#23232B", season: "all", formality: "smart", audience: "woman", tier: 1, image: "/catalog/real/black-jeans.jpg" },
  { name: "שורט ג׳ינס", category: "bottom", color: "כחול ג׳ינס", colorHex: "#6E8FC0", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/denim-shorts.jpg" },
  { name: "חצאית ג׳ינס", category: "bottom", color: "כחול ג׳ינס", colorHex: "#4A6A9D", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/denim-skirt.jpg" },
  { name: "חצאית מקסי שחורה", category: "bottom", color: "שחור", colorHex: "#222226", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/midi-skirt.jpg" },
  { name: "מכנס רחב", category: "bottom", color: "חום", colorHex: "#8A6A4A", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/wide-pants.jpg" },
  // ── Tops ───────────────────────────────────────────────────────────
  { name: "טופ שחור", category: "top", color: "שחור", colorHex: "#20202A", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/black-tee.jpg" },
  { name: "גופייה שחורה", category: "top", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/black-tank.jpg" },
  { name: "גופייה לבנה", category: "top", color: "לבן", colorHex: "#FAFAF5", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/white-tank.jpg" },
  { name: "טופ קרופ", category: "top", color: "שחור", colorHex: "#202024", season: "all", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/crop-top.jpg" },
  { name: "בגד גוף שחור", category: "top", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/black-bodysuit.jpg" },
  { name: "טופ סאטן קרם", category: "top", color: "קרם", colorHex: "#EFE3CE", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/satin-blouse.jpg" },
  // ── Dresses ────────────────────────────────────────────────────────
  { name: "שמלה שחורה", category: "dress", color: "שחור", colorHex: "#1A1A1A", season: "all", formality: "formal", audience: "woman", tier: 1, image: "/catalog/real/black-dress.jpg" },
  { name: "שמלה לבנה", category: "dress", color: "לבן", colorHex: "#F5F5F0", season: "summer", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/white-dress.jpg" },
  { name: "שמלה פרחונית", category: "dress", color: "פרחוני", colorHex: "#C99AA0", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/floral-dress.jpg" },
  { name: "שמלת מקסי", category: "dress", color: "צהוב", colorHex: "#E3C766", season: "summer", formality: "smart", audience: "woman", tier: 3, styles: ["romantic", "elegant"], image: "/catalog/real/maxi-dress.jpg" },
  // ── Outerwear ──────────────────────────────────────────────────────
  { name: "ז׳קט שחור", category: "outerwear", color: "שחור", colorHex: "#222226", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/blazer.jpg" },
  // ── Shoes ──────────────────────────────────────────────────────────
  { name: "סנדלי פלטפורמה", category: "shoes", color: "שחור", colorHex: "#2B2B2B", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/sandals.jpg" },
  { name: "עקבים שחורים", category: "shoes", color: "שחור", colorHex: "#18181C", season: "all", formality: "formal", audience: "woman", tier: 2, image: "/catalog/real/black-heels.jpg" },
  { name: "מגפי עקב שחורים", category: "shoes", color: "שחור", colorHex: "#1A1A1E", season: "winter", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/black-boots.jpg" },
  // ── Bags & accessories ─────────────────────────────────────────────
  { name: "תיק טוט", category: "bag", color: "מנטה", colorHex: "#A9CBB8", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/tote-bag.jpg" },
  { name: "תיק כתף שחור", category: "bag", color: "שחור", colorHex: "#1E1E22", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/shoulder-bag.jpg" },
  { name: "משקפי שמש", category: "accessory", color: "שחור", colorHex: "#141414", season: "summer", audience: "woman", tier: 2, image: "/catalog/real/sunglasses.jpg" },
  { name: "עגילי זהב", category: "accessory", color: "זהב", colorHex: "#C9A84C", season: "all", audience: "woman", tier: 2, image: "/catalog/real/gold-earrings.jpg" },
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
    const key = `${c.category}|${normName(c.name)}`;
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

  aiItems.forEach(push);

  const audiences: Audience[] =
    profile.wardrobeFor === "mixed" ? ["all", "woman", "man"] : ["all", profile.wardrobeFor];

  const matches = (d: SeedDef) =>
    audiences.includes(d.audience) &&
    (d.tier !== 3 || (d.styles ?? []).some((s) => profile.styles.includes(s)));

  for (const tier of [1, 2, 3] as const) {
    CATALOG.filter((d) => d.tier === tier && matches(d)).forEach(push);
  }

  return out;
}
