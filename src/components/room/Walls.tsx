/**
 * Room walls — back + 2 sides.
 * Back wall is the warmest, sides are slightly cooler (classic interior depth trick).
 * Architectural details: walnut skirting boards + slim chair rail.
 * A ceiling plane closes the top of the room, giving proper spatial boundaries.
 */
export default function Walls() {
  return (
    <group>
      {/* Ceiling — off-white, gives room real enclosure */}
      <mesh position={[0, 5.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#F8F4EE" roughness={1} />
      </mesh>

      {/* Back wall — warm ivory */}
      <mesh position={[0, 2.5, -1.7]} receiveShadow>
        <planeGeometry args={[12, 7]} />
        <meshStandardMaterial color="#F0E8D8" roughness={0.95} />
      </mesh>

      {/* Left wall — cooler off-white */}
      <mesh position={[-4, 2.5, 1.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color="#DDD0BC" roughness={0.95} />
      </mesh>

      {/* Right wall — warm side shadow tone */}
      <mesh position={[4, 2.5, 1.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color="#DBC7B0" roughness={0.95} />
      </mesh>

      {/* Walnut skirting boards — all three walls */}
      <mesh position={[0, 0.1, -1.69]} receiveShadow>
        <boxGeometry args={[12, 0.2, 0.035]} />
        <meshStandardMaterial color="#3E2510" roughness={0.75} />
      </mesh>
      <mesh position={[-3.99, 0.1, 1.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 0.035]} />
        <meshStandardMaterial color="#3E2510" roughness={0.75} />
      </mesh>
      <mesh position={[3.99, 0.1, 1.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 0.035]} />
        <meshStandardMaterial color="#3E2510" roughness={0.75} />
      </mesh>

      {/* Slim chair rail — back wall only */}
      <mesh position={[0, 2.05, -1.688]}>
        <boxGeometry args={[12, 0.035, 0.02]} />
        <meshStandardMaterial color="#8C6B42" roughness={0.65} />
      </mesh>

      {/* Crown moulding — back wall */}
      <mesh position={[0, 5.0, -1.688]}>
        <boxGeometry args={[12, 0.08, 0.03]} />
        <meshStandardMaterial color="#F5EDE0" roughness={0.85} />
      </mesh>
    </group>
  );
}
