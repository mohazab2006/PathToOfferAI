"""
Roadmap Builder - Generates learning roadmaps
"""
from typing import Dict, Any
from ai.provider import AIProvider

def generate_roadmap(jd_extract: Dict[str, Any], resume_parse: Dict[str, Any], 
                    ai_provider: AIProvider, timeline_weeks: int = 4) -> Dict[str, Any]:
    """
    Generate learning roadmap
    
    Args:
        jd_extract: JDExtract dict
        resume_parse: ResumeParse dict
        timeline_weeks: Number of weeks (2 or 4)
        ai_provider: AI provider instance
    
    Returns:
        Roadmap dict with weeks structure
    """
    return ai_provider.generate_roadmap(jd_extract, resume_parse, timeline_weeks)

