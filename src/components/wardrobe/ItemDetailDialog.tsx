import { useState } from "react";
import { Trash2, Sparkles, Shirt } from "lucide-react";
import type { ClothingItem } from "../../types";
import { CATEGORY_LABEL, SEASON_LABEL, MATERIAL_LABEL } from "../../lib/constants";
import Sheet from "../ui/Sheet";
import { tryOnGarment } from "../../lib/claude";
import {
  getAvatarRender,
  setAvatarRender,
  defaultFigureSrc,
  toFalImage,
} from "../../lib/avatar-store";

interface Props {
  item: ClothingItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ItemDetailDialog({ item, onClose, onDelete }: Props) {
  const [dressing, setDressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDress() {
    if (!item?.imageUrl || dressing) return;
    setDressing(true);
    setError(null);
    try {
      const figureSrc = getAvatarRender() ?? defaultFigureSrc();
      const [figure, garment] = await Promise.all([
        toFalImage(figureSrc),
        toFalImage(item.imageUrl),
      ]);
      const url = await tryOnGarment(figure, garment, item.category, item.name);
      setAvatarRender(url); // room updates live
      onClose(); // back to the room to see her wearing it
    } catch (e) {
      const msg = e instanceof Error ? e.message : "שגיאה לא ידועה";
      setError(`ההלבשה נכשלה: ${msg}`);
    } finally {
      setDressing(false);
    }
  }

  return (
    <Sheet open={!!item} onClose={onClose} title="פריט בארון">
      {item && (
        <div className="space-y-5" dir="rtl">
          {item.imageUrl && (
            <div className="aspect-square w-full overflow-hidden rounded-sm">
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div>
            <p className="text-xs label-tracked text-walnut-400 mb-1">
              {CATEGORY_LABEL[item.category]}
            </p>
            <h2 className="font-display text-2xl text-ebony">{item.name}</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-walnut-400 text-xs label-tracked mb-0.5">צבע</dt>
              <dd className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full border border-walnut-200"
                  style={{ backgroundColor: item.colorHex }}
                />
                <span>{item.color}</span>
              </dd>
            </div>
            {item.material && (
              <div>
                <dt className="text-walnut-400 text-xs label-tracked mb-0.5">בד</dt>
                <dd>{MATERIAL_LABEL[item.material]}</dd>
              </div>
            )}
            <div>
              <dt className="text-walnut-400 text-xs label-tracked mb-0.5">עונה</dt>
              <dd>{SEASON_LABEL[item.season]}</dd>
            </div>
            {item.brand && (
              <div>
                <dt className="text-walnut-400 text-xs label-tracked mb-0.5">מותג</dt>
                <dd>
                  {item.brand}
                  {item.model ? ` ${item.model}` : ""}
                </dd>
              </div>
            )}
          </dl>

          {/* Primary action — dress the avatar in this garment */}
          {item.imageUrl && (
            <button
              onClick={handleDress}
              disabled={dressing}
              className="w-full brass-plate rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {dressing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  מלבישה את הדמות…
                </>
              ) : (
                <>
                  <Shirt className="h-4 w-4" />
                  הלבישי את הדמות
                </>
              )}
            </button>
          )}
          {error && (
            <p className="text-center text-xs text-red-600 -mt-2">{error}</p>
          )}

          <button
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            disabled={dressing}
            className="w-full rounded-sm border border-walnut-200 text-walnut-500 hover:bg-walnut-50 hover:text-ebony transition flex items-center justify-center gap-2 py-3 font-display text-sm disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            הסירי מהארון
          </button>
        </div>
      )}
    </Sheet>
  );
}
