"""
Landing Page
"""
import streamlit as st
from storage.queries import get_user_profile
from storage.db import init_database, ensure_default_profile

def render():
    """Render landing page"""
    # Initialize database if needed
    init_database()
    ensure_default_profile()
    
    # Brand header
    st.markdown('<h1 class="brand-header">PathToOffer AI</h1>', unsafe_allow_html=True)
    
    # Centered content
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
        <div class="landing-hero">
            <h2>Turn Job Descriptions into Submission-Ready Applications</h2>
            <p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 2rem;">
                AI-powered resume optimization, cover letter generation, and interview prep
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Action buttons
        button_col1, button_col2 = st.columns(2)
        
        with button_col1:
            if st.button("Start Demo", type="primary", use_container_width=True):
                st.session_state.current_page = "workspace"
                st.session_state.demo_mode = True
                st.rerun()
        
        with button_col2:
            if st.button("Start with My Resume", use_container_width=True):
                st.session_state.current_page = "jobs"
                st.session_state.demo_mode = False
                st.rerun()
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Features preview - clean design without emojis
        st.markdown("""
        <div class="landing-features">
            <div class="landing-feature-item">
                <strong>AI Pipeline</strong>
                <span>Multi-stage optimization</span>
            </div>
            <div class="landing-feature-item">
                <strong>ATS-Safe PDFs</strong>
                <span>Professional exports</span>
            </div>
            <div class="landing-feature-item">
                <strong>Cover Letters</strong>
                <span>Tailored to each role</span>
            </div>
            <div class="landing-feature-item">
                <strong>Interview Prep</strong>
                <span>STAR scoring & practice</span>
            </div>
            <div class="landing-feature-item">
                <strong>Coding Practice</strong>
                <span>Original problems</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # Footer
    st.markdown("<br><br><br>", unsafe_allow_html=True)
    st.markdown(
        '<p style="text-align: center; font-size: 0.875rem; color: #64748b; margin-top: 4rem;">Runs locally. Your files stay on your machine.</p>',
        unsafe_allow_html=True
    )

