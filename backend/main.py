"""
FastAPI Backend for PathToOffer AI
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Optional
import os
import sys
from dotenv import load_dotenv

#
# Ensure we load the project-root .env (Windows often runs uvicorn with cwd=backend/,
# which would otherwise miss the root .env and cause OpenAI_API_KEY to be "missing").
#
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, ".env"))

# Initialize database before importing routers
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from storage.db import init_database, ensure_default_profile

# Initialize database
init_database()
ensure_default_profile()

app = FastAPI(title="PathToOffer AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow any localhost port (Next dev may hop ports if 3000 is busy)
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
try:
    from routers import jobs, resume, analysis, cover_letter, practice, exports, settings, demo, roadmap, resume_optimize
except ImportError:
    # Fallback for different import paths
    import sys
    import os
    sys.path.insert(0, os.path.dirname(__file__))
    from routers import jobs, resume, analysis, cover_letter, practice, exports, settings, demo, roadmap, resume_optimize

app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(cover_letter.router, prefix="/api/cover-letter", tags=["cover-letter"])
app.include_router(practice.router, prefix="/api/practice", tags=["practice"])
app.include_router(exports.router, prefix="/api/exports", tags=["exports"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(demo.router, prefix="/api/demo", tags=["demo"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(resume_optimize.router, prefix="/api/resume", tags=["resume-optimize"])

@app.get("/")
async def root():
    return {"message": "PathToOffer AI API", "version": "1.0.0"}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

