/**
 * Decorative rug — a layered rectangle on the floor in front of the cabinet.
 * Two planes (border + fill) fake a bordered rug pattern.
 */
export default function Rug({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Outer border — deep charcoal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 1.4]} />
        <meshStandardMaterial color="#2A2C2E" roughness={0.95} metalness={0} />
      </mesh>
      {/* Inner fill — warm sage-charcoal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[2.3, 1.1]} />
        <meshStandardMaterial color="#38393A" roughness={0.95} metalness={0} />
      </mesh>
      {/* Center diamond motif (subtle, single rotated square) */}
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        position={[0, 0.002, 0]}
        receiveShadow
      >
        <planeGeometry args={[0.45, 0.45]} />
        <meshStandardMaterial color="#4A4A4B" roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}
