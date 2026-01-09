"""
Exports Page
"""
import streamlit as st
from ui.layout import render_top_bar, render_sidebar

def render():
    """Render exports page"""
    render_top_bar()
    render_sidebar()
    st.header("Exports")
    st.info("PDF export engine coming soon")


