-- WeatherWear v2 — Supabase schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)

-- ─── Wardrobe items ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wardrobe (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  color       TEXT NOT NULL,
  color_hex   TEXT NOT NULL,
  material    TEXT,
  brand       TEXT,
  model       TEXT,
  season      TEXT NOT NULL,
  formality   TEXT,
  image_url   TEXT,
  created_at  BIGINT NOT NULL,
  source      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS wardrobe_user_id_idx ON wardrobe (user_id);

ALTER TABLE wardrobe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own wardrobe" ON wardrobe
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Storage bucket for clothing photos ─────────────────────────────────────
-- Go to Storage → New bucket → name "wardrobe", toggle Public ON.
-- OR run:
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe', 'wardrobe', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read wardrobe images" ON storage.objects
  FOR SELECT USING (bucket_id = 'wardrobe');

CREATE POLICY "Users delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
