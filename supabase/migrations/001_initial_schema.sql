-- ============================================================
-- FitCheck.ai — Initial Supabase Schema
-- Run this in the Supabase SQL Editor or via supabase db push
-- ============================================================

-- ── profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  gender        TEXT,
  body_type     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── clothing_items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clothing_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('top','bottom','shoes','dress','outerwear','accessory')),
  subcategory      TEXT,
  color            TEXT,
  secondary_colors TEXT[],
  pattern          TEXT,
  style            TEXT,
  formality        INT DEFAULT 3 CHECK (formality BETWEEN 1 AND 5),
  season           TEXT[],
  image_url        TEXT NOT NULL,
  source_url       TEXT,
  source_type      TEXT DEFAULT 'upload' CHECK (source_type IN ('upload','url')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own clothing items"
  ON clothing_items FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at on modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clothing_items_updated_at
  BEFORE UPDATE ON clothing_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- ── outfit_requests ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfit_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  occasion             TEXT NOT NULL,
  weather              TEXT,
  weather_temp         INT,
  style                TEXT,
  recommendation_count INT DEFAULT 3 CHECK (recommendation_count BETWEEN 1 AND 5),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outfit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own outfit requests"
  ON outfit_requests FOR ALL USING (auth.uid() = user_id);


-- ── outfits ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID REFERENCES outfit_requests(id) ON DELETE SET NULL,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT,
  explanation TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own outfits"
  ON outfits FOR ALL USING (auth.uid() = user_id);


-- ── outfit_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfit_items (
  outfit_id        UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  role             TEXT NOT NULL,
  PRIMARY KEY (outfit_id, clothing_item_id)
);

-- outfit_items inherits access through outfits (no separate RLS needed)
-- but we add it for safety:
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own outfit items"
  ON outfit_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "users can insert own outfit items"
  ON outfit_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "users can delete own outfit items"
  ON outfit_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );


-- ── favorites ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outfit_id  UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, outfit_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own favorites"
  ON favorites FOR ALL USING (auth.uid() = user_id);


-- ── Storage ────────────────────────────────────────────────────────────────────
-- Run these in the Supabase dashboard → Storage → Policies
-- OR via the REST API after creating the bucket

-- Create the wardrobe bucket (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe', 'wardrobe', true)
ON CONFLICT DO NOTHING;

-- Storage RLS: users can only read/write their own folder
CREATE POLICY "users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can view their own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "public can view wardrobe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wardrobe');

CREATE POLICY "users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id   ON clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category  ON clothing_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_outfit_requests_user_id  ON outfit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id          ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id        ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id   ON outfit_items(outfit_id);
