"""
ATS Scorer - Computes score breakdown
"""
from typing import Dict, Any
from ai.provider import AIProvider

def compute_score_breakdown(jd_extract: Dict[str, Any], resume_parse: Dict[str, Any], 
                           evidence_map: Dict[str, Any], ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Compute ATS score breakdown
    
    Args:
        jd_extract: JDExtract dict
        resume_parse: ResumeParse dict
        evidence_map: EvidenceMap dict
        ai_provider: AI provider instance
    
    Returns:
        ScoreBreakdown dict
    """
    return ai_provider.compute_score_breakdown(jd_extract, resume_parse, evidence_map)


