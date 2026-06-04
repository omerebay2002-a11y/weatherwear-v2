import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import type { Compartment } from "../room/Cabinet";

// All measurements are in % of the wardrobe-closed.png frame (937×1678).
// Tweak in 0.5–1% increments if anything is misaligned.

const LEFT_DOOR = {
  left: 20,
  right: 49,
  top: 29,
  bottom: 78, // tall, full-height
};

const RIGHT_DOOR = {
  left: 51,
  right: 79,
  top: 29,
  bottom: 58, // shorter — drawers below
};

const SWING_ANGLE = 75;
const SWING = { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const };
const INTERIOR_FADE = { duration: 0.35 };

const HOTSPOTS: Array<{
  id: Compartment;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
}> = [
  // Hotspots map to the cabinet interior layout (hangers top, folded clothes bottom-left, drawers bottom-right).
  { id: "shirts",  label: "חולצות ושמלות",            top: "31%", left: "20%", width: "29%", height: "20%" },
  { id: "coats",   label: "מעילים",                     top: "31%", left: "50%", width: "29%", height: "20%" },
  { id: "folded",  label: "מכנסיים ונעליים",           top: "51%", left: "20%", width: "29%", height: "27%" },
  { id: "drawers", label: "תחתונים גרביים תכשיטים",    top: "58%", left: "50%", width: "29%", height: "20%" },
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

  const leftDoorClip = `polygon(${LEFT_DOOR.left}% ${LEFT_DOOR.top}%, ${LEFT_DOOR.right}% ${LEFT_DOOR.top}%, ${LEFT_DOOR.right}% ${LEFT_DOOR.bottom}%, ${LEFT_DOOR.left}% ${LEFT_DOOR.bottom}%)`;
  const rightDoorClip = `polygon(${RIGHT_DOOR.left}% ${RIGHT_DOOR.top}%, ${RIGHT_DOOR.right}% ${RIGHT_DOOR.top}%, ${RIGHT_DOOR.right}% ${RIGHT_DOOR.bottom}%, ${RIGHT_DOOR.left}% ${RIGHT_DOOR.bottom}%)`;
  const leftDoorOrigin = `${LEFT_DOOR.left}% ${(LEFT_DOOR.top + LEFT_DOOR.bottom) / 2}%`;
  const rightDoorOrigin = `${RIGHT_DOOR.right}% ${(RIGHT_DOOR.top + RIGHT_DOOR.bottom) / 2}%`;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F5EFE0] via-parchment to-[#E8DDC9]">
      {/* Loading / error fallback */}
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
              <p className="text-sm text-walnut-400 font-editorial italic leading-relaxed">
                ודאי ש-{" "}
                <code className="text-brass not-italic font-mono text-xs bg-parchment-light px-1.5 py-0.5 rounded">
                  public/wardrobe-closed.png
                </code>
                {" "}ו-{" "}
                <code className="text-brass not-italic font-mono text-xs bg-parchment-light px-1.5 py-0.5 rounded">
                  public/wardrobe-interior.png
                </code>
                {" "}קיימים
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Cabinet wrapper — perspective makes rotateY look 3D */}
      <div
        onClick={() => ready && setCabinetOpen((v) => !v)}
        className="relative w-full max-w-md mx-auto cursor-pointer"
        style={{ aspectRatio: "937 / 1678", perspective: "1800px" }}
        role="button"
        aria-label={cabinetOpen ? "סגרי את הארון" : "פתחי את הארון"}
      >
        {/* L1: closed image — always visible, full frame (room + closed cabinet) */}
        <img
          src="/wardrobe-closed.png"
          alt="חדר עם ארון"
          draggable={false}
          onLoad={() => setClosedLoaded(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        />

        {/* L2: open-room image — full frame, fades in when doors open */}
        <motion.img
          src="/wardrobe-interior.png"
          alt="ארון פתוח"
          draggable={false}
          onLoad={() => setInteriorLoaded(true)}
          onError={() => setErrored(true)}
          animate={{ opacity: ready && cabinetOpen ? 1 : 0 }}
          transition={{ ...INTERIOR_FADE, delay: cabinetOpen ? 0.25 : 0 }}
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
          style={{ objectFit: "contain", zIndex: 10 }}
        />

        {/* L3a: LEFT DOOR — clipped from closed image, hinged on outer-left edge */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/wardrobe-closed.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            clipPath: leftDoorClip,
            transformOrigin: leftDoorOrigin,
            zIndex: 20,
          }}
          animate={{
            rotateY: cabinetOpen ? -SWING_ANGLE : 0,
            filter: cabinetOpen ? "brightness(0.85)" : "brightness(1)",
          }}
          transition={SWING}
        />

        {/* L3b: RIGHT DOOR — same pattern, mirrored */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/wardrobe-closed.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            clipPath: rightDoorClip,
            transformOrigin: rightDoorOrigin,
            zIndex: 20,
          }}
          animate={{
            rotateY: cabinetOpen ? SWING_ANGLE : 0,
            filter: cabinetOpen ? "brightness(0.85)" : "brightness(1)",
          }}
          transition={{ ...SWING, delay: cabinetOpen ? 0.06 : 0 }}
        />

        {/* Hotspots — labeled zones visible when cabinet open */}
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
              transition={{ duration: 0.3, delay: 0.5 + i * 0.07 }}
              whileTap={{ scale: 0.95 }}
              aria-label={spot.label}
              className="absolute rounded-lg cursor-pointer focus:outline-none group"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                zIndex: 30,
                background: "rgba(250, 246, 238, 0.08)",
                border: "1px solid rgba(184, 149, 106, 0.18)",
                backdropFilter: "blur(1px)",
              }}
            >
              {/* label chip at bottom of zone */}
              <span
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium leading-none transition-all duration-200"
                style={{
                  background: "rgba(26,20,16,0.52)",
                  color: "#F2EAE0",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(184,149,106,0.25)",
                }}
              >
                {spot.label.split(" ")[0]}
              </span>
            </motion.button>
          ))}
      </div>

      {/* Hint — only when ready and closed */}
      <AnimatePresence>
        {ready && !cabinetOpen && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="absolute bottom-28 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-20"
            dir="rtl"
          >
            {/* pulsing dot */}
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="block h-2 w-2 rounded-full bg-brass"
            />
            <p className="font-editorial italic text-white/80 text-sm tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              הקליקי לפתיחת הארון
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
