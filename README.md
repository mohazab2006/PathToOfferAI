# PathToOffer AI

A job application tool that helps you tailor your resume, prep for interviews, and stop guessing if your application is any good.

## The Problem

You apply to jobs, hear nothing back, and have no idea why. Is it your resume? The ATS? Bad luck? This tool gives you actual feedback instead of just hoping for the best.

## What You Can Do

- Paste a job description and pull out the important stuff (skills, keywords, requirements)
- Score your resume against the job and see where you're falling short
- Generate an optimized resume version that includes missing keywords
- Create cover letters that actually reference the specific role
- Get a study plan if you need to learn something before the interview
- Practice interview questions with AI feedback
- Export everything as PDFs when you're ready to apply

## Setup

You'll need Python 3.11+ and Node.js 18+.

```bash
# Backend
cd backend
pip install -r requirements.txt

# Create backend/.env with your OpenAI key:
# OPENAI_API_KEY=sk-...

# Frontend  
cd frontend
npm install
```

## Running It

Two terminals:

```bash
# Terminal 1
cd backend
python -m uvicorn main:app --reload

# Terminal 2
cd frontend
npm run dev
```

Then go to http://localhost:3000

## Demo Mode

Hit "Load Demo" on the home page if you just want to poke around without uploading your own stuff.

## How the AI Works

Uses GPT-4o under the hood. Here's what it handles:

- **JD parsing** — extracts skills, keywords, requirements from job posts
- **Resume parsing** — pulls structured data from your PDF/text resume
- **Scoring** — compares resume vs JD, returns a 0-100 match score
- **Optimization** — rewrites resume sections to include missing keywords
- **Cover letters** — generates one tailored to the specific job
- **Roadmaps** — builds a study plan if you're missing skills
- **Interview Qs** — generates questions + scores your answers
- **Code review** — reviews submitted code for problems

All calls go through `backend/ai/openai_provider.py`. Results get cached so you're not waiting twice.

## Stack

- Next.js + Tailwind for the frontend
- FastAPI for the backend
- OpenAI GPT-4o for the AI features
- SQLite so you don't need to set up a database
- ReportLab for PDF generation

## Structure

```
backend/
  routers/     # API routes
  ai/          # OpenAI calls
  core/        # Scoring logic, roadmap builder, etc.
  storage/     # DB queries and file handling

frontend/
  app/         # Pages and components
  lib/         # API client
```

## Notes

SQLite database lives at `path_to_offer.db` in the root. Uploaded resumes go in `uploads/`, exported PDFs in `exports/`.

The AI stuff can be slow on first run since it's hitting GPT-4o. Subsequent loads are faster because results get cached.

## Future Plans

Right now it runs locally. Eventually I want to deploy it properly:

- Dockerize both frontend and backend for easier deployment
- Backend on Railway or Render (FastAPI plays nice with both)
- Frontend on Vercel
- Swap SQLite for Postgres
- Add user auth so multiple people can use it

Not there yet, but the architecture is set up to make that switch pretty straightforward.

ant---

Built because job hunting is tedious and I wanted something to make it less painful.

