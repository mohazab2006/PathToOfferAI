"""
File handling utilities
"""
import os
import tempfile
from pathlib import Path
from typing import Optional

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
EXPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "exports")

def ensure_directories():
    """Ensure upload and export directories exist"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(EXPORT_DIR, exist_ok=True)

def save_uploaded_file(uploaded_file, filename: str = None) -> str:
    """Save an uploaded file and return the path"""
    ensure_directories()
    if filename is None:
        filename = uploaded_file.filename if hasattr(uploaded_file, 'filename') else uploaded_file.name
    file_path = os.path.join(UPLOAD_DIR, filename)
    # Handle both Streamlit UploadedFile and FastAPI UploadFile
    if hasattr(uploaded_file, 'read'):
        # FastAPI UploadFile
        with open(file_path, "wb") as f:
            content = uploaded_file.file.read()
            f.write(content)
    else:
        # Streamlit UploadedFile
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
    return file_path

def get_export_path(filename: str) -> str:
    """Get path for export file"""
    ensure_directories()
    return os.path.join(EXPORT_DIR, filename)

ensure_directories()

