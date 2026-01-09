"""
Cover Letter PDF Exporter
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT
from typing import Dict, Any

def export_cover_letter_pdf(cover_letter_text: str, resume_parse: Dict[str, Any], output_path: str):
    """
    Export cover letter to PDF (one page max)
    
    Args:
        cover_letter_text: Cover letter text
        resume_parse: ResumeParse dict for header/footer
        output_path: Output file path
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                           rightMargin=1*inch, leftMargin=1*inch,
                           topMargin=1*inch, bottomMargin=1*inch)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Header style
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor='black',
        spaceAfter=12
    )
    
    # Body style
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor='black',
        spaceAfter=12,
        leading=14
    )
    
    # Footer style
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor='black',
        spaceBefore=24
    )
    
    # Header
    identity = resume_parse.get("identity", {})
    name = identity.get("name", "")
    city = identity.get("city", "")
    email = identity.get("email", "")
    phone = identity.get("phone", "")
    
    story.append(Paragraph(name, header_style))
    contact_parts = []
    if city:
        contact_parts.append(city)
    if email:
        contact_parts.append(email)
    if phone:
        contact_parts.append(phone)
    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), header_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Cover letter body (split into paragraphs)
    paragraphs = cover_letter_text.split("\n\n")
    for para in paragraphs:
        if para.strip():
            story.append(Paragraph(para.strip(), body_style))
            story.append(Spacer(1, 0.15*inch))
    
    # Footer with platform links
    platforms = identity.get("platforms", {})
    footer_parts = []
    if platforms.get("portfolio"):
        footer_parts.append(f"Portfolio: {platforms['portfolio']}")
    if platforms.get("linkedin"):
        footer_parts.append(f"LinkedIn: {platforms['linkedin']}")
    if platforms.get("github"):
        footer_parts.append(f"GitHub: {platforms['github']}")
    
    if footer_parts:
        story.append(Spacer(1, 0.2*inch))
        for link in footer_parts:
            story.append(Paragraph(link, footer_style))
    
    # Build PDF
    doc.build(story)


