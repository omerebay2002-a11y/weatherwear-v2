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
  // Real garment-only packshots (no models) pulled from live stores — Steve Madden,
  // Colorful Standard, DL1961 — via their public /products.json, filtered by a
  // white-background check so every image is the garment as it hangs in a wardrobe
  // (clean + easy to dress). Dress/jeans use the in-repo clean flat-lays.
  // ── Bottoms ────────────────────────────────────────────────────────
  { name: "ג׳ינס כחול", category: "bottom", color: "כחול ג׳ינס", colorHex: "#3B5998", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/jeans-blue.jpg" },
  { name: "מכנס שחור רחב", category: "bottom", color: "שחור", colorHex: "#23232B", season: "all", formality: "smart", audience: "woman", tier: 1, image: "/catalog/real/black-pants.jpg" },
  { name: "מכנס טרנינג בז׳", category: "bottom", color: "בז׳", colorHex: "#B7A793", season: "all", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/beige-pants.jpg" },
  // ── Tops ───────────────────────────────────────────────────────────
  { name: "טופ לבן", category: "top", color: "לבן", colorHex: "#F5F5F0", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/white-tee.jpg" },
  { name: "טופ שחור", category: "top", color: "שחור", colorHex: "#20202A", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/black-tee.jpg" },
  { name: "טופ אפור", category: "top", color: "אפור", colorHex: "#9A9A9A", season: "all", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/gray-tee.jpg" },
  { name: "קרדיגן נייבי", category: "top", color: "כחול נייבי", colorHex: "#27374D", season: "winter", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/black-knit.jpg" },
  // ── Dresses ────────────────────────────────────────────────────────
  { name: "שמלה שחורה", category: "dress", color: "שחור", colorHex: "#1A1A1A", season: "all", formality: "formal", audience: "woman", tier: 1, image: "/catalog/real/dress-black.jpg" },
  { name: "שמלה פרחונית", category: "dress", color: "פרחוני", colorHex: "#C99AA0", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/dress-floral.jpg" },
  // ── Shoes ──────────────────────────────────────────────────────────
  { name: "סניקרס שחורות", category: "shoes", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/white-sneakers.jpg" },
  { name: "סניקרס אדומות", category: "shoes", color: "אדום", colorHex: "#C0392B", season: "all", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/black-sneakers.jpg" },
  { name: "נעלי בובה", category: "shoes", color: "חום", colorHex: "#B98A5A", season: "all", formality: "smart", audience: "woman", tier: 2, image: "/catalog/real/ballet-flats.jpg" },
  { name: "עקבים", category: "shoes", color: "חום", colorHex: "#6B4423", season: "all", formality: "formal", audience: "woman", tier: 2, image: "/catalog/real/heels.jpg" },
  { name: "סנדלים", category: "shoes", color: "חום", colorHex: "#5A3A2A", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/sandals.jpg" },
  { name: "מגפיים גבוהים", category: "shoes", color: "מאובק", colorHex: "#B08A86", season: "winter", formality: "smart", audience: "woman", tier: 3, styles: ["street", "elegant"], image: "/catalog/real/boots.jpg" },
  // ── Bags ───────────────────────────────────────────────────────────
  { name: "תיק ג׳ינס", category: "bag", color: "כחול ג׳ינס", colorHex: "#6E8FC0", season: "all", formality: "casual", audience: "woman", tier: 1, image: "/catalog/real/tote-bag.jpg" },
  { name: "תיק צבעוני", category: "bag", color: "צבעוני", colorHex: "#C99AA0", season: "summer", formality: "casual", audience: "woman", tier: 2, image: "/catalog/real/crossbody-bag.jpg" },
  { name: "קלאץ׳ זהב", category: "bag", color: "זהב", colorHex: "#B8860B", season: "all", formality: "formal", audience: "woman", tier: 3, styles: ["elegant"], image: "/catalog/real/clutch.jpg" },
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
