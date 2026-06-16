import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, Camera, UserRound, Check, ArrowLeft, Sparkles } from "lucide-react";
import { saveProfile, setOnboarded } from "../../lib/profile";

const SELFIE_KEY = "avatar_selfie_url";

const VIBES = [
  { id: "classic", label: "קלאסי", emoji: "🤍" },
  { id: "casual", label: "יומיומי", emoji: "👕" },
  { id: "elegant", label: "אלגנטי", emoji: "✨" },
  { id: "sporty", label: "ספורטיבי", emoji: "👟" },
  { id: "bold", label: "נועז", emoji: "🔥" },
  { id: "minimal", label: "מינימליסטי", emoji: "◻️" },
];

const OCCASIONS = [
  { id: "work", label: "עבודה", emoji: "💼" },
  { id: "evening", label: "יציאות ערב", emoji: "🌙" },
  { id: "casual", label: "יומיום", emoji: "☕" },
  { id: "sport", label: "ספורט", emoji: "🏃‍♀️" },
];

type Step = 0 | 1 | 2 | 3 | 4;
const TOTAL_DOTS = 4; // selfie + vibe + occasions + done (welcome has no dot)

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [selfie, setSelfie] = useState<string | null>(() => localStorage.getItem(SELFIE_KEY));
  const [vibes, setVibes] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setSelfie(url);
      localStorage.setItem(SELFIE_KEY, url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function toggle(list: string[], set: (v: string[]) => void, id: string) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function finish() {
    saveProfile({ styles: vibes, occasions, createdAt: Date.now() });
    setOnboarded();
    onDone();
  }

  const canNext =
    step === 0 ||
    (step === 1 && !!selfie) ||
    (step === 2 && vibes.length > 0) ||
    (step === 3 && occasions.length > 0) ||
    step === 4;

  function next() {
    if (step === 4) return finish();
    setStep((s) => (s + 1) as Step);
  }

  return (
    <div className="min-h-[100dvh] bg-parchment flex flex-col" dir="rtl">
      {/* Top bar: back + progress dots */}
      <div className="px-6 pt-6 flex items-center gap-4 h-12">
        {step > 0 && step < 4 && (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="text-walnut-400"
            aria-label="חזרה"
          >
            <ArrowLeft className="h-5 w-5 scale-x-[-1]" strokeWidth={1.8} />
          </button>
        )}
        {step > 0 && step < 4 && (
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < step ? "w-6 bg-brass" : "w-1.5 bg-walnut-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-6">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <Slide key="welcome" className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-md bg-ebony flex items-center justify-center mb-6">
                <Shirt className="h-8 w-8 text-brass" strokeWidth={1.6} />
              </div>
              <h1 className="font-display text-3xl text-ebony mb-3">בוקר טוב ☀️</h1>
              <p className="font-editorial italic text-walnut-500 text-lg leading-relaxed max-w-xs">
                בואי נכיר אותך בכמה שניות — ואני אגיד לך כל בוקר מה ללבוש.
              </p>
            </Slide>
          )}

          {/* STEP 1 — Selfie */}
          {step === 1 && (
            <Slide key="selfie" className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="font-display text-2xl text-ebony mb-2">קודם, תמונה שלך</h2>
              <p className="text-sm text-walnut-400 mb-6 max-w-xs">
                כדי שתראי את הבגדים שלך עלייך, באמת. רק את רואה אותה.
              </p>
              <div
                className="relative w-48 h-60 rounded-2xl overflow-hidden border-2 border-brass/30 shadow-md bg-parchment-light cursor-pointer"
                onClick={() => fileRef.current?.click()}
                role="button"
              >
                {selfie ? (
                  <img src={selfie} alt="הסלפי שלך" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-walnut-300">
                    <UserRound className="h-14 w-14" strokeWidth={1} />
                    <p className="font-editorial italic text-walnut-400">לחצי להוספה</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-parchment/90 border border-brass/20 rounded-full p-2 shadow">
                  <Camera className="h-4 w-4 text-walnut-500" strokeWidth={1.6} />
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFile}
              />
            </Slide>
          )}

          {/* STEP 2 — Vibe */}
          {step === 2 && (
            <Slide key="vibe" className="flex-1 flex flex-col justify-center">
              <h2 className="font-display text-2xl text-ebony mb-2 text-center">איזה סטייל מדבר אלייך?</h2>
              <p className="text-sm text-walnut-400 mb-7 text-center">אפשר לבחור כמה שבא לך</p>
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map((v) => (
                  <Chip
                    key={v.id}
                    label={v.label}
                    emoji={v.emoji}
                    active={vibes.includes(v.id)}
                    onClick={() => toggle(vibes, setVibes, v.id)}
                  />
                ))}
              </div>
            </Slide>
          )}

          {/* STEP 3 — Occasions */}
          {step === 3 && (
            <Slide key="occ" className="flex-1 flex flex-col justify-center">
              <h2 className="font-display text-2xl text-ebony mb-2 text-center">איך נראה לך השבוע?</h2>
              <p className="text-sm text-walnut-400 mb-7 text-center">מה הכי מתאים ליום-יום שלך</p>
              <div className="grid grid-cols-2 gap-3">
                {OCCASIONS.map((o) => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    emoji={o.emoji}
                    active={occasions.includes(o.id)}
                    onClick={() => toggle(occasions, setOccasions, o.id)}
                  />
                ))}
              </div>
            </Slide>
          )}

          {/* STEP 4 — Done */}
          {step === 4 && (
            <Slide key="done" className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="w-16 h-16 rounded-full bg-brass flex items-center justify-center mb-6"
              >
                <Sparkles className="h-8 w-8 text-parchment" strokeWidth={1.8} />
              </motion.div>
              <h2 className="font-display text-2xl text-ebony mb-3">מעולה, בנינו לך פרופיל</h2>
              <p className="font-editorial italic text-walnut-500 text-lg leading-relaxed max-w-xs">
                עכשיו נכיר את הארון שלך — וכל בוקר תקבלי לוק מוכן.
              </p>
            </Slide>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-8 pt-2">
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className="w-full flex items-center justify-center gap-2 bg-ebony text-parchment rounded-sm py-4 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
        >
          {step === 0 && "מתחילות"}
          {step === 1 && "יאללה, הלאה"}
          {(step === 2 || step === 3) && "ממשיכות"}
          {step === 4 && (<><Check className="h-4 w-4" strokeWidth={2} /> לארון שלי</>)}
        </button>
      </div>
    </div>
  );
}

function Slide({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Chip({
  label, emoji, active, onClick,
}: { label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-4 text-sm transition active:scale-[0.97] border ${
        active
          ? "bg-ebony text-parchment border-ebony shadow-md"
          : "bg-parchment-light text-walnut-600 border-brass/20"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="font-medium">{label}</span>
      {active && <Check className="h-4 w-4 mr-auto" strokeWidth={2} />}
    </button>
  );
}
