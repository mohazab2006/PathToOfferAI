"""Roadmap API Router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries
from storage.db import get_db_connection
from ai.openai_provider import OpenAIProvider
from core.roadmap_builder import generate_roadmap
from core.resume_parser import parse_resume

router = APIRouter()

DEMO_RESUME_FILE_PATH = "__demo_resume__"


class RoadmapGenerateRequest(BaseModel):
    job_id: int
    timeline_weeks: int = 4


@router.get("/{job_id}")
async def get_roadmap(job_id: int):
    """Get saved roadmap for a job (if any)."""
    assets = queries.get_job_assets(job_id)
    return {"roadmap": assets.get("roadmap") if assets else None}


@router.post("/generate")
async def generate_roadmap_endpoint(request: RoadmapGenerateRequest):
    """Generate and save roadmap for a job."""
    try:
        job = queries.get_job(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="Analyze the job description first.")

        # Pick resume source: demo jobs use sticky demo resume; otherwise latest resume.
        is_demo = (job.get("tags") and "demo" in job.get("tags", [])) or ("[Demo]" in str(job.get("title", "")))
        resume = queries.get_resume_source_by_file_path(DEMO_RESUME_FILE_PATH) if is_demo else queries.get_latest_resume_source()
        if not resume:
            raise HTTPException(status_code=400, detail="Resume not found")

        # Ensure parsed
        if not resume.get("parsed"):
            raw_text = resume.get("raw_text") or ""
            if not raw_text.strip():
                raise HTTPException(status_code=400, detail="Resume text missing")
            ai_provider = OpenAIProvider()
            parsed = await asyncio.to_thread(parse_resume, raw_text, ai_provider)
            # Persist parsed_json back to the same resume row if possible
            rid = resume.get("id")
            if rid:
                with get_db_connection() as conn:
                    cursor = conn.cursor()
                    import json as _json
                    cursor.execute("UPDATE resume_sources SET parsed_json = ? WHERE id = ?", (_json.dumps(parsed), rid))
            resume = queries.get_resume_source_by_file_path(DEMO_RESUME_FILE_PATH) if is_demo else queries.get_latest_resume_source()

        ai_provider = OpenAIProvider()
        roadmap = await asyncio.to_thread(generate_roadmap, analysis["jd_extract"], resume["parsed"], ai_provider, request.timeline_weeks)

        # Save into job_assets
        assets = queries.get_job_assets(request.job_id) or {}
        queries.save_job_assets(request.job_id, roadmap=roadmap)
        return {"roadmap": roadmap}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


