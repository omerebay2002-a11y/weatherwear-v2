import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, Camera, Sparkles } from "lucide-react";
import type { Compartment } from "../room/Cabinet";
import type { ClothingCategory, ClothingItem } from "../../types";
import { useWardrobe } from "../../contexts/WardrobeContext";
import { generateAvatar } from "../../lib/claude";
import { useAvatarRender, defaultFigureSrc, fitFigureToBase, toFalImage, useDressing, useDressingError, setDressingError } from "../../lib/avatar-store";

function pickItem(items: ClothingItem[], c: ClothingCategory): ClothingItem | null {
  return items.filter((i) => i.category === c)[0] ?? null;
}
function buildLook(items: ClothingItem[]) {
  const look: ClothingItem[] = [];
  const dress = pickItem(items, "dress");
  if (dress) look.push(dress);
  else {
    const top = pickItem(items, "top");
    const bottom = pickItem(items, "bottom");
    if (top) look.push(top);
    if (bottom) look.push(bottom);
  }
  const shoes = pickItem(items, "shoes");
  if (shoes) look.push(shoes);
  return look.map((it) => ({ name: it.name, category: it.category, color: it.color, colorHex: it.colorHex, material: it.material }));
}

// The avatar is a STABLE cutout layer over the room, so it never shifts when the
// wardrobe opens. The wardrobe opens/closes for real via two short videos of the
// doors swinging (both play forward natively → identical smooth speed).

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

// Warm, on-brand "designing the look" overlay shown over the room while a try-on
// runs (quality drape takes ~20-30s — the wait must feel crafted, not stuck).
const DRESS_LINES = [
  "בוחרת את הבד…",
  "מתאימה את הגזרה…",
  "מסדרת את הקפלים…",
  "מעצבת את הלוק…",
  "עוד רגע מוכן…",
];

function DressingOverlay() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % DRESS_LINES.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ background: "rgba(26,18,10,0.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
      dir="rtl"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="relative flex items-center justify-center"
      >
        <Sparkles className="h-9 w-9" style={{ color: "#E9CE7B" }} />
      </motion.div>
      <div className="h-6 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="font-editorial italic text-parchment text-base"
          >
            {DRESS_LINES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      {/* slim brass shimmer progress bar */}
      <div className="w-40 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(242,234,224,0.18)" }}>
        <motion.div
          className="h-full w-1/2 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #E9CE7B, transparent)" }}
          animate={{ x: ["-100%", "260%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function WardrobeIllustration({ onCompartmentClick }: { onCompartmentClick: (c: Compartment) => void }) {
  const openRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { items } = useWardrobe();
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [active, setActive] = useState<Active>("none"); // which clip is showing
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);
  const [renderUrl, setRenderUrl] = useAvatarRender();
  const [generating, setGenerating] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dressing = useDressing();
  const dressingError = useDressingError();
  useEffect(() => {
    if (!dressingError) return;
    const id = setTimeout(() => setDressingError(null), 4000);
    return () => clearTimeout(id);
  }, [dressingError]);

  // A saved render is ALREADY fit to the base box (+ shadow + de-haloed) once, at
  // save time — so render it as-is here. The default mannequin shows at its
  // locked authored size. Never re-process here (re-fitting would fold the baked
  // contact shadow into the bounding box and shrink the figure).
  const avatarSrc = renderUrl ?? defaultFigureSrc();

  function handleSelfie(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const selfie = reader.result as string;
      setGenerating(true);
      setAvatarError(false);
      try {
        // Inline the room as a data URL so fal composites it without having to
        // fetch our (auth-protected) preview origin — selfie works on share links.
        const roomUrl = await toFalImage("/wardrobe-closed.png");
        const raw = await generateAvatar(selfie, buildLook(items), roomUrl);
        const url = await fitFigureToBase(raw); // whole + same size as the base figure
        setRenderUrl(url);
      } catch {
        setAvatarError(true);
      } finally {
        setGenerating(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

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

      {/* Selfie chip — turn the default figure into a realistic "you" */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={generating}
        className="absolute z-40 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium disabled:opacity-50"
        style={{
          right: "5%", top: "18%",
          background: "rgba(26,18,10,0.6)", color: "#F2EAE0",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(201,168,76,0.45)",
        }}
        dir="rtl"
      >
        <Camera className="h-3.5 w-3.5" style={{ color: "#E9CE7B" }} />
        {renderUrl ? "החליפי תמונה" : "צרי בובה אישית"}
      </button>

      {avatarError && (
        <div className="absolute z-40 rounded-md px-2.5 py-1.5 text-[11px] leading-tight"
          style={{ right: "5%", top: "calc(18% + 40px)", background: "rgba(180,40,40,0.9)", color: "#fff", maxWidth: "44%" }} dir="rtl">
          יצירת הדמות נכשלה — נסי שוב
        </div>
      )}

      {/* Generating overlay (selfie) */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(26,18,10,0.55)", backdropFilter: "blur(3px)" }}
            dir="rtl"
          >
            <Sparkles className="h-8 w-8 animate-pulse" style={{ color: "#E9CE7B" }} />
            <p className="font-editorial italic text-parchment text-base">בונה אותך בחדר…</p>
            <p className="text-parchment/60 text-xs">כמה שניות</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dressing overlay (try-on) — elegant wait while the look is designed */}
      <AnimatePresence>{dressing && <DressingOverlay />}</AnimatePresence>

      {/* Dressing error — transient */}
      <AnimatePresence>
        {dressingError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 bottom-28 rounded-lg px-3.5 py-2 text-[12px] leading-tight max-w-[80%] text-center"
            style={{ background: "rgba(140,30,30,0.94)", color: "#fff" }}
            dir="rtl"
          >
            ההלבשה נכשלה — נסי שוב
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfie} />

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
