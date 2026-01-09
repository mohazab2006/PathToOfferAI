"""
Resume PDF Exporter
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from typing import Dict, Any

def export_resume_pdf(resume_parse: Dict[str, Any], output_path: str):
    """
    Export resume to PDF (one page max, ATS-safe)
    
    Args:
        resume_parse: ResumeParse dict
        output_path: Output file path
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                           rightMargin=0.75*inch, leftMargin=0.75*inch,
                           topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='black',
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    name_style = ParagraphStyle(
        'NameStyle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor='black',
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor='black',
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Header
    identity = resume_parse.get("identity", {})
    name = identity.get("name", "")
    role = ""  # Would come from job context
    city = identity.get("city", "")
    email = identity.get("email", "")
    phone = identity.get("phone", "")
    platforms = identity.get("platforms", {})
    
    story.append(Paragraph(name, name_style))
    if role:
        story.append(Paragraph(role, header_style))
    
    # Contact info
    contact_parts = []
    if city:
        contact_parts.append(city)
    if email:
        contact_parts.append(email)
    if phone:
        contact_parts.append(phone)
    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), styles['Normal']))
    
    # Platform links
    platform_parts = []
    if platforms.get("linkedin"):
        platform_parts.append(f"LinkedIn: {platforms['linkedin']}")
    if platforms.get("github"):
        platform_parts.append(f"GitHub: {platforms['github']}")
    if platforms.get("portfolio"):
        platform_parts.append(f"Portfolio: {platforms['portfolio']}")
    if platform_parts:
        story.append(Paragraph(" | ".join(platform_parts), styles['Normal']))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Skills
    skills = resume_parse.get("skills", {})
    if skills:
        story.append(Paragraph("TECHNICAL SKILLS", section_style))
        for category, items in skills.items():
            if items:
                skill_text = f"<b>{category.title()}:</b> {', '.join(items)}"
                story.append(Paragraph(skill_text, styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    # Projects
    projects = resume_parse.get("projects", [])
    if projects:
        story.append(Paragraph("PROJECTS", section_style))
        for project in projects[:3]:  # Limit to fit one page
            title = project.get("title", "")
            tech_stack = project.get("tech_stack", [])
            bullets = project.get("bullets", [])
            
            if title:
                story.append(Paragraph(f"<b>{title}</b>", styles['Normal']))
            if tech_stack:
                story.append(Paragraph(f"Tech Stack: {', '.join(tech_stack)}", styles['Normal']))
            for bullet in bullets[:2]:  # Max 2 bullets per project
                story.append(Paragraph(f"• {bullet}", styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
        story.append(Spacer(1, 0.1*inch))
    
    # Experience
    experience = resume_parse.get("experience", [])
    if experience:
        story.append(Paragraph("EXPERIENCE", section_style))
        for exp in experience[:2]:  # Limit to fit one page
            company = exp.get("company", "")
            role = exp.get("role", "")
            dates = exp.get("dates", "")
            bullets = exp.get("bullets", [])
            
            header_text = f"<b>{role}</b> | {company}"
            if dates:
                header_text += f" | {dates}"
            story.append(Paragraph(header_text, styles['Normal']))
            for bullet in bullets[:2]:  # Max 2 bullets per role
                story.append(Paragraph(f"• {bullet}", styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
        story.append(Spacer(1, 0.1*inch))
    
    # Education
    education = resume_parse.get("education", [])
    if education:
        story.append(Paragraph("EDUCATION", section_style))
        for edu in education:
            institution = edu.get("institution", "")
            degree = edu.get("degree", "")
            dates = edu.get("dates", "")
            
            edu_text = f"<b>{degree}</b> | {institution}"
            if dates:
                edu_text += f" | {dates}"
            story.append(Paragraph(edu_text, styles['Normal']))
    
    # Build PDF
    doc.build(story)


