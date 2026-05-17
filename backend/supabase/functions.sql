-- Supabase Edge Functions (SQL)
-- These are optional server-side functions that can be called via Supabase RPC.

-- ── Get user stats ──────────────────────────────────────────
-- Returns aggregate stats for a user's analyses dashboard.
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_analyses', COUNT(*),
        'average_score', COALESCE(ROUND(AVG(score)), 0),
        'highest_score', COALESCE(MAX(score), 0),
        'lowest_score', COALESCE(MIN(score), 0),
        'analyses_this_month', COUNT(*) FILTER (
            WHERE created_at >= date_trunc('month', NOW())
        )
    ) INTO result
    FROM public.analyses
    WHERE user_id = target_user_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Clean expired share links ───────────────────────────────
-- Run periodically via Supabase cron or pg_cron to revoke expired shares.
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
    affected INTEGER;
BEGIN
    UPDATE public.analyses
    SET is_public = false,
        share_token = NULL,
        share_expires_at = NULL
    WHERE is_public = true
      AND share_expires_at < NOW();

    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Decrement analyses_count on delete ──────────────────────
CREATE OR REPLACE FUNCTION decrement_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET analyses_count = GREATEST(analyses_count - 1, 0)
    WHERE id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_analysis_deleted
    AFTER DELETE ON public.analyses
    FOR EACH ROW
    EXECUTE FUNCTION decrement_analyses_count();
