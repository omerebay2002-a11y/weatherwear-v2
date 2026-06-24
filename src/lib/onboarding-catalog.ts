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
  // ── Tier 1 — the universal base almost everyone owns ──────────────
  { name: "טישרט לבנה", category: "top", color: "לבן", colorHex: "#F5F5F0", season: "all", formality: "casual", audience: "all", tier: 1, image: "/catalog/white-tee.png" },
  { name: "טישרט שחורה", category: "top", color: "שחור", colorHex: "#1C1C1C", season: "all", formality: "casual", audience: "all", tier: 1, image: "/catalog/black-tee.png" },
  { name: "טישרט אפורה", category: "top", color: "אפור", colorHex: "#9A9A9A", season: "all", formality: "casual", audience: "all", tier: 1 },
  { name: "ג׳ינס כחול", category: "bottom", color: "כחול ג׳ינס", colorHex: "#3B5998", season: "all", formality: "casual", audience: "all", tier: 1, image: "/catalog/blue-jeans.png" },
  { name: "ג׳ינס שחור", category: "bottom", color: "שחור", colorHex: "#23232B", season: "all", formality: "casual", audience: "all", tier: 1 },
  { name: "מכנסי טרנינג", category: "bottom", color: "אפור", colorHex: "#7D7D7D", season: "all", formality: "sport", audience: "all", tier: 1 },
  { name: "הודי", category: "top", color: "שחור", colorHex: "#222226", season: "winter", formality: "casual", audience: "all", tier: 1 },
  { name: "סוודר חם", category: "top", color: "בז׳", colorHex: "#C9B796", season: "winter", formality: "casual", audience: "all", tier: 1, image: "/catalog/beige-sweater.png" },
  { name: "חולצה מכופתרת לבנה", category: "top", color: "לבן", colorHex: "#FAFAF5", season: "all", formality: "smart", audience: "all", tier: 1, image: "/catalog/white-shirt.png" },
  { name: "ז׳קט ג׳ינס", category: "outerwear", color: "כחול ג׳ינס", colorHex: "#4A6A9D", season: "all", formality: "casual", audience: "all", tier: 1 },
  { name: "מעיל חורף", category: "outerwear", color: "שחור", colorHex: "#1E1E22", season: "winter", formality: "casual", audience: "all", tier: 1 },
  { name: "סניקרס לבנות", category: "shoes", color: "לבן", colorHex: "#F2F0EA", season: "all", formality: "casual", audience: "all", tier: 1 },
  { name: "סניקרס שחורות", category: "shoes", color: "שחור", colorHex: "#202024", season: "all", formality: "casual", audience: "all", tier: 1 },
  { name: "כפכפים", category: "shoes", color: "שחור", colorHex: "#2B2B2B", season: "summer", formality: "casual", audience: "all", tier: 1 },
  { name: "גרביים לבנות", category: "socks", color: "לבן", colorHex: "#F5F5F0", season: "all", audience: "all", tier: 1 },
  { name: "גרביים שחורות", category: "socks", color: "שחור", colorHex: "#1C1C1C", season: "all", audience: "all", tier: 1 },
  { name: "חגורה שחורה", category: "accessory", color: "שחור", colorHex: "#191919", season: "all", audience: "all", tier: 1 },
  { name: "משקפי שמש", category: "accessory", color: "שחור", colorHex: "#141414", season: "summer", audience: "all", tier: 1 },
  { name: "כובע מצחייה", category: "accessory", color: "שחור", colorHex: "#26262A", season: "summer", formality: "casual", audience: "all", tier: 1 },
  { name: "תיק גב", category: "bag", color: "שחור", colorHex: "#212125", season: "all", audience: "all", tier: 1 },

  // ── Tier 2 — very common ───────────────────────────────────────────
  { name: "שורט ג׳ינס", category: "bottom", color: "כחול ג׳ינס", colorHex: "#5577AA", season: "summer", formality: "casual", audience: "all", tier: 2 },
  { name: "שורט טרנינג", category: "bottom", color: "שחור", colorHex: "#26262A", season: "summer", formality: "sport", audience: "all", tier: 2 },
  { name: "גופייה לבנה", category: "top", color: "לבן", colorHex: "#FAFAF5", season: "summer", formality: "casual", audience: "all", tier: 2 },
  { name: "סווטשירט", category: "top", color: "אפור", colorHex: "#8E8E92", season: "winter", formality: "casual", audience: "all", tier: 2 },
  { name: "טישרט כחולה", category: "top", color: "כחול נייבי", colorHex: "#27374D", season: "all", formality: "casual", audience: "all", tier: 2 },
  { name: "מכנס בד שחור", category: "bottom", color: "שחור", colorHex: "#1F1F23", season: "all", formality: "smart", audience: "all", tier: 2 },
  { name: "נעלי ספורט לאימון", category: "shoes", color: "אפור", colorHex: "#88888C", season: "all", formality: "sport", audience: "all", tier: 2 },
  { name: "גרבי ספורט", category: "socks", color: "לבן", colorHex: "#F0F0EA", season: "all", formality: "sport", audience: "all", tier: 2 },
  { name: "מעיל גשם", category: "outerwear", color: "כחול נייבי", colorHex: "#2C3A55", season: "winter", audience: "all", tier: 2 },
  { name: "צעיף", category: "accessory", color: "אפור", colorHex: "#9A9A9E", season: "winter", audience: "all", tier: 2 },
  { name: "כובע צמר", category: "accessory", color: "שחור", colorHex: "#26262A", season: "winter", audience: "all", tier: 2 },

  // ── Women ──────────────────────────────────────────────────────────
  { name: "שמלה שחורה", category: "dress", color: "שחור", colorHex: "#1A1A1E", season: "all", formality: "formal", audience: "woman", tier: 1 },
  { name: "שמלת קיץ פרחונית", category: "dress", color: "פרחוני", colorHex: "#D98A9C", season: "summer", formality: "casual", audience: "woman", tier: 2 },
  { name: "חצאית ג׳ינס", category: "bottom", color: "כחול ג׳ינס", colorHex: "#4A6A9D", season: "summer", formality: "casual", audience: "woman", tier: 2 },
  { name: "חצאית מידי", category: "bottom", color: "שחור", colorHex: "#222226", season: "all", formality: "smart", audience: "woman", tier: 2 },
  { name: "טייץ שחור", category: "bottom", color: "שחור", colorHex: "#1C1C20", season: "all", formality: "sport", audience: "woman", tier: 1 },
  { name: "גוף שחור", category: "top", color: "שחור", colorHex: "#1E1E22", season: "all", formality: "smart", audience: "woman", tier: 2 },
  { name: "חולצת סאטן", category: "top", color: "שמנת", colorHex: "#EFE3CE", season: "all", formality: "smart", audience: "woman", tier: 2 },
  { name: "קרדיגן", category: "top", color: "בז׳", colorHex: "#C9B796", season: "winter", formality: "casual", audience: "woman", tier: 2 },
  { name: "בלייזר", category: "outerwear", color: "שחור", colorHex: "#222226", season: "all", formality: "formal", audience: "woman", tier: 2 },
  { name: "מגפיים שחורים", category: "shoes", color: "שחור", colorHex: "#1A1A1E", season: "winter", formality: "smart", audience: "woman", tier: 2 },
  { name: "נעלי עקב שחורות", category: "shoes", color: "שחור", colorHex: "#18181C", season: "all", formality: "formal", audience: "woman", tier: 2 },
  { name: "סנדלים", category: "shoes", color: "חום", colorHex: "#8A5A33", season: "summer", formality: "casual", audience: "woman", tier: 2 },
  { name: "תיק צד", category: "bag", color: "שחור", colorHex: "#1E1E22", season: "all", audience: "woman", tier: 1 },
  { name: "עגילים עדינים", category: "accessory", color: "זהב", colorHex: "#C9A84C", season: "all", audience: "woman", tier: 2 },
  { name: "שרשרת זהב עדינה", category: "accessory", color: "זהב", colorHex: "#C9A84C", season: "all", audience: "woman", tier: 2 },
  { name: "חזיות בסיסיות", category: "underwear", color: "שחור / גוף", colorHex: "#5C4A3D", season: "all", audience: "woman", tier: 1 },

  // ── Men ────────────────────────────────────────────────────────────
  { name: "חולצת פולו", category: "top", color: "כחול נייבי", colorHex: "#27374D", season: "all", formality: "smart", audience: "man", tier: 2 },
  { name: "מכנס צ׳ינו בז׳", category: "bottom", color: "בז׳", colorHex: "#C8B08A", season: "all", formality: "smart", audience: "man", tier: 2 },
  { name: "חולצה מכופתרת תכלת", category: "top", color: "תכלת", colorHex: "#A8C4E0", season: "all", formality: "smart", audience: "man", tier: 2 },
  { name: "מכנס מחויט", category: "bottom", color: "אפור כהה", colorHex: "#4A4A50", season: "all", formality: "formal", audience: "man", tier: 2 },
  { name: "נעלי עור", category: "shoes", color: "חום", colorHex: "#6B4423", season: "all", formality: "formal", audience: "man", tier: 2 },
  { name: "שעון", category: "accessory", color: "כסף", colorHex: "#B0B0B5", season: "all", audience: "man", tier: 2 },
  { name: "בוקסרים", category: "underwear", color: "מעורב", colorHex: "#445566", season: "all", audience: "man", tier: 1 },

  // ── Tier 3 — style-dependent extras ────────────────────────────────
  { name: "טופ ספורט", category: "top", color: "שחור", colorHex: "#202024", season: "all", formality: "sport", audience: "woman", tier: 3, styles: ["sporty"] },
  { name: "מכנסי ריצה", category: "bottom", color: "שחור", colorHex: "#1E1E22", season: "all", formality: "sport", audience: "all", tier: 3, styles: ["sporty"] },
  { name: "נעלי ריצה", category: "shoes", color: "צבעוני", colorHex: "#E05A33", season: "all", formality: "sport", audience: "all", tier: 3, styles: ["sporty"] },
  { name: "חולצת אימון מנדפת", category: "top", color: "אפור", colorHex: "#7D7D82", season: "all", formality: "sport", audience: "all", tier: 3, styles: ["sporty"] },
  { name: "מכנסי קרגו", category: "bottom", color: "ירוק זית", colorHex: "#6B6B4A", season: "all", formality: "casual", audience: "all", tier: 3, styles: ["street"] },
  { name: "הודי אוברסייז", category: "top", color: "אפור בהיר", colorHex: "#B5B5B8", season: "winter", formality: "casual", audience: "all", tier: 3, styles: ["street"] },
  { name: "סניקרס צבעוניות", category: "shoes", color: "צבעוני", colorHex: "#CC4444", season: "all", formality: "casual", audience: "all", tier: 3, styles: ["street"] },
  { name: "חליפה כהה", category: "outerwear", color: "כחול כהה", colorHex: "#1E2A3D", season: "all", formality: "formal", audience: "man", tier: 3, styles: ["elegant"] },
  { name: "עניבה", category: "accessory", color: "כחול כהה", colorHex: "#2A3A55", season: "all", formality: "formal", audience: "man", tier: 3, styles: ["elegant"] },
  { name: "שמלת ערב", category: "dress", color: "בורדו", colorHex: "#6E1F33", season: "all", formality: "formal", audience: "woman", tier: 3, styles: ["elegant", "romantic"] },
  { name: "חצאית פליסה", category: "bottom", color: "ורוד עתיק", colorHex: "#C99AA0", season: "all", formality: "smart", audience: "woman", tier: 3, styles: ["romantic"] },
  { name: "חולצת תחרה", category: "top", color: "לבן", colorHex: "#F7F3EC", season: "all", formality: "smart", audience: "woman", tier: 3, styles: ["romantic"] },
  { name: "מכנס רחב בז׳", category: "bottom", color: "בז׳", colorHex: "#CFBC9B", season: "all", formality: "smart", audience: "woman", tier: 3, styles: ["minimal", "elegant"] },
  { name: "טישרט אוף-ווייט", category: "top", color: "אוף-ווייט", colorHex: "#EDE8DD", season: "all", formality: "casual", audience: "all", tier: 3, styles: ["minimal"] },
  { name: "סוודר גולף שחור", category: "top", color: "שחור", colorHex: "#1C1C20", season: "winter", formality: "smart", audience: "all", tier: 3, styles: ["minimal", "elegant"] },
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
