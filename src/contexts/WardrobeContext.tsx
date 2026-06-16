import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ClothingItem } from "../types";
import { loadItems, saveItems } from "../lib/storage";
import { supabase, WARDROBE_BUCKET } from "../lib/supabase";
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

// Postgres lowercases unquoted identifiers, so the table uses snake_case columns.
type Row = Record<string, unknown>;

function rowToItem(d: Row): ClothingItem {
  return {
    id: d.id as string,
    name: d.name as string,
    category: d.category as ClothingItem["category"],
    color: d.color as string,
    colorHex: d.color_hex as string,
    season: d.season as ClothingItem["season"],
    material: (d.material ?? undefined) as ClothingItem["material"] | undefined,
    brand: (d.brand ?? undefined) as string | undefined,
    model: (d.model ?? undefined) as string | undefined,
    formality: (d.formality ?? undefined) as ClothingItem["formality"] | undefined,
    imageUrl: (d.image_url ?? undefined) as string | undefined,
    createdAt: Number(d.created_at),
    source: d.source as ClothingItem["source"],
  };
}

function itemToRow(item: ClothingItem, userId: string, imageUrl: string | null): Row {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    color: item.color,
    color_hex: item.colorHex,
    season: item.season,
    material: item.material ?? null,
    brand: item.brand ?? null,
    model: item.model ?? null,
    formality: item.formality ?? null,
    image_url: imageUrl,
    created_at: item.createdAt,
    source: item.source,
  };
}

async function uploadImage(uid: string, itemId: string, dataUrl: string): Promise<string> {
  if (!supabase) return dataUrl;
  const blob = dataUrlToBlob(dataUrl);
  if (blob.size > 5 * 1024 * 1024) throw new Error("Image too large (max 5 MB)");
  const path = `${uid}/${itemId}.jpg`;
  const { error } = await supabase.storage
    .from(WARDROBE_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(WARDROBE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const useCloud = !!(userId && supabase);

  const [items, setItems] = useState<ClothingItem[]>(() => useCloud ? [] : loadItems());
  const [loading, setLoading] = useState(useCloud);
  const [localItemsToMigrate, setLocalItemsToMigrate] = useState<ClothingItem[]>(
    () => useCloud ? loadItems() : []
  );

  useEffect(() => {
    if (!useCloud) saveItems(items);
  }, [items, useCloud]);

  useEffect(() => {
    if (!useCloud || !supabase || !userId) return;
    setLoading(true);
    supabase
      .from("wardrobe")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setItems((data ?? []).map((d) => rowToItem(d as Row)));
        setLoading(false);
      });
  }, [useCloud, userId]);

  const add = useCallback((item: ClothingItem) => {
    setItems((prev) => [item, ...prev]);

    if (!useCloud || !userId || !supabase) return;

    (async () => {
      let imageUrl = item.imageUrl ?? null;
      if (imageUrl?.startsWith("data:")) {
        try {
          imageUrl = await uploadImage(userId, item.id, imageUrl);
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, imageUrl: imageUrl! } : i)));
        } catch { /* keep base64 if upload fails */ }
      }
      const { error } = await supabase!.from("wardrobe").upsert(itemToRow(item, userId, imageUrl));
      if (error) console.error(error);
    })();
  }, [useCloud, userId]);

  const update = useCallback((item: ClothingItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    if (!useCloud || !userId || !supabase) return;
    supabase
      .from("wardrobe")
      .upsert(itemToRow(item, userId, item.imageUrl ?? null))
      .then(({ error }) => { if (error) console.error(error); });
  }, [useCloud, userId]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (!useCloud || !userId || !supabase) return;
    supabase.from("wardrobe").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error(error); });
    supabase.storage.from(WARDROBE_BUCKET).remove([`${userId}/${id}.jpg`])
      .then(() => {/* no file = OK */});
  }, [useCloud, userId]);

  const clear = useCallback(() => {
    setItems([]);
    if (!useCloud || !userId || !supabase) return;
    // RLS scopes the delete to the current user; the filter satisfies the API's required predicate.
    supabase.from("wardrobe").delete().eq("user_id", userId)
      .then(({ error }) => { if (error) console.error(error); });
  }, [useCloud, userId]);

  const migrate = useCallback(async () => {
    if (!useCloud || !localItemsToMigrate.length) return;
    for (const item of localItemsToMigrate) add(item);
    saveItems([]);
    setLocalItemsToMigrate([]);
  }, [useCloud, localItemsToMigrate, add]);

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
