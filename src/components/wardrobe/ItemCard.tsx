import { motion } from "framer-motion";
import type { ClothingItem } from "../../types";
import { CATEGORY_LABEL } from "../../lib/utils";

interface Props {
  item: ClothingItem;
  onClick?: () => void;
}

export default function ItemCard({ item, onClick }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="card text-right group relative overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-parchment-dark">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{ backgroundColor: item.colorHex }}
          >
            <span className="font-display text-4xl text-ebony/30">
              {CATEGORY_LABEL[item.category]?.[0] ?? "?"}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <p className="text-[10px] label-tracked text-walnut-400">
          {CATEGORY_LABEL[item.category]}
        </p>
        <p className="font-display text-sm text-ebony truncate" dir="rtl">
          {item.name}
        </p>
      </div>
    </motion.button>
  );
}
