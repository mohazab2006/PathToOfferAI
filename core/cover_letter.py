"""
Cover Letter Generator
"""
from typing import Dict, Any
from ai.provider import AIProvider

def generate_cover_letter(jd_extract: Dict[str, Any], resume_parse: Dict[str, Any], 
                         ai_provider: AIProvider, tone: str = "professional") -> str:
    """
    Generate cover letter
    
    Args:
        jd_extract: JDExtract dict
        resume_parse: ResumeParse dict
        tone: Tone (professional, enthusiastic, formal)
        ai_provider: AI provider instance
    
    Returns:
        Cover letter text (3 paragraphs, ≤250 words)
    """
    return ai_provider.generate_cover_letter(jd_extract, resume_parse, tone)

def format_cover_letter_with_links(cover_letter_text: str, resume_parse: Dict[str, Any]) -> str:
    """
    Format cover letter with header and platform links footer
    
    Args:
        cover_letter_text: Generated cover letter text
        resume_parse: ResumeParse dict with identity
    
    Returns:
        Formatted cover letter with header and footer
    """
    identity = resume_parse.get("identity", {})
    name = identity.get("name", "")
    city = identity.get("city", "")
    email = identity.get("email", "")
    phone = identity.get("phone", "")
    platforms = identity.get("platforms", {})
    
    # Header
    header_lines = [name]
    contact = []
    if city:
        contact.append(city)
    if email:
        contact.append(email)
    if phone:
        contact.append(phone)
    if contact:
        header_lines.append(" | ".join(contact))
    
    header = "\n".join(header_lines)
    
    # Footer with platform links
    footer_lines = []
    if platforms.get("portfolio"):
        footer_lines.append(f"Portfolio: {platforms['portfolio']}")
    if platforms.get("linkedin"):
        footer_lines.append(f"LinkedIn: {platforms['linkedin']}")
    if platforms.get("github"):
        footer_lines.append(f"GitHub: {platforms['github']}")
    
    footer = "\n\n" + "\n".join(footer_lines) if footer_lines else ""
    
    return f"{header}\n\n{cover_letter_text}{footer}"

