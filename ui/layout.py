"""
Layout Components - Top bar and sidebar
"""
import streamlit as st

def render_top_bar():
    """Render top navigation bar"""
    col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])
    
    with col1:
        st.markdown('<h1 class="brand-header">PathToOffer AI</h1>', unsafe_allow_html=True)
    
    with col2:
        if st.button("Jobs", use_container_width=True):
            st.session_state.current_page = "jobs"
            st.rerun()
    
    with col3:
        if st.button("Practice", use_container_width=True):
            st.session_state.current_page = "practice"
            st.rerun()
    
    with col4:
        if st.button("Exports", use_container_width=True):
            st.session_state.current_page = "exports"
            st.rerun()
    
    with col5:
        if st.button("Settings", use_container_width=True):
            st.session_state.current_page = "settings"
            st.rerun()

def render_sidebar():
    """Render left sidebar with jobs list"""
    with st.sidebar:
        st.markdown("### Jobs")
        
        from storage.queries import get_all_jobs
        jobs = get_all_jobs()
        
        if not jobs:
            st.markdown('<p style="color: #9ca3af; font-size: 0.875rem; padding: 1rem 0;">No jobs yet</p>', unsafe_allow_html=True)
        else:
            for job in jobs[:10]:  # Show first 10
                job_title = job.get("title", "Untitled")
                company = job.get("company", "")
                display_text = f"{job_title}"
                if company:
                    display_text += f" • {company}"
                
                if st.button(display_text, key=f"sidebar_{job['id']}", use_container_width=True):
                    st.session_state.selected_job_id = job["id"]
                    st.session_state.current_page = "workspace"
                    st.rerun()

