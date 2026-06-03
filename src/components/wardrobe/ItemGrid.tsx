import { motion, AnimatePresence } from "framer-motion";
import type { ClothingItem, ClothingCategory } from "../../types";
import ItemCard from "./ItemCard";
import { CATEGORY_LABEL } from "../../lib/constants";

interface Props {
  items: ClothingItem[];
  onItemClick: (item: ClothingItem) => void;
  onAddClick: () => void;
}

const CATEGORY_ORDER: ClothingCategory[] = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "bag",
  "accessory",
];

export default function ItemGrid({ items, onItemClick, onAddClick }: Props) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="font-editorial italic text-2xl text-walnut-500 mb-2">
          הארון ריק
        </p>
        <p className="text-sm text-walnut-400 mb-6 leading-relaxed">
          הוסיפי את הפריט הראשון שלך —<br />
          באמצעות תמונה, קול, או הקלדה.
        </p>
        <button
          onClick={onAddClick}
          className="brass-plate font-display text-base px-8 py-3 rounded-sm tracking-wide"
        >
          הוסיפי פריט ראשון
        </button>
      </div>
    );
  }

  // Group by category
  const grouped: Record<string, ClothingItem[]> = {};
  for (const it of items) {
    (grouped[it.category] ||= []).push(it);
  }

  return (
    <div className="space-y-5 pb-2">
      <AnimatePresence>
        {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
          <motion.section
            key={cat}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h4 className="font-display text-base text-walnut-700 mb-2 px-1 flex items-baseline gap-2">
              {CATEGORY_LABEL[cat]}
              <span className="text-xs font-sans text-walnut-300">
                {grouped[cat].length}
              </span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {grouped[cat].map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
              ))}
            </div>
          </motion.section>
        ))}
      </AnimatePresence>
    </div>
  );
}
