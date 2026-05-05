import { motion, AnimatePresence } from "framer-motion";
import Sheet from "../ui/Sheet";
import ItemCard from "./ItemCard";
import type { ClothingItem, ClothingCategory } from "../../types";
import type { Compartment } from "../room/Cabinet";

const COMPARTMENT_LABEL: Record<Compartment, string> = {
  shirts: "חולצות ושמלות",
  coats: "מעילים",
  folded: "מקופלים ונעליים",
  drawers: "אקססוריז ותיקים",
};

const COMPARTMENT_EMOJI: Record<Compartment, string> = {
  shirts: "👚",
  coats: "🧥",
  folded: "👖",
  drawers: "👜",
};

const COMPARTMENT_CATEGORIES: Record<Compartment, ClothingCategory[]> = {
  shirts: ["top", "dress"],
  coats: ["outerwear"],
  folded: ["bottom", "shoes"],
  drawers: ["accessory", "bag"],
};

interface Props {
  compartment: Compartment | null;
  items: ClothingItem[];
  onClose: () => void;
  onItemClick: (item: ClothingItem) => void;
  onAddClick: () => void;
}

export default function CompartmentSheet({
  compartment,
  items,
  onClose,
  onItemClick,
  onAddClick,
}: Props) {
  const filtered = compartment
    ? items.filter((it) =>
        COMPARTMENT_CATEGORIES[compartment].includes(it.category)
      )
    : [];

  return (
    <Sheet
      open={!!compartment}
      onClose={onClose}
      title={
        compartment
          ? `${COMPARTMENT_EMOJI[compartment]}  ${COMPARTMENT_LABEL[compartment]}`
          : ""
      }
    >
      <div dir="rtl" className="pt-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-editorial italic text-walnut-400 text-base mb-4">
              אין כאן כלום עדיין
            </p>
            <button
              onClick={() => {
                onClose();
                onAddClick();
              }}
              className="brass-plate font-display text-sm px-6 py-2.5 rounded-sm"
            >
              הוסיפי פריט
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs label-tracked text-walnut-400 mb-3">
              {filtered.length} פריטים
            </p>
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-2 gap-3 pb-2"
              >
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ItemCard item={item} onClick={() => onItemClick(item)} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </Sheet>
  );
}
