import { motion } from "framer-motion";
import type { ClothingItem } from "../../types";

interface Props {
  items: ClothingItem[];
  loading?: boolean;
}

export default function BridgeVisual({ items, loading }: Props) {
  const colors = items.slice(0, 4).map((i) => i.colorHex);

  return (
    <div className="mx-4 h-14 bg-parchment-dark rounded-md flex items-center justify-between px-4 gap-3">
      {/* Mini wardrobe icon */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="1.5" y="1.5" width="25" height="25" rx="2.5" stroke="#5C3E22" strokeWidth="1.5" />
        <line x1="14" y1="1.5" x2="14" y2="26.5" stroke="#5C3E22" strokeWidth="1" />
        <line x1="1.5" y1="15" x2="26.5" y2="15" stroke="#5C3E22" strokeWidth="0.75" strokeDasharray="2 1.5" />
        <circle cx="10.5" cy="10" r="1.2" fill="#B8956A" />
        <circle cx="17.5" cy="10" r="1.2" fill="#B8956A" />
      </svg>

      {/* Flowing dots */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brass"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 0.9, delay: i * 0.22, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Outfit color circles */}
      <div className="flex items-center gap-1.5">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-walnut-100 animate-pulse" />
            ))
          : colors.length > 0
          ? colors.map((hex, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border border-black/10"
                style={{ backgroundColor: hex }}
              />
            ))
          : [0, 1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-walnut-200 bg-parchment" />
            ))}
      </div>
    </div>
  );
}
