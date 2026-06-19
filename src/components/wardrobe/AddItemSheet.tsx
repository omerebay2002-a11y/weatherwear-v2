import { useState } from "react";
import { Camera, Mic, PenLine, ScanLine } from "lucide-react";
import Sheet from "../ui/Sheet";
import PhotoCapture from "./PhotoCapture";
import VoiceCapture from "./VoiceCapture";
import TypeCapture from "./TypeCapture";
import VideoScan from "./VideoScan";
import { useWardrobe } from "../../contexts/WardrobeContext";
import { useToast } from "../ui/Toast";
import { newId, cn } from "../../lib/utils";
import type { ClothingItem } from "../../types";

type Mode = "photo" | "video" | "voice" | "type";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddItemSheet({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("photo");
  const { add } = useWardrobe();
  const { push } = useToast();

  const handleSave = (
    data: Omit<ClothingItem, "id" | "createdAt" | "source">,
    source: "photo" | "voice" | "type"
  ) => {
    const item: ClothingItem = { ...data, id: newId("item"), createdAt: Date.now(), source };
    add(item);
    push(`${item.name} נוסף לארון`, "👗");
    onClose();
  };

  const handleVideoSave = (data: Omit<ClothingItem, "id" | "createdAt" | "source">) => {
    const item: ClothingItem = { ...data, id: newId("item"), createdAt: Date.now(), source: "photo" };
    add(item);
  };

  const handleVideoDone = (count: number) => {
    push(`${count} פריטים נוספו לארון`, "👗");
    onClose();
  };

  const tabs: { v: Mode; label: string; Icon: typeof Camera }[] = [
    { v: "photo", label: "תמונה", Icon: Camera },
    { v: "video", label: "סריקה", Icon: ScanLine },
    { v: "voice", label: "קול", Icon: Mic },
    { v: "type", label: "הקלדה", Icon: PenLine },
  ];

  return (
    <Sheet open={open} onClose={onClose} title="הוסיפי לארון" height="full">
      <div dir="rtl">
        {/* Mode tabs */}
        <div className="flex gap-1.5 mb-5 sticky top-0 bg-parchment-light pt-1 pb-3 z-10">
          {tabs.map(({ v, label, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => setMode(v)}
              aria-pressed={mode === v}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-sm border transition",
                mode === v
                  ? "border-ebony bg-ebony text-parchment"
                  : "border-walnut-200 text-walnut-500 hover:border-walnut-300"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div key={mode}>
          {mode === "photo" && (
            <PhotoCapture
              onCancel={onClose}
              onSave={(d) => handleSave(d, "photo")}
              onError={(msg) => push(msg, "⚠️")}
            />
          )}
          {mode === "video" && (
            <VideoScan
              onSave={handleVideoSave}
              onDone={handleVideoDone}
              onCancel={onClose}
            />
          )}
          {mode === "voice" && (
            <VoiceCapture
              onCancel={onClose}
              onSave={(d) => handleSave(d, "voice")}
              onError={(msg) => push(msg, "⚠️")}
            />
          )}
          {mode === "type" && (
            <TypeCapture onCancel={onClose} onSave={(d) => handleSave(d, "type")} />
          )}
        </div>
      </div>
    </Sheet>
  );
}
