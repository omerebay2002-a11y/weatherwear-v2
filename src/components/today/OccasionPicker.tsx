import type { Occasion } from "../../types";
import { cn } from "../../lib/utils";

interface Props {
  value: Occasion | null;
  onChange: (v: Occasion) => void;
}

const CHOICES: { v: Occasion; label: string }[] = [
  { v: "casual", label: "יומיום" },
  { v: "work", label: "עבודה" },
  { v: "evening", label: "ערב" },
  { v: "sport", label: "ספורט" },
];

export default function OccasionPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar" dir="rtl">
      {CHOICES.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          type="button"
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-sm text-[0.75rem] font-medium tracking-widest uppercase transition",
            value === v
              ? "bg-parchment-light border border-brass text-walnut-500"
              : "bg-parchment-dark border border-transparent text-ebony-muted hover:border-walnut-200"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
