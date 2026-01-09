"""
Interview Practice Engine
"""
from typing import Dict, Any, List, Optional
from ai.provider import AIProvider

def generate_interview_question(jd_extract: Dict[str, Any], mode: str, 
                               previous_questions: List[str] = None, 
                               ai_provider: AIProvider = None) -> Dict[str, Any]:
    """
    Generate interview question
    
    Args:
        jd_extract: JDExtract dict
        mode: "behavioural", "technical", or "mock"
        previous_questions: List of previously asked questions
        ai_provider: AI provider instance
    
    Returns:
        Question dict with question, type, what_interviewer_looks_for
    """
    if ai_provider is None:
        raise ValueError("AI provider is required")
    return ai_provider.generate_interview_question(jd_extract, mode, previous_questions)

def score_star_response(question: str, response: str, jd_extract: Dict[str, Any], 
                       ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Score STAR response using rubric
    
    Args:
        question: Interview question
        response: User's response
        jd_extract: JDExtract dict
        ai_provider: AI provider instance
    
    Returns:
        Score dict with rubric scores, strengths, improvements
    """
    return ai_provider.score_star_response(question, response, jd_extract)


