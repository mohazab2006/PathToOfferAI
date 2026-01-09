"""
Job Description Parser
"""
from typing import Dict, Any
from ai.provider import AIProvider
from core.schemas import JDExtract

def extract_jd(jd_text: str, ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Extract structured data from job description
    
    Args:
        jd_text: Raw job description text
        ai_provider: AI provider instance
    
    Returns:
        JDExtract dict
    """
    if not jd_text or not jd_text.strip():
        raise ValueError("Job description text is required")
    
    result = ai_provider.extract_jd(jd_text)
    
    # Validate against schema
    try:
        validated = JDExtract(**result)
        return validated.model_dump()
    except Exception as e:
        # Return raw result if validation fails (for debugging)
        return result


