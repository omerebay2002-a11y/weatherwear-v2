import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import type { Compartment } from "../room/Cabinet";
import { loadProfile } from "../../lib/profile";

// The avatar stands as a STABLE cutout layer over the room, so it never shifts
// when the wardrobe opens. The wardrobe opens for real via a short video of the
// doors swinging open (forward = open, reversed = close).
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

export default function WardrobeIllustration({ onCompartmentClick }: { onCompartmentClick: (c: Compartment) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);

  const avatarSrc = AVATAR_SRC[loadProfile()?.wardrobeFor ?? "woman"];

  const openWardrobe = () => {
    const v = videoRef.current;
    setCabinetOpen(true);
    if (!v) return;
    cancelAnimationFrame(rafRef.current);
    v.playbackRate = OPEN_RATE;
    v.play().catch(() => {/* if autoplay blocked, the static frames still read */});
  };

  // Close = play the clip in reverse by stepping currentTime down (reliable
  // cross-browser, unlike negative playbackRate).
  const closeWardrobe = () => {
    const v = videoRef.current;
    setCabinetOpen(false);
    if (!v) return;
    v.pause();
    const step = () => {
      const next = v.currentTime - (1 / 30) * OPEN_RATE;
      if (next <= 0 || Number.isNaN(next)) {
        v.currentTime = 0;
        return;
      }
      v.currentTime = next;
      rafRef.current = requestAnimationFrame(step);
    };
    step();
  };

  const toggle = () => {
    if (!ready) return;
    if (cabinetOpen) closeWardrobe();
    else openWardrobe();
  };

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
        {/* Closed poster (under the video, shown until the video is ready) */}
        <img
          src="/wardrobe-closed.png"
          alt="ארון"
          draggable={false}
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          style={{ zIndex: 1 }}
        />

        {/* The wardrobe doors opening — real motion. First frame === closed room. */}
        <video
          ref={videoRef}
          src="/wardrobe-open.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setReady(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          style={{ zIndex: 2 }}
        />

        {/* Avatar — stable cutout layer, same canvas so it aligns and never shifts. */}
        <img
          src={avatarSrc}
          alt="הדמות שלך"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          style={{ zIndex: 3 }}
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
