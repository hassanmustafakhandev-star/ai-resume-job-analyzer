# ⚡ Electric Resume — Backend API

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

Production-grade FastAPI backend for the Electric Resume AI-powered resume analyzer. Compares resumes against job descriptions using LLM analysis, provides match scores, skill gap analysis, and actionable improvement suggestions.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI (async) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT |
| AI | OpenAI GPT-4o-mini |
| Cache / Rate Limit | Redis + slowapi |
| PDF Parsing | PyMuPDF |
| Web Scraping | httpx + BeautifulSoup4 |
| Containerization | Docker + Docker Compose |

---

## 📋 Prerequisites

- **Python 3.12+**
- **Redis** (for rate limiting — Docker Compose handles this)
- **Supabase account** ([supabase.com](https://supabase.com))
- **OpenAI API key** ([platform.openai.com](https://platform.openai.com))

---

## 🚀 Local Setup

### 1. Clone & Navigate

```bash
git clone <your-repo-url>
cd AI-Resume-Job-Analyzer/backend
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual keys
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run the SQL files in order in the Supabase SQL Editor:
   - `supabase/schema.sql` — tables, indexes, triggers
   - `supabase/rls_policies.sql` — row-level security
   - `supabase/functions.sql` — server-side functions
   - `supabase/seed.sql` — (optional) dev seed data

### 4. Run with Docker Compose (Recommended)

```bash
docker-compose up --build
```

This starts both Redis and the API with hot-reload enabled.

### 5. Or Run Manually

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

> Make sure Redis is running locally on port 6379.

### 6. Verify

```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

---

## 🔑 Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://abc.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJ...` |
| `OPENAI_API_KEY` | ✅ | OpenAI API key | `sk-...` |
| `REDIS_URL` | ❌ | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | ✅ | Supabase JWT secret | `your-jwt-secret` |
| `ENVIRONMENT` | ❌ | `dev` or `prod` | `dev` |
| `MAX_PDF_SIZE_MB` | ❌ | Max upload size in MB | `5` |
| `ALLOWED_ORIGINS` | ❌ | CORS origins (comma-sep) | `http://localhost:3000` |

---

## 📖 API Documentation

Once running, visit:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ❌ | Health check |
| `GET` | `/api/v1/auth/me` | ✅ | Current user profile |
| `POST` | `/api/v1/analyze` | ✅ | Analyze resume (saves to history) |
| `POST` | `/api/v1/analyze/guest` | ❌ | Guest analysis (3/day limit) |
| `GET` | `/api/v1/history` | ✅ | List analysis history |
| `GET` | `/api/v1/history/{id}` | ✅ | Get single analysis |
| `DELETE` | `/api/v1/history/{id}` | ✅ | Delete analysis |
| `POST` | `/api/v1/share/{id}` | ✅ | Create share link |
| `GET` | `/api/v1/share/view/{token}` | ❌ | View shared analysis |

---

## 🧪 Testing

```bash
pytest tests/ -v
```

Tests use mocked Supabase and AI responses — no external services required.

---

## 🚢 Deployment (Railway)

1. Push to GitHub
2. Create a new Railway project → link your repo
3. Set the root directory to `backend/`
4. Add all environment variables from the table above
5. Railway will auto-detect the Dockerfile and deploy
6. Add a Redis instance via Railway's plugin marketplace
7. Update `REDIS_URL` to the Railway-provided Redis URL
8. Update `ALLOWED_ORIGINS` to your Vercel frontend URL

---

## 🔒 Security Notes

- **CORS**: Strict allowlist — no wildcards in production
- **RLS**: All Supabase tables have Row Level Security enabled
- **IDOR Prevention**: Every resource access verifies user ownership
- **Rate Limiting**: Per-user and per-IP limits on all endpoints
- **Input Validation**: All inputs validated via Pydantic with length/type constraints
- **No PII Storage**: Raw resume text is never stored in the database
- **Share Links**: Cryptographically secure tokens with 7-day expiry
- **Service Role**: Supabase service key used only server-side, never exposed
- **Request Size**: 10MB body limit enforced at middleware level
- **Non-root Docker**: Container runs as unprivileged user

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `pytest tests/ -v`
5. Lint with ruff: `ruff check app/`
6. Submit a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
