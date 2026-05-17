"""
Supabase client singletons.

Provides two clients:
- `supabase_client`: Uses the anon key — subject to RLS policies.
- `supabase_admin`:  Uses the service-role key — bypasses RLS for admin ops.

Both are created lazily and cached for the lifetime of the process.
"""

from functools import lru_cache

from supabase import create_client, Client

from app.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """Return a Supabase client using the anon key (RLS-enforced)."""
    settings = get_settings()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


@lru_cache()
def get_supabase_admin() -> Client:
    """Return a Supabase client using the service-role key (RLS-bypassed).

    ⚠️  Only use this for server-side admin operations that explicitly
    need to bypass Row Level Security — e.g. creating profiles on signup,
    reading shared analyses without a user context, or analytics queries.
    """
    settings = get_settings()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
