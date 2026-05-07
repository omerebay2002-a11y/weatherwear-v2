import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, X } from "lucide-react";
import type { Compartment } from "../room/Cabinet";

// Cabinet bounds inside the wardrobe.png frame (% of image), measured by eye:
//   top edge:    17%
//   bottom edge: 75%
//   left edge:   10%
//   right edge:  90%
// → doors cover top:17% left:10% width:80% height:58%
// → each half-door is width:40%

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
  const [cabinetOpen, setCabinetOpen] = useState(false);

  return (
    // Room background — soft cream wall up top, slightly darker "floor" below
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F5EFE0] via-parchment to-[#E8DDC9]">
      {/* Subtle "floor line" at ~75% — implies wall meets floor */}
      <div className="absolute inset-x-0 pointer-events-none" style={{ top: "75%", height: "1px", background: "linear-gradient(to right, transparent, rgba(124, 92, 56, 0.25), transparent)" }} />

      {/* Designed loading/error fallback */}
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

      {/* Image + overlays — same aspect ratio so % positioning works */}
      <div
        className="relative w-full max-w-md mx-auto"
        style={{ aspectRatio: "768 / 1364" }}
      >
        {/* The Stitch illustration */}
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

        {/* Mask the painted right-side pendant lights so we can place a centered one */}
        {state === "ready" && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: "11%",
              right: "5%",
              width: "32%",
              height: "12%",
              background: "linear-gradient(to bottom, #FBF6E8 60%, rgba(251, 246, 232, 0))",
            }}
          />
        )}

        {/* Centered pendant lamp above the cabinet */}
        {state === "ready" && (
          <svg
            className="absolute pointer-events-none"
            style={{ top: "8%", left: "45%", width: "10%", height: "12%" }}
            viewBox="0 0 100 200"
          >
            <defs>
              <radialGradient id="lampBulb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE7A8" stopOpacity="1" />
                <stop offset="55%" stopColor="#E8B95F" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#9A7434" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE7A8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FFE7A8" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* cord */}
            <line x1="50" y1="0" x2="50" y2="110" stroke="#3A2818" strokeWidth="1.4" />
            {/* glow halo */}
            <motion.ellipse
              cx="50"
              cy="150"
              rx="80"
              ry="55"
              fill="url(#lampGlow)"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* bulb */}
            <ellipse cx="50" cy="145" rx="14" ry="22" fill="url(#lampBulb)" />
            {/* lamp shade rim */}
            <path d="M 32 130 Q 50 120 68 130" stroke="#3A2818" strokeWidth="1.2" fill="none" />
          </svg>
        )}

        {/* Cabinet doors — cover the cabinet interior when closed, swing open on click */}
        {state === "ready" && (
          <div
            className="absolute"
            style={{
              top: "17%",
              left: "10%",
              width: "80%",
              height: "58%",
              perspective: "1200px",
              pointerEvents: cabinetOpen ? "none" : "auto",
            }}
            onClick={() => !cabinetOpen && setCabinetOpen(true)}
            role="button"
            aria-label="פתחי את הארון"
          >
            {/* Left door */}
            <motion.div
              className="absolute top-0 left-0 w-1/2 h-full cursor-pointer"
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                background:
                  "linear-gradient(135deg, #B5895A 0%, #9C7548 60%, #7E5A33 100%)",
                boxShadow: "inset -2px 0 4px rgba(58, 40, 24, 0.25), inset 2px 0 4px rgba(255, 231, 168, 0.15)",
              }}
              animate={{ rotateY: cabinetOpen ? -110 : 0 }}
              transition={{ type: "spring", damping: 17, stiffness: 95, mass: 0.9 }}
            >
              {/* Subtle vertical wood grain */}
              <div className="absolute inset-y-3 left-1/3 w-px bg-[#7E5A33]/15" />
              <div className="absolute inset-y-6 left-2/3 w-px bg-[#7E5A33]/10" />
              {/* Brass vertical handle on inner (right) edge */}
              <div
                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  right: "6%",
                  width: "3.5%",
                  height: "16%",
                  background: "linear-gradient(to bottom, #D9B574, #C09A56, #9C7B3E)",
                  boxShadow: "0 1px 2px rgba(58, 40, 24, 0.4)",
                }}
              />
            </motion.div>

            {/* Right door */}
            <motion.div
              className="absolute top-0 right-0 w-1/2 h-full cursor-pointer"
              style={{
                transformOrigin: "right center",
                transformStyle: "preserve-3d",
                background:
                  "linear-gradient(225deg, #B5895A 0%, #9C7548 60%, #7E5A33 100%)",
                boxShadow: "inset 2px 0 4px rgba(58, 40, 24, 0.25), inset -2px 0 4px rgba(255, 231, 168, 0.15)",
              }}
              animate={{ rotateY: cabinetOpen ? 110 : 0 }}
              transition={{ type: "spring", damping: 17, stiffness: 95, mass: 0.9 }}
            >
              <div className="absolute inset-y-3 left-1/3 w-px bg-[#7E5A33]/15" />
              <div className="absolute inset-y-6 left-2/3 w-px bg-[#7E5A33]/10" />
              {/* Brass vertical handle on inner (left) edge */}
              <div
                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: "6%",
                  width: "3.5%",
                  height: "16%",
                  background: "linear-gradient(to bottom, #D9B574, #C09A56, #9C7B3E)",
                  boxShadow: "0 1px 2px rgba(58, 40, 24, 0.4)",
                }}
              />
            </motion.div>
          </div>
        )}

        {/* "Tap to open" hint when closed */}
        <AnimatePresence>
          {state === "ready" && !cabinetOpen && (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="absolute font-editorial italic text-sm text-walnut-500 pointer-events-none"
              style={{ top: "78%", left: 0, right: 0, textAlign: "center" }}
              dir="rtl"
            >
              הקליקי לפתיחת הארון
            </motion.p>
          )}
        </AnimatePresence>

        {/* Close cabinet button when open */}
        <AnimatePresence>
          {state === "ready" && cabinetOpen && (
            <motion.button
              key="close-cabinet"
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 18 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCabinetOpen(false)}
              className="absolute frost-dark rounded-full h-10 w-10 flex items-center justify-center shadow-soft"
              style={{ top: "4%", left: "4%" }}
              aria-label="סגרי את הארון"
            >
              <X className="h-4 w-4 text-parchment" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Compartment hotspots — only clickable when cabinet is open */}
        {state === "ready" && cabinetOpen &&
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
