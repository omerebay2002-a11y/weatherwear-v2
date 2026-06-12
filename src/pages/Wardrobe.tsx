import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useWardrobe } from "../contexts/WardrobeContext";
import ItemDetailDialog from "../components/wardrobe/ItemDetailDialog";
import AddItemSheet from "../components/wardrobe/AddItemSheet";
import WardrobeSheet from "../components/wardrobe/WardrobeSheet";
import WardrobeIllustration from "../components/wardrobe/WardrobeIllustration";
import RoomAvatar from "../components/wardrobe/RoomAvatar";
import type { ClothingItem, ClothingCategory } from "../types";
import type { Compartment } from "../components/room/Cabinet";

const COMPARTMENT_TO_CATEGORIES: Record<Compartment, ClothingCategory[]> = {
  shirts: ["top", "dress"],
  coats: ["outerwear"],
  folded: ["bottom", "shoes"],
  drawers: ["underwear", "socks", "accessory", "bag"],
};

export default function Wardrobe() {
  const { items, remove } = useWardrobe();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [initialCategories, setInitialCategories] = useState<ClothingCategory[]>([]);

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
      className="relative h-[100dvh] w-full overflow-hidden bg-parchment"
    >
      {/* Illustrated wardrobe — replaces the old 3D scene */}
      <WardrobeIllustration onCompartmentClick={handleCompartmentClick} />

      {/* The avatar stands next to the wardrobe — part of the interface, not a page */}
      <RoomAvatar />

      {/* FAB — Add item */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", damping: 18 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setAdding(true)}
        className="absolute bottom-24 left-5 z-30 brass-plate rounded-full h-14 w-14 flex items-center justify-center shadow-soft-lg"
        aria-label="הוסיפי פריט"
      >
        <Plus className="h-7 w-7" strokeWidth={2.2} />
      </motion.button>

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
