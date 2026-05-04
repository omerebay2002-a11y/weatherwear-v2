import type { WhenChoice } from "../../types";
import { cn } from "../../lib/utils";

interface Props {
  value: WhenChoice;
  onChange: (v: WhenChoice) => void;
}

const CHOICES: { v: WhenChoice; label: string }[] = [
  { v: "now", label: "עכשיו" },
  { v: "tomorrow-morning", label: "מחר בבוקר" },
  { v: "tomorrow-evening", label: "מחר בערב" },
];

export default function WhenPicker({ value, onChange }: Props) {
  return (
    <div className="px-5" dir="rtl">
      <p className="text-xs label-tracked text-walnut-400 mb-2">מתי</p>
      <div className="flex gap-2">
        {CHOICES.map((c) => (
          <button
            key={c.v}
            onClick={() => onChange(c.v)}
            className={cn(
              "flex-1 rounded-full border py-2.5 text-sm transition",
              value === c.v
                ? "bg-ebony text-parchment border-ebony"
                : "bg-parchment-light text-walnut-500 border-walnut-200 hover:border-walnut-300"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
