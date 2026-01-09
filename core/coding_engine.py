"""
Coding Practice Engine
"""
from typing import Dict, Any
from ai.provider import AIProvider

def generate_coding_problem(jd_extract: Dict[str, Any], difficulty: str = "medium", 
                           ai_provider: AIProvider = None) -> Dict[str, Any]:
    """
    Generate original coding problem
    
    Args:
        jd_extract: JDExtract dict
        difficulty: "easy", "medium", or "hard"
        ai_provider: AI provider instance
    
    Returns:
        Problem dict with title, prompt, examples, test_cases
    """
    if ai_provider is None:
        raise ValueError("AI provider is required")
    return ai_provider.generate_coding_problem(jd_extract, difficulty)

def review_code(problem: Dict[str, Any], code: str, test_results: Dict[str, Any], 
               ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Review code solution
    
    Args:
        problem: Problem dict
        code: User's code
        test_results: Test execution results
        ai_provider: AI provider instance
    
    Returns:
        Review dict with correctness, complexity, feedback
    """
    return ai_provider.review_code(problem, code, test_results)


