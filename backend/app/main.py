from dotenv import load_dotenv
import os

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import Case
from app.api import appeal_router, hearing_router

app = FastAPI(title="Friendship Court AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hearing_router)
app.include_router(appeal_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Friendship Court API is running",
        "demo_mode": os.getenv("MOCK_AI_MODE", "false").lower() == "true" or not os.getenv("GEMINI_API_KEY"),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

# MVP placeholders for future implementation
@app.post("/api/cases", response_model=dict)
def create_case(case: Case):
    return {"status": "success", "case_id": case.id}
