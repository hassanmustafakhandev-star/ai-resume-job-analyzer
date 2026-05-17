# ⚡ Electric Resume — AI-Powered Career Engine

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Sentence--BERT-FF9800?style=for-the-badge&logo=huggingface&logoColor=white" alt="Sentence-BERT" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<br />

> **Ditch the boring black-and-white CVs.** Our intelligent semantic analyzer injects life into your experience, formatting your skills for impact and getting you past the ATS algorithms.

---

## ✨ Core Highlights & Features

### 🔮 1. Semantic Resonance (Keyword Alchemy)
We don't just do simple string matching. Our custom FastAPI backend runs **Sentence-BERT (`all-MiniLM-L6-v2`)** locally to compute high-dimensional cosine similarity between your resume narrative and the target job description.

### 🚀 2. Action Verb Velocity
Our NLP engine (`spaCy`) scans your bullet points to identify weak, passive phrases (e.g., *"was responsible for"*) and dynamically suggests high-impact industry action verbs (*Architected, Spearheaded, Scaled, Delivered*).

### 📊 3. Bento-Grid Dashboard & History
Track your career trajectory over time. Every analysis is securely saved to **Supabase**, allowing you to revisit past matches, view missing skill gaps, and generate public shareable report links.

### 🎨 4. Vivid Pop Design System
Built on Next.js 16 App Router and Tailwind CSS, featuring rich dark/light modes, glassmorphic panels, and smooth micro-animations powered by **Framer Motion**.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                 NEXT.JS 16 FRONTEND                    │
│   (App Router, Tailwind CSS, Framer Motion, Dropzone)  │
└───────────────────────────┬────────────────────────────┘
                            │
              REST API / Bearer Token (JWT)
                            │
┌───────────────────────────▼────────────────────────────┐
│                  FASTAPI 0.115 BACKEND                 │
│                                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────┐  │
│  │ PyMuPDF (fitz)  │ │ spaCy & SBERT   │ │ slowapi  │  │
│  │ Threaded Parser │ │ Semantic Engine │ │ Limiter  │  │
│  └─────────────────┘ └─────────────────┘ └──────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
                 Supabase Client / Admin
                            │
┌───────────────────────────▼────────────────────────────┐
│                   SUPABASE ECOSYSTEM                   │
│   (PostgreSQL, Row Level Security, Auth / JWT JWKS)    │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend (`/frontend`)
* **Framework:** Next.js 16.2 (App Router)
* **Styling:** Tailwind CSS + Radix UI
* **Animations:** Framer Motion
* **State & Auth:** React Context + Supabase Auth (`@supabase/supabase-js`)
* **Charts & UI:** Recharts, React Dropzone, Sonner Toasts

### Backend (`/backend`)
* **Framework:** FastAPI 0.115 + Uvicorn
* **ML & NLP:** Sentence-Transformers (SBERT), spaCy (`en_core_web_sm`), Scikit-Learn
* **PDF Extraction:** PyMuPDF (`fitz`) executed in async thread-pool
* **Security & Rate Limiting:** slowapi (in-memory RAM fallback), python-jose
* **Database:** Supabase REST & Python Client

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/hassanmustafakhandev-star/ai-resume-job-analyzer.git
cd ai-resume-job-analyzer
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Run Next.js dev server (runs on http://localhost:3000)
npm run dev
```

---

## 🌐 Vercel Deployment Guide

This monorepo is fully configured for Vercel deployment. You will create **2 Vercel Projects** from this single repository:

### 1. Deploy Backend (FastAPI)
1. Import repo in Vercel. Name it `electric-resume-backend`.
2. Set **Root Directory** to `backend`.
3. Add your Supabase environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `ENVIRONMENT=prod`).
4. Click **Deploy**. (Vercel uses the included `backend/vercel.json` to deploy FastAPI as serverless functions).

### 2. Deploy Frontend (Next.js)
1. Import repo again in Vercel. Name it `electric-resume`.
2. Set **Root Directory** to `frontend`.
3. Add your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Set `NEXT_PUBLIC_API_URL` to the live backend URL from Step 1 (e.g., `https://electric-resume-backend.vercel.app/api/v1`).
5. Click **Deploy**.

---

## 📜 License
© 2026 The Electric Gallery. All rights reserved. Built for high-performance career advancement.
