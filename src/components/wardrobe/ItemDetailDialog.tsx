import { Trash2, Shirt } from "lucide-react";
import type { ClothingItem } from "../../types";
import { CATEGORY_LABEL, SEASON_LABEL, MATERIAL_LABEL } from "../../lib/constants";
import Sheet from "../ui/Sheet";
import { tryOnGarment } from "../../lib/claude";
import {
  getAvatarRender,
  setAvatarRender,
  defaultFigureSrc,
  toFalImage,
  fitFigureToBase,
  getOutfitMode,
  setOutfitMode,
  setDressing,
  setDressingError,
} from "../../lib/avatar-store";

interface Props {
  item: ClothingItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ItemDetailDialog({ item, onClose, onDelete }: Props) {
  // Dress, then immediately return to the room so she watches the "designing the
  // look" overlay there (not a spinner in a sheet). The try-on runs in the
  // background and swaps the figure in when ready.
  function handleDress() {
    const it = item;
    if (!it?.imageUrl) return;
    onClose();
    setDressing(true);
    setDressingError(null);
    void (async () => {
      try {
        const c = it.category;
        const mode = getOutfitMode();
        // Outfit rules. The base mannequin already wears a default top + bottom.
        //  • dress → rebuild from the base (replaces the whole look)
        //  • top/bottom while wearing a dress → rebuild from base (drop the dress,
        //    the base supplies the complementary piece) — no shirt-over-dress
        //  • top/bottom in separates, or outerwear/shoes/bag → layer on the figure
        const leavingDress = (c === "top" || c === "bottom") && mode === "dress";
        const fromBase = c === "dress" || leavingDress;
        const figureSrc = fromBase ? defaultFigureSrc() : getAvatarRender() ?? defaultFigureSrc();

        const [figure, garment] = await Promise.all([
          toFalImage(figureSrc),
          toFalImage(it.imageUrl as string),
        ]);
        const raw = await tryOnGarment(figure, garment, c, it.name);
        const url = await fitFigureToBase(raw); // whole + same size as the base figure
        setAvatarRender(url);
        if (c === "dress") setOutfitMode("dress");
        else if (c === "top" || c === "bottom") setOutfitMode("separates");
      } catch (e) {
        setDressingError(e instanceof Error ? e.message : "שגיאה לא ידועה");
      } finally {
        setDressing(false);
      }
    })();
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
              className="w-full brass-plate rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Shirt className="h-4 w-4" />
              הלבישי את הדמות
            </button>
          )}

          <button
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="w-full rounded-sm border border-walnut-200 text-walnut-500 hover:bg-walnut-50 hover:text-ebony transition flex items-center justify-center gap-2 py-3 font-display text-sm"
          >
            <Trash2 className="h-4 w-4" />
            הסירי מהארון
          </button>
        </div>
      )}
    </Sheet>
  );
}
