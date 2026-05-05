/**
 * Low walnut bench — sits in front of the wardrobe.
 * Adds scale reference and makes the room feel inhabited.
 * Dimensions: 1.0m wide × 0.4m tall × 0.38m deep.
 */
export default function Bench({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Seat cushion — dark sage linen */}
      <mesh castShadow receiveShadow position={[0, 0.215, 0]}>
        <boxGeometry args={[0.95, 0.07, 0.34]} />
        <meshStandardMaterial color="#5C6355" roughness={0.92} metalness={0} />
      </mesh>
      {/* Seat top frame */}
      <mesh castShadow receiveShadow position={[0, 0.185, 0]}>
        <boxGeometry args={[1.0, 0.025, 0.38]} />
        <meshStandardMaterial color="#42291C" roughness={0.7} metalness={0.02} />
      </mesh>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[1.0, 0.17, 0.38]} />
        <meshStandardMaterial color="#4A2C18" roughness={0.72} metalness={0.02} />
      </mesh>
      {/* Legs — 4 small tapered posts */}
      {[[-0.42, -0.16], [-0.42, 0.16], [0.42, -0.16], [0.42, 0.16]].map(
        ([lx, lz], i) => (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[lx as number, 0.0, lz as number]}
          >
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color="#2E1C10" roughness={0.8} />
          </mesh>
        )
      )}
    </group>
  );
}
