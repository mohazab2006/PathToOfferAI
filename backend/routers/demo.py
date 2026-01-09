"""Demo API Router"""
from fastapi import APIRouter, HTTPException
import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries
from storage.db import init_database, ensure_default_profile
from ai.openai_provider import OpenAIProvider
from core.resume_parser import parse_resume
from core.jd_parser import extract_jd

router = APIRouter()

DEMO_RESUME_FILE_PATH = "__demo_resume__"

@router.post("/load")
async def load_demo():
    """Load demo data into database"""
    try:
        # Initialize database if needed
        init_database()
        ensure_default_profile()
        
        # Get project root (backend/routers/demo.py -> backend/ -> project root)
        current_file = os.path.abspath(__file__)
        backend_dir = os.path.dirname(os.path.dirname(current_file))  # Go up from routers/ to backend/
        project_root = os.path.dirname(backend_dir)  # Go up from backend/ to project root
        demo_dir = os.path.join(project_root, "demo")
        
        # Verify demo directory exists
        if not os.path.exists(demo_dir):
            raise HTTPException(status_code=404, detail=f"Demo directory not found: {demo_dir}")
        
        # Load demo profile
        try:
            profile_path = os.path.join(demo_dir, "profile.json")
            if os.path.exists(profile_path):
                with open(profile_path, "r", encoding="utf-8") as f:
                    profile = json.load(f)
                    queries.update_user_profile(**profile)
        except Exception as e:
            print(f"Warning: Failed to load profile: {e}")
            # Continue even if profile fails
        
        # Load demo job
        jd_path = os.path.join(demo_dir, "job_description.txt")
        if not os.path.exists(jd_path):
            raise HTTPException(status_code=404, detail=f"Demo job description not found: {jd_path}")
        
        with open(jd_path, "r", encoding="utf-8") as f:
            jd_text = f.read()
        
        # Find existing demo jobs (look for job with "demo" tag or specific title)
        existing_jobs = queries.get_all_jobs()
        demo_job = None
        demo_job_ids_to_delete = []
        
        for job in existing_jobs:
            # Check by tags or by title pattern
            is_demo = (job.get("tags") and "demo" in job.get("tags", [])) or \
                     (job.get("title") and "[Demo]" in str(job.get("title", "")))
            
            if is_demo:
                if demo_job is None:
                    # Keep the first (most recent) demo job
                    demo_job = job
                else:
                    # Mark other demo jobs for deletion
                    demo_job_ids_to_delete.append(job["id"])
        
        # Delete duplicate demo jobs
        for old_job_id in demo_job_ids_to_delete:
            try:
                queries.delete_job(old_job_id)
                print(f"Deleted duplicate demo job {old_job_id}")
            except Exception as e:
                print(f"Warning: Failed to delete duplicate demo job {old_job_id}: {e}")
        
        if demo_job:
            # Use existing demo job
            job_id = demo_job["id"]
            # Update it to make sure it has the latest demo data
            queries.update_job(job_id, jd_text=jd_text)
        else:
            # Create new demo job with "demo" tag
            try:
                job_id = queries.create_job(
                    title="Software Engineer Intern [Demo]",
                    company="TechCorp",
                    link="https://example.com/job",
                    jd_text=jd_text,
                    status="Saved",
                    tags=["demo"]
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")
        
        # Load demo resume (sticky upsert so it never "randomly disappears")
        try:
            resume_path = os.path.join(demo_dir, "resume.txt")
            if os.path.exists(resume_path):
                with open(resume_path, "r", encoding="utf-8") as f:
                    resume_text = f.read()
                
                # Save raw text only - parsing happens automatically when user clicks "Calculate Score"
                # Use a sentinel file_path so the demo resume can be fetched reliably even if user uploads their own resume.
                queries.upsert_resume_source_by_file_path(
                    file_path=DEMO_RESUME_FILE_PATH,
                    raw_text=resume_text,
                    parsed_json=None
                )
        except Exception as e:
            print(f"Warning: Failed to load resume: {e}")
            # Continue even if resume fails
        
        # Return immediately - no AI calls, just data loading
        # Resume parsing and JD analysis happen when user clicks "Analyze JD" or "Calculate Score"
        
        return {"job_id": job_id, "message": "Demo data loaded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = str(e)
        # Log full traceback to console for debugging
        print(f"Demo load error: {error_msg}")
        print(traceback.format_exc())
        # Return shorter error message to client
        raise HTTPException(status_code=500, detail=f"Failed to load demo: {error_msg}")

@router.post("/reset")
async def reset_demo():
    """Delete demo job(s) and demo resume so user can start fresh."""
    try:
        # Delete demo jobs
        jobs = queries.get_all_jobs()
        demo_ids = []
        for job in jobs:
            is_demo = (job.get("tags") and "demo" in job.get("tags", [])) or \
                     (job.get("title") and "[Demo]" in str(job.get("title", "")))
            if is_demo:
                demo_ids.append(job["id"])
        deleted_jobs = 0
        for jid in demo_ids:
            if queries.delete_job(jid):
                deleted_jobs += 1

        # Delete sticky demo resume
        deleted_resumes = queries.delete_resume_sources_by_file_path(DEMO_RESUME_FILE_PATH)

        return {"deleted_jobs": deleted_jobs, "deleted_demo_resumes": deleted_resumes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

