"""
Evidence Mapper - Maps JD requirements to resume evidence
"""
from typing import Dict, Any
from ai.provider import AIProvider

def build_evidence_map(jd_extract: Dict[str, Any], resume_parse: Dict[str, Any], ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Build evidence map between JD and resume
    
    Args:
        jd_extract: JDExtract dict
        resume_parse: ResumeParse dict
        ai_provider: AI provider instance
    
    Returns:
        EvidenceMap dict
    """
    return ai_provider.build_evidence_map(jd_extract, resume_parse)


