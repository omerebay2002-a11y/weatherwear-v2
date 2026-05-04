import { useState } from "react";
import { Camera, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ItemDraftForm, { type ItemDraft } from "./ItemDraftForm";
import { analyzeClothing } from "../../lib/claude";
import type { ClothingItem } from "../../types";

interface Props {
  onSave: (item: Omit<ClothingItem, "id" | "createdAt" | "source">) => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}

export default function PhotoCapture({ onSave, onCancel, onError }: Props) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<ItemDraft | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        setDraft(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    try {
      const result = await analyzeClothing({ mode: "image", imageBase64: imageUrl });
      setDraft({
        name: result.name,
        category: result.category,
        color: result.color,
        colorHex: result.colorHex,
        material: result.material,
        brand: result.brand,
        model: result.model,
        season: result.season,
        formality: result.formality,
      });
    } catch (e) {
      onError(
        e instanceof Error
          ? `הניתוח נכשל: ${e.message}`
          : "הניתוח נכשל. אפשר להזין ידנית."
      );
      // Allow manual entry as fallback
      setDraft({});
    } finally {
      setAnalyzing(false);
    }
  };

  if (draft) {
    return (
      <ItemDraftForm
        initial={draft}
        imageUrl={imageUrl}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {!imageUrl ? (
        <label className="block">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="cursor-pointer rounded-sm border-2 border-dashed border-walnut-200 hover:border-walnut-400 hover:bg-walnut-50 transition py-12 flex flex-col items-center text-walnut-400">
            <Camera className="h-10 w-10 mb-3" />
            <span className="font-display text-base text-ebony mb-1">
              צלמי או העלי תמונה
            </span>
            <span className="text-xs text-walnut-400">
              של פריט בודד, רצוי על רקע נקי
            </span>
          </div>
        </label>
      ) : (
        <>
          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-parchment-dark">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => setImageUrl("")}
              className="absolute top-2 left-2 frost-dark rounded-full p-2"
              aria-label="החליפי תמונה"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            className="brass-plate w-full font-display text-base py-4 rounded-sm flex items-center justify-center gap-2 tracking-wide"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                מנתחת את הפריט…
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                נתחי לי את הפריט
              </>
            )}
          </motion.button>

          <button
            onClick={() => setDraft({})}
            className="w-full text-center text-sm text-walnut-400 hover:text-walnut-600 transition py-2"
          >
            או — דלגי וערכי ידנית
          </button>
        </>
      )}
    </div>
  );
}
