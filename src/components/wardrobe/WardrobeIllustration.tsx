import { useState } from "react";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";
import type { Compartment } from "../room/Cabinet";

// Hotspots positioned as % of the wardrobe.png frame.
const HOTSPOTS: Array<{
  id: Compartment;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
}> = [
  { id: "shirts",  label: "חולצות ושמלות",            top: "26%", left: "11%", width: "39%", height: "14%" },
  { id: "coats",   label: "מעילים",                     top: "26%", left: "50%", width: "40%", height: "14%" },
  { id: "folded",  label: "מכנסיים ונעליים",           top: "44%", left: "11%", width: "39%", height: "32%" },
  { id: "drawers", label: "תחתונים גרביים תכשיטים",    top: "57%", left: "50%", width: "40%", height: "20%" },
];

interface Props {
  onCompartmentClick: (c: Compartment) => void;
}

type State = "loading" | "ready" | "error";

export default function WardrobeIllustration({ onCompartmentClick }: Props) {
  const [state, setState] = useState<State>("loading");

  return (
    // Subtle room atmosphere — soft cream "wall" up top, slightly warmer "floor" below.
    // Non-destructive: doesn't overlay anything on the image itself.
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F5EFE0] via-parchment to-[#E8DDC9]">
      {/* Faint floor line at ~76% — implies wall meets floor */}
      <div
        className="absolute inset-x-8 pointer-events-none"
        style={{
          top: "76%",
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(124, 92, 56, 0.18), transparent)",
        }}
      />

      {/* Loading / error state */}
      {state !== "ready" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none z-30"
          dir="rtl"
        >
          {state === "loading" ? (
            <>
              <Archive className="h-14 w-14 text-walnut-300" strokeWidth={1.2} />
              <p className="font-editorial italic text-walnut-400 text-base">טוענת את הארון…</p>
            </>
          ) : (
            <div className="max-w-xs px-6 text-center space-y-3 pointer-events-auto">
              <Archive className="h-12 w-12 mx-auto text-walnut-300" strokeWidth={1.2} />
              <p className="font-display text-base text-ebony">ארון לא נטען</p>
              <p className="text-sm text-walnut-400 font-editorial italic leading-relaxed">
                שמרי תמונה כ-{" "}
                <code className="text-brass not-italic font-mono text-xs bg-parchment-light px-1.5 py-0.5 rounded">
                  public/wardrobe.png
                </code>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Image + hotspots — same aspect ratio so % positioning maps 1:1 to image regions */}
      <div
        className="relative w-full max-w-md mx-auto"
        style={{ aspectRatio: "768 / 1364" }}
      >
        <motion.img
          src="/wardrobe.png"
          alt="ארון בגדים"
          draggable={false}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          initial={{ opacity: 0 }}
          animate={{ opacity: state === "ready" ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {state === "ready" &&
          HOTSPOTS.map((spot) => (
            <motion.button
              key={spot.id}
              type="button"
              onClick={() => onCompartmentClick(spot.id)}
              whileTap={{ scale: 0.97 }}
              whileHover={{ backgroundColor: "rgba(184, 149, 106, 0.10)" }}
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
