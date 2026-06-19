import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import type { Compartment } from "../room/Cabinet";
import { loadProfile } from "../../lib/profile";

// The avatar is a STABLE cutout layer over the room, so it never shifts when the
// wardrobe opens. The wardrobe opens/closes for real via two short videos of the
// doors swinging (both play forward natively → identical smooth speed).
const AVATAR_SRC: Record<"woman" | "man" | "mixed", string> = {
  woman: "/avatar-woman.png",
  man: "/avatar-woman.png", // TODO: add /avatar-man.png cutout
  mixed: "/avatar-woman.png",
};

// Hotspot zones are % of the frame — calibrated against the open wardrobe
// (wardrobe sits on the LEFT, interior ~x 8–40%). Fine-tune visually on device.
const HOTSPOTS: Array<{ id: Compartment; label: string; top: string; left: string; width: string; height: string }> = [
  { id: "shirts",  label: "חולצות ושמלות", top: "20%", left: "9%",  width: "30%", height: "22%" },
  { id: "folded",  label: "מקופל",          top: "43%", left: "9%",  width: "30%", height: "12%" },
  { id: "drawers", label: "מגירות",          top: "56%", left: "16%", width: "24%", height: "12%" },
  { id: "coats",   label: "נעליים",          top: "69%", left: "9%",  width: "30%", height: "9%"  },
];

const OPEN_RATE = 2.0; // play the door-swing a touch faster than real time

type Active = "none" | "open" | "close";

export default function WardrobeIllustration({ onCompartmentClick }: { onCompartmentClick: (c: Compartment) => void }) {
  const openRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLVideoElement>(null);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [active, setActive] = useState<Active>("none"); // which clip is showing
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);

  const avatarSrc = AVATAR_SRC[loadProfile()?.wardrobeFor ?? "woman"];

  const play = (el: HTMLVideoElement | null) => {
    if (!el) return;
    el.currentTime = 0;
    el.playbackRate = OPEN_RATE;
    el.play().catch(() => {/* if autoplay blocked the static frame still reads */});
  };

  const toggle = () => {
    if (!ready) return;
    if (cabinetOpen) {
      setCabinetOpen(false);
      setActive("close");
      play(closeRef.current);
    } else {
      setCabinetOpen(true);
      setActive("open");
      play(openRef.current);
    }
  };

  const baseVid = "absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none";

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
            <div className="max-w-xs px-6 text-center space-y-3">
              <Archive className="h-12 w-12 mx-auto text-walnut-300" strokeWidth={1.2} />
              <p className="font-display text-base text-ebony">ארון לא נטען</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Scene container — portrait 9:16, centered. */}
      <div
        onClick={toggle}
        className="absolute left-1/2 -translate-x-1/2 top-0 h-full cursor-pointer"
        style={{ aspectRatio: "768 / 1376", minWidth: "100%" }}
        role="button"
        aria-label={cabinetOpen ? "סגרי את הארון" : "פתחי את הארון"}
      >
        {/* Closed poster — shown until any clip plays (z1). */}
        <img
          src="/wardrobe-closed.png"
          alt="ארון"
          draggable={false}
          onError={() => setErrored(true)}
          className={baseVid}
          style={{ zIndex: 1 }}
        />

        {/* Door-OPEN clip (closed → open). First frame === closed room. */}
        <video
          ref={openRef}
          src="/wardrobe-open.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setReady(true)}
          onError={() => setErrored(true)}
          className={baseVid}
          style={{ zIndex: 2, opacity: active === "open" ? 1 : 0 }}
        />

        {/* Door-CLOSE clip (open → closed). */}
        <video
          ref={closeRef}
          src="/wardrobe-close.mp4"
          muted
          playsInline
          preload="auto"
          className={baseVid}
          style={{ zIndex: 3, opacity: active === "close" ? 1 : 0 }}
        />

        {/* Avatar — stable cutout layer, same canvas so it aligns and never shifts. */}
        <img
          src={avatarSrc}
          alt="הדמות שלך"
          draggable={false}
          className={baseVid}
          style={{ zIndex: 4 }}
        />

        {/* Hotspots — visible once open */}
        {ready && cabinetOpen &&
          HOTSPOTS.map((spot, i) => (
            <motion.button
              key={spot.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); onCompartmentClick(spot.id); }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 + i * 0.06 }}
              whileTap={{ scale: 0.95 }}
              aria-label={spot.label}
              className="absolute cursor-pointer focus:outline-none"
              style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height, zIndex: 10, background: "transparent" }}
            />
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
