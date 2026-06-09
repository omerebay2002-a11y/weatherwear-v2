import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

const RPM_AVATAR_KEY = "rpm_avatar_url";
const RPM_IFRAME = "https://demo.readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody";

// The avatar is part of the wardrobe interface — it stands on the floor to the
// LEFT of the wardrobe, in the same room. It is NOT a separate page.
function RPMModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2.3} position={[0, -1.15, 0]} />;
}

export default function RoomAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem(RPM_AVATAR_KEY));
  const [showCreator, setShowCreator] = useState(false);

  // Ready Player Me posts the finished avatar's .glb URL back to us
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

  return (
    <>
      {/* The 3D avatar, standing on the floor left of the wardrobe (clicks pass through) */}
      {avatarUrl && (
        <div className="absolute left-0 bottom-[7%] z-20 pointer-events-none" style={{ width: "46%", height: "74%" }}>
          <Canvas
            camera={{ position: [0, 0.6, 2.6], fov: 42 }}
            style={{ background: "transparent" }}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={1.35} color="#FBEFD8" />
            <directionalLight position={[2, 3, 2]} intensity={1.7} color="#FFE6B8" />
            <directionalLight position={[-2, 1.5, -1]} intensity={0.35} color="#C9D6EC" />
            <Suspense fallback={null}>
              <RPMModel url={avatarUrl} />
              <Environment preset="apartment" />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Create avatar (when none) — elegant button on the avatar's spot */}
      {!avatarUrl ? (
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreator(true)}
          className="absolute left-3 bottom-28 z-30 flex flex-col items-center gap-2 rounded-2xl px-4 py-4 shadow-xl"
          style={{
            background: "rgba(28,20,12,0.58)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(201,168,76,0.45)",
          }}
          dir="rtl"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(201,168,76,0.18)", border: "1px solid rgba(201,168,76,0.5)" }}
          >
            <Sparkles className="h-5 w-5" style={{ color: "#E9CE7B" }} />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: "#F4ECDD" }}>
            צרי את הבובה שלך
          </span>
          <span className="text-[10px] font-normal" style={{ color: "rgba(244,236,221,0.72)" }}>
            מהסלפי — נראית כמוך
          </span>
        </motion.button>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowCreator(true)}
          className="absolute left-3 top-14 z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
          style={{
            background: "rgba(26,18,10,0.55)",
            color: "#F2EAE0",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(201,168,76,0.4)",
          }}
          dir="rtl"
        >
          <RefreshCw className="h-3 w-3" />
          שנה בובה
        </motion.button>
      )}

      {/* Ready Player Me creator (full-frame modal) */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2" dir="rtl">
              <span className="font-display text-white text-base">צרי את הבובה שלך</span>
              <button
                onClick={() => setShowCreator(false)}
                className="text-white/70 hover:text-white transition text-xl leading-none"
                aria-label="סגרי"
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
    </>
  );
}
