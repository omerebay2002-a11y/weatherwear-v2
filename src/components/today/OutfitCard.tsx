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
      <div className="mx-4 rounded-md border border-brass/20 bg-parchment-light overflow-hidden" dir="rtl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-20 bg-parchment-dark rounded animate-shimmer" />
            <div className="h-3.5 w-16 bg-parchment-dark rounded animate-shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-parchment-dark animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 bg-parchment-dark rounded animate-shimmer w-full" />
                  <div className="h-2.5 bg-parchment-dark rounded animate-shimmer w-2/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brass" />
            <p className="font-editorial italic text-walnut-400 text-sm">חושבת מה הכי מתאים…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!outfit) return null;

  const items = outfit.itemIds
    .map((id) => wardrobe.find((it) => it.id === id))
    .filter((x): x is ClothingItem => !!x);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="mx-4 rounded-md border border-brass/25 bg-parchment-light overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-brass/15">
        <h3 className="font-display text-[1.1rem] text-ebony">
          הלוק שלי
        </h3>
        <span className="text-[0.625rem] font-medium tracking-widest uppercase text-brass-deep">
          AI · {items.length} פריטים
        </span>
      </div>

      {/* Items 2×2 grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5">
            {item.imageUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-black/10">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: item.colorHex }}
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-[0.875rem] text-ebony leading-tight truncate">
                {item.name}
              </p>
              <p className="text-[0.625rem] text-ebony-muted mt-0.5 tracking-widest uppercase">
                {CATEGORY_LABEL[item.category]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 h-px bg-brass/15" />

      {/* AI explanation */}
      <p className="font-editorial italic text-[0.9375rem] text-ebony-muted leading-relaxed px-4 py-3">
        {outfit.explanation}
      </p>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={onRegenerate}
          className="flex-1 rounded-sm border border-brass/40 text-walnut-500 hover:bg-parchment-dark transition py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          לוק אחר
        </button>
        <button
          type="button"
          onClick={onChat}
          className="flex-[2] brass-plate rounded-sm py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          שוחח עם הסטייליסטית
        </button>
      </div>
    </motion.div>
  );
}
