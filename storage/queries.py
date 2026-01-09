"""
Database query functions
"""
import json
from typing import Optional, List, Dict, Any
from storage.db import get_db_connection

# User Profile Queries
def get_user_profile() -> Optional[Dict[str, Any]]:
    """Get the user profile"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users_profile LIMIT 1")
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

def update_user_profile(**kwargs) -> bool:
    """Update user profile"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        fields = ", ".join([f"{k} = ?" for k in kwargs.keys()])
        values = list(kwargs.values())
        # SQLite doesn't support LIMIT in UPDATE, but we only have one profile anyway
        cursor.execute(f"UPDATE users_profile SET {fields}, updated_at = CURRENT_TIMESTAMP", values)
        return cursor.rowcount > 0

# Job Queries
def create_job(title: str, company: str = None, link: str = None, jd_text: str = None, status: str = "Saved", tags: List[str] = None) -> int:
    """Create a new job"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        tags_json = json.dumps(tags) if tags else None
        cursor.execute("""
            INSERT INTO jobs (title, company, link, jd_text, status, tags_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, company, link, jd_text, status, tags_json))
        return cursor.lastrowid

def get_job(job_id: int) -> Optional[Dict[str, Any]]:
    """Get a job by ID"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            job = dict(row)
            if job.get("tags_json"):
                job["tags"] = json.loads(job["tags_json"])
            return job
        return None

def get_all_jobs() -> List[Dict[str, Any]]:
    """Get all jobs (without jd_text for performance)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Exclude jd_text from list view - it can be very large
        cursor.execute("""
            SELECT id, title, company, link, status, tags_json, created_at, updated_at 
            FROM jobs 
            ORDER BY updated_at DESC
        """)
        rows = cursor.fetchall()
        jobs = [dict(row) for row in rows]
        for job in jobs:
            tags_json = job.get("tags_json")
            if tags_json:
                try:
                    job["tags"] = json.loads(tags_json)
                except (json.JSONDecodeError, TypeError):
                    job["tags"] = []
            else:
                job["tags"] = []
            # Remove tags_json from response (we have tags now)
            job.pop("tags_json", None)
        return jobs

def update_job(job_id: int, **kwargs) -> bool:
    """Update a job"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if "tags" in kwargs:
            kwargs["tags_json"] = json.dumps(kwargs.pop("tags"))
        fields = ", ".join([f"{k} = ?" for k in kwargs.keys()])
        values = list(kwargs.values()) + [job_id]
        cursor.execute(f"UPDATE jobs SET {fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)
        return cursor.rowcount > 0

def delete_job(job_id: int) -> bool:
    """Delete a job"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Clean up related rows to avoid orphaned analysis/assets that can cause confusing states.
        cursor.execute("DELETE FROM job_analysis WHERE job_id = ?", (job_id,))
        cursor.execute("DELETE FROM job_assets WHERE job_id = ?", (job_id,))
        cursor.execute("DELETE FROM practice_sessions WHERE job_id = ?", (job_id,))
        cursor.execute("DELETE FROM coding_sessions WHERE job_id = ?", (job_id,))
        cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        return cursor.rowcount > 0

def get_resume_source_by_file_path(file_path: str) -> Optional[Dict[str, Any]]:
    """Get a resume source by file_path"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resume_sources WHERE file_path = ? ORDER BY created_at DESC LIMIT 1", (file_path,))
        row = cursor.fetchone()
        if row:
            resume = dict(row)
            if resume.get("parsed_json"):
                resume["parsed"] = json.loads(resume["parsed_json"])
            return resume
        return None

def upsert_resume_source_by_file_path(file_path: str, raw_text: str = None, parsed_json: Dict = None) -> int:
    """Upsert a resume source by file_path (used for sticky demo resume)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM resume_sources WHERE file_path = ? ORDER BY created_at DESC LIMIT 1", (file_path,))
        existing = cursor.fetchone()
        parsed_json_str = json.dumps(parsed_json) if parsed_json else None
        if existing:
            cursor.execute(
                "UPDATE resume_sources SET raw_text = COALESCE(?, raw_text), parsed_json = ? WHERE id = ?",
                (raw_text, parsed_json_str, existing[0]),
            )
            return existing[0]
        cursor.execute(
            "INSERT INTO resume_sources (file_path, raw_text, parsed_json) VALUES (?, ?, ?)",
            (file_path, raw_text, parsed_json_str),
        )
        return cursor.lastrowid

def delete_resume_sources_by_file_path(file_path: str) -> int:
    """Delete resume sources matching a file_path (used for demo reset)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM resume_sources WHERE file_path = ?", (file_path,))
        return cursor.rowcount

# Resume Source Queries
def save_resume_source(file_path: str = None, raw_text: str = None, parsed_json: Dict = None) -> int:
    """Save a resume source"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        parsed_json_str = json.dumps(parsed_json) if parsed_json else None
        cursor.execute("""
            INSERT INTO resume_sources (file_path, raw_text, parsed_json)
            VALUES (?, ?, ?)
        """, (file_path, raw_text, parsed_json_str))
        return cursor.lastrowid

def get_latest_resume_source() -> Optional[Dict[str, Any]]:
    """Get the latest resume source"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resume_sources ORDER BY created_at DESC LIMIT 1")
        row = cursor.fetchone()
        if row:
            resume = dict(row)
            if resume.get("parsed_json"):
                resume["parsed"] = json.loads(resume["parsed_json"])
            return resume
        return None

# Job Analysis Queries
def save_job_analysis(job_id: int, jd_extract: Dict = None, evidence_map: Dict = None, 
                     score_breakdown: Dict = None, rewrite_plan: Dict = None) -> int:
    """Save or update job analysis"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Check if analysis exists
        cursor.execute("SELECT id FROM job_analysis WHERE job_id = ?", (job_id,))
        existing = cursor.fetchone()
        
        jd_extract_json = json.dumps(jd_extract) if jd_extract else None
        evidence_map_json = json.dumps(evidence_map) if evidence_map else None
        score_breakdown_json = json.dumps(score_breakdown) if score_breakdown else None
        rewrite_plan_json = json.dumps(rewrite_plan) if rewrite_plan else None
        
        if existing:
            cursor.execute("""
                UPDATE job_analysis 
                SET jd_extract_json = COALESCE(?, jd_extract_json),
                    evidence_map_json = COALESCE(?, evidence_map_json),
                    score_breakdown_json = COALESCE(?, score_breakdown_json),
                    rewrite_plan_json = COALESCE(?, rewrite_plan_json),
                    updated_at = CURRENT_TIMESTAMP
                WHERE job_id = ?
            """, (jd_extract_json, evidence_map_json, score_breakdown_json, rewrite_plan_json, job_id))
            return existing[0]
        else:
            cursor.execute("""
                INSERT INTO job_analysis (job_id, jd_extract_json, evidence_map_json, score_breakdown_json, rewrite_plan_json)
                VALUES (?, ?, ?, ?, ?)
            """, (job_id, jd_extract_json, evidence_map_json, score_breakdown_json, rewrite_plan_json))
            return cursor.lastrowid

def get_job_analysis(job_id: int) -> Optional[Dict[str, Any]]:
    """Get job analysis"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_analysis WHERE job_id = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            analysis = dict(row)
            for key in ["jd_extract_json", "evidence_map_json", "score_breakdown_json", "rewrite_plan_json"]:
                if analysis.get(key):
                    analysis[key.replace("_json", "")] = json.loads(analysis[key])
            return analysis
        return None

# Job Assets Queries
def save_job_assets(job_id: int, resume_versions: List[Dict] = None, 
                   cover_letter_versions: List[Dict] = None,
                   roadmap: Dict = None, interview_pack: Dict = None) -> int:
    """Save or update job assets"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM job_assets WHERE job_id = ?", (job_id,))
        existing = cursor.fetchone()
        
        resume_versions_json = json.dumps(resume_versions) if resume_versions else None
        cover_letter_versions_json = json.dumps(cover_letter_versions) if cover_letter_versions else None
        roadmap_json = json.dumps(roadmap) if roadmap else None
        interview_pack_json = json.dumps(interview_pack) if interview_pack else None
        
        if existing:
            cursor.execute("""
                UPDATE job_assets 
                SET resume_versions_json = COALESCE(?, resume_versions_json),
                    cover_letter_versions_json = COALESCE(?, cover_letter_versions_json),
                    roadmap_json = COALESCE(?, roadmap_json),
                    interview_pack_json = COALESCE(?, interview_pack_json),
                    updated_at = CURRENT_TIMESTAMP
                WHERE job_id = ?
            """, (resume_versions_json, cover_letter_versions_json, roadmap_json, interview_pack_json, job_id))
            return existing[0]
        else:
            cursor.execute("""
                INSERT INTO job_assets (job_id, resume_versions_json, cover_letter_versions_json, roadmap_json, interview_pack_json)
                VALUES (?, ?, ?, ?, ?)
            """, (job_id, resume_versions_json, cover_letter_versions_json, roadmap_json, interview_pack_json))
            return cursor.lastrowid

def get_job_assets(job_id: int) -> Optional[Dict[str, Any]]:
    """Get job assets"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_assets WHERE job_id = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            assets = dict(row)
            for key in ["resume_versions_json", "cover_letter_versions_json", "roadmap_json", "interview_pack_json"]:
                if assets.get(key):
                    assets[key.replace("_json", "")] = json.loads(assets[key])
            return assets
        return None

# Settings Queries
def get_setting(key: str, default: Any = None) -> Any:
    """Get an app setting"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM app_settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        if row:
            try:
                return json.loads(row[0])
            except:
                return row[0]
        return default

def set_setting(key: str, value: Any):
    """Set an app setting"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        value_str = json.dumps(value) if not isinstance(value, str) else value
        cursor.execute("""
            INSERT OR REPLACE INTO app_settings (key, value)
            VALUES (?, ?)
        """, (key, value_str))

