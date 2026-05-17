# ⚡ Electric Resume — AI-Powered Career Engine

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Sentence--BERT-FF9800?style=for-the-badge&logo=huggingface&logoColor=white" alt="Sentence-BERT" />
  <img src="https://img.shields.io/badge/spaCy-09A3D5?style=for-the-badge&logo=spacy&logoColor=white" alt="spaCy" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

> **Ditch the boring black-and-white CVs.** Our intelligent semantic analyzer injects life into your experience, formatting your skills for impact and getting you past the ATS algorithms.

---

## ✨ Core Highlights & Platform Capabilities

### 🔮 1. Semantic Resonance (Keyword Alchemy)
Traditional resume scanners rely on exact keyword matches. Electric Resume utilizes **Sentence-BERT (`all-MiniLM-L6-v2`)** running locally within a high-performance FastAPI pipeline. It calculates dense vector embeddings to measure true semantic alignment between your career narrative and target job descriptions.

### 🚀 2. Action Verb Velocity & NLP Dissection
Powered by **spaCy (`en_core_web_sm`)**, our NLP engine performs advanced part-of-speech tagging and dependency parsing. It isolates weak, passive phrasing (e.g., *"was responsible for"*, *"helped with"*) and dynamic suggests high-voltage action verbs (*Architected, Spearheaded, Scaled, Implemented, Delivered*).

### 📊 3. Bento-Grid Dashboard & Historical Tracking
Your career is a journey, not a static document. Every analysis is securely archived in **Supabase**, offering a rich bento-grid dashboard where professionals can track match score progression, monitor skill gap closure, and generate public shareable report tokens.

### 🎨 4. Vivid Pop SaaS Design System
Engineered on the Next.js 16 App Router and Tailwind CSS, the platform delivers an ultra-premium aesthetic featuring glassmorphism, dynamic score gauges, dark/light contrast modes, and fluid micro-animations powered by **Framer Motion**.

---

## 🔬 Deep-Dive: Custom ML & NLP Pipeline

Electric Resume operates a completely local, 5-stage custom machine learning architecture designed for maximum privacy, speed, and accuracy without relying on external paid LLM APIs:

```
┌────────────────────────────────────────────────────────┐
│               RAW RESUME & JD INGESTION                │
│    (PyMuPDF Threaded Parser / Plain-Text Sanitizer)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              STAGE 1: SKILL TAXONOMY MATCHER           │
│   (Multi-phrase lookup across 300+ curated tech skills)│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              STAGE 2: SPACY NLP DISSECTION             │
│   (Section classification & Action Verb extraction)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              STAGE 3: SBERT SEMANTIC ENGINE            │
│   (High-dimensional Cosine Similarity Embedding Match) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              STAGE 4: COMPOSITE AGGREGATOR             │
│   (Weighted Score: 55% Semantic, 35% Skill, 10% Layout)│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              STAGE 5: DYNAMIC REPORT ENGINE            │
│   (Tailored Section Rewrites & ATS Optimization Tips)  │
└────────────────────────────────────────────────────────┘
```

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

## 💻 Tech Stack Specification

### Frontend (`/frontend`)
* **Core Framework:** Next.js 16.2 (App Router, Turbopack)
* **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide Icons
* **Motion & Animation:** Framer Motion
* **Authentication & Client:** React Context + `@supabase/supabase-js`
* **Data Visualization:** Recharts, Custom SVG Gauges, React Dropzone, Sonner

### Backend (`/backend`)
* **Core Framework:** FastAPI 0.115 + Uvicorn ASGI Server
* **Machine Learning:** Sentence-Transformers (`all-MiniLM-L6-v2`), Scikit-Learn
* **Natural Language Processing:** spaCy (`en_core_web_sm`)
* **Document Extraction:** PyMuPDF (`fitz`) executed in async thread-pool
* **Security & Rate Limiting:** slowapi (in-memory RAM fallback), python-jose

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/hassanmustafakhandev-star/ai-resume-job-analyzer.git
cd ai-resume-job-analyzer
```

### 2. Backend Setup (`/backend`)
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

### 3. Frontend Setup (`/frontend`)
```bash
cd ../frontend
npm install

# Run Next.js dev server (runs on http://localhost:3000)
npm run dev
```

---

## 📜 License
© 2026 The Electric Gallery. All rights reserved. Built for high-performance career advancement.
