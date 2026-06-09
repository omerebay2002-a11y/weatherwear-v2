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
### TWO pages only — the avatar is NOT a page
- The app has exactly **two tabs / pages**: **הארון (Wardrobe, `/`)** and
  **היום (My Day, `/today`)**. Do **NOT** add a third "avatar" tab or `/avatar` route.
- The **avatar is part of the wardrobe interface** — it stands on the floor to the
  **LEFT** of the wardrobe, in the same room (component: `RoomAvatar`, rendered inside
  the Wardrobe page). It is never a separate page.
- The avatar must **never overlap the wardrobe**, and there must be **no hard seam /
  partition**. It is one room.
- Avatar is created via Ready Player Me (selfie → `.glb`), stored in `localStorage`
  under `rpm_avatar_url`.

### Wardrobe open/close
- Open/close is a **smooth opacity cross-fade** between `wardrobe-closed.png` and
  `wardrobe-interior.png` (see `WardrobeIllustration.tsx`). **No CSS fake doors** — they
  never aligned and looked broken.

### Desktop layout
- Mobile-first. On wide screens the whole app renders inside a centered
  **phone-width frame** (`max-w-[440px]`) with a warm dark surround — never full-bleed
  (that blew the room photo up huge and blurry).

### Before every push
- **ALWAYS run `npm run build` and confirm it passes** before pushing. `tsc` fails the
  Vercel build on unused imports / type errors — a green local build is the gate.
- After pushing to `main`, **screenshot the page** (dev server + headless Chromium) and
  actually look at it before declaring success. Don't assume.

### Deploy
- Vercel auto-deploys from **`main`**. Pushing to the feature branch alone does NOT update
  the live site.
