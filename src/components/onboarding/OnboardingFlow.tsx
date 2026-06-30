import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Check, ImagePlus, Loader2, MapPin, Shirt, Sparkles, X,
} from "lucide-react";
import { useWardrobe } from "../../contexts/WardrobeContext";
import { analyzeStyle } from "../../lib/claude";
import { fileToDownscaledDataUrl } from "../../lib/image";
import { buildSeedCandidates, type SeedCandidate } from "../../lib/onboarding-catalog";
import { saveProfile, markOnboarded } from "../../lib/profile";
import { geolocate } from "../../lib/weather";
import { newId } from "../../lib/utils";
import type {
  AgeRange, ClothingCategory, StylePref, UserProfile, WardrobeFor,
} from "../../types";

// ─────────────────────────────────────────────────────────
// Onboarding — the cold-start game.
// One question per screen, fast taps, then the AI guesses the wardrobe and
// the user confirms with single taps. Goal: 5–7 real items in the first
// minute, so the closet is alive before any manual typing.
// ─────────────────────────────────────────────────────────

type Step = "welcome" | "who" | "age" | "location" | "styles" | "photos" | "analyzing" | "pick";

const STEP_ORDER: Step[] = ["welcome", "who", "age", "location", "styles", "photos", "analyzing", "pick"];

const WHO_OPTIONS: { value: WardrobeFor; label: string; emoji: string }[] = [
  { value: "woman", label: "ארון של אישה", emoji: "👗" },
  { value: "man", label: "ארון של גבר", emoji: "👔" },
  { value: "mixed", label: "קצת מהכל", emoji: "👫" },
];

const AGE_OPTIONS: { value: AgeRange; label: string; emoji: string }[] = [
  { value: "under20", label: "עד 20", emoji: "✨" },
  { value: "20s", label: "20–29", emoji: "🌿" },
  { value: "30s", label: "30–39", emoji: "🥂" },
  { value: "40plus", label: "40+", emoji: "🕊️" },
];

const STYLE_OPTIONS: { value: StylePref; label: string; hint: string }[] = [
  { value: "casual", label: "קז׳ואל", hint: "ג׳ינס וטישרט זה הבית" },
  { value: "elegant", label: "אלגנטי", hint: "מחויט, מוקפד" },
  { value: "sporty", label: "ספורטיבי", hint: "בגדי ספורט גם ביומיום" },
  { value: "minimal", label: "מינימליסטי", hint: "צבעים שקטים, קווים נקיים" },
  { value: "romantic", label: "רומנטי", hint: "פרחוני, רך, נשי" },
  { value: "street", label: "אורבני", hint: "סטריטוור, אוברסייז" },
];

const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  top: "חולצות וסריגים",
  bottom: "מכנסיים וחצאיות",
  dress: "שמלות",
  outerwear: "מעילים וז׳קטים",
  shoes: "נעליים",
  socks: "גרביים",
  underwear: "הלבשה תחתונה",
  accessory: "אקססוריז",
  bag: "תיקים",
};

const CATEGORY_ORDER: ClothingCategory[] = [
  "top", "bottom", "dress", "outerwear", "shoes", "bag", "accessory", "socks", "underwear",
];

const MIN_ANALYZE_MS = 1400; // let the analysis moment breathe

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { add } = useWardrobe();

  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [who, setWho] = useState<WardrobeFor | null>(null);
  const [age, setAge] = useState<AgeRange | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [styles, setStyles] = useState<StylePref[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<SeedCandidate[]>([]);
  const [aiHits, setAiHits] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const stepIndex = STEP_ORDER.indexOf(step);
  const next = useCallback(
    () => setStep((s) => STEP_ORDER[Math.min(STEP_ORDER.indexOf(s) + 1, STEP_ORDER.length - 1)]),
    []
  );
  const back = useCallback(
    () => setStep((s) => STEP_ORDER[Math.max(STEP_ORDER.indexOf(s) - 1, 0)]),
    []
  );

  // single-choice steps advance on their own — keeps the game pace
  const pickAndGo = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setTimeout(next, 240);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls = await Promise.all(
      Array.from(files)
        .slice(0, 12 - photos.length)
        .map((f) => fileToDownscaledDataUrl(f).catch(() => null))
    );
    setPhotos((prev) => [...prev, ...urls.filter((u): u is string => !!u)]);
  };

  const runAnalysis = useCallback(async () => {
    setStep("analyzing");
    const startedAt = Date.now();
    const profile = { wardrobeFor: who ?? "mixed", styles };
    let ai: SeedCandidate[] = [];
    if (photos.length > 0) {
      try {
        ai = await analyzeStyle({
          wardrobeFor: profile.wardrobeFor,
          ageRange: age ?? "20s",
          styles,
          images: photos.slice(0, 6),
        });
      } catch {
        ai = []; // offline / API down → catalog guesses still carry the flow
      }
    }
    const list = buildSeedCandidates(profile, ai);
    const wait = Math.max(0, MIN_ANALYZE_MS - (Date.now() - startedAt));
    setTimeout(() => {
      setAiHits(ai.length);
      setCandidates(list);
      setSelected(new Set());
      setStep("pick");
    }, wait);
  }, [who, styles, photos, age]);

  const toggleCandidate = (i: number) =>
    setSelected((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(i)) nxt.delete(i);
      else nxt.add(i);
      return nxt;
    });

  const finish = useCallback(() => {
    const now = Date.now();
    [...selected].forEach((i, k) => {
      const c = candidates[i];
      add({
        ...c,
        imageUrl: c.image, // real product flat-lay, when we have one
        id: newId("item"),
        createdAt: now - k, // keep stable ordering
        source: "onboarding",
      });
    });
    const profile: UserProfile = {
      name: name.trim() || undefined,
      wardrobeFor: who ?? "mixed",
      ageRange: age ?? "20s",
      styles,
      city: city ?? undefined,
      outfitPhotoCount: photos.length,
      createdAt: now,
    };
    saveProfile(profile);
    markOnboarded();
    onComplete();
  }, [selected, candidates, add, name, who, age, styles, city, photos.length, onComplete]);

  const grouped = useMemo(() => {
    const map = new Map<ClothingCategory, { c: SeedCandidate; i: number }[]>();
    candidates.forEach((c, i) => {
      const arr = map.get(c.category) ?? [];
      arr.push({ c, i });
      map.set(c.category, arr);
    });
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      cat,
      items: map.get(cat)!,
    }));
  }, [candidates]);

  return (
    // Same centered phone-frame as AppShell — onboarding is never full-bleed on desktop
    <div className="min-h-[100dvh] w-full flex justify-center" style={{ background: "#1e1b18" }}>
      <div
        className="relative w-full max-w-[440px] min-h-[100dvh] flex flex-col shadow-2xl overflow-hidden"
        dir="rtl"
        style={{
          background:
            "radial-gradient(120% 80% at 78% 12%, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0) 42%), radial-gradient(110% 70% at 15% 92%, rgba(92,62,34,0.10) 0%, rgba(92,62,34,0) 50%), linear-gradient(180deg, #FAF6EE 0%, #F5EFE6 55%, #EFE6D6 100%)",
        }}
      >
        {/* subtle grain so the warm surface has texture, not flat color */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 flex flex-1 flex-col">
      {/* progress + back */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        {stepIndex > 0 && step !== "analyzing" ? (
          <button
            type="button"
            onClick={back}
            className="p-1 text-walnut-400 hover:text-ebony transition"
            aria-label="חזרה"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-7" />
        )}
        <div className="flex gap-1.5" aria-hidden>
          {STEP_ORDER.slice(0, 6).map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= Math.min(stepIndex, 5) ? "w-5 bg-brass" : "w-1.5 bg-parchment-dark"
              }`}
            />
          ))}
        </div>
        <span className="w-7" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex-1 flex flex-col px-6 pb-8"
        >
          {/* ── Welcome + name ───────────────────────────── */}
          {step === "welcome" && (
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="w-14 h-14 rounded-md bg-ebony flex items-center justify-center mb-6">
                <Shirt className="h-7 w-7 text-brass" strokeWidth={1.6} />
              </div>
              <h1 className="font-display text-3xl text-ebony mb-2">בואי נכיר</h1>
              <p className="font-editorial italic text-walnut-400 text-base mb-8">
                שתי דקות — ויש לך ארון חכם שיודע מה ללבוש
              </p>
              <label className="block text-xs text-walnut-400 mb-2" htmlFor="ob-name">
                איך קוראים לך?
              </label>
              <input
                id="ob-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="השם שלך"
                className="w-full rounded-sm border border-parchment-dark bg-parchment-light px-4 py-3.5 text-ebony placeholder:text-walnut-200 focus:outline-none focus:border-brass mb-6"
              />
              <button type="button" onClick={next} className="brass-plate rounded-sm py-3.5 text-sm font-semibold">
                {name.trim() ? `נעים להכיר, ${name.trim()} ←` : "מתחילים ←"}
              </button>
            </div>
          )}

          {/* ── Who is the wardrobe for ──────────────────── */}
          {step === "who" && (
            <StepShell title="בשביל מי הארון?" subtitle="כדי שננחש נכון מה יש בו">
              {WHO_OPTIONS.map((o) => (
                <ChoiceCard
                  key={o.value}
                  label={o.label}
                  emoji={o.emoji}
                  active={who === o.value}
                  onClick={() => pickAndGo(setWho)(o.value)}
                />
              ))}
            </StepShell>
          )}

          {/* ── Age ──────────────────────────────────────── */}
          {step === "age" && (
            <StepShell title="בת כמה את?" subtitle="ההמלצות מתאימות את עצמן">
              {AGE_OPTIONS.map((o) => (
                <ChoiceCard
                  key={o.value}
                  label={o.label}
                  emoji={o.emoji}
                  active={age === o.value}
                  onClick={() => pickAndGo(setAge)(o.value)}
                />
              ))}
            </StepShell>
          )}

          {/* ── Location ─────────────────────────────────── */}
          {step === "location" && (
            <StepShell
              title="איפה את גרה?"
              subtitle="מזג האוויר אצלך קובע מה נלבש — בלי להקליד כלום"
            >
              <button
                type="button"
                disabled={locating}
                onClick={async () => {
                  setLocating(true);
                  try {
                    const loc = await geolocate();
                    setCity(loc.city);
                    setTimeout(next, 600);
                  } catch {
                    setCity(null);
                  } finally {
                    setLocating(false);
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-sm border border-brass/50 bg-parchment-light py-4 text-sm font-medium text-ebony transition active:scale-[0.98]"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brass" />
                ) : (
                  <MapPin className="h-4 w-4 text-brass" />
                )}
                {city ? `מצאנו: ${city} ✓` : locating ? "מאתרת…" : "אשרי גישה למיקום"}
              </button>
              <button
                type="button"
                onClick={next}
                className="py-3 text-sm text-walnut-400 hover:text-ebony transition"
              >
                דלגי בינתיים
              </button>
            </StepShell>
          )}

          {/* ── Styles ───────────────────────────────────── */}
          {step === "styles" && (
            <StepShell title="מה הסטייל שלך?" subtitle="אפשר לבחור כמה">
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.map((o) => {
                  const active = styles.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() =>
                        setStyles((prev) =>
                          active ? prev.filter((s) => s !== o.value) : [...prev, o.value]
                        )
                      }
                      className={`rounded-sm border px-3 py-4 text-right transition active:scale-[0.97] ${
                        active
                          ? "border-brass bg-parchment-light shadow-brass"
                          : "border-parchment-dark bg-parchment-light"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-ebony mb-0.5">
                        {active ? "✓ " : ""}
                        {o.label}
                      </span>
                      <span className="block text-[11px] text-walnut-400 leading-snug">{o.hint}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={next}
                disabled={styles.length === 0}
                className="brass-plate rounded-sm py-3.5 text-sm font-semibold disabled:opacity-40 mt-2"
              >
                המשיכי ←
              </button>
            </StepShell>
          )}

          {/* ── Outfit photos ────────────────────────────── */}
          {step === "photos" && (
            <StepShell
              title="העלי תמונות של לוקים שלך"
              subtitle="מסיבה, חתונה, יומיום — כמה שיותר, ככה ה-AI מכיר אותך יותר טוב"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-sm">
                      <img src={p} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 left-1 frost-dark rounded-full p-1"
                        aria-label="הסירי תמונה"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-sm border-2 border-dashed border-walnut-200 hover:border-brass transition py-8 flex flex-col items-center gap-2 text-walnut-400"
              >
                <ImagePlus className="h-8 w-8" strokeWidth={1.4} />
                <span className="text-sm">
                  {photos.length ? `הוסיפי עוד (${photos.length} הועלו)` : "בחרי תמונות מהגלריה"}
                </span>
              </button>
              <button
                type="button"
                onClick={runAnalysis}
                className="brass-plate rounded-sm py-3.5 text-sm font-semibold"
              >
                {photos.length > 0 ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    נתחי את הסטייל שלי
                  </span>
                ) : (
                  "המשיכי בלי תמונות ←"
                )}
              </button>
            </StepShell>
          )}

          {/* ── Analyzing ────────────────────────────────── */}
          {step === "analyzing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-brass" strokeWidth={1.5} />
                <Sparkles className="absolute -top-1 -left-2 h-4 w-4 text-brass-light" />
              </div>
              <p className="font-display text-xl text-ebony">
                {photos.length > 0 ? "לומדת את הסטייל שלך…" : "מכינה את הארון שלך…"}
              </p>
              <p className="font-editorial italic text-sm text-walnut-400 max-w-[240px]">
                מנחשת מה כבר תלוי אצלך בארון — תכף רק תסמני מה נכון
              </p>
            </div>
          )}

          {/* ── Pick what you own ────────────────────────── */}
          {step === "pick" && (
            <div className="flex-1 flex flex-col">
              <h2 className="font-display text-2xl text-ebony mb-1">סמני מה יש לך</h2>
              <p className="font-editorial italic text-sm text-walnut-400 mb-4">
                {aiHits > 0
                  ? `מהתמונות שלך זיהינו ${aiHits} פריטים — הם ראשונים ברשימה`
                  : "אלה פריטים שכנראה יש לך — הקלקה אחת וזה בארון"}
              </p>
              <div className="flex-1 overflow-y-auto -mx-1 px-1 pb-28">
                {grouped.map(({ cat, items }) => (
                  <div key={cat} className="mb-5">
                    <p className="text-[11px] font-medium tracking-[0.18em] text-walnut-400 mb-2">
                      {CATEGORY_LABEL[cat]}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {items.map(({ c, i }) => {
                        const on = selected.has(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleCandidate(i)}
                            aria-pressed={on}
                            className={`group relative aspect-[3/4] overflow-hidden rounded-lg border text-right transition active:scale-[0.97] ${
                              on ? "border-brass ring-2 ring-brass" : "border-parchment-dark"
                            }`}
                          >
                            {c.image ? (
                              <img
                                src={c.image}
                                alt={c.name}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <span className="absolute inset-0" style={{ background: c.colorHex }} aria-hidden />
                            )}
                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-2 pt-6 pb-1.5 text-[11px] font-medium leading-tight text-white">
                              {c.name}
                            </span>
                            {on ? (
                              <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brass text-ebony shadow">
                                <Check className="h-4 w-4" strokeWidth={2.5} />
                              </span>
                            ) : (
                              <span className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" aria-hidden />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {/* sticky counter + CTA */}
              <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-parchment border-t border-parchment-dark px-6 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-display text-lg text-ebony leading-none">{selected.size}</p>
                  <p className="text-[11px] text-walnut-400">פריטים בארון</p>
                </div>
                <button
                  type="button"
                  onClick={finish}
                  className="brass-plate rounded-sm px-6 py-3 text-sm font-semibold disabled:opacity-40"
                  disabled={selected.size === 0}
                >
                  לארון שלי ←
                </button>
                <button
                  type="button"
                  onClick={finish}
                  className="text-xs text-walnut-400 hover:text-ebony transition"
                >
                  דלגי
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

// ── Small shared pieces ──────────────────────────────────

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
      <h2 className="font-display text-2xl text-ebony mb-1.5">{title}</h2>
      <p className="font-editorial italic text-sm text-walnut-400 mb-7">{subtitle}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function ChoiceCard({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-4 text-right transition-all duration-200 active:scale-[0.98] ${
        active
          ? "border-brass bg-parchment-light shadow-[0_6px_18px_-8px_rgba(60,40,20,0.35)]"
          : "border-parchment-dark bg-parchment-light/70 hover:border-brass/50 hover:bg-parchment-light hover:shadow-[0_4px_14px_-8px_rgba(60,40,20,0.25)]"
      }`}
    >
      {emoji && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-colors ${
            active ? "bg-brass/20" : "bg-parchment-dark/50"
          }`}
        >
          {emoji}
        </span>
      )}
      <span className="flex-1 text-base font-medium text-ebony">{label}</span>
      {active ? (
        <Check className="h-5 w-5 text-brass-deep" strokeWidth={2.2} />
      ) : (
        <ArrowRight className="h-4 w-4 text-walnut-300 transition-transform group-hover:-translate-x-0.5" />
      )}
    </button>
  );
}
