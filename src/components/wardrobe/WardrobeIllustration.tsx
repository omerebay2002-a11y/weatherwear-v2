import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import type { Compartment } from "../room/Cabinet";

// Hotspot zones are % of the wardrobe-interior.png frame.
// Calibrate against the open-wardrobe photo.
const HOTSPOTS: Array<{
  id: Compartment;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
}> = [
  { id: "shirts",  label: "חולצות ושמלות", top: "22%", left: "28%", width: "42%", height: "26%" },
  { id: "folded",  label: "מקופל",          top: "52%", left: "28%", width: "42%", height: "14%" },
  { id: "drawers", label: "מגירות",          top: "67%", left: "28%", width: "42%", height: "15%" },
  { id: "coats",   label: "נעליים",          top: "83%", left: "28%", width: "42%", height: "8%"  },
];

interface Props {
  onCompartmentClick: (c: Compartment) => void;
}

export default function WardrobeIllustration({ onCompartmentClick }: Props) {
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [closedLoaded, setClosedLoaded] = useState(false);
  const [interiorLoaded, setInteriorLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const ready = closedLoaded && interiorLoaded;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F5EFE0] via-parchment to-[#E8DDC9]">

      {/* Loading / error */}
      {(!ready || errored) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none z-30"
          dir="rtl"
        >
          {!errored ? (
            <>
              <Archive className="h-14 w-14 text-walnut-300" strokeWidth={1.2} />
              <p className="font-editorial italic text-walnut-400 text-base">טוענת את הארון…</p>
            </>
          ) : (
            <div className="max-w-xs px-6 text-center space-y-3 pointer-events-auto">
              <Archive className="h-12 w-12 mx-auto text-walnut-300" strokeWidth={1.2} />
              <p className="font-display text-base text-ebony">ארון לא נטען</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Image container */}
      <div
        onClick={() => ready && setCabinetOpen((v) => !v)}
        className="relative w-full max-w-md mx-auto cursor-pointer"
        style={{ aspectRatio: "937 / 1678" }}
        role="button"
        aria-label={cabinetOpen ? "סגרי את הארון" : "פתחי את הארון"}
      >
        {/* Closed photo — fades out when open */}
        <motion.img
          src="/wardrobe-closed.png"
          alt="ארון סגור"
          draggable={false}
          onLoad={() => setClosedLoaded(true)}
          onError={() => setErrored(true)}
          animate={{ opacity: cabinetOpen ? 0 : 1 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          style={{ zIndex: 1 }}
        />

        {/* Open photo — fades in when open */}
        <motion.img
          src="/wardrobe-interior.png"
          alt="ארון פתוח"
          draggable={false}
          onLoad={() => setInteriorLoaded(true)}
          onError={() => setErrored(true)}
          animate={{ opacity: cabinetOpen ? 1 : 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          style={{ zIndex: 2 }}
        />

        {/* Hotspots — visible after open transition */}
        {ready && cabinetOpen &&
          HOTSPOTS.map((spot, i) => (
            <motion.button
              key={spot.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCompartmentClick(spot.id);
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.55 + i * 0.06 }}
              whileTap={{ scale: 0.95 }}
              aria-label={spot.label}
              className="absolute rounded-lg cursor-pointer focus:outline-none"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                zIndex: 10,
                background: "rgba(250,246,238,0.06)",
                border: "1px solid rgba(184,149,106,0.2)",
              }}
            >
              <span
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  background: "rgba(26,20,16,0.55)",
                  color: "#F2EAE0",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(184,149,106,0.3)",
                }}
              >
                {spot.label}
              </span>
            </motion.button>
          ))}
      </div>

      {/* Hint when closed */}
      <AnimatePresence>
        {ready && !cabinetOpen && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="absolute bottom-28 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-20"
            dir="rtl"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="block h-2 w-2 rounded-full bg-brass"
            />
            <p className="font-editorial italic text-white/80 text-sm tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              הקליקי לפתיחת הארון
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
