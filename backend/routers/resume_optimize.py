"""Resume Optimization API Router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
import asyncio
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries
from storage.db import get_db_connection
from ai.openai_provider import OpenAIProvider
from core.resume_parser import parse_resume

router = APIRouter()

DEMO_RESUME_FILE_PATH = "__demo_resume__"


class OptimizeRequest(BaseModel):
    job_id: int
    label: str | None = None


@router.get("/versions/{job_id}")
async def get_versions(job_id: int):
    assets = queries.get_job_assets(job_id)
    return {"resume_versions": assets.get("resume_versions", []) if assets else []}


@router.post("/optimize")
async def optimize_resume(request: OptimizeRequest):
    try:
        job = queries.get_job(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="Analyze the job description first.")

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
            rid = resume.get("id")
            if rid:
                with get_db_connection() as conn:
                    cursor = conn.cursor()
                    import json as _json
                    cursor.execute("UPDATE resume_sources SET parsed_json = ? WHERE id = ?", (_json.dumps(parsed), rid))
            resume = queries.get_resume_source_by_file_path(DEMO_RESUME_FILE_PATH) if is_demo else queries.get_latest_resume_source()

        ai_provider = OpenAIProvider()
        optimized = await asyncio.to_thread(
            ai_provider.optimize_resume_parse,
            analysis["jd_extract"],
            resume["parsed"],
            analysis.get("score_breakdown"),
            analysis.get("evidence_map"),
        )

        # Append version
        assets = queries.get_job_assets(request.job_id) or {}
        versions = assets.get("resume_versions", []) or []
        versions.append(
            {
                "created_at": datetime.utcnow().isoformat() + "Z",
                "label": request.label or "Optimized",
                "source": "ai",
                "parsed": optimized,
            }
        )
        queries.save_job_assets(request.job_id, resume_versions=versions)
        return {"resume_versions": versions, "latest": versions[-1]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



