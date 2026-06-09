import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useWardrobe } from "../contexts/WardrobeContext";
import type { ClothingItem, ClothingCategory } from "../types";
import { CATEGORY_LABEL, CATEGORY_EMOJI } from "../lib/constants";

const RPM_AVATAR_KEY = "rpm_avatar_url";
const RPM_IFRAME = "https://demo.readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody";

const OUTFIT_CATS: ClothingCategory[] = ["top", "bottom", "dress", "outerwear", "shoes", "bag"];

function pick(items: ClothingItem[], cat: ClothingCategory) {
  return items.find((i) => i.category === cat) ?? null;
}

function RPMAvatarModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2.3} position={[0, -1.15, 0]} />;
}

function AvatarScene({ url }: { url: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 2.6], fov: 42 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.4} color="#FFF4E0" />
      <directionalLight position={[1.5, 3, 2]} intensity={1.8} color="#FFE8C0" castShadow />
      <directionalLight position={[-2, 1, -1]} intensity={0.4} color="#C8D8F0" />
      <Suspense fallback={null}>
        <RPMAvatarModel url={url} />
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  );
}

function OutfitChip({ item, cat }: { item: ClothingItem | null; cat: ClothingCategory }) {
  if (!item) return null;
  return (
    <div className="flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1.5"
      style={{ background: "rgba(250,246,238,0.12)", border: "1px solid rgba(184,149,106,0.25)" }}>
      <span
        className="h-3.5 w-3.5 rounded-full shrink-0"
        style={{ background: item.colorHex || "#C7A685" }}
      />
      <span className="text-[11px] text-parchment font-medium leading-none">
        {CATEGORY_EMOJI[cat]} {item.name || CATEGORY_LABEL[cat]}
      </span>
    </div>
  );
}

export default function Avatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    () => localStorage.getItem(RPM_AVATAR_KEY)
  );
  const [showCreator, setShowCreator] = useState(false);
  const { items } = useWardrobe();

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== "string") return;
      let url: string | null = null;
      if (e.data.endsWith(".glb")) {
        url = e.data;
      } else {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed?.source === "readyplayerme" && parsed?.eventName === "v1.avatar.exported") {
            url = parsed.data?.url ?? null;
          }
        } catch {}
      }
      if (url) {
        localStorage.setItem(RPM_AVATAR_KEY, url);
        setAvatarUrl(url);
        setShowCreator(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const outfit = OUTFIT_CATS.map((cat) => ({ cat, item: pick(items, cat) }))
    .filter((s) => s.item !== null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-[100dvh] w-full overflow-hidden"
    >
      <div
        className="absolute top-0 bottom-0 left-0"
        style={{
          width: "52%",
          background: "linear-gradient(180deg, #F0E5D2 0%, #F2C4B4 18%, #E8A888 55%, #A8783A 78%, #7A5828 100%)",
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 overflow-hidden"
        style={{ width: "52%" }}
      >
        <img
          src="/wardrobe-closed.svg"
          alt=""
          draggable={false}
          className="h-full w-auto object-cover pointer-events-none select-none"
          style={{ marginLeft: "-10%" }}
        />
      </div>
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: "44%",
          width: "16%",
          background: "linear-gradient(to right, #E8A888, transparent)",
        }}
      />

      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 pt-safe pt-3 pb-2">
              <span className="font-display text-white text-base">צרי את הבובה שלך</span>
              <button
                onClick={() => setShowCreator(false)}
                className="text-white/70 hover:text-white transition text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <iframe
              src={RPM_IFRAME}
              title="Ready Player Me avatar creator"
              allow="camera *; microphone *"
              className="flex-1 w-full border-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute top-0 bottom-0 left-0 z-10"
        style={{ width: "58%", paddingBottom: "160px" }}
      >
        {avatarUrl ? (
          <AvatarScene url={avatarUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" dir="rtl">
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowCreator(true)}
              className="brass-plate rounded-xl px-5 py-4 text-sm font-semibold shadow-lg flex flex-col items-center gap-1.5"
            >
              <span className="text-2xl">👤</span>
              <span>צרי את הבובה שלך</span>
              <span className="text-[11px] font-normal opacity-80">
                מהסלפי — נראית כמוך
              </span>
            </motion.button>
          </div>
        )}
      </div>

      {avatarUrl && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowCreator(true)}
          className="absolute top-14 left-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
          style={{
            background: "rgba(26,20,16,0.5)",
            color: "#F2EAE0",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(184,149,106,0.3)",
          }}
          dir="rtl"
        >
          <RefreshCw className="h-3 w-3" />
          שנה בובה
        </motion.button>
      )}

      <div
        className="absolute bottom-20 inset-x-0 z-20 px-3"
        dir="rtl"
      >
        <div
          className="rounded-2xl px-3 py-3"
          style={{
            background: "rgba(26,20,16,0.58)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(184,149,106,0.2)",
          }}
        >
          {outfit.length > 0 ? (
            <>
              <p className="text-[11px] text-parchment/60 font-medium mb-2">הלוק של היום</p>
              <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                {outfit.map(({ cat, item }) => (
                  <OutfitChip key={cat} item={item} cat={cat} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-parchment/60 font-editorial italic py-1">
              הארון ריק — הוסיפי בגדים כדי לבנות לוק
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
