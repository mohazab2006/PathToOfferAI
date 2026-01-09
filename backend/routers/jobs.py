"""
Jobs API Router
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    company: Optional[str] = None
    link: Optional[str] = None
    jd_text: Optional[str] = None
    status: str = "Saved"
    tags: Optional[List[str]] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    link: Optional[str] = None
    jd_text: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

@router.get("")
async def get_jobs():
    """Get all jobs"""
    try:
        jobs = queries.get_all_jobs()
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}")
async def get_job(job_id: int):
    """Get a specific job"""
    try:
        job = queries.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_job(job: JobCreate):
    """Create a new job"""
    try:
        job_id = queries.create_job(
            title=job.title,
            company=job.company,
            link=job.link,
            jd_text=job.jd_text,
            status=job.status,
            tags=job.tags
        )
        return {"id": job_id, "message": "Job created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{job_id}")
async def update_job(job_id: int, job: JobUpdate):
    """Update a job"""
    try:
        update_data = job.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        success = queries.update_job(job_id, **update_data)
        if not success:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"message": "Job updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{job_id}")
async def delete_job(job_id: int):
    """Delete a job"""
    try:
        success = queries.delete_job(job_id)
        if not success:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

