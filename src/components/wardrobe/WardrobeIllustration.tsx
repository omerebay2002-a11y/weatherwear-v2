import { motion } from "framer-motion";
import type { Compartment } from "../room/Cabinet";

// Each hotspot is positioned as a percentage of the wardrobe.png frame so it
// scales correctly on any screen size. Numbers were measured against the Stitch
// reference (1080×~1600 portrait illustration where the cabinet roughly fills
// 76% of the viewport vertically and 88% horizontally).
//
// Compartment regions:
//   shirts  → top-left rod (hangers, half the top section)
//   coats   → top-right rod (hangers, other half of the top section)
//   folded  → middle shelves on the left (folded clothes stacks)
//   drawers → bottom-right (3 wooden drawers with brass pulls)
const HOTSPOTS: Array<{
  id: Compartment;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
}> = [
  { id: "shirts",  label: "חולצות ושמלות",      top: "26%", left: "8%",  width: "40%", height: "18%" },
  { id: "coats",   label: "מעילים",               top: "26%", left: "52%", width: "40%", height: "18%" },
  { id: "folded",  label: "מכנסיים ונעליים",     top: "47%", left: "8%",  width: "40%", height: "30%" },
  { id: "drawers", label: "תחתונים גרביים תכשיטים", top: "55%", left: "52%", width: "40%", height: "22%" },
];

interface Props {
  onCompartmentClick: (c: Compartment) => void;
}

export default function WardrobeIllustration({ onCompartmentClick }: Props) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-parchment">
      {/* Brand wordmark */}
      <h1
        className="absolute top-4 inset-x-0 z-20 text-center font-display text-3xl tracking-tight pointer-events-none safe-top"
      >
        <span className="text-ebony">Weather</span>
        <span className="text-brass">Wear</span>
      </h1>

      {/* Illustration */}
      <div className="relative w-full max-w-md h-full">
        <img
          src="/wardrobe.png"
          alt="ארון בגדים"
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Clickable compartments — invisible but accessible */}
        {HOTSPOTS.map((spot) => (
          <motion.button
            key={spot.id}
            type="button"
            onClick={() => onCompartmentClick(spot.id)}
            whileTap={{ scale: 0.97 }}
            whileHover={{ backgroundColor: "rgba(184, 149, 106, 0.08)" }}
            transition={{ duration: 0.18 }}
            aria-label={spot.label}
            className="absolute rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brass/40"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
            }}
          />
        ))}
      </div>
    </div>
  );
}
