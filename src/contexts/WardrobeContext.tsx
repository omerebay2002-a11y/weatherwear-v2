import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ClothingItem } from "../types";
import { loadItems, saveItems } from "../lib/storage";

interface WardrobeContextValue {
  items: ClothingItem[];
  add: (item: ClothingItem) => void;
  update: (item: ClothingItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>(() => loadItems());

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const add = useCallback((item: ClothingItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const update = useCallback((item: ClothingItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, add, update, remove, clear }), [items, add, update, remove, clear]);

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe(): WardrobeContextValue {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used inside <WardrobeProvider>");
  return ctx;
}
