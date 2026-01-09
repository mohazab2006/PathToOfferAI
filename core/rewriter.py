"""
Rewriter - Applies constrained rewrites to resume bullets
"""
from typing import Dict, Any
from ai.provider import AIProvider

def rewrite_bullet(bullet: str, constraints: Dict[str, Any], context: Dict[str, Any], 
                  ai_provider: AIProvider) -> str:
    """
    Rewrite a single bullet point with constraints
    
    Args:
        bullet: Original bullet text
        constraints: Constraint rules (e.g., max_length, required_keywords)
        context: Context (e.g., project details, metrics)
        ai_provider: AI provider instance
    
    Returns:
        Rewritten bullet text
    """
    return ai_provider.rewrite_bullet(bullet, constraints, context)


