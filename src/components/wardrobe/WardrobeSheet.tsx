import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import Sheet from "../ui/Sheet";
import ItemCard from "./ItemCard";
import type { ClothingItem, ClothingCategory } from "../../types";
import { CATEGORY_LABEL, newId } from "../../lib/utils";
import { SEED_ITEMS } from "../../lib/seed-wardrobe";
import { useWardrobe } from "../../contexts/WardrobeContext";

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

// ─── Variants ────────────────────────────────────────────────────────────────

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

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
  const reduced = useReducedMotion();
  const { add } = useWardrobe();
  const [expanded, setExpanded] = useState<Set<ClothingCategory>>(
    () => new Set(initialCategories)
  );

  const importSeed = () => {
    SEED_ITEMS.forEach((seed, i) => {
      add({
        ...seed,
        id: newId("seed"),
        createdAt: Date.now() - (SEED_ITEMS.length - i) * 1000,
        source: "type",
      });
    });
  };

  // Sync expanded with initialCategories whenever the sheet opens
  // (so clicking a different compartment expands the correct category).
  useEffect(() => {
    if (open) setExpanded(new Set(initialCategories));
  }, [open, initialCategories]);

  const toggle = (cat: ClothingCategory) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

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
          <div className="py-10 text-center">
            <p className="font-editorial italic text-xl text-walnut-400 mb-2">הארון ריק</p>
            <p className="text-sm text-walnut-300 mb-6">
              הוסיפי את הפריט הראשון שלך,<br />
              או ייבאי את הפריטים שכבר יש לך
            </p>
            <div className="flex flex-col gap-2.5 max-w-[260px] mx-auto">
              <button
                type="button"
                onClick={importSeed}
                className="brass-plate rounded-sm px-6 py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                ייבאי {SEED_ITEMS.length} פריטים מה-PDF
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onAddClick(); }}
                className="rounded-sm border border-walnut-200 px-6 py-2.5 text-sm text-walnut-500 hover:border-walnut-300 transition"
              >
                הוסיפי פריט חדש
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {populated.map((cat) => {
              const catItems = grouped[cat];
              const isOpen = expanded.has(cat);

              return (
                <div key={cat} className="border border-brass/10 rounded-sm overflow-hidden bg-parchment-light">

                  {/* Accordion header */}
                  <motion.button
                    type="button"
                    onClick={() => toggle(cat)}
                    whileTap={reduced ? {} : { scale: 0.98, backgroundColor: "rgba(184,149,106,0.06)" }}
                    transition={{ duration: 0.1 }}
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
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.18 }}
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
                        transition={reduced ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown className="h-4 w-4 text-walnut-400" />
                      </motion.div>
                    </div>
                  </motion.button>

                  {/* Expandable content — staggered via variants */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          className="px-3 pb-3 pt-1"
                          variants={gridVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <div className="grid grid-cols-2 gap-2.5">
                            {catItems.map((item) => (
                              <motion.div key={item.id} variants={cardVariants}>
                                <ItemCard item={item} onClick={() => onItemClick(item)} />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Add more */}
            <motion.button
              type="button"
              onClick={() => { onClose(); onAddClick(); }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm text-walnut-400 hover:text-walnut-600 transition"
            >
              <Plus className="h-4 w-4" />
              הוסיפי פריט נוסף
            </motion.button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
