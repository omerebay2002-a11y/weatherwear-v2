# WeatherWear v2 — Project Context for AI Assistants

## ⚙️ הבסיס הגלובלי של עומר (חובה לפני כל עבודה)

- **שפה:** כל תשובה ללקוח **בעברית בלבד**. נשאר באנגלית רק מה שחייב — נתיבי קבצים, פקודות, שמות פונקציות/משתנים, קוד, ושמות מוצרים/כלים (`Vite`, `React`, `Three.js`, `Supabase`...). לא לתרגם אותם, ולא לערבב אנגלית מיותרת בתוך משפט עברי.
- **המוח המרכזי (מקור אמת):** `C:\Users\omere\OneDrive\Desktop\סידור של קלוד` — לקרוא משם `brain/Foundation.md` לפני החלטות מהותיות.
- **איכות עיצוב — אסור "גנרי":** זו אפליקציית UI (React/web). **לפני כל עבודת UI חדשה חובה להפעיל `taste-skill`** דרך הסקיל טול — לא להשתמש בברירות המחדל של המודל. על **שדרוג** עיצוב קיים → `redesign-skill` (audit-first).
- **סקילים להעדיף בפרויקט הזה:**
  - **UI / web-app:** `taste-skill`, `emil-design-eng`, `react-patterns`, `react-performance`, `make-interfaces-feel-better`, `design:design-critique`, `design:accessibility-review`.
  - **3D (react-three-fiber):** תמיד דרך סקילי `r3f-*` הספציפיים (תאורה→`r3f-lighting`, חומרים→`r3f-materials`, גאומטריה→`r3f-geometry`, אינטראקציה→`r3f-interaction`, טעינת מודלים→`r3f-loaders`), `react-three-fiber`, `web3d-integration-patterns` — לא `three.js` גנרי.
  - **אנימציה (framer-motion):** `motion-framer`, `emil-design-eng`.
  - **קוד / API / backend:** `code-review`, `verify`, `simplify`, `security-review`.
- **איסור placeholders / קוד חלקי:** פלט מלא בלבד → `output-skill`.
- **כלי / ספרייה / סקיל חיצוני חדש → להעביר דרך `/vet` לפני התקנה או שימוש.**

---

## This is the canonical system

**weatherwear-v2** is the active, canonical codebase for the Smart Wardrobe Avatar project.

> `style-smart` (omerebay2002-a11y/style-smart) is the **old prototype** — frozen, no longer active.
> Do NOT import from it, sync with it, or reference its logic. It exists for historical reference only.

---

## What this app is

**Core essence (the user's words): a smart digital wardrobe — ארון דיגיטלי חכם.**
Manage everything you own in one place, see it on your avatar, and get told what
to wear. The single biggest retention risk is the empty-wardrobe cold start: if
adding clothes is hard, users leave.

A smart virtual wardrobe with three connected panels:

| Panel | Description |
|-------|-------------|
| **Avatar** | User uploads a selfie → personalized avatar that wears outfits |
| **Wardrobe** | 3D virtual closet (Three.js cabinet), user manages clothes, sees them on avatar |
| **My Day** | Daily planner + calendar integration, suggests outfits by schedule + weather + events |

The three panels work together: **My Day drives the decision → Wardrobe supplies the outfit → Avatar wears it.**

---

## Onboarding — the first-run game (cold-start solution)

First run is a questionnaire that plays like a game (`OnboardingFlow.tsx`),
shown after sign-in and before the two pages. The spec, in the user's words:

1. **Sign-in** (existing SignInScreen; offline mode skips it).
2. **Quick questions**, one per screen, auto-advance on tap:
   name → who the wardrobe is for (woman/man/mixed) → age range →
   location permission (geolocation, skippable) → style multi-select.
3. **Outfit photo upload** — party, wedding, everyday; as many as possible.
   The AI analyzes the person's basic style from them (`api/analyze-style.ts`).
4. **The guess**: build ~70 candidate items the user likely owns —
   AI-detected items first, then universal basics (white/black tees etc.),
   then profile/style-matched items (`src/lib/onboarding-catalog.ts`).
5. **One-tap confirmation** ("סמני מה יש לך") with a live counter.
   **Retention goal: hit 5–7 real items in the first minute** — then the
   wardrobe is alive and the user stays. Manual add flows continue after.

Profile is stored in localStorage (`ww2.profile.v1`, flag `ww2.onboarded.v1`,
see `src/lib/profile.ts`). Users with existing items skip onboarding.
Seeded items get `source: "onboarding"`.

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
- The **avatar is part of the wardrobe interface** — it stands on the rug to the
  **RIGHT** of the wardrobe, against the plain wall strip, in the same room
  (component: `RoomAvatar`, rendered inside the Wardrobe page). It is never a
  separate page. (It used to be on the left, but the left side of the photo is
  occupied by the bed corner and olive tree — the figure looked like it floated
  on the bed. The right strip has clean wall + rug floor. Decided 2026-06-12.)
- The avatar must **never overlap the wardrobe**, and there must be **no hard seam /
  partition**. It is one room.
- Until the user creates a personal avatar, a built-in 3D **tailor's dress form**
  (linen torso, brass pole, walnut base — `DressForm` in `RoomAvatar.tsx`) stands
  in its place. Outfits will be dressed on this figure.
- Personal avatar is created via Ready Player Me (selfie → `.glb`), stored in
  `localStorage` under `rpm_avatar_url`, and replaces the dress form in place.

### Room layout (Wardrobe page)
- The room photo fills the **full screen height** (`object-cover`, wrapper keeps the
  photo's 937/1678 aspect, anchored **right**): the far-left window strip gets
  cropped on tall screens, the wardrobe sits left-of-center fully visible, and the
  plain-wall strip on the right is the avatar's standing room.
- The add-item FAB is **bottom-left** (per DESIGN.md), away from the avatar.

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
