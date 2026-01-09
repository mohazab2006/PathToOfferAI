"""
Resume Parser
"""
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
from typing import Dict, Any, Optional
from ai.provider import AIProvider
from core.schemas import ResumeParse

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    if PyPDF2 is None:
        raise ImportError("PyPDF2 is required for PDF extraction. Install with: pip install PyPDF2")
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def parse_resume(resume_text: str, ai_provider: AIProvider) -> Dict[str, Any]:
    """
    Parse resume into structured format
    
    Args:
        resume_text: Raw resume text
        ai_provider: AI provider instance
    
    Returns:
        ResumeParse dict
    """
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is required")
    
    result = ai_provider.parse_resume(resume_text)
    
    # Validate against schema
    try:
        validated = ResumeParse(**result)
        return validated.model_dump()
    except Exception as e:
        # Return raw result if validation fails (for debugging)
        return result

