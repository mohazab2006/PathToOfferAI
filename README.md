# PathToOffer AI

**Local web app** that uses AI to align your resume and interview prep with a specific job posting—so you see gaps, scores, and exports before you apply.

---

## What it’s for

Job seekers paste a real job description, upload a resume, and get structured feedback (match score, missing keywords, tailored copy, practice questions). Everything runs on your machine with your own OpenAI key.

---

## What you can do

| Area | Capability |
|------|------------|
| **Job** | Paste a JD; extract skills, keywords, and requirements |
| **Resume** | Upload PDF/text; parse, score vs job, see gaps |
| **Optimization** | Generate a resume version tuned to the posting |
| **Cover letter** | Draft tailored to that role |
| **Prep** | Interview questions with feedback; coding problems with review |
| **Learning** | Study roadmap when you’re missing skills |
| **Export** | Download resume, cover letter, interview pack, or a ZIP bundle |

**Try without your data:** use **Start demo** on the home page.

---

## Tools used

| Layer | Tech |
|--------|------|
| **UI** | Next.js, React, TypeScript, Tailwind CSS |
| **API** | Python, FastAPI, Uvicorn |
| **AI** | OpenAI API (configurable model; see `ai/openai_provider.py`) |
| **Data** | SQLite, SQLAlchemy |
| **Files** | PDF parsing (e.g. pypdf), PDF generation (ReportLab) |

---

## How to use

**Prerequisites:** Python 3.11+, Node.js 18+, an [OpenAI API key](https://platform.openai.com/).

1. **Clone the repo** and open a terminal at the project root.

2. **Environment** — create `.env` in the **project root** (same folder as this README):

   ```env
   OPENAI_API_KEY=sk-...
   ```

   See `.env.example` for optional variables.

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt -r backend/requirements.txt
   cd frontend && npm install && cd ..
   ```

4. **Run** — two terminals:

   ```bash
   # Terminal 1 — API
   cd backend
   python -m uvicorn main:app --reload
   ```

   ```bash
   # Terminal 2 — UI
   cd frontend
   npm run dev
   ```

5. Open **http://localhost:3000** in the browser.

**Data on disk:** `path_to_offer.db` (database), `uploads/` (resumes), `exports/` (generated PDFs)—all under the project root.
