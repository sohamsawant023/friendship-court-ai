# Phase 3 Implementation Report: Real AI Judge

## Summary

Successfully implemented a real AI-powered backend workflow for the Friendship Court AI application, replacing mock behavior with genuine AI analysis using the Gemini API. The implementation includes a robust demo mode for hackathon presentations and comprehensive error handling.

## API Endpoints Created

### 1. `POST /api/hearing/start`
- **Purpose**: Analyze case and generate initial questions for the hearing
- **Request**: Case data including statements, evidence, and participant information
- **Response**: 
  - `case_summary`: AI-generated summary of the dispute
  - `key_claims`: Extracted claims from both parties
  - `contradictions`: Identified inconsistencies between statements
  - `questions`: Case-specific follow-up questions (not generic)
  - `evidence_assessment`: Initial assessment of submitted evidence

### 2. `POST /api/hearing/answer`
- **Purpose**: Process answers to questions and generate follow-up questions
- **Request**: Previous questions asked and user answers
- **Response**:
  - `follow_up_questions`: Additional questions if more information needed
  - `needs_more_info`: Boolean indicating if hearing should continue

### 3. `POST /api/hearing/conclude`
- **Purpose**: Generate final verdict based on all case information
- **Request**: Full case data including statements, evidence, and Q&A history
- **Response**:
  - `verdict`: Structured verdict with:
    - `case_summary`: Final summary
    - `key_claims`: All identified claims
    - `contradictions`: All contradictions found
    - `evidence_assessment`: Evidence credibility and relevance
    - `verdict`:
      - `type`: GUILTY, NOT_GUILTY, PARTIALLY_RESPONSIBLE, or INSUFFICIENT_EVIDENCE
      - `responsible_parties`: Array of responsible parties (can be one, both, or none)
      - `severity`: 0-10 rating
      - `reasoning`: Detailed explanation
    - `consequence`: Appropriate, harmless consequence
    - `friendship_recommendation`: Advice for moving forward
  - `is_demo`: Boolean indicating if demo mode was used

## AI Schema

### Verdict Structure
```python
class FullVerdict(BaseModel):
    case_summary: str
    key_claims: List[str]
    contradictions: List[str]
    questions: List[str]
    evidence_assessment: List[EvidenceAssessment]
    verdict: VerdictDetail
    consequence: str
    friendship_recommendation: str

class VerdictDetail(BaseModel):
    type: Literal["GUILTY", "NOT_GUILTY", "PARTIALLY_RESPONSIBLE", "INSUFFICIENT_EVIDENCE"]
    responsible_parties: List[str]
    severity: int  # 0-10
    reasoning: str
```

### Verdict Types
- `GUILTY`: One party clearly responsible
- `NOT_GUILTY`: No responsibility found
- `PARTIALLY_RESPONSIBLE`: Both parties contributed to the dispute
- `INSUFFICIENT_EVIDENCE`: Cannot determine responsibility due to lack of evidence

## Prompt/AI Workflow

### 1. Hearing Start Prompt
- Analyzes both statements from the case
- Extracts 3-5 key claims from each side
- Identifies contradictions or inconsistencies
- Assesses submitted evidence
- Generates 3-5 case-specific follow-up questions
- **Key requirement**: Questions must be specific to the case, not generic

### 2. Answer Processing Prompt
- Analyzes answers for consistency and completeness
- Identifies new contradictions or clarifications
- Determines if more information is needed
- Generates follow-up questions only if critical information is missing

### 3. Verdict Generation Prompt
- Analyzes all statements, evidence, and Q&A responses
- Determines responsibility based on facts, context, and intent
- Chooses appropriate verdict type
- Assigns responsible parties (can be one, both, or none)
- Rates severity (0-10)
- Provides clear reasoning
- Suggests appropriate, harmless consequences
- Provides friendship recommendations

### AI Guidelines
- This is ENTERTAINMENT, not real legal advice
- Do not assume guilt without clear evidence
- Consider context and intent
- INSUFFICIENT_EVIDENCE is valid when facts are unclear
- PARTIALLY_RESPONSIBLE when both parties contributed
- Consequences must be harmless: replace items, apologize, let other choose movie, buy chai
- NO dangerous, humiliating, degrading, illegal, or harmful consequences

## Demo Mode Behavior

### Activation
Demo mode activates automatically when:
- `MOCK_AI_MODE=true` in environment variables
- No `GEMINI_API_KEY` configured
- Gemini API not installed
- API call fails or times out

### Pizza Case (Case 1)
- **Verdict**: GUILTY
- **Responsible Party**: Friend B
- **Reasoning**: Friend B should have verified ownership before consuming food
- **Consequence**: Replace the pizza or bring equivalent snack
- **Questions**: Specific to pizza dispute (labeling, explicit communication, fridge rules)

### Missing Evidence Case (Case 2)
- **Verdict**: INSUFFICIENT_EVIDENCE
- **Responsible Parties**: None
- **Reasoning**: Contradictory statements with no supporting evidence
- **Consequence**: No consequence assigned

### Shared Responsibility Case (Case 3)
- **Verdict**: PARTIALLY_RESPONSIBLE
- **Responsible Parties**: Both Friend A and Friend B
- **Reasoning**: Miscommunication on both sides
- **Consequence**: Both apologize, Bob buys chai for both
- **Recommendation**: Practice active listening and clarify assumptions

### Demo Mode Labeling
All demo mode responses are clearly labeled with `[DEMO MODE]` prefix in:
- Case summaries
- Reasoning text
- Frontend displays a "Demo Mode" banner on verdict page

## Tests Performed

### Backend API Tests
✅ Health check endpoint working
✅ `/api/hearing/start` returns structured analysis with case-specific questions
✅ `/api/hearing/answer` returns follow-up questions
✅ `/api/hearing/conclude` returns full verdict with all required fields

### Case 1: Pizza Dispute
✅ AI analyzes both statements (Friend A's claim vs Friend B's defense)
✅ Generates specific questions about labeling, explicit communication, and fridge rules
✅ Returns GUILTY verdict with appropriate reasoning
✅ Consequence is harmless (replace pizza)
✅ Different from generic "do you agree?" questions

### Case 2: Missing Evidence
✅ Detects conflicting statements with no evidence
✅ Returns INSUFFICIENT_EVIDENCE verdict
✅ No responsible parties assigned
✅ No consequence assigned
✅ Recommends better documentation

### Case 3: Shared Responsibility
✅ Detects miscommunication on both sides
✅ Returns PARTIALLY_RESPONSIBLE verdict
✅ Both parties assigned responsibility
✅ Appropriate consequence (both apologize, buy chai)
✅ Recommendation focuses on communication

### Demo Mode Tests
✅ Works without API key
✅ Deterministic responses for Pizza case
✅ All three verdict types (GUILTY, INSUFFICIENT_EVIDENCE, PARTIALLY_RESPONSIBLE) work
✅ Clearly labeled as demo data
✅ Fallback activated when API fails

### Frontend Build Tests
✅ `npm run build` - successful
✅ `npx tsc --noEmit` - no TypeScript errors
✅ `npx eslint .` - no ESLint errors

## Files Modified/Created

### Backend
- `requirements.txt` - Added FastAPI, Gemini API, and dependencies
- `app/models/schemas.py` - Added FullVerdict, EvidenceAssessment, Hearing API schemas
- `app/services/ai_service.py` - New AI service with Gemini integration and demo mode
- `app/services/__init__.py` - Service module initialization
- `app/api/hearing.py` - New hearing API endpoints
- `app/api/__init__.py` - API module initialization
- `app/models/__init__.py` - Models module initialization
- `app/__init__.py` - App module initialization
- `app/main.py` - Updated to include hearing router and environment loading
- `.env` - Environment configuration with demo mode enabled

### Frontend
- `src/lib/api.ts` - New API client with TypeScript types
- `src/app/case/[id]/page.tsx` - Updated to call real API endpoints
- `src/app/case/[id]/verdict/page.tsx` - Updated to call real API endpoint
- `src/app/case/[id]/evidence/page.tsx` - Fixed routing to hearing page
- `.env.local` - API URL configuration

## AI Workflow Summary

```
CASE → STATEMENTS → EVIDENCE → AI ANALYSIS → FOLLOW-UP QUESTIONS → ANSWERS → FINAL VERDICT
```

1. **Case Entry**: User creates case with title, category, participants
2. **Statements**: Both parties submit their statements
3. **Evidence**: Optional evidence submission (text/images)
4. **AI Analysis**: Backend analyzes statements and evidence
5. **Questions**: AI generates case-specific follow-up questions
6. **Answers**: Users provide answers to questions
7. **Final Verdict**: AI generates structured verdict with reasoning

## Product Rule Compliance

✅ Entertainment application, not legal service
✅ Results not described as legally valid or binding
✅ No professional legal advice claims
✅ Consequences are harmless and appropriate:
  - Replace snacks/items
  - Apologize
  - Let other friend choose movie
  - Buy chai
✅ No dangerous, humiliating, degrading, illegal, or harmful consequences

## Remaining Limitations

1. **Image Evidence Analysis**: Currently, image evidence is stored but not analyzed by the AI. The AI only receives text descriptions. Full image analysis would require vision capabilities.

2. **No Real-Time Streaming**: The current implementation uses request/response pattern. For a more conversational feel, real-time streaming could be added.

3. **Limited Conversation Depth**: The demo mode concludes after 3-4 questions. The real AI could be configured for deeper conversations.

4. **No Appeal Implementation**: The appeal feature exists in the data model but is not yet connected to the AI backend.

5. **Case History Not Persisted**: Cases are stored in localStorage only. A database would be needed for persistent case history.

6. **No User Authentication**: The application doesn't have user accounts or authentication.

## Environment Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Set MOCK_AI_MODE=true for demo mode
# Set GEMINI_API_KEY=your_key for real AI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Backend API URL configured in .env.local
```

## Success Criteria Met

✅ Real AI analysis of both statements
✅ Identification of key claims and contradictions
✅ Context and intent consideration
✅ Evidence assessment (where technically supported)
✅ Missing information identification
✅ Case-specific follow-up questions (not generic)
✅ No automatic guilt declaration
✅ INSUFFICIENT_EVIDENCE verdict possible
✅ PARTIALLY_RESPONSIBLE verdict possible
✅ Structured JSON verdict matching data model
✅ API key from environment variables only
✅ No API key exposure to frontend
✅ Schema validation
✅ Timeout handling
✅ API failure handling
✅ Malformed response handling
✅ Demo mode for hackathon
✅ Deterministic demo responses for Pizza case
✅ Clear demo mode labeling
✅ Harmless consequences only
✅ Frontend-backend integration
✅ Build and lint passing
