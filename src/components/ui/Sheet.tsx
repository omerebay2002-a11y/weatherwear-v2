import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** "auto" lets content size dictate height; "full" goes 90vh */
  height?: "auto" | "full";
  children: React.ReactNode;
}

/**
 * Bottom sheet primitive.
 * Drag-to-dismiss, frosted backdrop. Hebrew-friendly (no LTR-only icons in chrome).
 */
export default function Sheet({ open, onClose, title, height = "auto", children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-ebony/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={
              "fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md rounded-t-2xl bg-parchment-light shadow-soft-lg border-t border-walnut-100/50 " +
              (height === "full" ? "h-[90dvh]" : "max-h-[90dvh]")
            }
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <span className="block w-10 h-1 rounded-full bg-walnut-200/70 mx-auto absolute left-0 right-0 top-2" />
              <h3 className="font-display text-lg text-ebony pt-2">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-walnut-500 hover:bg-walnut-50 transition"
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "80dvh" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
