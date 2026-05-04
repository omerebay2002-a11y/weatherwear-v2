interface Props {
  position: [number, number, number];
}

/**
 * Cylindrical brass pull handle. Vertically oriented, ~12 cm tall.
 * Two small base discs for the mounts.
 */
export default function BrassHandle({ position }: Props) {
  return (
    <group position={position}>
      {/* Vertical bar */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 16]} />
        <meshStandardMaterial
          color="#C9A57A"
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>
      {/* Top mount */}
      <mesh castShadow position={[0, 0.06, 0.012]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Bottom mount */}
      <mesh castShadow position={[0, -0.06, 0.012]}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}
