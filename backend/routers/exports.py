"""Exports API Router"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries, files
from exporters.pdf_resume import export_resume_pdf
from exporters.pdf_cover_letter import export_cover_letter_pdf
from exporters.pdf_interview_pack import export_interview_pack_pdf
from exporters.packager import create_application_pack

router = APIRouter()

@router.get("/resume/{job_id}")
async def export_resume(job_id: int):
    """Export resume as PDF"""
    try:
        job = queries.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Prefer an optimized resume version if it exists for this job
        assets = queries.get_job_assets(job_id)
        resume_parse = None
        if assets and assets.get("resume_versions"):
            latest_version = assets["resume_versions"][-1]
            resume_parse = latest_version.get("parsed")

        # Fallback to latest uploaded/demo resume
        if not resume_parse:
            resume = queries.get_latest_resume_source()
            if not resume or not resume.get("parsed"):
                raise HTTPException(status_code=400, detail="Resume not uploaded")
            resume_parse = resume["parsed"]
        
        output_path = files.get_export_path(f"resume_{job_id}.pdf")
        export_resume_pdf(resume_parse, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=f"resume_{job_id}.pdf"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cover-letter/{job_id}")
async def export_cover_letter(job_id: int):
    """Export cover letter as PDF"""
    try:
        job = queries.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        assets = queries.get_job_assets(job_id)
        if not assets or not assets.get("cover_letter_versions"):
            raise HTTPException(status_code=400, detail="Cover letter not generated yet")
        
        resume = queries.get_latest_resume_source()
        if not resume or not resume.get("parsed"):
            raise HTTPException(status_code=400, detail="Resume not uploaded")
        
        # Get latest cover letter version
        cover_letter_text = assets["cover_letter_versions"][-1]["text"]
        
        output_path = files.get_export_path(f"cover_letter_{job_id}.pdf")
        export_cover_letter_pdf(cover_letter_text, resume["parsed"], output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=f"cover_letter_{job_id}.pdf"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interview-pack/{job_id}")
async def export_interview_pack(job_id: int):
    """Export interview pack as PDF"""
    try:
        job = queries.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        analysis = queries.get_job_analysis(job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="JD not analyzed yet")
        
        assets = queries.get_job_assets(job_id)
        interview_pack = assets.get("interview_pack") if assets else None
        
        output_path = files.get_export_path(f"interview_pack_{job_id}.pdf")
        export_interview_pack_pdf(analysis["jd_extract"], interview_pack, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=f"interview_pack_{job_id}.pdf"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/package/{job_id}")
async def export_package(job_id: int):
    """Export complete application package (ZIP)"""
    try:
        job = queries.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Generate all PDFs first
        pdf_paths = []
        
        # Resume PDF - prefer optimized version
        assets = queries.get_job_assets(job_id)
        resume_parse = None
        if assets and assets.get("resume_versions"):
            latest_version = assets["resume_versions"][-1]
            resume_parse = latest_version.get("parsed")
        
        # Fallback to latest uploaded/demo resume
        if not resume_parse:
            resume = queries.get_latest_resume_source()
            if resume and resume.get("parsed"):
                resume_parse = resume["parsed"]
        
        if resume_parse:
            resume_path = files.get_export_path(f"resume_{job_id}.pdf")
            export_resume_pdf(resume_parse, resume_path)
            pdf_paths.append(resume_path)
        
        # Cover Letter PDF
        if assets and assets.get("cover_letter_versions") and resume_parse:
            cover_letter_text = assets["cover_letter_versions"][-1]["text"]
            cl_path = files.get_export_path(f"cover_letter_{job_id}.pdf")
            export_cover_letter_pdf(cover_letter_text, resume_parse, cl_path)
            pdf_paths.append(cl_path)
        
        # Interview Pack PDF
        analysis = queries.get_job_analysis(job_id)
        if analysis and analysis.get("jd_extract"):
            interview_pack = assets.get("interview_pack") if assets else None
            ip_path = files.get_export_path(f"interview_pack_{job_id}.pdf")
            export_interview_pack_pdf(analysis["jd_extract"], interview_pack, ip_path)
            pdf_paths.append(ip_path)
        
        if not pdf_paths:
            raise HTTPException(status_code=400, detail="No documents available to package")
        
        # Create ZIP package
        package_path = files.get_export_path(f"application_{job_id}.zip")
        create_application_pack(pdf_paths, package_path)
        
        return FileResponse(
            package_path,
            media_type="application/zip",
            filename=f"application_{job_id}.zip"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

