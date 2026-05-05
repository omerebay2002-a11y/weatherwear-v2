/**
 * Walls — back + 2 sides with depth-creating tonal contrast.
 * Back wall is the warmest cream; side walls are slightly cooler/dustier
 * (this is a classic interior trick — same hue, different temperature).
 * Crown moulding + chair rail + walnut baseboard add architectural feel.
 */
export default function Walls() {
  return (
    <group>
      {/* Back wall — warm cream */}
      <mesh position={[0, 2.5, -1.7]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#EFE4D0" roughness={0.95} />
      </mesh>

      {/* Left wall — cooler dusty cream */}
      <mesh position={[-4, 2.5, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#D8CCB6" roughness={0.95} />
      </mesh>

      {/* Right wall — slightly different to break symmetry */}
      <mesh position={[4, 2.5, 0.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#DCC9B2" roughness={0.95} />
      </mesh>

      {/* Crown moulding at the top of back wall */}
      <mesh position={[0, 5.0, -1.69]}>
        <boxGeometry args={[12, 0.12, 0.04]} />
        <meshStandardMaterial color="#F5EFE6" roughness={0.85} />
      </mesh>

      {/* Chair rail — subtle horizontal accent at mid-height */}
      <mesh position={[0, 2.0, -1.69]}>
        <boxGeometry args={[12, 0.04, 0.025]} />
        <meshStandardMaterial color="#7E5733" roughness={0.7} />
      </mesh>

      {/* Walnut baseboard */}
      <mesh position={[0, 0.09, -1.69]} receiveShadow>
        <boxGeometry args={[12, 0.18, 0.03]} />
        <meshStandardMaterial color="#42291C" roughness={0.85} />
      </mesh>

      {/* Side wall baseboards */}
      <mesh
        position={[-3.99, 0.09, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[6, 0.18, 0.03]} />
        <meshStandardMaterial color="#42291C" roughness={0.85} />
      </mesh>
      <mesh
        position={[3.99, 0.09, 0.5]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[6, 0.18, 0.03]} />
        <meshStandardMaterial color="#42291C" roughness={0.85} />
      </mesh>
    </group>
  );
}
