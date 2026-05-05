import { useState, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useWardrobe } from "../contexts/WardrobeContext";
import ItemDetailDialog from "../components/wardrobe/ItemDetailDialog";
import AddItemSheet from "../components/wardrobe/AddItemSheet";
import CompartmentSheet from "../components/wardrobe/CompartmentSheet";
import type { ClothingItem } from "../types";
import type { Compartment } from "../components/room/Cabinet";

// Code-split the 3D scene — keeps Today page bundle small
const Room3D = lazy(() => import("../components/room/Room3D"));

export default function Wardrobe() {
  const { items, remove } = useWardrobe();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [compartment, setCompartment] = useState<Compartment | null>(null);

  const itemCount = items.length;
  const hint = useMemo(() => {
    if (open) return "הקליקי על מדור בארון לראות פריטים";
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
          <Room3D
            open={open}
            onToggle={() => setOpen((o) => !o)}
            onCompartmentClick={setCompartment}
          />
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

      {/* Modals */}
      <CompartmentSheet
        compartment={compartment}
        items={items}
        onClose={() => setCompartment(null)}
        onItemClick={(item) => {
          setCompartment(null);
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
