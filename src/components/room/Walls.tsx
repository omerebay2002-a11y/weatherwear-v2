/**
 * Three walls: back + 2 sides. Cream/parchment color.
 * Subtle baseboard at the bottom.
 */
export default function Walls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2.5, -1.7]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#E8DDC9" roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-4, 2.5, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#DDD0BA" roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[4, 2.5, 0.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#DDD0BA" roughness={0.95} />
      </mesh>

      {/* Back baseboard */}
      <mesh position={[0, 0.07, -1.69]} receiveShadow>
        <boxGeometry args={[12, 0.14, 0.02]} />
        <meshStandardMaterial color="#F5EFE6" roughness={0.85} />
      </mesh>
    </group>
  );
}
