import { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import * as THREE from "three";

const RPM_AVATAR_KEY = "rpm_avatar_url";
const RPM_IFRAME = "https://demo.readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody";

// The avatar is part of the wardrobe interface — it stands on the floor to the
// LEFT of the wardrobe, in the same room. It is NOT a separate page.
//
// Until the user creates a personal Ready Player Me avatar, an elegant tailor's
// dress form stands in its place — linen torso, brass pole, walnut base — in the
// same material language as the room. Outfits will be dressed on this figure.

function DressForm() {
  // Lathe profile of the torso: (radius, height) pairs from hip to neck
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
      {/* soft contact shadow on the rug */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color="#2C1E12" transparent opacity={0.22} />
      </mesh>
      {/* walnut base — turned-wood dome */}
      <mesh material={walnut} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.04, 40]} />
      </mesh>
      <mesh material={walnut} position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.055, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* brass pole */}
      <mesh material={brass} position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.78, 16]} />
      </mesh>
      {/* linen torso */}
      <mesh material={linen} position={[0, 0.78, 0]}>
        <latheGeometry args={[torsoPoints, 48]} />
      </mesh>
      {/* brass neck cap */}
      <mesh material={brass} position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.018, 0.026, 0.035, 20]} />
      </mesh>
      <mesh material={brass} position={[0, 1.545, 0]}>
        <sphereGeometry args={[0.02, 20, 14]} />
      </mesh>
    </group>
  );
}

function RPMModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // RPM full-body avatars are ~1.8 units tall with feet at y=0
  return <primitive object={scene} scale={0.88} position={[0, -0.78, 0]} />;
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
      {/* The figure stands in the right strip of the room — on the rug, against
          the plain wall, never covering the wardrobe. */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ right: "-3%", bottom: "-2%", width: "32%", height: "62%" }}
      >
        <Canvas
          camera={{ position: [0, 0.5, 3.6], fov: 36 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
        >
          <ambientLight intensity={1.1} color="#FBEFD8" />
          <directionalLight position={[-2.5, 2.5, 2]} intensity={1.9} color="#FFE6B8" />
          <directionalLight position={[2, 1.5, -1]} intensity={0.4} color="#C9D6EC" />
          {avatarUrl ? (
            <Suspense fallback={<DressForm />}>
              <RPMModel url={avatarUrl} />
              <Suspense fallback={null}>
                <Environment preset="apartment" />
              </Suspense>
            </Suspense>
          ) : (
            <DressForm />
          )}
        </Canvas>
      </div>

      {/* Quiet action chip by the figure's feet */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreator(true)}
        className="absolute z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
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
        {avatarUrl ? (
          <>
            <RefreshCw className="h-3 w-3" />
            שנה בובה
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" style={{ color: "#E9CE7B" }} />
            צרי בובה אישית
          </>
        )}
      </motion.button>

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
