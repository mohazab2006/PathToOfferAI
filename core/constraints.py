"""
Constraint Verification - Verifies rewrites meet constraints
"""
from typing import Dict, Any, List

def verify_bullet_constraints(bullet: str, constraints: Dict[str, Any]) -> Dict[str, Any]:
    """
    Verify bullet meets constraints
    
    Args:
        bullet: Bullet text to verify
        constraints: Constraint rules
    
    Returns:
        Dict with is_valid, violations
    """
    violations = []
    
    # Check max length
    if "max_length" in constraints:
        if len(bullet) > constraints["max_length"]:
            violations.append(f"Exceeds max length of {constraints['max_length']} characters")
    
    # Check required keywords
    if "required_keywords" in constraints:
        bullet_lower = bullet.lower()
        for keyword in constraints["required_keywords"]:
            if keyword.lower() not in bullet_lower:
                violations.append(f"Missing required keyword: {keyword}")
    
    # Check action verb
    if constraints.get("must_start_with_action_verb", False):
        action_verbs = ["developed", "created", "built", "designed", "implemented", 
                       "optimized", "improved", "managed", "led", "achieved"]
        first_word = bullet.split()[0].lower() if bullet.split() else ""
        if first_word not in action_verbs:
            violations.append("Should start with an action verb")
    
    return {
        "is_valid": len(violations) == 0,
        "violations": violations
    }

def auto_repair_bullet(bullet: str, violations: List[str], ai_provider, context: Dict[str, Any]) -> str:
    """
    Attempt to auto-repair bullet based on violations
    
    Args:
        bullet: Original bullet
        violations: List of violation messages
        ai_provider: AI provider instance
        context: Context for rewriting
    
    Returns:
        Repaired bullet
    """
    # For now, return original - full repair would use AI
    # This is a placeholder for the verification loop
    return bullet


