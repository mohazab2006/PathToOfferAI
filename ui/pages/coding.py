"""
Coding Practice Page
"""
import streamlit as st
from ui.layout import render_top_bar, render_sidebar

def render():
    """Render coding practice page"""
    render_top_bar()
    render_sidebar()
    st.header("Coding Practice")
    st.info("Coding practice engine coming soon")


