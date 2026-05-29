# Prototype Reference — style-smart (FROZEN)

> This document captures what was built in the old `style-smart` prototype.
> The prototype is **frozen** — this file is the only reference needed. Do not open or modify that repo.

---

## What style-smart was

A Hebrew-language smart wardrobe & lifestyle app built on Lovable Cloud.

### Tech
- React 18 + TypeScript + Vite
- shadcn/ui + Radix UI components
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, Edge Functions in Deno)
- Lovable AI Gateway (Gemini 2.5 / GPT-5)
- Framer Motion, Recharts, React Query, Zod

### Features built in the prototype
- Virtual wardrobe with item management
- AI outfit suggestions (via Lovable/Gemini)
- Calendar / daily planner view
- Shopping list
- Auth (email + Supabase)
- Dashboard with Recharts analytics

### What to port to weatherwear-v2
- [ ] Calendar/My Day UI patterns (layout, time slots)
- [ ] Outfit suggestion UX flow (how suggestions are presented)
- [ ] Item-add modal UX

### What to skip (prototype-specific, not needed)
- Supabase auth — weatherwear-v2 uses localStorage, no login required for MVP
- Recharts analytics — out of scope for MVP
- shadcn/ui components — weatherwear-v2 uses minimal custom UI
- Lovable AI gateway — weatherwear-v2 uses direct Anthropic Claude SDK

---

## Key decisions made in the prototype (to honor in v2)

- RTL layout, Hebrew labels throughout
- Mobile-first (max-width container, bottom nav)
- Wardrobe items have: name, category, color, imageUrl, tags
- Daily view shows: weather + outfit suggestion + events list
