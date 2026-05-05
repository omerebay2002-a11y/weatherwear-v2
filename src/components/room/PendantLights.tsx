/**
 * Linear pendant light fixture — a 1.4m brass rail with 3 glass pendants.
 * Each pendant: thin cable → brass cap → frosted globe.
 * The globes glow warm from within and cast soft pointLights downward.
 */
export default function PendantLights({
  position,
}: {
  position: [number, number, number];
}) {
  const PENDANTS = [
    { x: -0.42, drop: 0.28 },
    { x: 0,     drop: 0.48 },
    { x: 0.42,  drop: 0.32 },
  ];

  return (
    <group position={position}>
      {/* Ceiling mount */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
        <meshStandardMaterial color="#8C6B42" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Horizontal rail */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[1.4, 0.03, 0.03]} />
        <meshStandardMaterial color="#B8956A" metalness={0.9} roughness={0.15} />
      </mesh>

      {PENDANTS.map(({ x, drop }, i) => (
        <group key={i} position={[x, -0.04, 0]}>
          {/* Thin cable */}
          <mesh position={[0, -drop / 2, 0]}>
            <cylinderGeometry args={[0.004, 0.004, drop, 6]} />
            <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
          </mesh>

          {/* Brass cap */}
          <mesh position={[0, -drop - 0.025, 0]}>
            <cylinderGeometry args={[0.05, 0.04, 0.05, 16]} />
            <meshStandardMaterial color="#C9A57A" metalness={0.88} roughness={0.18} />
          </mesh>

          {/* Frosted glass globe — visible glow via emissive */}
          <mesh position={[0, -drop - 0.11, 0]}>
            <sphereGeometry args={[0.08, 24, 24]} />
            <meshPhysicalMaterial
              color="#FFF8E8"
              emissive="#FFD080"
              emissiveIntensity={1.2}
              roughness={0.1}
              metalness={0}
              transparent
              opacity={0.82}
            />
          </mesh>

          {/* Light source inside the globe */}
          <pointLight
            position={[0, -drop - 0.11, 0]}
            color="#FFD080"
            intensity={0.5}
            distance={3.5}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
