import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import Cabinet from "./Cabinet";
import Floor from "./Floor";
import Walls from "./Walls";

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function Room3D({ open, onToggle }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.55, 4.2], fov: 38 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.1}
        color="#FFE6C8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} color="#D9C7AE" />

      <Suspense fallback={null}>
        <Floor />
        <Walls />
        <Cabinet open={open} onToggle={onToggle} />
        <ContactShadows
          position={[0, -0.001, 0]}
          opacity={0.4}
          scale={6}
          blur={2.5}
          far={2}
        />
        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  );
}
