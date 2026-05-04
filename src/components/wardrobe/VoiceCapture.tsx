import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ItemDraftForm, { type ItemDraft } from "./ItemDraftForm";
import { startSpeechRecognition, isSpeechSupported } from "../../lib/speech";
import { analyzeClothing } from "../../lib/claude";
import type { ClothingItem } from "../../types";

interface Props {
  onSave: (item: Omit<ClothingItem, "id" | "createdAt" | "source">) => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}

export default function VoiceCapture({ onSave, onCancel, onError }: Props) {
  const [recording, setRecording] = useState(false);
  const [partial, setPartial] = useState("");
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  useEffect(
    () => () => {
      recRef.current?.stop();
    },
    []
  );

  if (!isSpeechSupported()) {
    return (
      <div className="text-center py-10 px-4" dir="rtl">
        <MicOff className="h-10 w-10 mx-auto text-walnut-300 mb-3" />
        <p className="font-display text-base text-ebony mb-2">
          הדפדפן שלך לא תומך בהקלטה
        </p>
        <p className="text-sm text-walnut-400 leading-relaxed mb-6">
          השתמשי ב-Chrome / Edge / Samsung Internet כדי לקלוט בעברית.
          <br />
          או — הקלידי במקום זאת.
        </p>
        <button
          onClick={onCancel}
          className="rounded-sm border border-walnut-200 px-6 py-2.5 text-sm"
        >
          חזרי
        </button>
      </div>
    );
  }

  const toggle = () => {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    setPartial("");
    setTranscript("");
    const handle = startSpeechRecognition(
      ({ transcript }) => setPartial(transcript),
      ({ transcript }) => {
        setTranscript((prev) => (prev ? prev + " " + transcript : transcript));
        setPartial("");
      },
      (msg) => {
        onError(msg);
        setRecording(false);
      }
    );
    if (handle) {
      recRef.current = handle;
      setRecording(true);
    }
  };

  const handleAnalyze = async () => {
    const text = (transcript + " " + partial).trim();
    if (!text) return;
    setAnalyzing(true);
    try {
      const result = await analyzeClothing({ mode: "text", text });
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
      setDraft({ name: text });
    } finally {
      setAnalyzing(false);
    }
  };

  if (draft) {
    return (
      <ItemDraftForm
        initial={draft}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  const fullText = (transcript + " " + partial).trim();

  return (
    <div className="space-y-5 text-center" dir="rtl">
      <div className="pt-2">
        <p className="text-xs label-tracked text-walnut-400 mb-1">
          הסבירי לי את הפריט
        </p>
        <p className="font-editorial italic text-walnut-500 text-sm">
          לדוגמה: "חולצה לבנה רגילה מכותנה"
        </p>
      </div>

      <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
        {recording && (
          <motion.span
            className="absolute inset-0 rounded-full bg-walnut-500/20"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={
            "relative h-24 w-24 rounded-full flex items-center justify-center transition shadow-soft-lg " +
            (recording ? "bg-ebony text-parchment" : "brass-plate")
          }
          aria-label={recording ? "עצרי הקלטה" : "התחילי הקלטה"}
        >
          {recording ? <MicOff className="h-9 w-9" /> : <Mic className="h-9 w-9" />}
        </motion.button>
      </div>

      <p className="text-xs text-walnut-400">
        {recording ? "הקליטה מתבצעת… הקיש שוב לסיום" : "הקיש להתחלת ההקלטה"}
      </p>

      {fullText && (
        <div className="card text-right p-4 min-h-[60px]">
          <p className="text-sm leading-relaxed text-ebony">
            {transcript}
            {partial && <span className="text-walnut-300"> {partial}</span>}
          </p>
        </div>
      )}

      {fullText && !recording && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleAnalyze}
          disabled={analyzing}
          className="brass-plate w-full font-display text-base py-3.5 rounded-sm flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              מנתחת…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              נתחי לי
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
