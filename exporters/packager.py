"""
Package Exporter - Creates ZIP files
"""
import zipfile
import os
from typing import List

def create_application_pack(pdf_paths: List[str], output_zip_path: str):
    """
    Create ZIP file with all PDFs
    
    Args:
        pdf_paths: List of PDF file paths
        output_zip_path: Output ZIP file path
    """
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for pdf_path in pdf_paths:
            if os.path.exists(pdf_path):
                filename = os.path.basename(pdf_path)
                zipf.write(pdf_path, filename)


