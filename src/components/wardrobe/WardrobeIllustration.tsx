import { useState } from "react";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";
import type { Compartment } from "../room/Cabinet";

// Hotspots positioned as % of the wardrobe.png frame so they scale on any screen.
// Starting values measured against the Stitch reference (cabinet roughly fills
// 76% of viewport vertically and 88% horizontally).
const HOTSPOTS: Array<{
  id: Compartment;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
}> = [
  { id: "shirts",  label: "חולצות ושמלות",            top: "26%", left: "8%",  width: "40%", height: "18%" },
  { id: "coats",   label: "מעילים",                     top: "26%", left: "52%", width: "40%", height: "18%" },
  { id: "folded",  label: "מכנסיים ונעליים",           top: "47%", left: "8%",  width: "40%", height: "30%" },
  { id: "drawers", label: "תחתונים גרביים תכשיטים",    top: "55%", left: "52%", width: "40%", height: "22%" },
];

interface Props {
  onCompartmentClick: (c: Compartment) => void;
}

type State = "loading" | "ready" | "error";

export default function WardrobeIllustration({ onCompartmentClick }: Props) {
  const [state, setState] = useState<State>("loading");

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-parchment overflow-hidden">
      {/* Brand wordmark */}
      <h1 className="absolute top-4 inset-x-0 z-20 text-center font-display text-3xl tracking-tight pointer-events-none safe-top">
        <span className="text-ebony">Weather</span>
        <span className="text-brass">Wear</span>
      </h1>

      {/* Designed fallback — visible while loading or if image fails.
          NOT the cabinet itself, just a deliberate empty-state. */}
      {state !== "ready" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
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
                שמרי את התמונה מ-Stitch בנתיב{" "}
                <code className="text-brass not-italic font-mono text-xs bg-parchment-light px-1.5 py-0.5 rounded">
                  public/wardrobe.png
                </code>{" "}
                והדף ירענן אוטומטית
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Image + hotspots */}
      <div className="relative w-full max-w-md h-full">
        <motion.img
          src="/wardrobe.png"
          alt="ארון בגדים"
          draggable={false}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          initial={{ opacity: 0 }}
          animate={{ opacity: state === "ready" ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
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
