"""
Roadmap PDF Exporter
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from typing import Dict, Any

def export_roadmap_pdf(roadmap: Dict[str, Any], output_path: str):
    """
    Export roadmap to PDF
    
    Args:
        roadmap: Roadmap dict
        output_path: Output file path
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    story.append(Paragraph("Learning Roadmap", styles['Title']))
    story.append(Spacer(1, 0.3*inch))
    
    # Add roadmap content
    weeks = roadmap.get("weeks", [])
    for week in weeks:
        week_num = week.get("week_number", 0)
        story.append(Paragraph(f"Week {week_num}", styles['Heading2']))
        
        focus_areas = week.get("focus_areas", [])
        if focus_areas:
            story.append(Paragraph(f"Focus: {', '.join(focus_areas)}", styles['Normal']))
        
        tasks = week.get("tasks", [])
        for task in tasks:
            title = task.get("title", "")
            desc = task.get("description", "")
            story.append(Paragraph(f"• {title}: {desc}", styles['Normal']))
        
        story.append(Spacer(1, 0.2*inch))
    
    doc.build(story)


