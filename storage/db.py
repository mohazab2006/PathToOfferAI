"""
Database initialization and connection management
"""
import sqlite3
import os
from typing import Optional
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "path_to_offer.db")

def get_db_path() -> str:
    """Get the database file path"""
    return DB_PATH

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_database():
    """Initialize database schema"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Users profile table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users_profile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                city_country TEXT,
                email TEXT,
                phone TEXT,
                linkedin_url TEXT,
                github_url TEXT,
                portfolio_url TEXT,
                other_platforms_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Jobs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                company TEXT,
                link TEXT,
                jd_text TEXT,
                status TEXT DEFAULT 'Saved',
                tags_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Add index for faster sorting
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_jobs_updated_at ON jobs(updated_at DESC)
        """)
        
        # Resume sources table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resume_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT,
                raw_text TEXT,
                parsed_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Job analysis table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS job_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                jd_extract_json TEXT,
                evidence_map_json TEXT,
                score_breakdown_json TEXT,
                rewrite_plan_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        """)
        
        # Job assets table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS job_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                resume_versions_json TEXT,
                cover_letter_versions_json TEXT,
                roadmap_json TEXT,
                interview_pack_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        """)
        
        # Practice sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS practice_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER,
                mode TEXT,
                transcript_json TEXT,
                rubric_scores_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        """)
        
        # Coding sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS coding_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER,
                problem_json TEXT,
                attempt_code TEXT,
                test_results_json TEXT,
                feedback_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        """)
        
        # App settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        
        conn.commit()

def ensure_default_profile():
    """Ensure a default user profile exists"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users_profile")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO users_profile (name, city_country, email)
                VALUES (?, ?, ?)
            """, ("", "", ""))
            conn.commit()

# Initialize on import
if not os.path.exists(DB_PATH):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_database()
    ensure_default_profile()

