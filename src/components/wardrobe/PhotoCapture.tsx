import { useState } from "react";
import { Camera, Loader2, RefreshCw } from "lucide-react";
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

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      setImageUrl(url);
      setDraft(null);
      // Auto-analyze immediately — no extra button tap needed
      setAnalyzing(true);
      try {
        const result = await analyzeClothing({ mode: "image", imageBase64: url });
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
        onError("הניתוח נכשל. ערכי ידנית.");
        setDraft({});
      } finally {
        setAnalyzing(false);
      }
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
      {!imageUrl ? (
        <label className="block cursor-pointer">
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
          <div className="rounded-sm border-2 border-dashed border-walnut-200 hover:border-brass transition py-14 flex flex-col items-center gap-3 text-walnut-400">
            <Camera className="h-12 w-12" strokeWidth={1.4} />
            <div className="text-center">
              <p className="font-display text-base text-ebony">צלמי פריט</p>
              <p className="text-xs text-walnut-400 mt-1">AI יזהה אוטומטית</p>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-parchment-dark">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          {analyzing && (
            <div className="absolute inset-0 bg-ebony/60 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
              <p className="font-editorial italic text-parchment text-sm">מזהה פריט…</p>
            </div>
          )}
          {!analyzing && (
            <button
              type="button"
              onClick={() => { setImageUrl(""); setDraft(null); }}
              className="absolute top-2 left-2 frost-dark rounded-full p-2"
              aria-label="החליפי תמונה"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
