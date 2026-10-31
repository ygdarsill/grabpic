-- ─────────────────────────────────────────────────────────────────────────────
-- GrabPic: Supabase SQL Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create face vectors table
CREATE TABLE IF NOT EXISTS face_vectors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code  TEXT NOT NULL,
  photo_url   TEXT NOT NULL,
  embedding   vector(128) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index for fast event-scoped KNN search (IVFFlat — good for free tier sizes)
CREATE INDEX IF NOT EXISTS face_vectors_event_idx
  ON face_vectors (event_code);

DROP INDEX IF EXISTS face_vectors_embedding_idx;

-- Use cosine distance ops — face-api.js descriptors are designed for cosine comparison
CREATE INDEX IF NOT EXISTS face_vectors_embedding_idx
  ON face_vectors USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. RPC: Upsert a face vector (called by backend after each photo upload)
CREATE OR REPLACE FUNCTION upsert_face_vector(
  p_id        UUID,
  p_event_code TEXT,
  p_photo_url TEXT,
  p_embedding TEXT  -- JSON array string, e.g. "[0.12, -0.43, ...]"
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO face_vectors (id, event_code, photo_url, embedding)
  VALUES (
    p_id,
    p_event_code,
    p_photo_url,
    p_embedding::vector
  )
  ON CONFLICT (id) DO UPDATE
    SET embedding = EXCLUDED.embedding,
        photo_url = EXCLUDED.photo_url;
END;
$$;

-- 5. RPC: KNN search — returns photos matching a query face vector
-- Uses cosine distance (<=>): 0.0 = identical, 1.0 = orthogonal, 2.0 = opposite
-- Threshold of 0.4 works well for face-api.js 128-d descriptors
DROP FUNCTION IF EXISTS search_face_vectors(TEXT, TEXT, FLOAT, INT);

CREATE OR REPLACE FUNCTION search_face_vectors(
  p_event_code   TEXT,
  p_query_vector TEXT,    -- JSON array string
  p_threshold    FLOAT DEFAULT 0.4,
  p_limit        INT   DEFAULT 100
)
RETURNS TABLE (
  photo_url   TEXT,
  distance    FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_vec vector(128);
BEGIN
  query_vec := p_query_vector::vector;

  RETURN QUERY
  SELECT
    fv.photo_url,
    (fv.embedding <=> query_vec)::FLOAT AS distance
  FROM face_vectors fv
  WHERE
    fv.event_code = p_event_code
    AND (fv.embedding <=> query_vec) <= p_threshold
  ORDER BY fv.embedding <=> query_vec
  LIMIT p_limit;
END;
$$;

-- 6. Storage bucket (run this or create via Dashboard → Storage)
-- Note: You can also create the bucket manually in Supabase Dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('grabpic-photos', 'grabpic-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policy: anyone can read (public CDN)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'grabpic-photos');

-- 8. Storage policy: only authenticated uploads (via presigned URLs from backend)
-- The backend uses the SERVICE KEY which bypasses RLS
DROP POLICY IF EXISTS "Service role upload" ON storage.objects;
CREATE POLICY "Service role upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'grabpic-photos');
