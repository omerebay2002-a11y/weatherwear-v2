# WeatherWear v2

Hebrew-first AI fashion app — a 3D walnut wardrobe + AI-powered outfit suggestions based on real-time weather.

## Features
- **Wardrobe** — a 3D room with a 4-door walnut cabinet that opens forward like real furniture
- **Add items** via photo (Claude Vision), voice (Web Speech, he-IL), or typing
- **Today** — live weather + occasion → AI-generated outfit + chat with a stylist persona

## Stack
- Vite 5 + React 18 + TypeScript
- Tailwind CSS (Hebrew RTL, mobile-first)
- @react-three/fiber + @react-three/drei + three (real 3D, code-split)
- Framer Motion
- Anthropic Claude (Sonnet 4.6 + Haiku 4.5) via Vercel Edge Functions
- Open-Meteo (weather, no key)
- Web Speech API (voice input, he-IL)
- localStorage (wardrobe persistence)

## Local development

```bash
npm install
cp .env.example .env
# add your ANTHROPIC_API_KEY to .env
npm run dev
```

Then open http://localhost:5173

## Production

Auto-deploys to Vercel on every push to `main`.

Required environment variable in Vercel:
- `ANTHROPIC_API_KEY` — get one at https://console.anthropic.com/settings/keys

## Project structure

```
api/                            # Vercel Edge Functions (Claude proxy)
├── analyze-clothing.ts         # photo/text → structured ClothingItem
├── suggest-outfit.ts           # weather + occasion → outfit
└── chat.ts                     # streaming stylist chat

src/
├── pages/                      # Wardrobe, Today
├── components/
│   ├── room/                   # 3D scene (Cabinet + Door + BrassHandle)
│   ├── wardrobe/               # 2D overlay + add-item flow
│   ├── today/                  # weather + outfit + chat
│   ├── ui/                     # Toast, Sheet
│   └── layout/                 # AppShell, BottomNav
├── lib/
│   ├── claude.ts               # /api/* client
│   ├── weather.ts              # Open-Meteo
│   ├── speech.ts               # Web Speech API
│   ├── storage.ts              # localStorage
│   ├── outfit-rules.ts         # offline fallback
│   └── utils.ts
├── contexts/WardrobeContext.tsx
└── types.ts
```

## Graceful degradation

If `ANTHROPIC_API_KEY` is missing or the Claude API fails:
- **analyze-clothing** → user falls back to manual entry (form is pre-shown)
- **suggest-outfit** → `lib/outfit-rules.ts` picks deterministically with Hebrew explanation
- **chat** → returns a clear error message; rest of the app keeps working

## Browser support

- Chrome / Edge / Samsung Internet — full feature set including Hebrew voice input
- Safari iOS — voice tab will display fallback ("דפדפן לא תומך"), photo + type still work

## License

Private. © 2026.
