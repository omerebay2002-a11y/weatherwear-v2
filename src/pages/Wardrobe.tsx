import { useState, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronUp } from "lucide-react";
import { useWardrobe } from "../contexts/WardrobeContext";
import ItemGrid from "../components/wardrobe/ItemGrid";
import ItemDetailDialog from "../components/wardrobe/ItemDetailDialog";
import AddItemSheet from "../components/wardrobe/AddItemSheet";
import type { ClothingItem } from "../types";

// Code-split the 3D scene — keeps Today page bundle small
const Room3D = lazy(() => import("../components/room/Room3D"));

export default function Wardrobe() {
  const { items, remove } = useWardrobe();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<ClothingItem | null>(null);

  const itemCount = items.length;
  const hint = useMemo(() => {
    if (open) return "הקליקי שוב על הארון לסגירה";
    if (itemCount === 0) return "הקליקי על הארון לפתיחה";
    return `${itemCount} פריטים · הקליקי על הארון לפתיחה`;
  }, [open, itemCount]);

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
          <Room3D open={open} onToggle={() => setOpen((o) => !o)} />
        </Suspense>
      </div>

      {/* Hint text — top center */}
      <motion.div
        className="absolute top-4 inset-x-0 z-20 pointer-events-none safe-top text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="font-editorial italic text-sm text-walnut-500">{hint}</p>
      </motion.div>

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

      {/* Items panel — slides up when cabinet is open */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="items-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 220,
              delay: 0.3, // wait for doors
            }}
            className="absolute bottom-16 inset-x-0 z-20 mx-auto max-w-md"
          >
            <div className="frost mx-3 rounded-t-xl rounded-b-md max-h-[50dvh] overflow-y-auto no-scrollbar">
              <div className="sticky top-0 frost flex items-center justify-between px-5 py-3 border-b border-walnut-100/50">
                <h3 className="font-display text-base text-ebony">בארון שלך</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-walnut-400 hover:text-walnut-600"
                  aria-label="סגרי"
                >
                  <ChevronUp className="h-5 w-5 rotate-180" />
                </button>
              </div>
              <div className="px-4 py-4">
                <ItemGrid
                  items={items}
                  onItemClick={setSelected}
                  onAddClick={() => setAdding(true)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AddItemSheet open={adding} onClose={() => setAdding(false)} />
      <ItemDetailDialog
        item={selected}
        onClose={() => setSelected(null)}
        onDelete={remove}
      />
    </motion.div>
  );
}
