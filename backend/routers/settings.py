"""Settings API Router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries

router = APIRouter()

@router.get("/profile")
async def get_profile():
    profile = queries.get_user_profile()
    return profile or {}

@router.put("/profile")
async def update_profile(profile: dict):
    queries.update_user_profile(**profile)
    return {"message": "Profile updated"}


