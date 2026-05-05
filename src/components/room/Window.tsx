/**
 * Background window — wooden frame + a "view" plane showing a soft daylight scene.
 * Mounted high on the back wall, above the cabinet, behind/around the chandelier line.
 * The window is mostly decorative — it's a visual cue that we're in a room, not in the void.
 */
interface Props {
  position: [number, number, number];
  width?: number;
  height?: number;
}

export default function Window({ position, width = 1.6, height = 1.4 }: Props) {
  const FRAME = 0.06;
  return (
    <group position={position}>
      {/* The view — a flat plane with a sky-to-garden gradient */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width - FRAME * 2, height - FRAME * 2]} />
        <meshBasicMaterial color="#A8C8DC" />
      </mesh>
      {/* Lower half of the view — warm garden tone, fakes a horizon */}
      <mesh position={[0, -(height - FRAME * 2) / 4, -0.005]}>
        <planeGeometry args={[width - FRAME * 2, (height - FRAME * 2) / 2]} />
        <meshBasicMaterial color="#9BAE94" />
      </mesh>
      {/* Frame — top */}
      <mesh position={[0, height / 2 - FRAME / 2, 0.01]}>
        <boxGeometry args={[width, FRAME, 0.04]} />
        <meshStandardMaterial color="#42291C" roughness={0.7} />
      </mesh>
      {/* Frame — bottom (sill) */}
      <mesh position={[0, -height / 2 + FRAME / 2, 0.012]}>
        <boxGeometry args={[width + 0.04, FRAME * 1.2, 0.06]} />
        <meshStandardMaterial color="#5C3E22" roughness={0.65} />
      </mesh>
      {/* Frame — left */}
      <mesh position={[-width / 2 + FRAME / 2, 0, 0.01]}>
        <boxGeometry args={[FRAME, height, 0.04]} />
        <meshStandardMaterial color="#42291C" roughness={0.7} />
      </mesh>
      {/* Frame — right */}
      <mesh position={[width / 2 - FRAME / 2, 0, 0.01]}>
        <boxGeometry args={[FRAME, height, 0.04]} />
        <meshStandardMaterial color="#42291C" roughness={0.7} />
      </mesh>
      {/* Cross mullion (vertical) — gives it the classic 4-pane window look */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[FRAME / 2, height - FRAME * 2, 0.05]} />
        <meshStandardMaterial color="#42291C" roughness={0.7} />
      </mesh>
      {/* Cross mullion (horizontal) */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[width - FRAME * 2, FRAME / 2, 0.05]} />
        <meshStandardMaterial color="#42291C" roughness={0.7} />
      </mesh>

      {/* Cool daylight spilling through the window into the room */}
      <pointLight
        position={[0, 0, 0.6]}
        color="#D8E4F0"
        intensity={0.55}
        distance={6}
        decay={1.4}
      />
    </group>
  );
}
