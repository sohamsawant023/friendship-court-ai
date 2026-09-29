from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    HearingStartRequest,
    HearingStartResponse,
    HearingAnswerRequest,
    HearingAnswerResponse,
    HearingConcludeRequest,
    HearingConcludeResponse
)
from app.services import ai_service

router = APIRouter(prefix="/api/hearing", tags=["hearing"])


@router.post("/start", response_model=HearingStartResponse)
async def start_hearing(request: HearingStartRequest):
    """
    Start a hearing by analyzing the case and generating initial questions.
    
    This endpoint:
    - Analyzes both statements from the case
    - Identifies key claims and contradictions
    - Assesses submitted evidence
    - Generates case-specific follow-up questions
    """
    try:
        response = await ai_service.start_hearing(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start hearing: {str(e)}")


@router.post("/answer", response_model=HearingAnswerResponse)
async def submit_answer(request: HearingAnswerRequest):
    """
    Submit answers to hearing questions and get follow-up questions.
    
    This endpoint:
    - Processes answers to previous questions
    - Analyzes responses for consistency
    - Determines if more information is needed
    - Generates follow-up questions if necessary
    """
    try:
        response = await ai_service.submit_answer(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process answer: {str(e)}")


@router.post("/conclude", response_model=HearingConcludeResponse)
async def conclude_hearing(request: HearingConcludeRequest):
    """
    Conclude the hearing and generate a final verdict.
    
    This endpoint:
    - Analyzes all statements, evidence, and Q&A history
    - Determines responsibility based on facts and context
    - Generates a structured verdict with:
      - Case summary
      - Key claims and contradictions
      - Evidence assessment
      - Verdict type (GUILTY, NOT_GUILTY, PARTIALLY_RESPONSIBLE, INSUFFICIENT_EVIDENCE)
      - Responsible parties
      - Severity rating
      - Reasoning
      - Appropriate consequence
      - Friendship recommendation
    """
    try:
        response = await ai_service.conclude_hearing(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to conclude hearing: {str(e)}")
