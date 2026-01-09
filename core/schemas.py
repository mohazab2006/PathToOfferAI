"""
Pydantic schemas for data contracts
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class JDExtract(BaseModel):
    """Job Description Extraction Schema"""
    role_title: str
    seniority: str = Field(..., pattern="^(intern|junior|mid|senior)$")
    must_have_skills: List[str] = []
    nice_to_have_skills: List[str] = []
    languages: List[str] = []
    frameworks: List[str] = []
    tools: List[str] = []
    responsibilities: List[str] = []
    keywords: List[str] = []
    domain: Optional[str] = None

class Identity(BaseModel):
    """Resume Identity Schema"""
    name: str
    email: str
    city: Optional[str] = None
    platforms: Dict[str, str] = {}

class Experience(BaseModel):
    """Experience Entry Schema"""
    company: str
    role: str
    dates: Optional[str] = None
    bullets: List[str] = []

class Project(BaseModel):
    """Project Entry Schema"""
    title: str
    tech_stack: List[str] = []
    bullets: List[str] = []

class Education(BaseModel):
    """Education Entry Schema"""
    institution: str
    degree: str
    dates: Optional[str] = None

class ResumeParse(BaseModel):
    """Resume Parsing Schema"""
    identity: Identity
    skills: Dict[str, List[str]] = {}
    experience: List[Experience] = []
    projects: List[Project] = []
    certifications: List[str] = []
    extracurriculars: List[str] = []
    education: List[Education] = []

class EvidenceCitation(BaseModel):
    """Evidence Citation Schema"""
    section: str
    index: int
    bullet_index: Optional[int] = None

class EvidenceMap(BaseModel):
    """Evidence Mapping Schema"""
    evidence: Dict[str, List[EvidenceCitation]] = {}
    missing: List[str] = []

class ScoreDetails(BaseModel):
    """Score Details Schema"""
    score: int = Field(..., ge=0, le=100)
    explanation: str = ""
    details: Dict[str, Any] = {}

class BulletLintResult(BaseModel):
    """Bullet Linting Result Schema"""
    bullet: str
    status: str = Field(..., pattern="^(Strong|Needs improvement|Weak)$")
    issues: List[str] = []
    suggestions: List[str] = []

class ScoreBreakdown(BaseModel):
    """ATS Score Breakdown Schema"""
    keyword_coverage: ScoreDetails
    alignment: ScoreDetails
    evidence_strength: ScoreDetails
    bullet_quality: ScoreDetails
    formatting: ScoreDetails
    final_score: int = Field(..., ge=0, le=100)
    top_fixes: List[Dict[str, Any]] = []
    lint_results: Optional[List[BulletLintResult]] = None

class RewritePlan(BaseModel):
    """Rewrite Plan Schema"""
    prioritized_edits: List[Dict[str, Any]] = []
    expected_impact: str = "medium"


