import { useState } from "react";
import { ImagePlus } from "lucide-react";
import ItemDraftForm from "./ItemDraftForm";
import type { ClothingItem } from "../../types";

interface Props {
  onSave: (item: Omit<ClothingItem, "id" | "createdAt" | "source">) => void;
  onCancel: () => void;
}

export default function TypeCapture({ onSave, onCancel }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {!imageUrl && (
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
          <div className="cursor-pointer rounded-sm border-2 border-dashed border-walnut-200 hover:border-walnut-400 transition py-6 flex flex-col items-center text-walnut-400">
            <ImagePlus className="h-6 w-6 mb-1" />
            <span className="font-display text-sm">הוסיפי תמונה (לא חובה)</span>
          </div>
        </label>
      )}
      <ItemDraftForm
        initial={{}}
        imageUrl={imageUrl}
        onCancel={onCancel}
        onSave={onSave}
      />
    </div>
  );
}
