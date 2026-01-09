"""
Rewrite Planner - Creates prioritized rewrite plan
"""
from typing import Dict, Any
from ai.provider import AIProvider

def create_rewrite_plan(score_breakdown: Dict[str, Any], evidence_map: Dict[str, Any], 
                       ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Create rewrite plan with prioritized fixes
    
    Args:
        score_breakdown: ScoreBreakdown dict
        evidence_map: EvidenceMap dict
        ai_provider: AI provider instance
    
    Returns:
        RewritePlan dict
    """
    return ai_provider.create_rewrite_plan(score_breakdown, evidence_map)


