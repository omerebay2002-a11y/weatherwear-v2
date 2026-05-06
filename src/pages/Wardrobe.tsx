import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useWardrobe } from "../contexts/WardrobeContext";
import ItemDetailDialog from "../components/wardrobe/ItemDetailDialog";
import AddItemSheet from "../components/wardrobe/AddItemSheet";
import WardrobeSheet from "../components/wardrobe/WardrobeSheet";
import type { ClothingItem, ClothingCategory } from "../types";
import type { Compartment } from "../components/room/Cabinet";

// Code-split the 3D scene
const Room3D = lazy(() => import("../components/room/Room3D"));

const COMPARTMENT_TO_CATEGORIES: Record<Compartment, ClothingCategory[]> = {
  shirts: ["top", "dress"],
  coats: ["outerwear"],
  folded: ["bottom", "shoes"],
  drawers: ["accessory", "bag"],
};

export default function Wardrobe() {
  const { items, remove } = useWardrobe();
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [initialCategories, setInitialCategories] = useState<ClothingCategory[]>([]);

  const itemCount = items.length;
  const hint = cabinetOpen
    ? "הקליקי על מדור בארון לראות פריטים"
    : itemCount === 0
    ? "הקליקי על הארון לפתיחה"
    : `${itemCount} פריטים · הקליקי על הארון לפתיחה`;

  const handleCompartmentClick = (compartment: Compartment) => {
    setInitialCategories(COMPARTMENT_TO_CATEGORIES[compartment]);
    setSheetOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-parchment via-parchment-dark to-parchment"
    >
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <p className="font-editorial italic text-walnut-300">טוענת ארון…</p>
            </div>
          }
        >
          <Room3D
            open={cabinetOpen}
            onToggle={() => setCabinetOpen((o) => !o)}
            onCompartmentClick={handleCompartmentClick}
          />
        </Suspense>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {!cabinetOpen && (
          <motion.div
            key="hint"
            className="absolute top-4 inset-x-0 z-20 pointer-events-none safe-top text-center"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <p className="font-editorial italic text-sm text-walnut-500">{hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — Add item */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", damping: 18 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setAdding(true)}
        className="absolute bottom-24 left-5 z-30 brass-plate rounded-full h-14 w-14 flex items-center justify-center shadow-soft-lg"
        aria-label="הוסיפי פריט"
      >
        <Plus className="h-7 w-7" strokeWidth={2.2} />
      </motion.button>

      {/* Close cabinet */}
      <AnimatePresence>
        {cabinetOpen && (
          <motion.button
            key="close"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setCabinetOpen(false)}
            className="absolute top-4 right-4 z-30 safe-top frost-dark rounded-full h-11 w-11 flex items-center justify-center shadow-soft-lg"
            aria-label="סגרי ארון"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      <WardrobeSheet
        open={sheetOpen}
        initialCategories={initialCategories}
        items={items}
        onClose={() => setSheetOpen(false)}
        onItemClick={(item) => {
          setSheetOpen(false);
          setSelected(item);
        }}
        onAddClick={() => setAdding(true)}
      />
      <AddItemSheet open={adding} onClose={() => setAdding(false)} />
      <ItemDetailDialog
        item={selected}
        onClose={() => setSelected(null)}
        onDelete={remove}
      />
    </motion.div>
  );
}
