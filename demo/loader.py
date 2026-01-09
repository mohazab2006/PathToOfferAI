"""
Demo Data Loader
"""
import json
import os
from storage.queries import (
    create_job, save_resume_source, update_user_profile,
    save_job_analysis, save_job_assets
)

def load_demo_data():
    """Load demo data into database"""
    demo_dir = os.path.join(os.path.dirname(__file__))
    
    # Load demo profile
    profile_path = os.path.join(demo_dir, "profile.json")
    if os.path.exists(profile_path):
        with open(profile_path, "r") as f:
            profile = json.load(f)
            update_user_profile(**profile)
    
    # Load demo job
    jd_path = os.path.join(demo_dir, "job_description.txt")
    if os.path.exists(jd_path):
        with open(jd_path, "r") as f:
            jd_text = f.read()
        
        job_id = create_job(
            title="Software Engineer Intern",
            company="TechCorp",
            link="https://example.com/job",
            jd_text=jd_text,
            status="Saved"
        )
        
        # Load demo resume
        resume_path = os.path.join(demo_dir, "resume.txt")
        if os.path.exists(resume_path):
            with open(resume_path, "r") as f:
                resume_text = f.read()
            
            save_resume_source(raw_text=resume_text)
        
        # Set as selected job
        import streamlit as st
        st.session_state.selected_job_id = job_id
        
        return job_id
    
    return None


