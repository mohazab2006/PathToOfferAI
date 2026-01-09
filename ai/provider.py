"""
AI Provider Interface
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    def extract_jd(self, jd_text: str) -> Dict[str, Any]:
        """Extract structured data from job description"""
        pass
    
    @abstractmethod
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """Parse resume into structured format"""
        pass
    
    @abstractmethod
    def build_evidence_map(self, jd_extract: Dict, resume_parse: Dict) -> Dict[str, Any]:
        """Build evidence map between JD and resume"""
        pass
    
    @abstractmethod
    def compute_score_breakdown(self, jd_extract: Dict, resume_parse: Dict, evidence_map: Dict) -> Dict[str, Any]:
        """Compute ATS score breakdown"""
        pass
    
    @abstractmethod
    def create_rewrite_plan(self, score_breakdown: Dict, evidence_map: Dict) -> Dict[str, Any]:
        """Create rewrite plan with prioritized fixes"""
        pass
    
    @abstractmethod
    def rewrite_bullet(self, bullet: str, constraints: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Rewrite a single bullet point with constraints"""
        pass

    @abstractmethod
    def optimize_resume_parse(
        self,
        jd_extract: Dict[str, Any],
        resume_parse: Dict[str, Any],
        score_breakdown: Optional[Dict[str, Any]] = None,
        evidence_map: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Optimize resume_parse for a specific job (returns ResumeParse dict)"""
        pass
    
    @abstractmethod
    def generate_cover_letter(self, jd_extract: Dict, resume_parse: Dict, tone: str = "professional") -> str:
        """Generate cover letter"""
        pass
    
    @abstractmethod
    def suggest_projects(self, jd_extract: Dict, resume_parse: Dict) -> List[Dict[str, Any]]:
        """Suggest projects for CS students"""
        pass
    
    @abstractmethod
    def generate_roadmap(self, jd_extract: Dict, resume_parse: Dict, timeline_weeks: int = 4) -> Dict[str, Any]:
        """Generate learning roadmap"""
        pass
    
    @abstractmethod
    def generate_interview_question(self, jd_extract: Dict, mode: str, previous_questions: List[str] = None) -> Dict[str, Any]:
        """Generate interview question"""
        pass
    
    @abstractmethod
    def score_star_response(self, question: str, response: str, jd_extract: Dict) -> Dict[str, Any]:
        """Score STAR response"""
        pass
    
    @abstractmethod
    def generate_coding_problem(self, jd_extract: Dict, difficulty: str = "medium") -> Dict[str, Any]:
        """Generate original coding problem"""
        pass
    
    @abstractmethod
    def review_code(self, problem: Dict, code: str, test_results: Dict) -> Dict[str, Any]:
        """Review code solution"""
        pass

