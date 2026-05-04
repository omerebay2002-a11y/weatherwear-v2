import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import WeatherStrip from "../components/today/WeatherStrip";
import WhenPicker from "../components/today/WhenPicker";
import OccasionPicker from "../components/today/OccasionPicker";
import OutfitCard from "../components/today/OutfitCard";
import StylistChat from "../components/today/StylistChat";
import { fetchWeather } from "../lib/weather";
import { suggestOutfit } from "../lib/claude";
import { pickOutfitOffline } from "../lib/outfit-rules";
import { useWardrobe } from "../contexts/WardrobeContext";
import { useToast } from "../components/ui/Toast";
import type { Occasion, Outfit, WeatherSnapshot, WhenChoice } from "../types";

export default function Today() {
  const { items } = useWardrobe();
  const { push } = useToast();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [when, setWhen] = useState<WhenChoice>("now");
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch weather on mount
  useEffect(() => {
    let alive = true;
    fetchWeather()
      .then((w) => {
        if (alive) setWeather(w);
      })
      .catch(() => {
        push("לא הצלחנו לקבל מזג אוויר — בודקות הרשאות מיקום", "⚠️");
      });
    return () => {
      alive = false;
    };
  }, [push]);

  const generate = useCallback(
    async (occ: Occasion) => {
      if (!weather) return;
      setLoading(true);
      try {
        const result = await suggestOutfit({ weather, occasion: occ, when, wardrobe: items });
        setOutfit(result);
      } catch {
        // Graceful fallback to offline rules
        const offline = pickOutfitOffline(items, weather, occ, when);
        setOutfit(offline);
      } finally {
        setLoading(false);
      }
    },
    [weather, when, items]
  );

  // Auto-regenerate when when/occasion changes (and we have both)
  useEffect(() => {
    if (occasion) generate(occasion);
  }, [when, occasion, generate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[100dvh] pb-24"
    >
      <WeatherStrip weather={weather} loading={!weather} />

      <div className="space-y-4 mt-2">
        <WhenPicker value={when} onChange={setWhen} />
        <OccasionPicker value={occasion} onChange={setOccasion} />
      </div>

      <div className="mt-5">
        {occasion ? (
          <OutfitCard
            outfit={outfit}
            wardrobe={items}
            loading={loading}
            onRegenerate={() => occasion && generate(occasion)}
            onChat={() => setChatOpen(true)}
          />
        ) : (
          <div className="px-5 pt-2 text-center" dir="rtl">
            <p className="font-editorial italic text-walnut-400 text-sm">
              בחרי לאן את הולכת ואני אצפה לך לוק
            </p>
          </div>
        )}
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
