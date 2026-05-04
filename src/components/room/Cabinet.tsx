import Door from "./Door";

interface Props {
  open: boolean;
  onToggle: () => void;
}

/**
 * Walnut wardrobe — 2.4m tall × 2.0m wide × 0.6m deep, sitting on the floor.
 * Group center at world (0, 1.2, -0.5). Floor is at world y=0.
 *
 * Layout (relative to group center):
 *   • back panel    z = -0.28
 *   • side panels   x = ±0.98
 *   • top + bottom  y = ±1.18
 *   • center divider (vert + horiz) — 2×2 grid
 *   • 2 shelves: one in upper compartment, one in lower
 *
 * Front face of cabinet at z = +0.3. Doors sit at z = +0.302 (just in front).
 */
export default function Cabinet({ open, onToggle }: Props) {
  // World pivot positions for the 4 doors (cabinet center at (0,1.2,-0.5))
  const cabX = 0,
    cabY = 1.2,
    cabZ = -0.5;
  const doorZ = cabZ + 0.302; // -0.198
  const topY = cabY + 0.6; // 1.8
  const botY = cabY - 0.6; // 0.6
  const leftX = cabX - 1.0; // -1.0
  const rightX = cabX + 1.0; // +1.0
  const DOOR_W = 1.0;
  const DOOR_H = 1.2;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Cabinet body */}
      <group position={[cabX, cabY, cabZ]}>
        {/* Back panel */}
        <mesh receiveShadow position={[0, 0, -0.28]}>
          <boxGeometry args={[2.0, 2.4, 0.04]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Left side */}
        <mesh receiveShadow castShadow position={[-0.98, 0, 0.02]}>
          <boxGeometry args={[0.04, 2.4, 0.58]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Right side */}
        <mesh receiveShadow castShadow position={[0.98, 0, 0.02]}>
          <boxGeometry args={[0.04, 2.4, 0.58]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Top cap */}
        <mesh receiveShadow castShadow position={[0, 1.18, 0.02]}>
          <boxGeometry args={[2.0, 0.04, 0.58]} />
          <meshStandardMaterial color="#42291C" roughness={0.7} />
        </mesh>

        {/* Top crown moulding (subtle) */}
        <mesh castShadow position={[0, 1.22, 0.02]}>
          <boxGeometry args={[2.06, 0.04, 0.62]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Bottom cap (slightly raised plinth) */}
        <mesh receiveShadow castShadow position={[0, -1.18, 0.02]}>
          <boxGeometry args={[2.0, 0.04, 0.58]} />
          <meshStandardMaterial color="#42291C" roughness={0.7} />
        </mesh>

        {/* Plinth toe-kick */}
        <mesh castShadow position={[0, -1.16, 0.04]}>
          <boxGeometry args={[1.96, 0.08, 0.52]} />
          <meshStandardMaterial color="#3E2A18" roughness={0.85} />
        </mesh>

        {/* Horizontal mid divider (between top + bottom doors) */}
        <mesh receiveShadow castShadow position={[0, 0, 0.02]}>
          <boxGeometry args={[1.96, 0.04, 0.56]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Vertical mid divider (between left + right doors) */}
        <mesh receiveShadow castShadow position={[0, 0, 0.02]}>
          <boxGeometry args={[0.04, 2.4, 0.56]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Interior — slightly lighter back wall to brighten when doors are open */}
        <mesh position={[0, 0, -0.255]}>
          <boxGeometry args={[1.94, 2.34, 0.005]} />
          <meshStandardMaterial color="#8C6B42" roughness={0.85} />
        </mesh>

        {/* Upper shelf (mid of upper compartment) */}
        <mesh receiveShadow castShadow position={[0, 0.6, 0.0]}>
          <boxGeometry args={[1.94, 0.025, 0.52]} />
          <meshStandardMaterial color="#7E5733" roughness={0.7} />
        </mesh>

        {/* Lower shelf */}
        <mesh receiveShadow castShadow position={[0, -0.6, 0.0]}>
          <boxGeometry args={[1.94, 0.025, 0.52]} />
          <meshStandardMaterial color="#7E5733" roughness={0.7} />
        </mesh>

        {/* Hanging rod (upper compartment) */}
        <mesh castShadow position={[0, 1.0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 1.86, 16]} />
          <meshStandardMaterial color="#B8956A" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 4 doors — top-left, top-right, bottom-left, bottom-right */}
      <Door
        pivot={[leftX, topY, doorZ]}
        width={DOOR_W}
        height={DOOR_H}
        hingeDir={1}
        open={open}
        delayMs={0}
      />
      <Door
        pivot={[rightX, topY, doorZ]}
        width={DOOR_W}
        height={DOOR_H}
        hingeDir={-1}
        open={open}
        delayMs={0}
      />
      <Door
        pivot={[leftX, botY, doorZ]}
        width={DOOR_W}
        height={DOOR_H}
        hingeDir={1}
        open={open}
        delayMs={120}
      />
      <Door
        pivot={[rightX, botY, doorZ]}
        width={DOOR_W}
        height={DOOR_H}
        hingeDir={-1}
        open={open}
        delayMs={120}
      />
    </group>
  );
}
