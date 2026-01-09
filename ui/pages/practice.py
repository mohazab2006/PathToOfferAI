"""
Interview Practice Page
"""
import streamlit as st
from ui.layout import render_top_bar, render_sidebar

def render():
    """Render practice page"""
    render_top_bar()
    render_sidebar()
    st.header("Interview Practice")
    st.info("Interview practice engine coming soon")


