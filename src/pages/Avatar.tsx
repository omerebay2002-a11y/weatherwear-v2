import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, UserRound } from "lucide-react";
import { useWardrobe } from "../contexts/WardrobeContext";
import type { ClothingCategory, ClothingItem } from "../types";
import { CATEGORY_LABEL } from "../lib/constants";

const SELFIE_KEY = "avatar_selfie_url";

const OUTFIT_SLOTS: ClothingCategory[] = ["top", "bottom", "dress", "outerwear", "shoes", "bag"];

function pickItem(items: ClothingItem[], category: ClothingCategory): ClothingItem | null {
  return items.filter((i) => i.category === category)[0] ?? null;
}

export default function Avatar() {
  const { items } = useWardrobe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(() => localStorage.getItem(SELFIE_KEY));

  useEffect(() => {
    if (selfieUrl) localStorage.setItem(SELFIE_KEY, selfieUrl);
    else localStorage.removeItem(SELFIE_KEY);
  }, [selfieUrl]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelfieUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const outfitSlots = OUTFIT_SLOTS.map((cat) => ({
    category: cat,
    item: pickItem(items, cat),
  })).filter(({ item }) => item !== null) as { category: ClothingCategory; item: ClothingItem }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] pb-24 flex flex-col"
      dir="rtl"
    >
      <div className="px-6 pt-8 pb-4">
        <h1 className="font-editorial italic text-2xl text-walnut-700">הבובה שלי</h1>
        <p className="text-sm text-walnut-400 mt-0.5">העלי סלפי — ותראי איך הבגדים נראים עלייך</p>
      </div>

      <div className="flex flex-col items-center px-6 gap-4">
        <div
          className="relative w-56 h-72 rounded-2xl overflow-hidden border-2 border-brass/30 shadow-md bg-parchment-light cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <AnimatePresence mode="wait">
            {selfieUrl ? (
              <motion.img
                key="selfie"
                src={selfieUrl}
                alt="הסלפי שלך"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center gap-3 text-walnut-300"
              >
                <UserRound className="h-16 w-16" strokeWidth={1} />
                <p className="font-editorial italic text-base text-walnut-400">הוסיפי סלפי</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            className="absolute bottom-3 left-3 bg-parchment/90 backdrop-blur-sm border border-brass/20 rounded-full p-2 shadow"
            aria-label="העלי סלפי"
          >
            <Camera className="h-4 w-4 text-walnut-500" strokeWidth={1.6} />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div className="mt-8 px-6 flex flex-col gap-3">
        <h2 className="font-display text-base text-walnut-700">
          הלוק הנוכחי
          <span className="text-xs font-sans text-walnut-300 mr-2">מהארון שלך</span>
        </h2>

        {outfitSlots.length === 0 ? (
          <div className="rounded-md border border-brass/20 bg-parchment-light p-6 text-center">
            <p className="font-editorial italic text-walnut-400 text-sm">
              הארון ריק — הוסיפי בגדים כדי לבנות לוק
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {outfitSlots.map(({ category, item }) => (
              <OutfitSlot key={category} category={category} item={item} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OutfitSlot({ category, item }: { category: ClothingCategory; item: ClothingItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="aspect-square rounded-xl overflow-hidden bg-parchment-light border border-brass/15 shadow-sm">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: item.color ?? "#e8dfc8" }}
          >
            <span className="text-2xl opacity-40">
              {CATEGORY_LABEL[category]?.charAt(0) ?? "?"}
            </span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-walnut-400 text-center leading-tight">{item.name || CATEGORY_LABEL[category]}</p>
    </div>
  );
}
