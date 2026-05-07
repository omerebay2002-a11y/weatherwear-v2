import { motion } from "framer-motion";
import type { Compartment } from "../room/Cabinet";

interface Props {
  onCompartmentClick: (c: Compartment) => void;
}

// All in viewBox units. Cabinet occupies x:[50..350], y:[110..530] of a 400×600 frame.
// Compartment regions:
//   shirts  → top-left rod         (x:50..200, y:130..230)
//   coats   → top-right rod        (x:200..350, y:130..230)
//   folded  → bottom-left shelves  (x:50..200, y:230..515)
//   drawers → bottom-right drawers (x:200..350, y:230..515)

export default function WardrobeIllustration({ onCompartmentClick }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col items-center bg-parchment">
      {/* Brand wordmark */}
      <h1 className="absolute top-4 inset-x-0 z-20 text-center font-display text-3xl tracking-tight pointer-events-none safe-top">
        <span className="text-ebony">Weather</span>
        <span className="text-brass">Wear</span>
      </h1>

      <svg
        viewBox="0 0 400 600"
        className="w-full max-w-md h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="ארון בגדים"
      >
        <defs>
          {/* Cabinet wood gradient — warm honey brown */}
          <linearGradient id="wood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B5895A" />
            <stop offset="60%" stopColor="#9C7548" />
            <stop offset="100%" stopColor="#7E5A33" />
          </linearGradient>
          <linearGradient id="woodInside" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8E6B40" />
            <stop offset="100%" stopColor="#6E5230" />
          </linearGradient>

          {/* Drawer face — slightly lighter for depth */}
          <linearGradient id="drawerFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A8814F" />
            <stop offset="100%" stopColor="#8B6539" />
          </linearGradient>

          {/* Brass for handles */}
          <linearGradient id="brass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D9B574" />
            <stop offset="50%" stopColor="#C09A56" />
            <stop offset="100%" stopColor="#9C7B3E" />
          </linearGradient>

          {/* Window night sky */}
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F2845" />
            <stop offset="100%" stopColor="#324563" />
          </linearGradient>

          {/* Pendant bulb glow */}
          <radialGradient id="bulb" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FFE7A8" stopOpacity="1" />
            <stop offset="60%" stopColor="#E8B95F" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9A7434" stopOpacity="1" />
          </radialGradient>

          {/* Floor shadow */}
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3A2818" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#3A2818" stopOpacity="0" />
          </radialGradient>

          {/* Folded clothes color gradients */}
          <linearGradient id="cloth1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8DDC9" />
            <stop offset="100%" stopColor="#C9B898" />
          </linearGradient>
          <linearGradient id="cloth2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A0A0A0" />
            <stop offset="100%" stopColor="#7A7A7A" />
          </linearGradient>
          <linearGradient id="cloth3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3F5878" />
            <stop offset="100%" stopColor="#2C4060" />
          </linearGradient>
          <linearGradient id="cloth4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D9B0B0" />
            <stop offset="100%" stopColor="#B68888" />
          </linearGradient>
        </defs>

        {/* ─── Background scene ───────────────────────────── */}
        {/* Window with night sky */}
        <g>
          <rect x="155" y="35" width="90" height="70" rx="3" fill="url(#sky)" stroke="#8B6539" strokeWidth="2" />
          <line x1="200" y1="35" x2="200" y2="105" stroke="#8B6539" strokeWidth="1.5" />
          {/* Stars */}
          <circle cx="172" cy="55" r="1" fill="#F5E8C4" />
          <circle cx="186" cy="48" r="0.8" fill="#F5E8C4" />
          <circle cx="220" cy="60" r="1" fill="#F5E8C4" />
          <circle cx="232" cy="52" r="0.8" fill="#F5E8C4" />
          <circle cx="178" cy="80" r="0.8" fill="#F5E8C4" />
          <circle cx="225" cy="85" r="1" fill="#F5E8C4" />
          <circle cx="208" cy="92" r="0.6" fill="#F5E8C4" />
        </g>

        {/* Pendant lights (top-right) */}
        <g>
          {[290, 320, 350].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2={45 + i * 10} stroke="#3A2818" strokeWidth="1" />
              <ellipse cx={x} cy={55 + i * 10} rx="6" ry="9" fill="url(#bulb)" />
              <motion.ellipse
                cx={x}
                cy={55 + i * 10}
                rx="22"
                ry="22"
                fill="url(#bulb)"
                opacity="0.18"
                animate={{ opacity: [0.14, 0.22, 0.14] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          ))}
        </g>

        {/* Floor shadow under cabinet */}
        <ellipse cx="200" cy="540" rx="170" ry="14" fill="url(#shadow)" />

        {/* ─── Cabinet body ───────────────────────────── */}
        {/* Outer frame */}
        <rect x="50" y="110" width="300" height="420" rx="5" fill="url(#wood)" stroke="#5A4020" strokeWidth="1.5" />

        {/* Interior backwall (slightly inset, darker) */}
        <rect x="58" y="118" width="284" height="404" rx="2" fill="url(#woodInside)" />

        {/* Vertical divider between left and right halves */}
        <line x1="200" y1="120" x2="200" y2="520" stroke="#5A4020" strokeWidth="1.5" />

        {/* Horizontal divider between top section (rods) and bottom section (shelves/drawers) */}
        <line x1="58" y1="225" x2="342" y2="225" stroke="#5A4020" strokeWidth="1" opacity="0.6" />

        {/* ─── Top section: hanging rods ───────────────────────────── */}
        {/* Top-left rod */}
        <rect x="68" y="155" width="120" height="3" rx="1.5" fill="#9A8270" />
        {/* Hangers on left rod */}
        <g stroke="#7A5A36" strokeWidth="1.4" strokeLinecap="round" fill="none">
          {[78, 100, 122, 144, 166].map((cx) => (
            <g key={cx}>
              <line x1={cx} y1="156" x2={cx} y2="162" />
              <path d={`M ${cx - 9} 178 L ${cx} 165 L ${cx + 9} 178`} />
            </g>
          ))}
        </g>

        {/* Top-right rod */}
        <rect x="212" y="155" width="120" height="3" rx="1.5" fill="#9A8270" />
        <g stroke="#7A5A36" strokeWidth="1.4" strokeLinecap="round" fill="none">
          {[222, 244, 266, 288, 310].map((cx) => (
            <g key={cx}>
              <line x1={cx} y1="156" x2={cx} y2="162" />
              <path d={`M ${cx - 9} 178 L ${cx} 165 L ${cx + 9} 178`} />
            </g>
          ))}
        </g>

        {/* Subtle warm overhead light glow on each rod */}
        <ellipse cx="128" cy="135" rx="50" ry="10" fill="#F5E0B8" opacity="0.25" />
        <ellipse cx="272" cy="135" rx="50" ry="10" fill="#F5E0B8" opacity="0.25" />

        {/* ─── Bottom-left: shelves with folded clothes ───────────────────────────── */}
        {/* Two horizontal shelves */}
        <line x1="58" y1="335" x2="200" y2="335" stroke="#5A4020" strokeWidth="1" />
        <line x1="58" y1="430" x2="200" y2="430" stroke="#5A4020" strokeWidth="1" />

        {/* Stack 1 — cream sweaters (top shelf, left) */}
        <g>
          <rect x="80" y="295" width="40" height="9" rx="1" fill="url(#cloth1)" />
          <rect x="78" y="306" width="44" height="9" rx="1" fill="url(#cloth1)" opacity="0.92" />
          <rect x="76" y="317" width="48" height="14" rx="1" fill="#C9B898" />
        </g>

        {/* Stack 2 — gray (top shelf, right) */}
        <g>
          <rect x="135" y="298" width="40" height="9" rx="1" fill="url(#cloth2)" />
          <rect x="133" y="309" width="44" height="9" rx="1" fill="url(#cloth2)" opacity="0.92" />
          <rect x="131" y="320" width="48" height="11" rx="1" fill="#7A7A7A" />
        </g>

        {/* Stack 3 — navy folds (bottom shelf, left) */}
        <g>
          <rect x="80" y="395" width="40" height="9" rx="1" fill="url(#cloth3)" />
          <rect x="78" y="406" width="44" height="9" rx="1" fill="url(#cloth3)" opacity="0.92" />
          <rect x="76" y="417" width="48" height="12" rx="1" fill="#2C4060" />
        </g>

        {/* Stack 4 — pink (bottom shelf, right) */}
        <g>
          <rect x="135" y="398" width="40" height="9" rx="1" fill="url(#cloth4)" />
          <rect x="133" y="409" width="44" height="9" rx="1" fill="url(#cloth4)" opacity="0.92" />
          <rect x="131" y="420" width="48" height="9" rx="1" fill="#B68888" />
        </g>

        {/* Subtle warm light glow above shelves */}
        <ellipse cx="128" cy="245" rx="60" ry="8" fill="#F5E0B8" opacity="0.18" />

        {/* ─── Bottom-right: drawers ───────────────────────────── */}
        {/* 3 drawer fronts */}
        {[245, 335, 425].map((y) => (
          <g key={y}>
            <rect x="208" y={y} width="132" height="80" rx="2" fill="url(#drawerFace)" stroke="#5A4020" strokeWidth="0.8" />
            {/* Brass handle in middle */}
            <rect x="262" y={y + 36} width="24" height="6" rx="1.5" fill="url(#brass)" stroke="#7B5E2C" strokeWidth="0.4" />
            <rect x="266" y={y + 32} width="3" height="3" fill="#7B5E2C" />
            <rect x="279" y={y + 32} width="3" height="3" fill="#7B5E2C" />
          </g>
        ))}

        {/* ─── Interactive hotspots ───────────────────────────── */}
        {/* Each hotspot covers its compartment — fully transparent until hover/tap */}
        {(
          [
            { id: "shirts",  x: 50,  y: 120, w: 150, h: 105, label: "חולצות ושמלות" },
            { id: "coats",   x: 200, y: 120, w: 150, h: 105, label: "מעילים" },
            { id: "folded",  x: 50,  y: 230, w: 150, h: 285, label: "מכנסיים ונעליים" },
            { id: "drawers", x: 200, y: 230, w: 150, h: 285, label: "תחתונים גרביים תכשיטים" },
          ] as const
        ).map((spot) => (
          <motion.rect
            key={spot.id}
            x={spot.x}
            y={spot.y}
            width={spot.w}
            height={spot.h}
            rx="3"
            fill="#C09A56"
            fillOpacity="0"
            stroke="#C09A56"
            strokeOpacity="0"
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            whileHover={{ fillOpacity: 0.08, strokeOpacity: 0.6 }}
            whileTap={{ fillOpacity: 0.16, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            onClick={() => onCompartmentClick(spot.id as Compartment)}
            role="button"
            aria-label={spot.label}
          />
        ))}
      </svg>
    </div>
  );
}
