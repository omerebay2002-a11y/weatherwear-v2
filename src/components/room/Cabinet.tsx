import Door from "./Door";

interface Props {
  open: boolean;
  onToggle: () => void;
}

/**
 * Walnut wardrobe — 2.4m × 2.0m × 0.6m. Centered at world (0, 1.2, -0.5).
 *
 * Interior (visible when doors swing open):
 *   • Top-left  → hanging rod for shirts (5 wood hangers)
 *   • Top-right → hanging rod for coats (4 bulkier hangers)
 *   • Bottom-left  → 3 wood shelves for folded items
 *   • Bottom-right → 3 drawers with brass pulls
 */
export default function Cabinet({ open, onToggle }: Props) {
  const cabX = 0,
    cabY = 1.2,
    cabZ = -0.5;
  const doorZ = cabZ + 0.302;
  const topY = cabY + 0.6;
  const botY = cabY - 0.6;
  const leftX = cabX - 1.0;
  const rightX = cabX + 1.0;
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
      {/* Cabinet body group */}
      <group position={[cabX, cabY, cabZ]}>
        {/* Back panel */}
        <mesh receiveShadow position={[0, 0, -0.28]}>
          <boxGeometry args={[2.0, 2.4, 0.04]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Side panels */}
        <mesh receiveShadow castShadow position={[-0.98, 0, 0.02]}>
          <boxGeometry args={[0.04, 2.4, 0.58]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[0.98, 0, 0.02]}>
          <boxGeometry args={[0.04, 2.4, 0.58]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Top + bottom caps */}
        <mesh receiveShadow castShadow position={[0, 1.18, 0.02]}>
          <boxGeometry args={[2.0, 0.04, 0.58]} />
          <meshStandardMaterial color="#42291C" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[0, -1.18, 0.02]}>
          <boxGeometry args={[2.0, 0.04, 0.58]} />
          <meshStandardMaterial color="#42291C" roughness={0.7} />
        </mesh>

        {/* Crown moulding */}
        <mesh castShadow position={[0, 1.22, 0.02]}>
          <boxGeometry args={[2.06, 0.04, 0.62]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Toe-kick plinth */}
        <mesh castShadow position={[0, -1.16, 0.04]}>
          <boxGeometry args={[1.96, 0.08, 0.52]} />
          <meshStandardMaterial color="#3E2A18" roughness={0.85} />
        </mesh>

        {/* Mid horizontal divider */}
        <mesh receiveShadow castShadow position={[0, 0, 0.02]}>
          <boxGeometry args={[1.96, 0.04, 0.56]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>
        {/* Mid vertical divider */}
        <mesh receiveShadow castShadow position={[0, 0, 0.02]}>
          <boxGeometry args={[0.04, 2.4, 0.56]} />
          <meshStandardMaterial color="#5C3E22" roughness={0.7} />
        </mesh>

        {/* Interior back — slightly lighter to brighten when doors open */}
        <mesh position={[0, 0, -0.255]}>
          <boxGeometry args={[1.94, 2.34, 0.005]} />
          <meshStandardMaterial color="#9C7950" roughness={0.85} />
        </mesh>

        {/* ======== TOP-LEFT: hanging rod for shirts ======== */}
        <HangingRod
          position={[-0.5, 1.0, 0.05]}
          width={0.86}
          rodColor="#B8956A"
          hangerCount={5}
          hangerWidth={0.12}
          hangerColor="#7E5733"
        />

        {/* ======== TOP-RIGHT: hanging rod for coats ======== */}
        <HangingRod
          position={[0.5, 1.0, 0.05]}
          width={0.86}
          rodColor="#B8956A"
          hangerCount={4}
          hangerWidth={0.16}
          hangerColor="#42291C"
        />

        {/* ======== BOTTOM-LEFT: 3 wood shelves ======== */}
        {[-0.2, -0.55, -0.9].map((y, i) => (
          <mesh
            key={`shelf-l-${i}`}
            receiveShadow
            castShadow
            position={[-0.5, y, 0]}
          >
            <boxGeometry args={[0.92, 0.025, 0.5]} />
            <meshStandardMaterial color="#7E5733" roughness={0.7} />
          </mesh>
        ))}

        {/* ======== BOTTOM-RIGHT: 3 drawers with brass pulls ======== */}
        {[-0.18, -0.55, -0.92].map((y, i) => (
          <group key={`drawer-r-${i}`} position={[0.5, y, 0.21]}>
            {/* Drawer front */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.9, 0.32, 0.04]} />
              <meshStandardMaterial color="#7E5733" roughness={0.65} />
            </mesh>
            {/* Recessed inset on drawer front */}
            <mesh position={[0, 0, 0.021]}>
              <boxGeometry args={[0.78, 0.22, 0.005]} />
              <meshStandardMaterial color="#6A4628" roughness={0.7} />
            </mesh>
            {/* Brass pull (horizontal bar) */}
            <mesh
              castShadow
              rotation={[Math.PI / 2, 0, Math.PI / 2]}
              position={[0, 0, 0.045]}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.18, 16]} />
              <meshStandardMaterial color="#C9A57A" metalness={0.85} roughness={0.22} />
            </mesh>
            {/* Pull mounts */}
            <mesh position={[-0.085, 0, 0.032]}>
              <cylinderGeometry args={[0.014, 0.014, 0.022, 12]} />
              <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0.085, 0, 0.032]}>
              <cylinderGeometry args={[0.014, 0.014, 0.022, 12]} />
              <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4 doors */}
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

// ─── Internal helpers ───

interface HangingRodProps {
  position: [number, number, number];
  width: number;
  rodColor: string;
  hangerCount: number;
  hangerWidth: number;
  hangerColor: string;
}

function HangingRod({
  position,
  width,
  rodColor,
  hangerCount,
  hangerWidth,
  hangerColor,
}: HangingRodProps) {
  return (
    <group position={position}>
      {/* The brass rod */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, width, 16]} />
        <meshStandardMaterial color={rodColor} metalness={0.85} roughness={0.28} />
      </mesh>
      {/* End caps */}
      <mesh position={[-width / 2, 0, 0]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color={rodColor} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2, 0, 0]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color={rodColor} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Hangers spaced along the rod */}
      {Array.from({ length: hangerCount }).map((_, i) => {
        const t = (i + 1) / (hangerCount + 1);
        const x = -width / 2 + t * width;
        return (
          <group key={i} position={[x, -0.18, 0]}>
            {/* Hook */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
              <torusGeometry args={[0.018, 0.005, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#B8956A" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Hanger body — thin horizontal bar */}
            <mesh castShadow position={[0, 0.06, 0]}>
              <boxGeometry args={[hangerWidth, 0.018, 0.025]} />
              <meshStandardMaterial color={hangerColor} roughness={0.65} />
            </mesh>
            {/* Slanted shoulders (left + right) */}
            <mesh castShadow position={[-hangerWidth / 2, 0.1, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.005, 0.1, 0.02]} />
              <meshStandardMaterial color={hangerColor} roughness={0.65} />
            </mesh>
            <mesh castShadow position={[hangerWidth / 2, 0.1, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.005, 0.1, 0.02]} />
              <meshStandardMaterial color={hangerColor} roughness={0.65} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
