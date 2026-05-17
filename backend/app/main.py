"""
Electric Resume — FastAPI Application Entry Point.

Configures middleware, routers, exception handlers, and the lifespan
context manager for startup/shutdown hooks.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.middleware.rate_limit import limiter
from app.models.responses import ErrorResponse, HealthResponse
from app.routers import auth, analyze, history, share

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("electric_resume")


# ── Lifespan ──────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks.

    - Startup: verify Supabase connection, log config summary.
    - Shutdown: clean up connections.
    """
    settings = get_settings()
    logger.info("Starting Electric Resume API [env=%s]", settings.ENVIRONMENT)
    logger.info("CORS origins: %s", settings.allowed_origins_list)

    # Verify Supabase connectivity
    try:
        from app.database import get_supabase_admin
        db = get_supabase_admin()
        db.table("profiles").select("id").limit(1).execute()
        logger.info("Supabase connection verified ✓")
    except Exception as exc:
        logger.error("Supabase connection failed: %s", exc)

    yield

    logger.info("Shutting down Electric Resume API")


# ── App Instance ──────────────────────────────────────────────

app = FastAPI(
    title="Electric Resume API",
    version="1.0.0",
    description=(
        "Production-grade backend for the Electric Resume AI-powered "
        "resume analyzer. Provides resume analysis, history management, "
        "and shareable report links."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Rate Limiter ──────────────────────────────────────────────

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Trusted Hosts ─────────────────────────────────────────────

if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["electricresume.com", "*.electricresume.com", "localhost"],
    )

# ── Request Size Limit Middleware ─────────────────────────────


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Reject request bodies larger than 10MB."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10 * 1024 * 1024:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Request body too large (max 10MB)."},
        )
    return await call_next(request)


# ── Exception Handlers ────────────────────────────────────────


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "The requested resource was not found."},
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """Custom 422 handler — return clear validation errors."""
    errors = exc.errors()
    logger.error("Request validation failed: %s", errors)
    first_error = errors[0] if errors else {}
    field = " → ".join(str(loc) for loc in first_error.get("loc", []))
    msg = first_error.get("msg", "Validation error")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"{field}: {msg}"},
    )



@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Custom 500 handler — never expose internals."""
    logger.exception("Unhandled server error")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


# ── Routers ───────────────────────────────────────────────────

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(analyze.router, prefix=API_PREFIX)
app.include_router(history.router, prefix=API_PREFIX)
app.include_router(share.router, prefix=API_PREFIX)


# ── Health Check ──────────────────────────────────────────────


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns 200 OK if the service is running.",
    tags=["System"],
)
async def health_check() -> HealthResponse:
    """Simple liveness probe — returns OK with no internal details."""
    return HealthResponse(status="ok")
