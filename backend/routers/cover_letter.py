"""Cover Letter API Router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries
from core.cover_letter import generate_cover_letter, format_cover_letter_with_links
from ai.openai_provider import OpenAIProvider

router = APIRouter()

class GenerateCLRequest(BaseModel):
    job_id: int
    tone: str = "professional"

@router.post("/generate")
async def generate_cover_letter_endpoint(request: GenerateCLRequest):
    """Generate cover letter"""
    try:
        job = queries.get_job(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="JD not analyzed yet")
        
        resume = queries.get_latest_resume_source()
        if not resume or not resume.get("parsed"):
            raise HTTPException(status_code=400, detail="Resume not uploaded")
        
        ai_provider = OpenAIProvider()
        cl_text = generate_cover_letter(
            analysis["jd_extract"],
            resume["parsed"],
            ai_provider,
            request.tone
        )
        
        formatted_cl = format_cover_letter_with_links(cl_text, resume["parsed"])
        
        # Save to assets
        assets = queries.get_job_assets(request.job_id) or {}
        versions = assets.get("cover_letter_versions", [])
        versions.append({"text": formatted_cl, "tone": request.tone})
        queries.save_job_assets(request.job_id, cover_letter_versions=versions)
        
        return {"cover_letter": formatted_cl}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

