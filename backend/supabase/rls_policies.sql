-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES policies:
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Profiles are created automatically via trigger on auth.users insert
-- No user can delete their profile directly (no DELETE policy provided)

-- ANALYSES policies:
-- SELECT: user can read own analyses OR analyses where is_public=true AND share_expires_at > now()
CREATE POLICY "Users can read own or shared analyses"
    ON public.analyses
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR (is_public = true AND share_expires_at > NOW())
    );

-- INSERT: user can only insert with their own user_id (enforce via auth.uid())
CREATE POLICY "Users can insert own analyses"
    ON public.analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: user can only update their own analyses
CREATE POLICY "Users can update own analyses"
    ON public.analyses
    FOR UPDATE
    USING (auth.uid() = user_id);

-- DELETE: user can only delete their own analyses
CREATE POLICY "Users can delete own analyses"
    ON public.analyses
    FOR DELETE
    USING (auth.uid() = user_id);

-- RATE_LIMIT_LOG policies:
-- Only backend service role should interact with this typically, 
-- but if we allow users to read their own logs:
CREATE POLICY "Users can read own rate limit logs"
    ON public.rate_limit_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- SERVICE ROLE bypass:
-- Backend uses service_role key for admin operations only.
-- Service role bypasses RLS by default in Supabase.
-- Endpoints using anon key + JWT will be subject to these policies.
