import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import WeatherStrip from "../components/today/WeatherStrip";
import WhenPicker from "../components/today/WhenPicker";
import OccasionPicker from "../components/today/OccasionPicker";
import OutfitCard from "../components/today/OutfitCard";
import BridgeVisual from "../components/today/BridgeVisual";
import StylistChat from "../components/today/StylistChat";
import { fetchWeather } from "../lib/weather";
import { suggestOutfit } from "../lib/claude";
import { pickOutfitOffline } from "../lib/outfit-rules";
import { useWardrobe } from "../contexts/WardrobeContext";
import { useToast } from "../components/ui/Toast";
import type { Occasion, Outfit, WeatherSnapshot, WhenChoice } from "../types";

const AUTO_THRESHOLD = 10;

export default function Today() {
  const { items } = useWardrobe();
  const { push } = useToast();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [when, setWhen] = useState<WhenChoice>("now");
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const isAutoMode = items.length >= AUTO_THRESHOLD;
  const isEmpty = items.length === 0;

  const outfitItems = outfit
    ? (outfit.itemIds
        .map((id) => items.find((it) => it.id === id))
        .filter(Boolean) as typeof items)
    : [];

  useEffect(() => {
    let alive = true;
    fetchWeather()
      .then((w) => { if (alive) setWeather(w); })
      .catch(() => push("לא הצלחנו לקבל מזג אוויר — בדקי הרשאות מיקום", "⚠️"));
    return () => { alive = false; };
  }, [push]);

  const generate = useCallback(
    async (occ: Occasion) => {
      if (!weather) return;
      setLoading(true);
      try {
        const result = await suggestOutfit({ weather, occasion: occ, when, wardrobe: items });
        setOutfit(result);
      } catch {
        const offline = pickOutfitOffline(items, weather, occ, when);
        setOutfit(offline);
      } finally {
        setLoading(false);
      }
    },
    [weather, when, items]
  );

  // Auto mode: generate once weather loads
  useEffect(() => {
    if (isAutoMode && weather && !outfit) {
      setOccasion("casual");
      generate("casual");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoMode, weather]);

  // Re-generate when timing changes (if outfit already exists)
  useEffect(() => {
    if (outfit && occasion) generate(occasion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [when]);

  const handleOccasion = useCallback(
    (occ: Occasion) => {
      setOccasion(occ);
      generate(occ);
    },
    [generate]
  );

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 pb-24 px-8"
        dir="rtl"
      >
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" aria-hidden className="opacity-40">
          <rect x="2" y="2" width="44" height="52" rx="3" stroke="#5C3E22" strokeWidth="2" />
          <line x1="24" y1="2" x2="24" y2="54" stroke="#5C3E22" strokeWidth="1.5" />
          <line x1="2" y1="28" x2="46" y2="28" stroke="#5C3E22" strokeWidth="1" />
          <circle cx="20" cy="17" r="2" fill="#B8956A" />
          <circle cx="28" cy="17" r="2" fill="#B8956A" />
        </svg>
        <div className="text-center">
          <p className="font-display text-lg text-ebony mb-2">הארון ריק</p>
          <p className="font-editorial italic text-sm text-walnut-400">הוסיפי בגדים לארון תחילה</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="brass-plate rounded-sm px-6 py-3 text-sm font-medium"
        >
          לארון שלי ←
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-[100dvh] pb-24 flex flex-col"
    >
      <WeatherStrip weather={weather} loading={!weather} />

      <div className="flex flex-col gap-3 pt-3 flex-1">
        <WhenPicker value={when} onChange={setWhen} />
        <OccasionPicker value={occasion} onChange={handleOccasion} />
        <BridgeVisual items={outfitItems} loading={loading} />

        <AnimatePresence mode="wait">
          {outfit || loading ? (
            <OutfitCard
              key="card"
              outfit={outfit}
              wardrobe={items}
              loading={loading}
              onRegenerate={() => occasion && generate(occasion)}
              onChat={() => setChatOpen(true)}
            />
          ) : (
            !isAutoMode && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-editorial italic text-center text-sm text-brass-deep px-8 mt-2"
                dir="rtl"
              >
                בחרי לאן את הולכת ואני אצפה לך לוק
              </motion.p>
            )
          )}
        </AnimatePresence>
      </div>

      <StylistChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        weather={weather}
        wardrobe={items}
      />
    </motion.div>
  );
}
