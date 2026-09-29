from pydantic import BaseModel, Field
from typing import List, Optional, Literal

VerdictType = Literal["GUILTY", "NOT_GUILTY", "PARTIALLY_RESPONSIBLE", "INSUFFICIENT_EVIDENCE"]
AppealStatus = Literal["PENDING", "UPHELD", "MODIFIED", "OVERTURNED"]

class Participant(BaseModel):
    name: str

class Statement(BaseModel):
    participant_name: str
    statement_text: str
    explanation: Optional[str] = None

class Evidence(BaseModel):
    id: str
    type: Literal["image", "text"]
    content: str
    submitted_by: str

class Question(BaseModel):
    id: str
    asked_to: str
    question_text: str

class Answer(BaseModel):
    question_id: str
    answer_text: str

class Hearing(BaseModel):
    questions: List[Question] = []
    answers: List[Answer] = []

class EvidenceAssessment(BaseModel):
    evidence_id: str
    credibility: Literal["high", "medium", "low"]
    relevance: Literal["high", "medium", "low"]
    notes: str

class VerdictDetail(BaseModel):
    type: VerdictType
    responsible_parties: List[str]
    severity: int = Field(ge=0, le=10)
    reasoning: str

class FullVerdict(BaseModel):
    case_summary: str
    key_claims: List[str]
    contradictions: List[str]
    questions: List[str]
    evidence_assessment: List[EvidenceAssessment]
    verdict: VerdictDetail
    consequence: str
    friendship_recommendation: str

# Keep the old Verdict for backward compatibility with existing frontend
class Verdict(BaseModel):
    verdict_type: VerdictType
    responsible_party: str
    severity_score: int = Field(ge=0, le=10)
    evidence_strength: str
    key_findings: List[str]
    reasoning: str
    consequence: str
    friendship_recommendation: str

class Appeal(BaseModel):
    id: str
    counter_argument: str
    new_evidence: List[Evidence] = []
    status: AppealStatus
    revised_verdict: Optional[Verdict] = None

class Case(BaseModel):
    id: str
    title: str
    category: str
    friend_a: Participant
    friend_b: Participant
    description: str
    statements: List[Statement] = []
    evidence: List[Evidence] = []
    hearing: Optional[Hearing] = None
    verdict: Optional[Verdict] = None
    appeals: List[Appeal] = []

# Hearing API Request/Response schemas
class HearingStartRequest(BaseModel):
    case_id: str
    title: str
    category: str
    friend_a: str
    friend_b: str
    description: str
    statements: List[Statement]
    evidence: List[Evidence] = []
    demo_mode: bool = False

class HearingStartResponse(BaseModel):
    success: bool
    case_summary: str
    key_claims: List[str]
    contradictions: List[str]
    questions: List[str]  # Initial questions for the hearing
    evidence_assessment: List[EvidenceAssessment]
    is_demo: bool = False
    mode_message: Optional[str] = None


class HearingAnswerTurn(BaseModel):
    question: str
    answer: str
    participant: str

class HearingAnswerRequest(BaseModel):
    case_id: str
    title: str = ""
    category: str = ""
    friend_a: str = "Friend A"
    friend_b: str = "Friend B"
    description: str = ""
    statements: List[Statement] = []
    evidence: List[Evidence] = []
    questions_asked: List[str]
    answers: List[HearingAnswerTurn]
    demo_mode: bool = False

class HearingAnswerResponse(BaseModel):
    success: bool
    follow_up_questions: List[str]
    needs_more_info: bool
    is_demo: bool = False
    mode_message: Optional[str] = None

class HearingConcludeRequest(BaseModel):
    case_id: str
    title: str
    category: str
    friend_a: str
    friend_b: str
    description: str
    statements: List[Statement]
    evidence: List[Evidence] = []
    conversation_history: List[dict]  # Full Q&A history
    demo_mode: bool = False

class HearingConcludeResponse(BaseModel):
    success: bool
    verdict: FullVerdict
    is_demo: bool = False
    mode_message: Optional[str] = None


AppealOutcome = Literal["VERDICT_UPHELD", "VERDICT_MODIFIED", "VERDICT_OVERTURNED"]


class AppealRequest(HearingStartRequest):
    conversation_history: List[dict] = []
    original_verdict: FullVerdict
    appeal_argument: str
    new_evidence: List[Evidence] = []


class AppealResult(BaseModel):
    outcome: AppealOutcome
    original_verdict: FullVerdict
    appeal_argument: str
    appeal_reasoning: str
    new_evidence_assessment: List[EvidenceAssessment]
    what_changed: str
    updated_verdict: FullVerdict


class AppealResponse(BaseModel):
    success: bool
    appeal: AppealResult
    is_demo: bool = False
    mode_message: Optional[str] = None
