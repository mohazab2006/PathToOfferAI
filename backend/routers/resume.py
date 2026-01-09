"""Resume API Router"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, Response
from typing import Optional
import asyncio
import sys
import os
import html
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries, files
from storage.db import get_db_connection
from core.resume_parser import parse_resume, extract_text_from_pdf
from core.schemas import ResumeParse
from ai.openai_provider import OpenAIProvider
from pydantic import BaseModel
from copy import deepcopy

router = APIRouter()

DEMO_RESUME_FILE_PATH = "__demo_resume__"
OPTIMIZED_LABEL = "Optimized"

def _render_text_resume_html(title: str, text: str) -> str:
    safe = html.escape(text or "")
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{html.escape(title)}</title>
    <style>
      :root {{
        color-scheme: light;
      }}
      body {{
        margin: 0;
        background: #f6f7fb;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: #0f172a;
      }}
      .wrap {{
        max-width: 980px;
        margin: 32px auto;
        padding: 0 16px;
      }}
      .card {{
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        overflow: hidden;
      }}
      .head {{
        padding: 16px 18px;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(180deg, #ffffff, #fafafa);
        font-weight: 700;
      }}
      pre {{
        margin: 0;
        padding: 18px;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;
        font-size: 13px;
        line-height: 1.55;
      }}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="head">{html.escape(title)}</div>
        <pre>{safe}</pre>
      </div>
    </div>
  </body>
</html>"""

def _add_missing_skills_to_parsed_resume(resume_parsed: dict, missing_skills: list[str]) -> dict:
    """Heuristic: add missing skills to parsed resume skills.tools (and avoid duplicates)."""
    updated = deepcopy(resume_parsed or {})
    skills = updated.get("skills") or {}
    if not isinstance(skills, dict):
        skills = {}
    tools = skills.get("tools") or []
    if not isinstance(tools, list):
        tools = []
    existing = {str(t).strip().lower() for t in tools if str(t).strip()}
    for s in missing_skills:
        key = str(s).strip()
        if not key:
            continue
        if key.lower() not in existing:
            tools.append(key)
            existing.add(key.lower())
    skills["tools"] = tools
    updated["skills"] = skills
    return updated

class OptimizeResumeRequest(BaseModel):
    job_id: int

class SaveResumeVersionRequest(BaseModel):
    job_id: int
    label: str = OPTIMIZED_LABEL
    parsed: dict

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse resume"""
    try:
        # Save file
        file_path = files.save_uploaded_file(file, file.filename)
        
        # Extract text
        if file.filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(file_path)
        else:
            with open(file_path, 'r') as f:
                resume_text = f.read()
        
        # Parse with AI
        ai_provider = OpenAIProvider()
        # Run blocking LLM call off the event loop so other endpoints stay responsive.
        parsed = await asyncio.to_thread(parse_resume, resume_text, ai_provider)
        
        # Save to database (with both file_path and raw_text)
        resume_id = queries.save_resume_source(
            file_path=file_path, 
            raw_text=resume_text,
            parsed_json=parsed
        )
        
        return {"id": resume_id, "parsed": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_resume():
    """Get latest resume"""
    resume = queries.get_latest_resume_source()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    return resume

@router.get("/demo")
async def get_demo_resume():
    """Get demo resume (sticky)"""
    resume = queries.get_resume_source_by_file_path(DEMO_RESUME_FILE_PATH)
    if not resume:
        raise HTTPException(status_code=404, detail="No demo resume found")
    return resume

@router.get("/view")
async def view_resume():
    """View the uploaded resume file (PDF or text)"""
    resume = queries.get_latest_resume_source()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    
    file_path = resume.get("file_path")
    raw_text = resume.get("raw_text")
    
    # If we have a file path, serve the file
    if file_path and os.path.exists(file_path):
        if file_path.endswith('.pdf'):
            filename = os.path.basename(file_path)
            return FileResponse(
                file_path,
                media_type='application/pdf',
                filename=filename,
                headers={"Content-Disposition": f'inline; filename="{filename}"'}
            )
        else:
            # Text file - return styled HTML so it doesn't look like a "black screen"
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return Response(content=_render_text_resume_html("Resume (Text)", content), media_type='text/html')
    
    # If no file path but we have raw text, return that
    if raw_text:
        return Response(content=_render_text_resume_html("Resume (Text)", raw_text), media_type='text/html')
    
    raise HTTPException(status_code=404, detail="Resume file not found")

@router.get("/view-demo")
async def view_demo_resume():
    """View the demo resume (text)"""
    resume = queries.get_resume_source_by_file_path(DEMO_RESUME_FILE_PATH)
    if not resume:
        raise HTTPException(status_code=404, detail="No demo resume found")
    raw_text = resume.get("raw_text") or ""
    return Response(
        content=_render_text_resume_html("Demo Resume (Updated)", raw_text),
        media_type='text/html',
        headers={"X-Resume-Server": "with-optimize-endpoints"}
    )

@router.post("/clear")
async def clear_resumes():
    """Clear all resumes (user reset)"""
    try:
        # Only clears resume sources (does not touch jobs)
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM resume_sources")
            deleted = cursor.rowcount
        return {"deleted": deleted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/versions/{job_id}")
async def get_resume_versions(job_id: int):
    """Get resume versions saved for a job."""
    assets = queries.get_job_assets(job_id)
    return {"resume_versions": (assets.get("resume_versions") if assets else []) or []}

@router.post("/versions")
async def save_resume_version(request: SaveResumeVersionRequest):
    """Save a resume version for a job (client/server generated)."""
    try:
        assets = queries.get_job_assets(request.job_id) or {}
        versions = assets.get("resume_versions") or []
        if not isinstance(versions, list):
            versions = []
        versions.append({
            "label": request.label,
            "created_at": None,  # optional; db updated_at exists, UI can show label only
            "parsed": request.parsed,
        })
        queries.save_job_assets(request.job_id, resume_versions=versions)
        return {"resume_versions": versions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize")
async def optimize_resume(request: OptimizeResumeRequest):
    """
    Create an optimized resume version for a job, based on current analysis.
    This does NOT overwrite the uploaded resume; it saves a new version under job_assets.resume_versions.
    """
    try:
        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("evidence_map") or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="Analyze and score this job first to generate fixes.")

        # Ensure we have a parsed resume (demo or uploaded)
        resume = queries.get_latest_resume_source()
        if not resume:
            raise HTTPException(status_code=400, detail="Resume not uploaded")

        if not resume.get("parsed") and resume.get("raw_text"):
            ai_provider = OpenAIProvider()
            parsed = await asyncio.to_thread(parse_resume, resume["raw_text"], ai_provider)
            # Save a new row so latest has parsed data; simplest approach for now
            queries.save_resume_source(file_path=resume.get("file_path"), raw_text=resume.get("raw_text"), parsed_json=parsed)
            resume = queries.get_latest_resume_source()

        if not resume or not resume.get("parsed"):
            raise HTTPException(status_code=400, detail="Resume could not be parsed")

        missing = (analysis.get("evidence_map") or {}).get("missing") or []
        if not isinstance(missing, list):
            missing = []

        optimized_parsed = _add_missing_skills_to_parsed_resume(resume["parsed"], missing)

        assets = queries.get_job_assets(request.job_id) or {}
        versions = assets.get("resume_versions") or []
        if not isinstance(versions, list):
            versions = []
        versions.append({
            "label": OPTIMIZED_LABEL,
            "missing_added": missing,
            "parsed": optimized_parsed,
        })
        queries.save_job_assets(request.job_id, resume_versions=versions)

        return {"message": "Optimized resume version saved", "resume_versions": versions}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

