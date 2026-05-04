import { MeshReflectorMaterial } from "@react-three/drei";

/**
 * Dark walnut floor with subtle reflection.
 * Single plane — no plank texture (kept minimal/modern).
 */
export default function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={1.5}
        roughness={0.85}
        depthScale={0.4}
        minDepthThreshold={0.85}
        maxDepthThreshold={1}
        color="#3a2618"
        metalness={0.2}
        mirror={0.45}
      />
    </mesh>
  );
}
