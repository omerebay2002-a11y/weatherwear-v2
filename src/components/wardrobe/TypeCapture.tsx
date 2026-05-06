import { useState } from "react";
import { useAnimate } from "framer-motion";
import { Loader2, Sparkles, ImagePlus } from "lucide-react";
import ItemDraftForm, { type ItemDraft } from "./ItemDraftForm";
import { analyzeClothing } from "../../lib/claude";
import type { ClothingItem } from "../../types";

interface Props {
  onSave: (item: Omit<ClothingItem, "id" | "createdAt" | "source">) => void;
  onCancel: () => void;
}

export default function TypeCapture({ onSave, onCancel }: Props) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputScope, animateInput] = useAnimate();

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeClothing({ mode: "text", text: trimmed });
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
    } catch {
      setError("לא הצלחתי לזהות — נסי שוב או ערכי ידנית");
      animateInput(inputScope.current, { x: [0, -8, 8, -8, 8, 0] }, { duration: 0.4 });
      setDraft({});
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
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
      {/* AI text input */}
      <div className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-walnut-400">תארי את הפריט</p>
        <div className="relative" ref={inputScope}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Levi's 501 כחול, Nike Air Max לבן, שמלה שחורה קצרה…"
            className="w-full rounded-sm border border-walnut-200 bg-parchment px-4 py-3 text-sm text-ebony placeholder-walnut-300 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/30 transition"
            dir="rtl"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!text.trim() || analyzing}
          className="brass-plate rounded-sm py-3 w-full flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {analyzing ? (
            <><Loader2 className="h-4 w-4 animate-spin" />מזהה עם AI…</>
          ) : (
            <><Sparkles className="h-4 w-4" />זהי פריט</>
          )}
        </button>

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-walnut-300">
        <div className="h-px flex-1 bg-walnut-200" />
        <span className="text-xs">או</span>
        <div className="h-px flex-1 bg-walnut-200" />
      </div>

      {/* Optional image */}
      {!imageUrl ? (
        <label className="block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="cursor-pointer rounded-sm border-2 border-dashed border-walnut-200 hover:border-walnut-300 transition py-5 flex flex-col items-center text-walnut-400 gap-1.5">
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs">הוסיפי תמונה (לא חובה)</span>
          </div>
        </label>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-parchment-dark">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl(undefined)}
            className="absolute top-2 left-2 frost-dark rounded-full px-2 py-1 text-xs text-parchment"
          >
            הסירי
          </button>
        </div>
      )}

      {/* If image chosen, offer to fill form manually */}
      {imageUrl && !draft && (
        <button
          type="button"
          onClick={() => setDraft({})}
          className="w-full text-xs text-walnut-400 underline underline-offset-2"
        >
          מלאי ידנית ←
        </button>
      )}
    </div>
  );
}
