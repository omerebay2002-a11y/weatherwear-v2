import { Briefcase, Sparkles, Coffee, Activity } from "lucide-react";
import type { Occasion } from "../../types";
import { cn } from "../../lib/utils";

interface Props {
  value: Occasion | null;
  onChange: (v: Occasion) => void;
}

const CHOICES: { v: Occasion; label: string; Icon: typeof Briefcase }[] = [
  { v: "work", label: "עבודה", Icon: Briefcase },
  { v: "evening", label: "ערב", Icon: Sparkles },
  { v: "casual", label: "יומיום", Icon: Coffee },
  { v: "sport", label: "ספורט", Icon: Activity },
];

export default function OccasionPicker({ value, onChange }: Props) {
  return (
    <div className="px-5" dir="rtl">
      <p className="text-xs label-tracked text-walnut-400 mb-2">לאן</p>
      <div className="grid grid-cols-4 gap-2">
        {CHOICES.map(({ v, label, Icon }) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-sm border py-3 transition",
              value === v
                ? "bg-ebony text-parchment border-ebony"
                : "bg-parchment-light text-walnut-500 border-walnut-200 hover:border-walnut-300"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.6} />
            <span className="font-display text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
