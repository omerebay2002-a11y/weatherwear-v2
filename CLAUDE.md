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
- **Storage:** Supabase (Auth + Postgres `wardrobe` table with RLS + Storage bucket); falls back to localStorage offline mode when `VITE_SUPABASE_*` env vars are absent. Setup SQL in `supabase/setup.sql`.
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

## 🎨 Design & Skills — איך לא להיות גנרי

אפליקציית סטיילינג ויזואלית — **העיצוב הוא המוצר**. תמיד דרך סקילי טעם, לא ברירות מחדל:

- **טעם UI:** `emil-design-eng` (ליטוש + מיקרו-מושן), `soft-skill` / `minimalist-skill` (נקי, יוקרתי), `popular-web-designs` (רפרנס).
- **3D (ארון Three.js + R3F):** `react-three-fiber` + הספציפיים — `r3f-lighting` (תאורת הארון), `r3f-materials` (עץ/בד), `r3f-geometry`, `r3f-interaction` (פתיחה/לחיצה), `r3f-postprocessing`. ל-drei → `r3f-loaders` / `r3f-textures`.
- **אנימציה:** `motion-framer` / `gsap-scrolltrigger` (מעברי פאנלים), `lottie-animations`.
- **מובייל-first + RTL עברית** — קריאוּת ומגע נוח.
- לפני שינוי עיצוב משמעותי → `taste-skill`; לשדרוג מסך קיים → `redesign-skill`.
