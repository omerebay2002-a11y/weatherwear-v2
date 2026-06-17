import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import { loadProfile } from "../../lib/profile";
import { useWardrobe } from "../../contexts/WardrobeContext";
import { generateAvatar } from "../../lib/claude";
import type { ClothingCategory, ClothingItem } from "../../types";

// The avatar stands in the clean lane to the RIGHT of the wardrobe — a flat
// cutout LAYER over the room photo (not baked in). Default: a faceless
// boutique mannequin chosen by the onboarding profile. Once the user adds a
// selfie, a realistic full-body "her" (selfie → render → cutout) replaces it.

const MANNEQUIN: Record<"woman" | "man" | "mixed", string> = {
  woman: "/avatar-female.png",
  man: "/avatar-male.png",
  mixed: "/avatar-female.png",
};

const SELFIE_KEY = "avatar_selfie_url";
const RENDER_KEY = "avatar_render_url";

function pickItem(items: ClothingItem[], c: ClothingCategory): ClothingItem | null {
  return items.filter((i) => i.category === c)[0] ?? null;
}
function buildLook(items: ClothingItem[]): ClothingItem[] {
  const look: ClothingItem[] = [];
  const dress = pickItem(items, "dress");
  if (dress) look.push(dress);
  else {
    const top = pickItem(items, "top");
    const bottom = pickItem(items, "bottom");
    if (top) look.push(top);
    if (bottom) look.push(bottom);
  }
  const out = pickItem(items, "outerwear");
  if (out) look.push(out);
  const shoes = pickItem(items, "shoes");
  if (shoes) look.push(shoes);
  return look;
}

export default function RoomAvatar() {
  const { items } = useWardrobe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [renderUrl, setRenderUrl] = useState<string | null>(() => localStorage.getItem(RENDER_KEY));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mannequinSrc = useMemo(() => MANNEQUIN[loadProfile()?.wardrobeFor ?? "woman"], []);
  const figureSrc = renderUrl ?? mannequinSrc;

  useEffect(() => {
    if (renderUrl) localStorage.setItem(RENDER_KEY, renderUrl);
    else localStorage.removeItem(RENDER_KEY);
  }, [renderUrl]);

  function pickSelfie() {
    fileRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(SELFIE_KEY, dataUrl);
      void dressFromSelfie(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function dressFromSelfie(selfie: string) {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const look = buildLook(items).map((it) => ({
        name: it.name, category: it.category, color: it.color, colorHex: it.colorHex, material: it.material,
      }));
      const url = await generateAvatar(selfie, look); // empty look → neutral outfit
      setRenderUrl(url);
    } catch {
      setError("יצירת הדמות נכשלה — נסי שוב");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      {/* Figure layer — fills the right standing lane */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ right: "-1%", bottom: "1%", width: "54%", height: "82%" }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: "1%", width: "44%", height: "2.6%", background: "rgba(40,26,14,0.3)", filter: "blur(8px)", borderRadius: "50%" }}
        />
        <AnimatePresence mode="wait">
          <motion.img
            key={figureSrc}
            src={figureSrc}
            alt="הדמות שלך"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full h-full object-contain object-bottom select-none"
            draggable={false}
          />
        </AnimatePresence>

        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "rgba(26,18,10,0.45)", backdropFilter: "blur(2px)" }}
            >
              <Sparkles className="h-6 w-6 animate-pulse" style={{ color: "#E9CE7B" }} />
              <span className="font-editorial italic text-xs" style={{ color: "#F2EAE0" }}>בונה אותך…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selfie chip — by the figure */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={pickSelfie}
        disabled={generating}
        className="absolute z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium disabled:opacity-50"
        style={{
          right: "5%", top: "26%",
          background: "rgba(26,18,10,0.55)", color: "#F2EAE0",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(201,168,76,0.4)",
        }}
        dir="rtl"
      >
        <Camera className="h-3 w-3" style={{ color: "#E9CE7B" }} />
        {renderUrl ? "החליפי סלפי" : "צרי בובה אישית"}
      </motion.button>

      {error && (
        <div
          className="absolute z-30 rounded-md px-2.5 py-1.5 text-[10px] leading-tight"
          style={{ right: "5%", top: "calc(26% + 34px)", background: "rgba(180,40,40,0.9)", color: "#fff", maxWidth: "40%" }}
          dir="rtl"
        >
          {error}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />
    </>
  );
}
