"""
Job Workspace Page
"""
import streamlit as st
from storage.queries import get_job, get_job_analysis, get_job_assets, save_job_analysis, save_job_assets
from ui.layout import render_top_bar, render_sidebar
try:
    from demo.loader import load_demo_data
except ImportError:
    def load_demo_data():
        pass

def render():
    """Render job workspace page"""
    render_top_bar()
    render_sidebar()
    
    # Load demo data if in demo mode
    if st.session_state.get("demo_mode", False):
        if "demo_loaded" not in st.session_state:
            load_demo_data()
            st.session_state.demo_loaded = True
    
    # Get current job
    job_id = st.session_state.get("selected_job_id")
    if not job_id:
        st.warning("No job selected. Please select a job from the Jobs page.")
        if st.button("Go to Jobs"):
            st.session_state.current_page = "jobs"
            st.rerun()
        return
    
    job = get_job(job_id)
    if not job:
        st.error("Job not found.")
        return
    
    # Workspace header
    st.header(f"{job.get('title', 'Untitled')}")
    if job.get('company'):
        st.markdown(f"**{job.get('company')}**")
    
    # Workspace tabs
    tabs = st.tabs(["Overview", "Resume", "Cover Letter", "Gaps", "Practice", "Coding", "Export"])
    
    with tabs[0]:
        render_overview_tab(job_id, job)
    with tabs[1]:
        render_resume_tab(job_id, job)
    with tabs[2]:
        render_cover_letter_tab(job_id, job)
    with tabs[3]:
        st.info("Gaps analysis coming soon")
    with tabs[4]:
        st.info("Practice mode coming soon")
    with tabs[5]:
        st.info("Coding practice coming soon")
    with tabs[6]:
        st.info("Export coming soon")

def render_overview_tab(job_id, job):
    """Render overview tab"""
    st.subheader("Job Analysis")
    
    # Task toggles and run button
    st.markdown("### Pipeline Tasks")
    
    col1, col2 = st.columns([3, 1])
    with col1:
        analyze_jd = st.checkbox("Analyze JD", value=False)
        parse_resume = st.checkbox("Parse Resume", value=False)
        ats_score = st.checkbox("ATS Score + Breakdown", value=False)
        keyword_heatmap = st.checkbox("Keyword Heatmap", value=False)
        rewrite_bullets = st.checkbox("Rewrite Bullets (Evidence-based)", value=False)
        generate_cl = st.checkbox("Generate Cover Letter", value=False)
        build_roadmap = st.checkbox("Build Roadmap", value=False)
        build_pack = st.checkbox("Build Interview Pack", value=False)
    
    with col2:
        if st.button("Run Selected", type="primary", use_container_width=True):
            st.info("Pipeline execution coming soon")
    
    # Display existing analysis
    analysis = get_job_analysis(job_id)
    if analysis and analysis.get("jd_extract"):
        st.markdown("### Job Requirements")
        jd_extract = analysis["jd_extract"]
        
        if jd_extract.get("must_have_skills"):
            st.markdown("**Must-Have Skills:**")
            skills = ", ".join(jd_extract["must_have_skills"])
            st.markdown(skills)
        
        if jd_extract.get("keywords"):
            st.markdown("**Keywords:**")
            keywords = ", ".join(jd_extract["keywords"][:10])
            st.markdown(keywords)
    
    if analysis and analysis.get("score_breakdown"):
        st.markdown("### ATS Score")
        score = analysis["score_breakdown"].get("final_score", 0)
        st.metric("Overall Score", f"{score}/100")
        
        # Score breakdown bars
        breakdown = analysis["score_breakdown"]
        for key in ["keyword_coverage", "alignment", "evidence_strength", "bullet_quality"]:
            if key in breakdown:
                score_val = breakdown[key].get("score", 0) if isinstance(breakdown[key], dict) else 0
                st.progress(score_val / 100, text=f"{key.replace('_', ' ').title()}: {score_val}/100")

def render_resume_tab(job_id, job):
    """Render resume tab"""
    st.subheader("Resume")
    st.info("Resume parsing and editing coming soon")

def render_cover_letter_tab(job_id, job):
    """Render cover letter tab"""
    st.subheader("Cover Letter")
    st.info("Cover letter generation coming soon")

