from fastapi import APIRouter, HTTPException

from app.models.schemas import AppealRequest, AppealResponse
from app.services import ai_service

router = APIRouter(prefix="/api", tags=["appeal"])


@router.post("/appeal", response_model=AppealResponse)
async def reassess_appeal(request: AppealRequest):
    try:
        return await ai_service.reassess_appeal(request)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Appeal reassessment failed. Please retry the appeal.",
        ) from error