import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  collection, doc, getDocs, setDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { ClothingItem } from "../types";
import { loadItems, saveItems } from "../lib/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "./AuthContext";

interface WardrobeContextValue {
  items: ClothingItem[];
  loading: boolean;
  localItemsToMigrate: ClothingItem[];
  add: (item: ClothingItem) => void;
  update: (item: ClothingItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  migrate: () => Promise<void>;
  dismissMigration: () => void;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

// ─── Helpers ────────────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function rowToItem(d: Record<string, unknown>): ClothingItem {
  return {
    id: d.id as string,
    name: d.name as string,
    category: d.category as ClothingItem["category"],
    color: d.color as string,
    colorHex: d.colorHex as string,
    season: d.season as ClothingItem["season"],
    material: d.material as ClothingItem["material"] | undefined,
    brand: d.brand as string | undefined,
    model: d.model as string | undefined,
    formality: d.formality as ClothingItem["formality"] | undefined,
    imageUrl: d.imageUrl as string | undefined,
    createdAt: d.createdAt as number,
    source: d.source as ClothingItem["source"],
  };
}

async function uploadImage(userId: string, itemId: string, dataUrl: string): Promise<string> {
  if (!storage) return dataUrl;
  const blob = dataUrlToBlob(dataUrl);
  const imgRef = ref(storage, `wardrobe/${userId}/${itemId}.jpg`);
  await uploadBytes(imgRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(imgRef);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [localItemsToMigrate, setLocalItemsToMigrate] = useState<ClothingItem[]>(() => loadItems());

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!userId || !db) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const col = collection(db, "users", userId, "wardrobe");
    getDocs(query(col, orderBy("createdAt", "desc")))
      .then(({ docs }) => {
        setItems(docs.map((d) => rowToItem(d.data() as Record<string, unknown>)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const add = useCallback((item: ClothingItem) => {
    if (!userId || !db) return;
    setItems((prev) => [item, ...prev]);

    (async () => {
      let imageUrl = item.imageUrl;
      if (imageUrl?.startsWith("data:")) {
        try {
          imageUrl = await uploadImage(userId, item.id, imageUrl);
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, imageUrl } : i)));
        } catch { /* keep base64 if upload fails */ }
      }
      const data = { ...item, imageUrl: imageUrl ?? null };
      await setDoc(doc(db!, "users", userId, "wardrobe", item.id), data);
    })();
  }, [userId]);

  const update = useCallback((item: ClothingItem) => {
    if (!userId || !db) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    setDoc(doc(db!, "users", userId, "wardrobe", item.id), item).catch(console.error);
  }, [userId]);

  const remove = useCallback((id: string) => {
    if (!userId || !db) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    deleteDoc(doc(db!, "users", userId, "wardrobe", id)).catch(console.error);
    if (storage) {
      deleteObject(ref(storage, `wardrobe/${userId}/${id}.jpg`)).catch(() => {/* no file = OK */});
    }
  }, [userId]);

  const clear = useCallback(() => {
    if (!userId || !db) return;
    setItems([]);
    // Delete all docs
    const col = collection(db, "users", userId, "wardrobe");
    getDocs(col).then(({ docs }) => {
      docs.forEach((d) => deleteDoc(d.ref).catch(console.error));
    });
  }, [userId]);

  // Migrate localStorage items to Firestore
  const migrate = useCallback(async () => {
    if (!userId || !localItemsToMigrate.length) return;
    for (const item of localItemsToMigrate) {
      add(item);
    }
    // Clear localStorage after migration
    saveItems([]);
    setLocalItemsToMigrate([]);
  }, [userId, localItemsToMigrate, add]);

  const dismissMigration = useCallback(() => {
    saveItems([]);
    setLocalItemsToMigrate([]);
  }, []);

  const value = useMemo(
    () => ({ items, loading, localItemsToMigrate, add, update, remove, clear, migrate, dismissMigration }),
    [items, loading, localItemsToMigrate, add, update, remove, clear, migrate, dismissMigration]
  );

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe(): WardrobeContextValue {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used inside <WardrobeProvider>");
  return ctx;
}
