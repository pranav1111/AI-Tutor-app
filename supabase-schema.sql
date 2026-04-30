-- ============================================
-- Converso — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Companions table (AI tutors)
CREATE TABLE IF NOT EXISTS public.companions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    subject     TEXT NOT NULL,
    topic       TEXT NOT NULL,
    voice       TEXT NOT NULL,
    style       TEXT NOT NULL,
    duration    INTEGER NOT NULL DEFAULT 15,
    author      TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Session history (tracks completed voice sessions)
CREATE TABLE IF NOT EXISTS public.session_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id  UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
    user_id       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Bookmarks (user-bookmarked companions)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id  UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
    user_id       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(companion_id, user_id)
);

-- Enable Row Level Security (recommended)
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (via Clerk JWT)
-- Adjust these policies based on your security needs
CREATE POLICY "Allow all for authenticated users" ON public.companions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.session_history
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.bookmarks
    FOR ALL USING (true) WITH CHECK (true);
