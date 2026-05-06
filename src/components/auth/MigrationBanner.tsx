import { motion, AnimatePresence } from "framer-motion";
import { useWardrobe } from "../../contexts/WardrobeContext";

export default function MigrationBanner() {
  const { localItemsToMigrate, migrate, dismissMigration } = useWardrobe();

  if (!localItemsToMigrate.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed top-0 inset-x-0 z-50 bg-ebony text-parchment px-4 py-3 flex items-center gap-3 safe-top"
        dir="rtl"
      >
        <p className="flex-1 text-sm">
          יש לך {localItemsToMigrate.length} פריטים שמורים — להעביר לחשבון?
        </p>
        <button
          type="button"
          onClick={migrate}
          className="brass-plate text-xs px-3 py-1.5 rounded-sm flex-shrink-0"
        >
          העבירי
        </button>
        <button
          type="button"
          onClick={dismissMigration}
          className="text-parchment/50 text-xs flex-shrink-0"
        >
          ביטול
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
