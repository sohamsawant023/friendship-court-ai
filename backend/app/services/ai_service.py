import os
import json
from typing import List, Dict, Optional
import asyncio
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from app.models.schemas import (
    HearingStartRequest,
    HearingStartResponse,
    HearingAnswerRequest,
    HearingAnswerResponse,
    HearingConcludeRequest,
    HearingConcludeResponse,
    FullVerdict,
    VerdictDetail,
    EvidenceAssessment,
    VerdictType
)


class AIService:
    """Service for AI-powered case analysis using Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.mock_mode = os.getenv("MOCK_AI_MODE", "false").lower() == "true"
        self.model = None
        
        if not self.mock_mode and GEMINI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
                self.mock_mode = True
    
    def _is_demo_mode(self) -> bool:
        """Check if running in demo mode"""
        return self.mock_mode or not GEMINI_AVAILABLE or not self.api_key
    
    async def start_hearing(self, request: HearingStartRequest) -> HearingStartResponse:
        """
        Analyze case and generate initial questions for the hearing.
        
        This analyzes both statements, identifies key claims, detects contradictions,
        and generates case-specific follow-up questions.
        """
        if self._is_demo_mode():
            return await self._demo_start_hearing(request)
        
        try:
            # Build context for AI
            context = self._build_case_context(request)
            
            prompt = f"""
You are an AI judge for a friendship dispute resolution court. Analyze the following case and provide insights.

CASE DETAILS:
{context}

Your task:
1. Summarize the case in 2-3 sentences
2. Extract 3-5 key claims from each side
3. Identify any contradictions or inconsistencies between the statements
4. Assess the evidence provided (if any)
5. Generate 3-5 specific, case-relevant questions to clarify the dispute

IMPORTANT:
- Questions must be specific to THIS case, not generic
- Avoid asking generic questions like "How do you feel?"
- Focus on factual details, timelines, permissions, and context
- Consider intent and context, not just literal statements
- Do not assume guilt

Return your response as a JSON object with this exact structure:
{{
    "case_summary": "string",
    "key_claims": ["claim1", "claim2", ...],
    "contradictions": ["contradiction1", "contradiction2", ...],
    "questions": ["question1", "question2", ...],
    "evidence_assessment": [
        {{
            "evidence_id": "id",
            "credibility": "high|medium|low",
            "relevance": "high|medium|low",
            "notes": "assessment notes"
        }}
    ]
}}
"""
            
            response = await self._call_gemini_with_timeout(prompt, timeout=30)
            
            # Parse and validate response
            parsed = self._parse_json_response(response)
            
            # Build evidence assessment
            evidence_assessment = []
            for i, evidence in enumerate(request.evidence):
                evidence_assessment.append(EvidenceAssessment(
                    evidence_id=evidence.id,
                    credibility="medium",
                    relevance="medium",
                    notes="Evidence submitted for review"
                ))
            
            return HearingStartResponse(
                success=True,
                case_summary=parsed.get("case_summary", "Case analysis completed"),
                key_claims=parsed.get("key_claims", []),
                contradictions=parsed.get("contradictions", []),
                questions=parsed.get("questions", []),
                evidence_assessment=evidence_assessment
            )
            
        except asyncio.TimeoutError:
            print("AI analysis timed out, falling back to demo mode")
            return await self._demo_start_hearing(request)
        except Exception as e:
            print(f"Error in AI analysis: {e}")
            return await self._demo_start_hearing(request)
    
    async def submit_answer(self, request: HearingAnswerRequest) -> HearingAnswerResponse:
        """
        Process answers to questions and generate follow-up questions.
        """
        if self._is_demo_mode():
            return await self._demo_submit_answer(request)
        
        try:
            # Build context from Q&A history
            context = self._build_qa_context(request)
            
            prompt = f"""
You are an AI judge reviewing answers in a friendship dispute hearing.

QUESTIONS ASKED AND ANSWERS RECEIVED:
{context}

Your task:
1. Analyze the answers for consistency and completeness
2. Identify any new contradictions or clarifications
3. Determine if more information is needed
4. Generate 2-3 follow-up questions if more info is needed, or return empty list if ready for verdict

IMPORTANT:
- Only ask follow-up questions if critical information is missing
- Questions must be specific to the answers provided
- If enough information is available to make a fair judgment, return empty questions list

Return as JSON:
{{
    "follow_up_questions": ["question1", "question2", ...],
    "needs_more_info": true/false
}}
"""
            
            response = await self._call_gemini_with_timeout(prompt, timeout=20)
            parsed = self._parse_json_response(response)
            
            return HearingAnswerResponse(
                success=True,
                follow_up_questions=parsed.get("follow_up_questions", []),
                needs_more_info=parsed.get("needs_more_info", False)
            )
            
        except asyncio.TimeoutError:
            print("AI answer processing timed out")
            return HearingAnswerResponse(
                success=True,
                follow_up_questions=[],
                needs_more_info=False
            )
        except Exception as e:
            print(f"Error processing answer: {e}")
            return HearingAnswerResponse(
                success=True,
                follow_up_questions=[],
                needs_more_info=False
            )
    
    async def conclude_hearing(self, request: HearingConcludeRequest) -> HearingConcludeResponse:
        """
        Generate final verdict based on all case information and hearing Q&A.
        """
        if self._is_demo_mode():
            return await self._demo_conclude_hearing(request)
        
        try:
            context = self._build_full_context(request)
            
            prompt = f"""
You are an AI judge for a friendship dispute resolution court. Generate a final verdict.

CASE INFORMATION:
{context}

Your task:
1. Analyze all statements, evidence, and Q&A responses
2. Determine responsibility based on facts, context, and intent
3. Choose appropriate verdict type: GUILTY, NOT_GUILTY, PARTIALLY_RESPONSIBLE, or INSUFFICIENT_EVIDENCE
4. Assign responsible parties (can be one, both, or none)
5. Rate severity (0-10, where 10 is most severe)
6. Provide clear reasoning
7. Suggest appropriate, harmless consequences (replace items, apologize, buy chai, etc.)
8. Provide friendship recommendations

IMPORTANT RULES:
- This is ENTERTAINMENT, not real legal advice
- Do not assume guilt without clear evidence
- Consider context and intent
- INSUFFICIENT_EVIDENCE is valid when facts are unclear
- PARTIALLY_RESPONSIBLE when both parties contributed
- Consequences must be harmless: replace items, apologize, let other choose movie, buy chai
- NO dangerous, humiliating, degrading, illegal, or harmful consequences

Return as JSON:
{{
    "case_summary": "string",
    "key_claims": ["claim1", "claim2", ...],
    "contradictions": ["contradiction1", ...],
    "questions": [],
    "evidence_assessment": [],
    "verdict": {{
        "type": "GUILTY|NOT_GUILTY|PARTIALLY_RESPONSIBLE|INSUFFICIENT_EVIDENCE",
        "responsible_parties": ["Friend A", "Friend B", or both],
        "severity": 0-10,
        "reasoning": "detailed explanation"
    }},
    "consequence": "specific harmless consequence",
    "friendship_recommendation": "advice for moving forward"
}}
"""
            
            response = await self._call_gemini_with_timeout(prompt, timeout=45)
            parsed = self._parse_json_response(response)
            
            # Build verdict object
            verdict_detail = VerdictDetail(
                type=parsed.get("verdict", {}).get("type", "INSUFFICIENT_EVIDENCE"),
                responsible_parties=parsed.get("verdict", {}).get("responsible_parties", []),
                severity=parsed.get("verdict", {}).get("severity", 0),
                reasoning=parsed.get("verdict", {}).get("reasoning", "Unable to determine")
            )
            
            full_verdict = FullVerdict(
                case_summary=parsed.get("case_summary", ""),
                key_claims=parsed.get("key_claims", []),
                contradictions=parsed.get("contradictions", []),
                questions=parsed.get("questions", []),
                evidence_assessment=[],
                verdict=verdict_detail,
                consequence=parsed.get("consequence", "No consequence specified"),
                friendship_recommendation=parsed.get("friendship_recommendation", "Communicate openly")
            )
            
            return HearingConcludeResponse(
                success=True,
                verdict=full_verdict,
                is_demo=False
            )
            
        except asyncio.TimeoutError:
            print("AI verdict generation timed out, using demo mode")
            return await self._demo_conclude_hearing(request)
        except Exception as e:
            print(f"Error generating verdict: {e}")
            return await self._demo_conclude_hearing(request)
    
    # Helper methods
    
    def _build_case_context(self, request: HearingStartRequest) -> str:
        """Build context string from case data"""
        context = f"""
Title: {request.title}
Category: {request.category}
Friend A: {request.friend_a}
Friend B: {request.friend_b}
Description: {request.description}

Statements:
"""
        for stmt in request.statements:
            context += f"\n{stmt.participant_name}: {stmt.statement_text}"
            if stmt.explanation:
                context += f"\nContext: {stmt.explanation}"
        
        if request.evidence:
            context += "\n\nEvidence:"
            for ev in request.evidence:
                context += f"\n- {ev.type} from {ev.submitted_by}: {ev.content[:100]}..."
        
        return context
    
    def _build_qa_context(self, request: HearingAnswerRequest) -> str:
        """Build context from Q&A history"""
        context = ""
        for qa in request.answers:
            context += f"\nQ: {qa['question']}\nA ({qa['participant']}): {qa['answer']}\n"
        return context
    
    def _build_full_context(self, request: HearingConcludeRequest) -> str:
        """Build full context for final verdict"""
        context = f"""
Title: {request.title}
Category: {request.category}
Friend A: {request.friend_a}
Friend B: {request.friend_b}
Description: {request.description}

Statements:
"""
        for stmt in request.statements:
            context += f"\n{stmt.participant_name}: {stmt.statement_text}"
            if stmt.explanation:
                context += f"\nContext: {stmt.explanation}"
        
        if request.evidence:
            context += "\n\nEvidence:"
            for ev in request.evidence:
                context += f"\n- {ev.type} from {ev.submitted_by}: {ev.content[:200]}..."
        
        context += "\n\nHearing Q&A:"
        for qa in request.conversation_history:
            context += f"\nQ: {qa.get('question', '')}\nA ({qa.get('participant', '')}): {qa.get('answer', '')}"
        
        return context
    
    async def _call_gemini_with_timeout(self, prompt: str, timeout: int) -> str:
        """Call Gemini API with timeout"""
        if not self.model:
            raise Exception("Gemini model not initialized")
        
        try:
            result = await asyncio.wait_for(
                asyncio.to_thread(self.model.generate_content, prompt),
                timeout=timeout
            )
            return result.text
        except asyncio.TimeoutError:
            raise
        except Exception as e:
            print(f"Gemini API error: {e}")
            raise
    
    def _parse_json_response(self, response: str) -> dict:
        """Parse JSON from AI response with error handling"""
        try:
            # Try to extract JSON from response
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                # Fallback if no JSON found
                return {"case_summary": response, "key_claims": [], "contradictions": [], "questions": []}
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            return {"case_summary": response, "key_claims": [], "contradictions": [], "questions": []}
    
    # Demo mode methods
    
    async def _demo_start_hearing(self, request: HearingStartRequest) -> HearingStartResponse:
        """Demo mode with deterministic responses based on case content"""
        title_lower = request.title.lower()
        
        # Pizza case (Case 1)
        if "pizza" in title_lower:
            return HearingStartResponse(
                success=True,
                case_summary="[DEMO MODE] Dispute over pizza consumption between friends. Friend A claims Friend B ate pizza after being told not to, while Friend B claims the pizza appeared available in the shared fridge.",
                key_claims=[
                    "Friend A explicitly told Friend B not to eat the pizza",
                    "Friend B ate the pizza anyway",
                    "Pizza was in a shared fridge",
                    "Friend B believed the pizza was available for anyone"
                ],
                contradictions=[
                    "Friend A claims clear communication about ownership, Friend B claims pizza appeared shared",
                    "Different understanding of permission and ownership"
                ],
                questions=[
                    f"{request.friend_a}, was the pizza labeled with your name or otherwise marked as yours?",
                    f"{request.friend_b}, did {request.friend_a} explicitly say 'this is my pizza, do not eat it' before the incident?",
                    f"{request.friend_a}, had you previously established rules about sharing food in the fridge?",
                    f"{request.friend_b}, did you ask before taking the pizza, or did you assume it was available?"
                ],
                evidence_assessment=[]
            )
        
        # Generic demo response for other cases
        return HearingStartResponse(
            success=True,
            case_summary=f"[DEMO MODE] Dispute between {request.friend_a} and {request.friend_b} regarding {request.title}. Both parties have submitted statements with differing accounts of the incident.",
            key_claims=[
                f"{request.friend_a} claims their account is accurate",
                f"{request.friend_b} claims their account is accurate",
                "Both parties disagree on key details"
            ],
            contradictions=[
                "Conflicting accounts of the incident",
                "Different interpretations of events"
            ],
            questions=[
                f"{request.friend_a}, can you provide specific details about when this incident occurred?",
                f"{request.friend_b}, what was your understanding of the situation at the time?",
                "Were there any witnesses to this incident?"
            ],
            evidence_assessment=[]
        )
    
    async def _demo_submit_answer(self, request: HearingAnswerRequest) -> HearingAnswerResponse:
        """Demo mode for answer processing"""
        # After 2-3 questions, conclude the hearing
        if len(request.answers) >= 3:
            return HearingAnswerResponse(
                success=True,
                follow_up_questions=[],
                needs_more_info=False
            )
        
        return HearingAnswerResponse(
            success=True,
            follow_up_questions=[
                "Can you provide any additional context that might help clarify the situation?"
            ],
            needs_more_info=True
        )
    
    async def _demo_conclude_hearing(self, request: HearingConcludeRequest) -> HearingConcludeResponse:
        """Demo mode with deterministic verdicts based on case content"""
        title_lower = request.title.lower()
        
        # Pizza case (Case 1) - GUILTY verdict
        if "pizza" in title_lower:
            verdict_detail = VerdictDetail(
                type="GUILTY",
                responsible_parties=[request.friend_b],
                severity=3,
                reasoning=f"[DEMO MODE] Based on the statements, {request.friend_a} claims to have communicated that the pizza was off-limits. {request.friend_b} claims the pizza appeared available. Without clear evidence of labeling or explicit communication beforehand, there is ambiguity. However, {request.friend_b} should have verified ownership before consuming food that wasn't theirs. The weight of evidence suggests {request.friend_b} should have been more cautious."
            )
            
            full_verdict = FullVerdict(
                case_summary="[DEMO MODE] Pizza consumption dispute. Clear communication about ownership was claimed but disputed.",
                key_claims=[
                    f"{request.friend_a} claims pizza was off-limits",
                    f"{request.friend_b} claims pizza appeared available",
                    "Different understanding of permission"
                ],
                contradictions=[
                    "Disagreement over whether permission was clearly communicated",
                    "Different interpretations of shared fridge rules"
                ],
                questions=[],
                evidence_assessment=[],
                verdict=verdict_detail,
                consequence=f"{request.friend_b} should replace the pizza or bring a equivalent snack as a gesture of goodwill.",
                friendship_recommendation="Establish clear guidelines about sharing food in shared spaces. Label personal items or have a conversation about expectations."
            )
            
            return HearingConcludeResponse(
                success=True,
                verdict=full_verdict,
                is_demo=True
            )
        
        # Missing evidence case (Case 2) - INSUFFICIENT_EVIDENCE
        if not request.evidence and len(request.conversation_history) < 2:
            verdict_detail = VerdictDetail(
                type="INSUFFICIENT_EVIDENCE",
                responsible_parties=[],
                severity=0,
                reasoning="[DEMO MODE] The statements provided are contradictory, but there is no evidence to support either account. Without additional evidence or witness testimony, it is impossible to determine what actually occurred."
            )
            
            full_verdict = FullVerdict(
                case_summary="[DEMO MODE] Dispute with conflicting statements and no supporting evidence.",
                key_claims=[
                    "Both parties provide conflicting accounts",
                    "No evidence submitted to verify claims"
                ],
                contradictions=[
                    "Direct contradiction between statements",
                    "No way to verify which account is accurate"
                ],
                questions=[],
                evidence_assessment=[],
                verdict=verdict_detail,
                consequence="No consequence assigned due to insufficient evidence.",
                friendship_recommendation="Consider this a learning experience about the importance of clear communication. In the future, document important agreements or discussions."
            )
            
            return HearingConcludeResponse(
                success=True,
                verdict=full_verdict,
                is_demo=True
            )
        
        # Shared responsibility case (Case 3) - PARTIALLY_RESPONSIBLE
        # Detect if both parties seem to have contributed
        verdict_detail = VerdictDetail(
            type="PARTIALLY_RESPONSIBLE",
            responsible_parties=[request.friend_a, request.friend_b],
            severity=4,
            reasoning=f"[DEMO MODE] Both {request.friend_a} and {request.friend_b} contributed to this dispute. Based on the statements, there appears to be miscommunication on both sides. {request.friend_a} may not have been clear enough, and {request.friend_b} may not have been careful enough. This is a shared responsibility situation."
        )
        
        full_verdict = FullVerdict(
            case_summary="[DEMO MODE] Dispute where both parties contributed to the misunderstanding.",
            key_claims=[
                f"{request.friend_a} has some responsibility",
                f"{request.friend_b} has some responsibility",
                "Miscommunication on both sides"
            ],
            contradictions=[
                "Both parties have valid points",
                "Neither party is entirely blameless"
            ],
            questions=[],
            evidence_assessment=[],
            verdict=verdict_detail,
            consequence=f"Both {request.friend_a} and {request.friend_b} should apologize to each other and agree to communicate more clearly in the future. {request.friend_b} can buy chai for both as a peace offering.",
            friendship_recommendation="Practice active listening and clarify assumptions before acting. Have a conversation about expectations to prevent similar misunderstandings."
        )
        
        return HearingConcludeResponse(
            success=True,
            verdict=full_verdict,
            is_demo=True
        )


# Singleton instance
ai_service = AIService()
