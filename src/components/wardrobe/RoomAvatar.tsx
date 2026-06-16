import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Camera } from "lucide-react";
import * as THREE from "three";
import { useWardrobe } from "../../contexts/WardrobeContext";
import { generateAvatar } from "../../lib/claude";
import type { ClothingCategory, ClothingItem } from "../../types";

const SELFIE_KEY = "avatar_selfie_url";
const RENDER_KEY = "avatar_render_url";

// The avatar is part of the wardrobe interface — it stands on the floor to the
// RIGHT of the wardrobe, in the same room. It is NOT a separate page.
//
// Until the user adds a selfie, an elegant tailor's dress form stands in its
// place. Once she adds a selfie and dresses it, a realistic image of HER wearing
// the wardrobe look (Nano Banana) stands there instead — same footprint.

function pickItem(items: ClothingItem[], category: ClothingCategory): ClothingItem | null {
  return items.filter((i) => i.category === category)[0] ?? null;
}

// A coherent look from the wardrobe: dress OR top+bottom, plus coat + shoes + bag.
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
  const outerwear = pickItem(items, "outerwear");
  if (outerwear) look.push(outerwear);
  const shoes = pickItem(items, "shoes");
  if (shoes) look.push(shoes);
  const bag = pickItem(items, "bag");
  if (bag) look.push(bag);
  return look;
}

function DressForm() {
  const torsoPoints = useMemo(
    () =>
      [
        [0.004, 0.0],
        [0.098, 0.012],
        [0.115, 0.09],
        [0.108, 0.2],
        [0.082, 0.34],
        [0.098, 0.5],
        [0.092, 0.58],
        [0.06, 0.67],
        [0.032, 0.72],
        [0.004, 0.73],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );

  const linen = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#D9C7A6", roughness: 0.92, metalness: 0 }),
    []
  );
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#B8956A", roughness: 0.35, metalness: 0.75 }),
    []
  );
  const walnut = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#4A3324", roughness: 0.6, metalness: 0.1 }),
    []
  );

  return (
    <group position={[0, -1.0, 0]} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color="#2C1E12" transparent opacity={0.22} />
      </mesh>
      <mesh material={walnut} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.04, 40]} />
      </mesh>
      <mesh material={walnut} position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.055, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={brass} position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.78, 16]} />
      </mesh>
      <mesh material={linen} position={[0, 0.78, 0]}>
        <latheGeometry args={[torsoPoints, 48]} />
      </mesh>
      <mesh material={brass} position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.018, 0.026, 0.035, 20]} />
      </mesh>
      <mesh material={brass} position={[0, 1.545, 0]}>
        <sphereGeometry args={[0.02, 20, 14]} />
      </mesh>
    </group>
  );
}

export default function RoomAvatar() {
  const { items } = useWardrobe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selfie, setSelfie] = useState<string | null>(() => localStorage.getItem(SELFIE_KEY));
  const [renderUrl, setRenderUrl] = useState<string | null>(() => localStorage.getItem(RENDER_KEY));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const look = useMemo(() => buildLook(items), [items]);

  useEffect(() => {
    if (selfie) localStorage.setItem(SELFIE_KEY, selfie);
    else localStorage.removeItem(SELFIE_KEY);
  }, [selfie]);

  useEffect(() => {
    if (renderUrl) localStorage.setItem(RENDER_KEY, renderUrl);
    else localStorage.removeItem(RENDER_KEY);
  }, [renderUrl]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfie(reader.result as string);
      setRenderUrl(null);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function dressMe() {
    if (!selfie || look.length === 0 || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const url = await generateAvatar(
        selfie,
        look.map((it) => ({
          name: it.name,
          category: it.category,
          color: it.color,
          colorHex: it.colorHex,
          material: it.material,
        }))
      );
      setRenderUrl(url);
    } catch {
      setError("הרינדור נכשל — נסי שוב");
    } finally {
      setGenerating(false);
    }
  }

  // What the chip does + says, by state.
  const onChip = () => {
    if (!selfie) fileRef.current?.click();
    else dressMe();
  };
  const chipLabel = !selfie ? "צרי בובה אישית" : renderUrl ? "לוק אחר" : "לבשי עליי";
  const ChipIcon = renderUrl ? RefreshCw : !selfie ? Camera : Sparkles;
  const chipDisabled = !!selfie && (look.length === 0 || generating);

  return (
    <>
      {/* The figure stands in the right strip of the room — on the rug, against
          the plain wall, never covering the wardrobe. */}
      <div
        className="absolute z-20 overflow-hidden rounded-xl"
        style={{ right: "-3%", bottom: "-2%", width: "32%", height: "62%" }}
      >
        {renderUrl ? (
          <motion.img
            key="render"
            src={renderUrl}
            alt="את לובשת את הלוק"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full object-contain object-bottom drop-shadow-xl"
          />
        ) : (
          <Canvas
            camera={{ position: [0, 0.5, 3.6], fov: 36 }}
            style={{ background: "transparent" }}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
          >
            <ambientLight intensity={1.1} color="#FBEFD8" />
            <directionalLight position={[-2.5, 2.5, 2]} intensity={1.9} color="#FFE6B8" />
            <directionalLight position={[2, 1.5, -1]} intensity={0.4} color="#C9D6EC" />
            <Suspense fallback={null}>
              <DressForm />
            </Suspense>
          </Canvas>
        )}

        {/* Generating overlay */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "rgba(26,18,10,0.5)", backdropFilter: "blur(2px)" }}
            >
              <Sparkles className="h-6 w-6 animate-pulse" style={{ color: "#E9CE7B" }} />
              <span className="font-editorial italic text-xs" style={{ color: "#F2EAE0" }}>
                מלבישה אותך…
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiet action chip by the figure */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={onChip}
        disabled={chipDisabled}
        className="absolute z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium disabled:opacity-50"
        style={{
          right: "4%",
          top: "30%",
          background: "rgba(26,18,10,0.55)",
          color: "#F2EAE0",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(201,168,76,0.4)",
        }}
        dir="rtl"
      >
        <ChipIcon className="h-3 w-3" style={{ color: "#E9CE7B" }} />
        {chipLabel}
      </motion.button>

      {/* Change-selfie chip (only once a selfie exists) */}
      {selfie && (
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute z-30 rounded-full p-1.5"
          style={{
            right: "4%",
            top: "calc(30% + 30px)",
            background: "rgba(242,234,224,0.85)",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
          aria-label="החליפי סלפי"
        >
          <Camera className="h-3 w-3" style={{ color: "#6B4F35" }} />
        </button>
      )}

      {/* Error hint */}
      {error && (
        <div
          className="absolute z-30 rounded-md px-2.5 py-1.5 text-[10px] leading-tight"
          style={{ right: "4%", top: "calc(30% + 64px)", background: "rgba(180,40,40,0.9)", color: "#fff", maxWidth: "30%" }}
          dir="rtl"
        >
          {error}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
