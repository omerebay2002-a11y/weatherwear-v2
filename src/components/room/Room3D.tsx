import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import Cabinet, { type Compartment } from "./Cabinet";
import Floor from "./Floor";
import Walls from "./Walls";
import PendantLights from "./PendantLights";
import Window from "./Window";
import Rug from "./Rug";
import Bench from "./Bench";

interface Props {
  open: boolean;
  onToggle: () => void;
  onCompartmentClick: (c: Compartment) => void;
}

export default function Room3D({ open, onToggle, onCompartmentClick }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1.5, 2]}
      camera={{ position: [0, 1.7, 5.8], fov: 44 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 1.5, -0.3);
      }}
    >
      {/* Warm ambient — fills corners without washing out shadows */}
      <ambientLight intensity={0.28} color="#FFF0D8" />

      {/* Primary key light — warm, from upper-right, casts shadows */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.9}
        color="#FFE0AA"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={5}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-bias={-0.001}
      />

      {/* Cool back-fill from window side — creates warm/cool contrast */}
      <directionalLight position={[-2.5, 3, -1.5]} intensity={0.35} color="#B8D0E8" />

      {/* Subtle front fill — lifts the floor/bench without flattening */}
      <pointLight position={[0, 0.8, 3]} intensity={0.18} color="#FFE6C8" distance={6} decay={2} />

      <Suspense fallback={null}>
        <Floor />
        <Walls />

        {/* Rug — dark charcoal rectangle, between camera and cabinet */}
        <Rug position={[0, 0.001, 1.1]} />

        {/* Bench — low walnut seat in front of cabinet */}
        <Bench position={[0, 0, 0.55]} />

        {/* Window on back wall above cabinet */}
        <Window position={[0, 2.95, -1.69]} width={1.5} height={1.0} />

        {/* 3-pendant linear light above the scene */}
        <PendantLights position={[0, 3.6, 0.5]} />

        {/* The hero */}
        <Cabinet
          open={open}
          onToggle={onToggle}
          onCompartmentClick={onCompartmentClick}
        />

        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.55}
          scale={8}
          blur={1.8}
          far={3}
          resolution={1024}
        />

        <Environment preset="apartment" />
      </Suspense>
    </Canvas>
  );
}
