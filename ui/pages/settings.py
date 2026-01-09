"""
Settings Page
"""
import streamlit as st
import os
from ui.layout import render_top_bar, render_sidebar
from storage.queries import get_setting, set_setting, get_user_profile, update_user_profile

def render():
    """Render settings page"""
    render_top_bar()
    render_sidebar()
    
    st.header("Settings")
    
    # API Key section
    st.subheader("OpenAI API Configuration")
    api_key = os.getenv("OPENAI_API_KEY")
    
    if api_key:
        st.success("✅ API key is configured")
        masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "***"
        st.code(f"Key: {masked_key}")
    else:
        st.error("❌ API key not found. Please set OPENAI_API_KEY in your .env file")
        st.info("Create a .env file in the project root with: OPENAI_API_KEY=your_key_here")
    
    # Model selection
    model = st.selectbox(
        "Model",
        ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"],
        index=0
    )
    set_setting("openai_model", model)
    
    quality_mode = st.selectbox(
        "Quality Mode",
        ["fast", "quality"],
        index=1
    )
    set_setting("quality_mode", quality_mode)
    
    # User Profile section
    st.subheader("User Profile")
    profile = get_user_profile()
    
    if profile:
        with st.form("profile_form"):
            name = st.text_input("Full Name", value=profile.get("name", ""))
            city_country = st.text_input("City, Country", value=profile.get("city_country", ""))
            email = st.text_input("Email", value=profile.get("email", ""))
            phone = st.text_input("Phone (optional)", value=profile.get("phone", ""))
            linkedin = st.text_input("LinkedIn URL", value=profile.get("linkedin_url", ""))
            github = st.text_input("GitHub URL", value=profile.get("github_url", ""))
            portfolio = st.text_input("Portfolio URL", value=profile.get("portfolio_url", ""))
            
            if st.form_submit_button("Save Profile", type="primary"):
                update_user_profile(
                    name=name,
                    city_country=city_country,
                    email=email,
                    phone=phone,
                    linkedin_url=linkedin,
                    github_url=github,
                    portfolio_url=portfolio
                )
                st.success("Profile updated!")


