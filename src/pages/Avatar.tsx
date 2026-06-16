import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, UserRound, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import WeatherStrip from "../components/today/WeatherStrip";
import OccasionPicker from "../components/today/OccasionPicker";
import { useWardrobe } from "../contexts/WardrobeContext";
import type { ClothingCategory, ClothingItem, Occasion, Outfit, WeatherSnapshot } from "../types";
import { CATEGORY_LABEL } from "../lib/constants";
import { fetchWeather } from "../lib/weather";
import { suggestOutfit, generateAvatar } from "../lib/claude";
import { pickOutfitOffline } from "../lib/outfit-rules";
import { loadProfile } from "../lib/profile";

const SELFIE_KEY = "avatar_selfie_url";
const RESULT_KEY = "avatar_result_url";

const VALID_OCCASIONS: Occasion[] = ["work", "evening", "casual", "sport"];

// Default occasion from the onboarding profile, falling back to "casual".
function defaultOccasion(): Occasion {
  const first = loadProfile()?.occasions?.find((o): o is Occasion =>
    VALID_OCCASIONS.includes(o as Occasion)
  );
  return first ?? "casual";
}

export default function Avatar() {
  const { items } = useWardrobe();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selfieUrl, setSelfieUrl] = useState<string | null>(() => localStorage.getItem(SELFIE_KEY));
  const [resultUrl, setResultUrl] = useState<string | null>(() => localStorage.getItem(RESULT_KEY));
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve the suggested outfit's IDs to actual wardrobe items.
  const look = useMemo<ClothingItem[]>(
    () =>
      outfit
        ? (outfit.itemIds.map((id) => items.find((it) => it.id === id)).filter(Boolean) as ClothingItem[])
        : [],
    [outfit, items]
  );

  useEffect(() => {
    if (selfieUrl) localStorage.setItem(SELFIE_KEY, selfieUrl);
    else localStorage.removeItem(SELFIE_KEY);
  }, [selfieUrl]);

  useEffect(() => {
    if (resultUrl) localStorage.setItem(RESULT_KEY, resultUrl);
    else localStorage.removeItem(RESULT_KEY);
  }, [resultUrl]);

  // Weather on mount.
  useEffect(() => {
    let alive = true;
    fetchWeather().then((w) => { if (alive) setWeather(w); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Ask the AI for a look (offline fallback). Clears any stale render.
  const suggest = useCallback(
    async (occ: Occasion) => {
      if (!weather || items.length === 0) return;
      setSuggesting(true);
      setError(null);
      try {
        const result = await suggestOutfit({ weather, occasion: occ, when: "now", wardrobe: items });
        setOutfit(result);
      } catch {
        setOutfit(pickOutfitOffline(items, weather, occ, "now"));
      } finally {
        setSuggesting(false);
        setResultUrl(null);
      }
    },
    [weather, items]
  );

  // First suggestion once weather + wardrobe are ready.
  useEffect(() => {
    if (weather && items.length > 0 && !outfit && !occasion) {
      const occ = defaultOccasion();
      setOccasion(occ);
      suggest(occ);
    }
  }, [weather, items, outfit, occasion, suggest]);

  function handleOccasion(occ: Occasion) {
    setOccasion(occ);
    suggest(occ);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfieUrl(reader.result as string);
      setResultUrl(null);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleDressMe() {
    if (!selfieUrl || look.length === 0 || rendering) return;
    setRendering(true);
    setError(null);
    try {
      const url = await generateAvatar(
        selfieUrl,
        look.map((it) => ({
          name: it.name,
          category: it.category,
          color: it.color,
          colorHex: it.colorHex,
          material: it.material,
        }))
      );
      setResultUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש — נסי שוב");
    } finally {
      setRendering(false);
    }
  }

  const canDress = !!selfieUrl && look.length > 0 && !suggesting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] pb-28 flex flex-col"
      dir="rtl"
    >
      <div className="px-6 pt-8 pb-3">
        <h1 className="font-editorial italic text-2xl text-walnut-700">הבובה שלי</h1>
        <p className="text-sm text-walnut-400 mt-0.5">לוק מותאם למזג האוויר — עלייך, באמת</p>
      </div>

      <WeatherStrip weather={weather} loading={!weather} />
      <div className="pt-2">
        <OccasionPicker value={occasion} onChange={handleOccasion} />
      </div>

      {/* Stage */}
      <div className="flex flex-col items-center px-6 gap-4 mt-3">
        <div
          className="relative w-64 h-[22rem] rounded-2xl overflow-hidden border-2 border-brass/30 shadow-md bg-parchment-light"
          onClick={() => !resultUrl && fileRef.current?.click()}
          role={resultUrl ? undefined : "button"}
        >
          <AnimatePresence mode="wait">
            {resultUrl ? (
              <motion.img key="result" src={resultUrl} alt="את לובשת את הלוק"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full object-cover" />
            ) : selfieUrl ? (
              <motion.img key="selfie" src={selfieUrl} alt="הסלפי שלך"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full object-cover" />
            ) : (
              <motion.div key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center gap-3 text-walnut-300 cursor-pointer">
                <UserRound className="h-16 w-16" strokeWidth={1} />
                <p className="font-editorial italic text-base text-walnut-400">הוסיפי סלפי</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {rendering && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-ebony/55 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-parchment">
                <Sparkles className="h-7 w-7 animate-pulse" strokeWidth={1.6} />
                <p className="font-editorial italic text-sm">מלבישה אותך…</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            className="absolute bottom-3 left-3 bg-parchment/90 backdrop-blur-sm border border-brass/20 rounded-full p-2 shadow"
            aria-label="החליפי סלפי"
          >
            <Camera className="h-4 w-4 text-walnut-500" strokeWidth={1.6} />
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />

        <button
          type="button"
          onClick={handleDressMe}
          disabled={!canDress || rendering}
          className="w-64 flex items-center justify-center gap-2 bg-ebony text-parchment rounded-sm py-3.5 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
        >
          {resultUrl
            ? (<><RefreshCw className="h-4 w-4" strokeWidth={1.8} /> לוק אחר</>)
            : (<><Sparkles className="h-4 w-4" strokeWidth={1.8} /> לבשי עליי</>)}
        </button>

        {!selfieUrl && <p className="text-xs text-walnut-400">קודם העלי סלפי</p>}
        {selfieUrl && items.length === 0 && (
          <p className="text-xs text-walnut-400">הארון ריק — הוסיפי בגדים כדי לבנות לוק</p>
        )}
        {selfieUrl && items.length > 0 && !occasion && (
          <p className="text-xs text-walnut-400">בחרי לאן את הולכת ואצפה לך לוק</p>
        )}

        {error && (
          <div className="w-64 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
            <span className="leading-tight">{error}</span>
          </div>
        )}
      </div>

      {/* The look being worn */}
      {(look.length > 0 || suggesting) && (
        <div className="mt-8 px-6 flex flex-col gap-3">
          <h2 className="font-display text-base text-walnut-700">
            הלוק
            <span className="text-xs font-sans text-walnut-300 mr-2">
              {suggesting ? "בוחרת לך…" : "מהארון שלך"}
            </span>
          </h2>
          {outfit?.explanation && !suggesting && (
            <p className="font-editorial italic text-sm text-walnut-500 leading-relaxed">{outfit.explanation}</p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {look.map((item) => (
              <OutfitSlot key={item.id} category={item.category} item={item} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function OutfitSlot({ category, item }: { category: ClothingCategory; item: ClothingItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="aspect-square rounded-xl overflow-hidden bg-parchment-light border border-brass/15 shadow-sm">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: item.colorHex ?? "#e8dfc8" }}>
            <span className="text-2xl opacity-40">{CATEGORY_LABEL[category]?.charAt(0) ?? "?"}</span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-walnut-400 text-center leading-tight">{item.name || CATEGORY_LABEL[category]}</p>
    </div>
  );
}
