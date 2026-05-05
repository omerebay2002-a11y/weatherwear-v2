/**
 * Brass chandelier — 6 arms radiating outward, each with a small glowing bulb.
 * Sits high above the cabinet to give vertical contrast.
 */
export default function Chandelier({ position }: { position: [number, number, number] }) {
  const ARMS = 6;
  const ARM_LEN = 0.55;

  return (
    <group position={position}>
      {/* Cable from ceiling */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.2, 8]} />
        <meshStandardMaterial color="#1A1410" roughness={0.85} />
      </mesh>

      {/* Top mount cap */}
      <mesh position={[0, 0.05, 0]}>
        <coneGeometry args={[0.05, 0.1, 12]} />
        <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Central body */}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#C9A57A" metalness={0.85} roughness={0.22} />
      </mesh>

      {/* Decorative ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
        <torusGeometry args={[0.32, 0.012, 8, 32]} />
        <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Arms + bulbs */}
      {Array.from({ length: ARMS }).map((_, i) => {
        const angle = (i / ARMS) * Math.PI * 2;
        const x = Math.cos(angle) * ARM_LEN;
        const z = Math.sin(angle) * ARM_LEN;
        return (
          <group key={i}>
            {/* Arm — slanted from center to bulb position */}
            <mesh
              position={[x / 2, -0.1, z / 2]}
              rotation={[0, -angle, Math.PI / 2 - Math.atan2(0.18, ARM_LEN / 2)]}
            >
              <cylinderGeometry args={[0.008, 0.008, ARM_LEN * 1.05, 8]} />
              <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.28} />
            </mesh>
            {/* Bulb cup (brass holder) */}
            <mesh position={[x, -0.18, z]}>
              <cylinderGeometry args={[0.025, 0.018, 0.04, 12]} />
              <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Glowing bulb */}
            <mesh position={[x, -0.22, z]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial
                color="#FFE6B0"
                emissive="#FFCB7A"
                emissiveIntensity={2.5}
                roughness={0.1}
              />
            </mesh>
            {/* Tiny point light at the bulb to actually cast warmth */}
            <pointLight
              position={[x, -0.22, z]}
              color="#FFD79A"
              intensity={0.12}
              distance={1.6}
              decay={2}
            />
          </group>
        );
      })}

      {/* Subtle bottom finial */}
      <mesh position={[0, -0.32, 0]}>
        <coneGeometry args={[0.03, 0.08, 10]} />
        <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}
