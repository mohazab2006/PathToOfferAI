"""Practice API Router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from storage import queries
from core.interview_engine import generate_interview_question, score_star_response
from core.coding_engine import generate_coding_problem, review_code
from ai.openai_provider import OpenAIProvider

router = APIRouter()

class GenerateQuestionRequest(BaseModel):
    job_id: int
    mode: str = "behavioural"  # behavioural, technical, mock
    previous_questions: Optional[List[str]] = None

class ScoreResponseRequest(BaseModel):
    job_id: int
    question: str
    response: str

@router.post("/question")
async def generate_question(request: GenerateQuestionRequest):
    """Generate interview question"""
    try:
        job = queries.get_job(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="JD not analyzed yet")
        
        ai_provider = OpenAIProvider()
        question = generate_interview_question(
            analysis["jd_extract"],
            request.mode,
            request.previous_questions or [],
            ai_provider
        )
        
        return question
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/score")
async def score_response(request: ScoreResponseRequest):
    """Score STAR response"""
    try:
        job = queries.get_job(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="JD not analyzed yet")
        
        ai_provider = OpenAIProvider()
        score = score_star_response(
            request.question,
            request.response,
            analysis["jd_extract"],
            ai_provider
        )
        
        return score
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_practice_sessions():
    """Get practice sessions (placeholder)"""
    return {"sessions": []}

class GenerateProblemRequest(BaseModel):
    job_id: int
    difficulty: str = "medium"  # easy, medium, hard

class ReviewCodeRequest(BaseModel):
    job_id: int
    problem: dict
    code: str
    test_results: dict = {}

@router.post("/coding/problem")
async def generate_coding_problem_endpoint(request: GenerateProblemRequest):
    """Generate coding problem"""
    try:
        job = queries.get_job(request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        analysis = queries.get_job_analysis(request.job_id)
        if not analysis or not analysis.get("jd_extract"):
            raise HTTPException(status_code=400, detail="JD not analyzed yet")
        
        ai_provider = OpenAIProvider()
        problem = generate_coding_problem(
            analysis["jd_extract"],
            request.difficulty,
            ai_provider
        )
        
        return problem
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coding/review")
async def review_code_endpoint(request: ReviewCodeRequest):
    """Review code solution"""
    try:
        ai_provider = OpenAIProvider()
        review = review_code(
            request.problem,
            request.code,
            request.test_results,
            ai_provider
        )
        
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

