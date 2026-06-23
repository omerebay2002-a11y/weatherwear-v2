import type { WhenChoice } from "../../types";
import { cn } from "../../lib/utils";

interface Props {
  value: WhenChoice;
  onChange: (v: WhenChoice) => void;
}

const CHOICES: { v: WhenChoice; label: string }[] = [
  { v: "now", label: "עכשיו" },
  { v: "tomorrow-morning", label: "מחר בוקר" },
  { v: "tomorrow-evening", label: "מחר ערב" },
];

export default function WhenPicker({ value, onChange }: Props) {
  return (
    <div className="mx-4 flex border border-parchment-dark rounded-sm overflow-hidden" dir="rtl">
      {CHOICES.map((c, i) => (
        <button
          key={c.v}
          type="button"
          onClick={() => onChange(c.v)}
          aria-pressed={value === c.v}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition",
            i < CHOICES.length - 1 && "border-l border-parchment-dark",
            value === c.v
              ? "bg-ebony text-parchment"
              : "bg-transparent text-ebony-muted hover:bg-parchment-dark"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
