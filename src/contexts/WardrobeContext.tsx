import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ClothingItem } from "../types";
import { loadItems, saveItems } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { STARTER_WARDROBE } from "../lib/starter-wardrobe";
import { isOnboarded } from "../lib/profile";
import { newId } from "../lib/utils";

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

// ─── DB ↔ domain mapping ─────────────────────────────────────────────────────

type DbRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  color_hex: string;
  material: string | null;
  brand: string | null;
  model: string | null;
  season: string;
  formality: string | null;
  image_url: string | null;
  created_at: number;
  source: string;
};

function rowToItem(row: DbRow): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ClothingItem["category"],
    color: row.color,
    colorHex: row.color_hex,
    material: (row.material ?? undefined) as ClothingItem["material"] | undefined,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    season: row.season as ClothingItem["season"],
    formality: (row.formality ?? undefined) as ClothingItem["formality"] | undefined,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
    source: row.source as ClothingItem["source"],
  };
}

function itemToRow(item: ClothingItem, userId: string, imageUrl?: string): DbRow {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    color: item.color,
    color_hex: item.colorHex,
    material: item.material ?? null,
    brand: item.brand ?? null,
    model: item.model ?? null,
    season: item.season,
    formality: item.formality ?? null,
    image_url: imageUrl ?? item.imageUrl ?? null,
    created_at: item.createdAt,
    source: item.source,
  };
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function uploadImage(userId: string, itemId: string, dataUrl: string): Promise<string> {
  if (!supabase) return dataUrl;
  const blob = dataUrlToBlob(dataUrl);
  if (blob.size > 5 * 1024 * 1024) throw new Error("Image too large (max 5 MB)");
  const path = `${userId}/${itemId}.jpg`;
  const { error } = await supabase.storage
    .from("wardrobe")
    .upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("wardrobe").getPublicUrl(path);
  return data.publicUrl;
}

async function deleteImage(userId: string, itemId: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from("wardrobe").remove([`${userId}/${itemId}.jpg`]);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const useCloud = !!(userId && supabase);

  const [items, setItems] = useState<ClothingItem[]>(() => (useCloud ? [] : loadItems()));
  const [loading, setLoading] = useState(useCloud);
  const [localItemsToMigrate, setLocalItemsToMigrate] = useState<ClothingItem[]>(
    () => (useCloud ? loadItems() : [])
  );

  // Persist to localStorage when offline
  useEffect(() => {
    if (!useCloud) saveItems(items);
  }, [items, useCloud]);

  // Never-empty wardrobe (offline): once the user has onboarded, fill an empty
  // closet with the real starter clothes (with real images) so it's alive from
  // the first second. Runs once on mount.
  useEffect(() => {
    if (useCloud) return;
    if (!isOnboarded()) return; // let the first-run questionnaire happen first
    if (loadItems().length > 0) return;
    const now = Date.now();
    setItems(
      STARTER_WARDROBE.map((s, i) => ({
        ...s,
        id: newId("starter"),
        createdAt: now - i,
        source: "onboarding" as ClothingItem["source"],
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch from Supabase when logged in
  useEffect(() => {
    if (!useCloud || !supabase || !userId) return;
    setLoading(true);
    supabase
      .from("wardrobe")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setItems((data as DbRow[]).map(rowToItem));
        setLoading(false);
      });
  }, [useCloud, userId]);

  const add = useCallback(
    (item: ClothingItem) => {
      setItems((prev) => [item, ...prev]);
      if (!useCloud || !userId || !supabase) return;

      (async () => {
        let imageUrl = item.imageUrl;
        if (imageUrl?.startsWith("data:")) {
          try {
            imageUrl = await uploadImage(userId, item.id, imageUrl);
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, imageUrl } : i))
            );
          } catch { /* keep base64 if upload fails */ }
        }
        const row = itemToRow(item, userId, imageUrl);
        await supabase.from("wardrobe").insert(row);
      })();
    },
    [useCloud, userId]
  );

  const update = useCallback(
    (item: ClothingItem) => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      if (!useCloud || !userId || !supabase) return;
      const row = itemToRow(item, userId);
      supabase.from("wardrobe").update(row).eq("id", item.id).then(({ error }) => {
        if (error) console.error(error);
      });
    },
    [useCloud, userId]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (!useCloud || !userId || !supabase) return;
      supabase.from("wardrobe").delete().eq("id", id).then(({ error }) => {
        if (error) console.error(error);
      });
      deleteImage(userId, id).catch(() => {/* no file = OK */});
    },
    [useCloud, userId]
  );

  const clear = useCallback(() => {
    setItems([]);
    if (!useCloud || !userId || !supabase) return;
    supabase
      .from("wardrobe")
      .delete()
      .eq("user_id", userId)
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
