import { motion } from "framer-motion";
import { RefreshCw, MessageCircle, Loader2 } from "lucide-react";
import type { ClothingItem, Outfit } from "../../types";
import { CATEGORY_LABEL } from "../../lib/utils";

interface Props {
  outfit: Outfit | null;
  wardrobe: ClothingItem[];
  loading: boolean;
  onRegenerate: () => void;
  onChat: () => void;
}

export default function OutfitCard({ outfit, wardrobe, loading, onRegenerate, onChat }: Props) {
  if (loading) {
    return (
      <div className="card mx-5 p-6 text-center" dir="rtl">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-walnut-400" />
        <p className="font-editorial italic text-walnut-500">חושבת מה הכי מתאים…</p>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="card mx-5 p-6 text-center" dir="rtl">
        <p className="font-editorial italic text-walnut-400 text-sm">
          בחרי "מתי" ו"לאן" כדי לקבל המלצה
        </p>
      </div>
    );
  }

  const items = outfit.itemIds
    .map((id) => wardrobe.find((it) => it.id === id))
    .filter((x): x is ClothingItem => !!x);

  if (items.length === 0) {
    return (
      <div className="card mx-5 p-6 text-center" dir="rtl">
        <p className="font-display text-base text-ebony mb-2">הארון ריק</p>
        <p className="text-sm text-walnut-400">
          הוסיפי קודם פריטים בעמוד הארון, ואחזור עם המלצה.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card mx-5 p-5"
      dir="rtl"
    >
      <p className="text-xs label-tracked text-walnut-400 mb-3">הלוק שלי בשבילך</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="aspect-square overflow-hidden rounded-sm bg-parchment-dark relative"
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ backgroundColor: item.colorHex }}
              >
                <span className="font-display text-2xl text-ebony/30">
                  {CATEGORY_LABEL[item.category]?.[0]}
                </span>
              </div>
            )}
            <span className="absolute bottom-1 right-1 frost text-[10px] px-1.5 py-0.5 rounded">
              {CATEGORY_LABEL[item.category]}
            </span>
          </div>
        ))}
      </div>

      <p className="font-editorial italic text-base text-ebony leading-relaxed mb-5">
        {outfit.explanation}
      </p>

      <div className="flex gap-2">
        <button
          onClick={onRegenerate}
          className="flex-1 rounded-sm border border-walnut-200 text-walnut-500 hover:bg-walnut-50 transition py-2.5 flex items-center justify-center gap-1.5 font-display text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          החליפי לוק
        </button>
        <button
          onClick={onChat}
          className="flex-1 brass-plate rounded-sm py-2.5 flex items-center justify-center gap-1.5 font-display text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          דברי איתי
        </button>
      </div>
    </motion.div>
  );
}
