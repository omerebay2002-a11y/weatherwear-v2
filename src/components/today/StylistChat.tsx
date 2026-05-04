import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Sheet from "../ui/Sheet";
import { chatStream } from "../../lib/claude";
import type { ChatMessage, ClothingItem, WeatherSnapshot } from "../../types";
import { cn } from "../../lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  weather: WeatherSnapshot | null;
  wardrobe: ClothingItem[];
}

const SUGGESTIONS = [
  "תכיני לי לוק לדייט מחר",
  "מה ללבוש לפגישה חשובה",
  "הולכת לטיול ביום קר",
];

export default function StylistChat({ open, onClose, weather, wardrobe }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || !weather || streaming) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text.trim(), ts: Date.now() };
    setMessages((m) => [...m, userMsg]);

    const placeholder: ChatMessage = { role: "assistant", content: "", ts: Date.now() };
    setMessages((m) => [...m, placeholder]);
    setStreaming(true);

    try {
      let acc = "";
      for await (const delta of chatStream([...messages, userMsg], { weather, wardrobe })) {
        acc += delta;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...placeholder, content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          ...placeholder,
          content:
            e instanceof Error
              ? `שגיאה: ${e.message}`
              : "שגיאה — נסי שוב.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="הסטייליסטית שלי" height="full">
      <div className="flex flex-col h-[75dvh]" dir="rtl">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto -mx-5 px-5 space-y-3 pb-4">
          {messages.length === 0 && (
            <div className="pt-6">
              <p className="font-editorial italic text-walnut-400 text-sm mb-4 text-center">
                שאלי אותי כל מה שתרצי על הלוק היום
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-right card px-4 py-3 hover:bg-walnut-50 transition"
                  >
                    <span className="text-sm text-walnut-600">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-ebony text-parchment"
                    : "bg-parchment-light border border-walnut-100 text-ebony"
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                ) : null)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-walnut-100 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            disabled={streaming}
            placeholder="כתבי לי…"
            className="flex-1 rounded-full border border-walnut-200 bg-parchment-light px-4 py-2.5 text-sm focus:border-walnut-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="brass-plate rounded-full h-10 w-10 flex items-center justify-center disabled:opacity-50"
            aria-label="שלחי"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Sheet>
  );
}
