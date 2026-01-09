"""Analysis API Router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
import asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries
from storage.db import get_db_connection
from core.jd_parser import extract_jd
from core.resume_parser import parse_resume
from core.evidence_mapper import build_evidence_map
from core.scorer import compute_score_breakdown
from ai.openai_provider import OpenAIProvider
import json

router = APIRouter()

class AnalyzeJDRequest(BaseModel):
    job_id: int
    jd_text: str

@router.post("/jd")
async def analyze_jd(request: AnalyzeJDRequest):
    """Extract structured data from JD"""
    try:
        ai_provider = OpenAIProvider()
        # Run blocking LLM call off the event loop so other endpoints (jobs/demo) stay responsive.
        jd_extract = await asyncio.to_thread(extract_jd, request.jd_text, ai_provider)
        queries.save_job_analysis(request.job_id, jd_extract=jd_extract)
        return {"jd_extract": jd_extract}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScoreRequest(BaseModel):
    job_id: int

@router.post("/score")
async def score_resume(request: ScoreRequest):
    """Compute ATS score"""
    try:
        job_id = request.job_id
        
        # Get job to access JD text
        job = queries.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get or create analysis
        analysis = queries.get_job_analysis(job_id)

        # If we already computed a score, return it (avoids recompute + prevents repeated long calls).
        if analysis and analysis.get("score_breakdown") and analysis.get("evidence_map"):
            return {"score_breakdown": analysis["score_breakdown"], "evidence_map": analysis["evidence_map"]}
        
        # Auto-analyze JD if not analyzed yet (for demo mode)
        if not analysis or not analysis.get("jd_extract"):
            if not job.get("jd_text"):
                raise HTTPException(status_code=400, detail="Job description not found. Please add a job description first.")
            
            try:
                ai_provider = OpenAIProvider()
                jd_extract = await asyncio.to_thread(extract_jd, job["jd_text"], ai_provider)
                queries.save_job_analysis(job_id, jd_extract=jd_extract)
                analysis = queries.get_job_analysis(job_id)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to analyze job description: {str(e)}")
        
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="JD not analyzed yet")
        
        resume = queries.get_latest_resume_source()
        if not resume:
            raise HTTPException(status_code=400, detail="Resume not uploaded")
        
        # Check if resume needs parsing (parsed_json is None or empty, but raw_text exists)
        needs_parsing = False
        if resume.get("parsed_json"):
            # Already has parsed_json, check if it's valid
            try:
                parsed_data = json.loads(resume["parsed_json"])
                if not parsed_data or not isinstance(parsed_data, dict):
                    needs_parsing = True
            except (json.JSONDecodeError, TypeError):
                needs_parsing = True
        elif resume.get("raw_text"):
            # Has raw_text but no parsed_json
            needs_parsing = True
        
        # Auto-parse resume if needed (for demo mode)
        if needs_parsing and resume.get("raw_text"):
            try:
                ai_provider = OpenAIProvider()
                parsed = await asyncio.to_thread(parse_resume, resume["raw_text"], ai_provider)
                # Update the existing resume with parsed data
                resume_id = resume.get("id")
                if resume_id:
                    # Update existing resume
                    with get_db_connection() as conn:
                        cursor = conn.cursor()
                        parsed_json_str = json.dumps(parsed) if parsed else None
                        cursor.execute("""
                            UPDATE resume_sources 
                            SET parsed_json = ? 
                            WHERE id = ?
                        """, (parsed_json_str, resume_id))
                    # Reload resume to get parsed data
                    resume = queries.get_latest_resume_source()
                else:
                    # No ID, save as new
                    queries.save_resume_source(raw_text=resume["raw_text"], parsed_json=parsed)
                    resume = queries.get_latest_resume_source()
            except Exception as e:
                import traceback
                error_detail = f"Failed to parse resume: {str(e)}\n{traceback.format_exc()}"
                print(error_detail)
                raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
        
        # Final check - ensure we have parsed resume data
        if not resume or not resume.get("parsed"):
            raise HTTPException(status_code=400, detail="Resume not uploaded or could not be parsed")
        
        ai_provider = OpenAIProvider()
        evidence_map = await asyncio.to_thread(build_evidence_map, analysis["jd_extract"], resume["parsed"], ai_provider)
        score_breakdown = await asyncio.to_thread(
            compute_score_breakdown,
            analysis["jd_extract"],
            resume["parsed"],
            evidence_map,
            ai_provider
        )
        
        queries.save_job_analysis(job_id, evidence_map=evidence_map, score_breakdown=score_breakdown)
        return {"score_breakdown": score_breakdown, "evidence_map": evidence_map}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to score resume: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"Failed to score resume: {str(e)}")

@router.get("/{job_id}")
async def get_analysis(job_id: int):
    """Get analysis for a job"""
    analysis = queries.get_job_analysis(job_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

