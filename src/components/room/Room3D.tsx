import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import Cabinet from "./Cabinet";
import Floor from "./Floor";
import Walls from "./Walls";
import Chandelier from "./Chandelier";
import Window from "./Window";

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function Room3D({ open, onToggle }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1.5, 2]}
      camera={{ position: [0, 1.7, 5.0], fov: 40 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 1.55, -0.3);
      }}
    >
      {/* Warm ambient — fills shadows but doesn't wash out */}
      <ambientLight intensity={0.32} color="#FFF1D9" />

      {/* Warm key light from upper-right */}
      <directionalLight
        position={[2.5, 4.5, 3.5]}
        intensity={0.95}
        color="#FFE2B2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={5}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0008}
      />

      {/* Cool fill from the window side */}
      <directionalLight
        position={[-2.0, 3.5, -1.0]}
        intensity={0.4}
        color="#C7D7E8"
      />

      {/* Soft front-below fill — lifts cabinet's lower half */}
      <pointLight position={[0, 1.0, 2.0]} intensity={0.25} color="#FFE6C8" />

      <Suspense fallback={null}>
        <Floor />
        <Walls />

        {/* Window on back wall, just above cabinet top */}
        <Window position={[0, 3.0, -1.69]} width={1.6} height={1.1} />

        {/* Brass chandelier — hovers above cabinet top */}
        <Chandelier position={[0, 3.05, 0.6]} />

        {/* The hero — wardrobe */}
        <Cabinet open={open} onToggle={onToggle} />

        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.5}
          scale={7}
          blur={2.0}
          far={2.5}
          resolution={1024}
        />

        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  );
}
