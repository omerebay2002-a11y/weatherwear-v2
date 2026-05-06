import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import Sheet from "../ui/Sheet";
import ItemCard from "./ItemCard";
import type { ClothingItem, ClothingCategory } from "../../types";
import { CATEGORY_LABEL } from "../../lib/utils";

const CATEGORY_ORDER: ClothingCategory[] = [
  "top", "bottom", "dress", "outerwear", "shoes", "bag", "accessory",
];

const CATEGORY_EMOJI: Record<ClothingCategory, string> = {
  top: "👚",
  bottom: "👖",
  dress: "👗",
  outerwear: "🧥",
  shoes: "👟",
  bag: "👜",
  accessory: "💍",
};

interface Props {
  open: boolean;
  initialCategories?: ClothingCategory[];
  items: ClothingItem[];
  onClose: () => void;
  onItemClick: (item: ClothingItem) => void;
  onAddClick: () => void;
}

export default function WardrobeSheet({
  open,
  initialCategories = [],
  items,
  onClose,
  onItemClick,
  onAddClick,
}: Props) {
  const [expanded, setExpanded] = useState<Set<ClothingCategory>>(
    () => new Set(initialCategories)
  );

  // Re-init expanded when initialCategories changes (compartment click)
  const toggle = (cat: ClothingCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const grouped = CATEGORY_ORDER.reduce<Record<string, ClothingItem[]>>(
    (acc, cat) => {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length) acc[cat] = catItems;
      return acc;
    },
    {}
  );

  const populated = CATEGORY_ORDER.filter((cat) => grouped[cat]?.length);

  return (
    <Sheet open={open} onClose={onClose} title="הארון שלי" height="full">
      <div dir="rtl" className="pb-4">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-editorial italic text-xl text-walnut-400 mb-2">הארון ריק</p>
            <p className="text-sm text-walnut-300 mb-6">הוסיפי את הפריט הראשון שלך</p>
            <button
              type="button"
              onClick={() => { onClose(); onAddClick(); }}
              className="brass-plate rounded-sm px-8 py-3 text-sm font-medium"
            >
              הוסיפי פריט
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {populated.map((cat) => {
              const catItems = grouped[cat];
              const isOpen = expanded.has(cat);

              return (
                <div key={cat} className="border border-brass/10 rounded-sm overflow-hidden bg-parchment-light">
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => toggle(cat)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                  >
                    <span className="text-lg">{CATEGORY_EMOJI[cat]}</span>
                    <span className="font-display text-base text-ebony flex-1">
                      {CATEGORY_LABEL[cat]}
                    </span>

                    {/* Color swatches — collapsed preview */}
                    <AnimatePresence>
                      {!isOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1"
                        >
                          {catItems.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className="w-3.5 h-3.5 rounded-full border border-white/40 flex-shrink-0"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          ))}
                          {catItems.length > 5 && (
                            <span className="text-[10px] text-walnut-400">+{catItems.length - 5}</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Count + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="bg-brass/15 text-walnut-600 text-[11px] font-semibold rounded-full px-2 py-0.5">
                        {catItems.length}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown className="h-4 w-4 text-walnut-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expandable content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1">
                          <div className="grid grid-cols-2 gap-2.5">
                            {catItems.map((item, i) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.25 }}
                              >
                                <ItemCard item={item} onClick={() => onItemClick(item)} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Add more */}
            <button
              type="button"
              onClick={() => { onClose(); onAddClick(); }}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm text-walnut-400 hover:text-walnut-600 transition"
            >
              <Plus className="h-4 w-4" />
              הוסיפי פריט נוסף
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
