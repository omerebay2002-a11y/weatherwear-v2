# WeatherWear v2 — Project Context for AI Assistants

## This is the canonical system

**weatherwear-v2** is the active, canonical codebase for the Smart Wardrobe Avatar project.

> `style-smart` (omerebay2002-a11y/style-smart) is the **old prototype** — frozen, no longer active.
> Do NOT import from it, sync with it, or reference its logic. It exists for historical reference only.

---

## What this app is

A smart virtual wardrobe with three connected panels:

| Panel | Description |
|-------|-------------|
| **Avatar** | User uploads a selfie → personalized avatar that wears outfits |
| **Wardrobe** | 3D virtual closet (Three.js cabinet), user manages clothes, sees them on avatar |
| **My Day** | Daily planner + calendar integration, suggests outfits by schedule + weather + events |

The three panels work together: **My Day drives the decision → Wardrobe supplies the outfit → Avatar wears it.**

---

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite, Tailwind CSS
- **3D:** Three.js + React Three Fiber (3D wardrobe cabinet)
- **AI:** Anthropic Claude API (Sonnet/Haiku) via Vercel Edge Functions (`/api`)
- **Weather:** Open-Meteo API (no API key needed)
- **Voice:** Web Speech API — Hebrew (`he-IL`)
- **Storage:** localStorage (client-side, no backend DB)
- **Deploy:** Vercel

---

## MVP Goal

All three panels functional and connected. No backend database required — localStorage is enough for MVP.

---

## Branch convention

Active development branch: `claude/smart-wardrobe-avatar-j9e1l`

All AI-assisted work should be committed and pushed to this branch.

---

## Language & UX

- **Hebrew-first**, RTL layout
- Mobile-first design
- Voice input supported (Hebrew)

---

## 🔒 Hard rules — DO NOT repeat past mistakes

These are non-negotiable. Past sessions broke the project by violating them.

### The wardrobe image is FIXED
- The **only** wardrobe is the **dark-walnut photo**: `public/wardrobe-closed.png` (closed)
  and `public/wardrobe-interior.png` (open). Warm room, olive tree, curtain, brass handles.
- **NEVER** replace these images, generate a new wardrobe, swap in a "light oak" version,
  or create an SVG/cartoon illustration of the wardrobe. The cartoon SVG was deleted on
  purpose — do not bring it back.
- Both the **Wardrobe page** and the **Avatar page** must use this same photo so the app
  feels like one continuous room.

### Wardrobe open/close
- Open/close is a **smooth opacity cross-fade** between `wardrobe-closed.png` and
  `wardrobe-interior.png` (see `WardrobeIllustration.tsx`). **No CSS fake doors** — they
  never aligned and looked broken.

### Avatar page layout
- One cohesive room: the wardrobe photo is the background; the avatar stands on the floor
  to the **LEFT** of the wardrobe (Ready Player Me 3D model).
- The avatar must **never overlap the wardrobe**, and there must be **no hard seam /
  partition** between avatar and wardrobe. It is one room, not two glued halves.
- Avatar is created via Ready Player Me (selfie → `.glb`), stored in `localStorage`
  under `rpm_avatar_url`.

### Before every push
- **ALWAYS run `npm run build` and confirm it passes** before pushing. `tsc` fails the
  Vercel build on unused imports / type errors — a green local build is the gate.
- After pushing to `main`, **screenshot the page** (dev server + headless Chromium) and
  actually look at it before declaring success. Don't assume.

### Deploy
- Vercel auto-deploys from **`main`**. Pushing to the feature branch alone does NOT update
  the live site.
