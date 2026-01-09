"""
Jobs List Page
"""
import streamlit as st
from storage.queries import get_all_jobs, create_job, delete_job
from ui.layout import render_top_bar, render_sidebar

def render():
    """Render jobs list page"""
    render_top_bar()
    render_sidebar()
    
    # Main content
    st.header("Jobs")
    
    # Create new job button
    if st.button("+ New Job", type="primary"):
        st.session_state.show_new_job_form = True
    
    # New job form
    if st.session_state.get("show_new_job_form", False):
        with st.form("new_job_form"):
            title = st.text_input("Job Title *", placeholder="e.g., Software Engineer Intern")
            company = st.text_input("Company", placeholder="e.g., Google")
            link = st.text_input("Job Link", placeholder="https://...")
            jd_text = st.text_area("Job Description", height=200, placeholder="Paste the full job description here...")
            
            col1, col2 = st.columns(2)
            with col1:
                submit = st.form_submit_button("Save Job", type="primary")
            with col2:
                cancel = st.form_submit_button("Cancel")
            
            if submit:
                if title:
                    job_id = create_job(title=title, company=company, link=link, jd_text=jd_text)
                    st.success(f"Job '{title}' saved!")
                    st.session_state.show_new_job_form = False
                    st.session_state.selected_job_id = job_id
                    st.session_state.current_page = "workspace"
                    st.rerun()
                else:
                    st.error("Job title is required")
            
            if cancel:
                st.session_state.show_new_job_form = False
                st.rerun()
    
    # Jobs list
    jobs = get_all_jobs()
    
    if not jobs:
        st.markdown("""
        <div class="empty-state">
            <div class="empty-state-title">No jobs yet</div>
            <div class="empty-state-description">Create your first job to get started with resume optimization and interview prep.</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        # Search and filter
        search_term = st.text_input("Search jobs", placeholder="Search by title, company...", key="job_search")
        
        # Filter jobs
        filtered_jobs = jobs
        if search_term:
            search_lower = search_term.lower()
            filtered_jobs = [j for j in jobs if 
                            search_lower in j.get("title", "").lower() or 
                            search_lower in j.get("company", "").lower()]
        
        # Display jobs
        for job in filtered_jobs:
            with st.container():
                col1, col2, col3 = st.columns([3, 1, 1])
                
                with col1:
                    st.markdown(f"### {job.get('title', 'Untitled')}")
                    if job.get('company'):
                        st.markdown(f"**{job['company']}**")
                    if job.get('status'):
                        status_colors = {
                            "Saved": "badge",
                            "Applied": "badge badge-primary",
                            "Interviewing": "badge badge-success",
                            "Closed": "badge"
                        }
                        st.markdown(f'<span class="{status_colors.get(job["status"], "badge")}">{job["status"]}</span>', unsafe_allow_html=True)
                
                with col2:
                    if st.button("Open", key=f"open_{job['id']}"):
                        st.session_state.selected_job_id = job['id']
                        st.session_state.current_page = "workspace"
                        st.rerun()
                
                with col3:
                    if st.button("Delete", key=f"delete_{job['id']}"):
                        delete_job(job['id'])
                        st.rerun()
                
                st.divider()

