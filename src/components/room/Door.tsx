import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import BrassHandle from "./BrassHandle";

interface Props {
  /** Pivot position in world space — placed at the OUTER vertical edge of the door */
  pivot: [number, number, number];
  width: number;
  height: number;
  /** +1 = left-side door (pivot on left, opens CCW around Y); -1 = right-side door */
  hingeDir: 1 | -1;
  open: boolean;
  /** Stagger delay in ms (top doors = 0, bottom doors = 120) */
  delayMs?: number;
}

const OPEN_ANGLE = (95 * Math.PI) / 180; // 95° forward swing
const DAMPING = 0.085; // ≈ 1.4s settle at 60fps

export default function Door({
  pivot,
  width,
  height,
  hingeDir,
  open,
  delayMs = 0,
}: Props) {
  const groupRef = useRef<Group>(null);
  const targetRef = useRef(0);
  const scheduledRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meshOffsetX = (hingeDir === 1 ? 1 : -1) * (width / 2);
  // Handle sits 5cm from the inner edge, vertically centered
  const innerEdgeX = (hingeDir === 1 ? 1 : -1) * (width - 0.05);
  const handlePos: [number, number, number] = [innerEdgeX, 0, 0.045];

  useEffect(() => {
    if (scheduledRef.current) clearTimeout(scheduledRef.current);
    const setTarget = () => {
      targetRef.current = open ? hingeDir * OPEN_ANGLE : 0;
    };
    if (delayMs > 0 && open) {
      scheduledRef.current = setTimeout(setTarget, delayMs);
    } else {
      setTarget();
    }
    return () => {
      if (scheduledRef.current) clearTimeout(scheduledRef.current);
    };
  }, [open, delayMs, hingeDir]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += (targetRef.current - g.rotation.y) * DAMPING;
  });

  return (
    <group ref={groupRef} position={pivot}>
      {/* Outer door panel */}
      <mesh castShadow receiveShadow position={[meshOffsetX, 0, 0.02]}>
        <boxGeometry args={[width - 0.01, height - 0.01, 0.04]} />
        <meshStandardMaterial color="#7E5733" roughness={0.62} metalness={0.05} />
      </mesh>
      {/* Recessed inner panel — classic furniture look */}
      <mesh position={[meshOffsetX, 0, 0.041]}>
        <boxGeometry args={[width - 0.18, height - 0.22, 0.005]} />
        <meshStandardMaterial color="#6E4A2A" roughness={0.7} metalness={0.05} />
      </mesh>
      <BrassHandle position={handlePos} />
    </group>
  );
}
