import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import type { ClothingItem, ClothingCategory, Material, Season } from "../../types";
import { cn } from "../../lib/utils";

export interface ItemDraft {
  name?: string;
  category?: ClothingCategory;
  color?: string;
  colorHex?: string;
  material?: Material;
  brand?: string;
  model?: string;
  season?: Season;
  formality?: ClothingItem["formality"];
  imageUrl?: string;
}

interface Props {
  initial: ItemDraft;
  imageUrl?: string;
  onCancel: () => void;
  onSave: (item: Omit<ClothingItem, "id" | "createdAt" | "source">) => void;
  saveLabel?: string;
}

const CATEGORIES: { v: ClothingCategory; label: string }[] = [
  { v: "outerwear", label: "מעיל" },
  { v: "top", label: "חולצה" },
  { v: "dress", label: "שמלה" },
  { v: "bottom", label: "מכנסיים" },
  { v: "underwear", label: "תחתונים" },
  { v: "socks", label: "גרביים" },
  { v: "shoes", label: "נעליים" },
  { v: "bag", label: "תיק" },
  { v: "accessory", label: "תכשיטים" },
];

const MATERIALS: { v: Material; label: string }[] = [
  { v: "cotton", label: "כותנה" },
  { v: "denim", label: "ג׳ינס" },
  { v: "wool", label: "צמר" },
  { v: "linen", label: "פשתן" },
  { v: "silk", label: "משי" },
  { v: "leather", label: "עור" },
  { v: "synthetic", label: "סינתטי" },
];

const SEASONS: { v: Season; label: string }[] = [
  { v: "summer", label: "קיץ" },
  { v: "all", label: "כל השנה" },
  { v: "winter", label: "חורף" },
];

const COLORS: { name: string; hex: string }[] = [
  { name: "שחור", hex: "#1A1410" },
  { name: "לבן", hex: "#FAF6EE" },
  { name: "אפור", hex: "#6B6B6B" },
  { name: "חום", hex: "#5C3E22" },
  { name: "חאקי", hex: "#948169" },
  { name: "בז׳", hex: "#C9B898" },
  { name: "ורוד עתיק", hex: "#D9B0B0" },
  { name: "כחול ג׳ינס", hex: "#3F5878" },
  { name: "ירוק זית", hex: "#6B7553" },
  { name: "ירוק מנטה", hex: "#9BAE94" },
  { name: "אדום יין", hex: "#6F2A2A" },
  { name: "צהוב חרדל", hex: "#B89742" },
];

export default function ItemDraftForm({
  initial,
  imageUrl,
  onCancel,
  onSave,
  saveLabel = "שמרי בארון",
}: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [category, setCategory] = useState<ClothingCategory | undefined>(
    initial.category
  );
  const [colorName, setColorName] = useState(initial.color ?? "");
  const [colorHex, setColorHex] = useState(initial.colorHex ?? "#5C3E22");
  const [material, setMaterial] = useState<Material | undefined>(initial.material);
  const [season, setSeason] = useState<Season>(initial.season ?? "all");
  const [brand, setBrand] = useState(initial.brand ?? "");
  const [model, setModel] = useState(initial.model ?? "");

  useEffect(() => {
    setName(initial.name ?? "");
    setCategory(initial.category);
    setColorName(initial.color ?? "");
    setColorHex(initial.colorHex ?? "#5C3E22");
    setMaterial(initial.material);
    setSeason(initial.season ?? "all");
    setBrand(initial.brand ?? "");
    setModel(initial.model ?? "");
  }, [initial]);

  const valid = !!(name.trim() && category && colorName);

  return (
    <div className="space-y-5" dir="rtl">
      {imageUrl && (
        <div className="aspect-square w-full overflow-hidden rounded-sm bg-parchment-dark">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <Field label="שם הפריט" htmlFor="item-name">
        <input
          id="item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: ג׳ינס Levi's 501 כחול"
          className="w-full rounded-sm border border-walnut-200 bg-parchment-light px-3 py-2.5 text-sm focus:border-walnut-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-walnut-400"
        />
      </Field>

      <Field label="קטגוריה">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.v}
              active={category === c.v}
              onClick={() => setCategory(c.v)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="צבע">
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setColorName(c.name);
                setColorHex(c.hex);
              }}
              className={cn(
                "relative aspect-square rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut-400",
                colorName === c.name
                  ? "border-ebony scale-110"
                  : "border-walnut-100 hover:border-walnut-300"
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={c.name}
              aria-pressed={colorName === c.name}
            >
              {colorName === c.name && (
                <Check
                  className="absolute inset-0 m-auto h-4 w-4"
                  style={{
                    color: ["#FAF6EE", "#C9B898", "#D9B0B0", "#9BAE94", "#B89742"].includes(c.hex)
                      ? "#1A1410"
                      : "#FAF6EE",
                  }}
                />
              )}
            </button>
          ))}
        </div>
        {colorName && (
          <p className="text-xs text-walnut-400 mt-2">בחרת: {colorName}</p>
        )}
      </Field>

      <Field label="עונה">
        <div className="flex gap-2">
          {SEASONS.map((s) => (
            <Chip key={s.v} active={season === s.v} onClick={() => setSeason(s.v)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="בד (לא חובה)">
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((m) => (
            <Chip
              key={m.v}
              active={material === m.v}
              onClick={() => setMaterial(material === m.v ? undefined : m.v)}
            >
              {m.label}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="מותג (לא חובה)" htmlFor="item-brand">
          <input
            id="item-brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Levi's"
            className="w-full rounded-sm border border-walnut-200 bg-parchment-light px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-walnut-400"
          />
        </Field>
        <Field label="דגם (לא חובה)" htmlFor="item-model">
          <input
            id="item-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="501"
            className="w-full rounded-sm border border-walnut-200 bg-parchment-light px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-walnut-400"
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-sm border border-walnut-200 text-walnut-500 hover:bg-walnut-50 transition py-3 font-display text-sm"
        >
          ביטול
        </button>
        <button
          disabled={!valid}
          onClick={() => {
            if (!valid || !category) return;
            onSave({
              name: name.trim(),
              category,
              color: colorName,
              colorHex,
              material,
              brand: brand.trim() || undefined,
              model: model.trim() || undefined,
              season,
              imageUrl,
            });
          }}
          className={cn(
            "flex-2 rounded-sm py-3 px-6 font-display text-sm transition",
            valid
              ? "brass-plate"
              : "bg-walnut-100 text-walnut-300 cursor-not-allowed"
          )}
          style={{ flex: 2 }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  if (htmlFor) {
    return (
      <div>
        <label htmlFor={htmlFor} className="block text-xs label-tracked text-walnut-400 mb-2">
          {label}
        </label>
        {children}
      </div>
    );
  }
  return (
    <fieldset>
      <legend className="block text-xs label-tracked text-walnut-400 mb-2">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm transition border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut-400",
        active
          ? "bg-ebony text-parchment border-ebony"
          : "bg-parchment-light text-walnut-500 border-walnut-200 hover:border-walnut-300"
      )}
    >
      {children}
    </button>
  );
}
