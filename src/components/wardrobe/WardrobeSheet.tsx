import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Plus, Sparkles, ExternalLink, LogOut } from "lucide-react";
import Sheet from "../ui/Sheet";
import ItemCard from "./ItemCard";
import type { ClothingItem, ClothingCategory } from "../../types";
import { newId } from "../../lib/utils";
import { CATEGORY_LABEL, CATEGORY_EMOJI } from "../../lib/constants";
import { SEED_ITEMS } from "../../lib/seed-wardrobe";
import { useWardrobe } from "../../contexts/WardrobeContext";
import { useAuth } from "../../contexts/AuthContext";

const CATEGORY_ORDER: ClothingCategory[] = [
  "outerwear", "top", "dress", "bottom", "underwear", "socks", "shoes", "bag", "accessory",
];

function titleFor(initialCategories: ClothingCategory[]): string {
  const set = new Set(initialCategories);
  if (set.has("outerwear") && set.size === 1) return "🧥 מעילים";
  if (set.has("top") && set.has("dress")) return "👚 חולצות ושמלות";
  if (set.has("bottom") && set.has("shoes")) return "👖 מכנסיים ונעליים";
  if (set.has("underwear") && set.has("socks")) return "🧦 תחתונים, גרביים ותכשיטים";
  return "הארון שלי";
}

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
  const { configured, userId, user, signOut } = useAuth();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const cloudUrl = supabaseRef && userId
    ? `https://supabase.com/dashboard/project/${supabaseRef}/editor`
    : null;
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

  const filterSet = initialCategories.length > 0 ? new Set(initialCategories) : null;
  const visibleItems = filterSet ? items.filter((i) => filterSet.has(i.category)) : items;

  const grouped = CATEGORY_ORDER.reduce<Record<string, ClothingItem[]>>(
    (acc, cat) => {
      const catItems = visibleItems.filter((i) => i.category === cat);
      if (catItems.length) acc[cat] = catItems;
      return acc;
    },
    {}
  );

  const populated = CATEGORY_ORDER.filter((cat) => grouped[cat]?.length);

  return (
    <Sheet open={open} onClose={onClose} title={titleFor(initialCategories)} height="full">
      <div dir="rtl" className="pb-4">
        {visibleItems.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center">
            {/* hanger illustration */}
            <svg width="64" height="56" viewBox="0 0 64 56" fill="none" className="mb-5 text-walnut-200">
              <path d="M32 10a6 6 0 1 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M32 16c0 0-12 8-20 16h40C44 24 32 16 32 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="font-display text-lg text-ebony mb-1">
              {items.length === 0 ? "הארון עוד ריק" : "אין פריטים כאן"}
            </p>
            <p className="text-sm text-walnut-400 leading-relaxed mb-8 max-w-[220px]">
              {items.length === 0
                ? "הוסיפי את הבגד הראשון שלך, או ייבאי את כל הארון בלחיצה"
                : "הוסיפי פריט חדש לקטגוריה הזאת"}
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              {items.length === 0 && (
                <button
                  type="button"
                  onClick={importSeed}
                  className="brass-plate rounded-xl px-6 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  ייבאי {SEED_ITEMS.length} פריטים בלחיצה
                </button>
              )}
              <button
                type="button"
                onClick={() => { onClose(); onAddClick(); }}
                className="rounded-xl border border-walnut-200 px-6 py-3 text-sm font-medium text-walnut-500 hover:border-brass/50 hover:text-walnut-600 transition-colors"
              >
                + הוסיפי פריט חדש
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
                  <motion.button
                    type="button"
                    onClick={() => toggle(cat)}
                    aria-expanded={isOpen}
                    aria-controls={"category-panel-" + cat}
                    whileTap={reduced ? {} : { scale: 0.98, backgroundColor: "rgba(184,149,106,0.06)" }}
                    transition={{ duration: 0.1 }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                  >
                    <span className="text-lg">{CATEGORY_EMOJI[cat]}</span>
                    <span className="font-display text-base text-ebony flex-1">
                      {CATEGORY_LABEL[cat]}
                    </span>
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
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        id={"category-panel-" + cat}
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
        {configured && userId && (
          <div className="mt-6 pt-4 border-t border-walnut-100/60 space-y-2">
            {user?.email && (
              <p className="text-[11px] text-walnut-400 text-center">{user.email}</p>
            )}
            {cloudUrl && (
              <a
                href={cloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-walnut-500 hover:text-ebony transition py-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                צפי בכל הפריטים בענן
              </a>
            )}
            <button
              type="button"
              onClick={() => { signOut(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 text-xs text-walnut-400 hover:text-ebony transition py-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              התנתקי
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
