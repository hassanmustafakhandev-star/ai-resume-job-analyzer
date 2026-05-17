-- Supabase Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    analyses_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    job_title TEXT,
    company_name TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    matched_skills TEXT[],
    missing_skills TEXT[],
    suggestions JSONB, -- { summary: {issue, improvement}, experience: {issue, improvement}, skills: {issue, improvement} }
    rewrite_preview TEXT,
    jd_snippet TEXT, -- first 300 chars of JD for display only
    share_token TEXT UNIQUE,
    share_expires_at TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limit log table (optional, for tracking abuse)
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    endpoint TEXT,
    request_count INTEGER,
    window_start TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON public.analyses(created_at);
CREATE INDEX IF NOT EXISTS analyses_share_token_idx ON public.analyses(share_token);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_analyses_modtime
    BEFORE UPDATE ON public.analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to increment analyses_count
CREATE OR REPLACE FUNCTION increment_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET analyses_count = analyses_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_analysis_created
    AFTER INSERT ON public.analyses
    FOR EACH ROW
    EXECUTE FUNCTION increment_analyses_count();
