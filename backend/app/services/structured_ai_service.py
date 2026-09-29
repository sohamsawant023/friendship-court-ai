import asyncio
import base64
import json
import os
import re
from typing import Any, TypeVar

from pydantic import BaseModel, ValidationError

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.models.schemas import (
    AppealOutcome,
    AppealRequest,
    AppealResponse,
    AppealResult,
    Evidence,
    EvidenceAssessment,
    FullVerdict,
    HearingAnswerRequest,
    HearingAnswerResponse,
    HearingConcludeRequest,
    HearingConcludeResponse,
    HearingStartRequest,
    HearingStartResponse,
    VerdictDetail,
)


class AnalysisDraft(BaseModel):
    case_summary: str
    key_claims: list[str]
    contradictions: list[str]
    questions: list[str]
    evidence_assessment: list[EvidenceAssessment]


class FollowUpDraft(BaseModel):
    follow_up_questions: list[str]
    needs_more_info: bool


class AppealDraft(BaseModel):
    outcome: AppealOutcome
    appeal_reasoning: str
    new_evidence_assessment: list[EvidenceAssessment]
    what_changed: str
    updated_verdict: FullVerdict


ResponseModel = TypeVar("ResponseModel", bound=BaseModel)


class AIService:
    """Structured Gemini workflow with a deterministic, labeled demo fallback."""

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.force_demo = os.getenv("MOCK_AI_MODE", "false").lower() == "true"
        self.model = None
        self.initialization_error = False

        if self.api_key and genai is not None and not self.force_demo:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
            except Exception:
                self.initialization_error = True

    def _demo_reason(self, requested: bool, error: Exception | None = None) -> str:
        if requested or self.force_demo:
            return "Demo Mode is active. Responses are deterministic demo data."
        if not self.api_key:
            return "Gemini API key is not configured; deterministic Demo Mode was used."
        if genai is None or self.initialization_error:
            return "Gemini could not be initialized; deterministic Demo Mode was used."
        if isinstance(error, asyncio.TimeoutError):
            return "Gemini timed out; deterministic Demo Mode was used."
        if isinstance(error, (ValidationError, json.JSONDecodeError, ValueError)):
            return "Gemini returned an invalid structured response; deterministic Demo Mode was used."
        if error is not None:
            return "Gemini analysis failed; deterministic Demo Mode was used."
        return "Deterministic Demo Mode is active."

    def _should_use_demo(self, requested: bool) -> bool:
        return requested or self.force_demo or not self.api_key or self.model is None

    async def _generate_structured(
        self,
        prompt: str,
        response_model: type[ResponseModel],
        timeout: int,
        evidence: list[Evidence] | None = None,
    ) -> ResponseModel:
        if self.model is None or genai is None:
            raise RuntimeError("Gemini is not configured")

        contents: list[Any] = [prompt]
        if evidence:
            contents.extend(self._inline_images(evidence))

        generation_config = {
            "temperature": 0.2,
            "response_mime_type": "application/json",
            "response_schema": response_model,
        }

        for attempt in range(2):
            try:
                result = await asyncio.wait_for(
                    asyncio.to_thread(
                        self.model.generate_content,
                        contents,
                        generation_config=generation_config,
                    ),
                    timeout=timeout,
                )
                raw_response = getattr(result, "text", None)
                if not raw_response:
                    raise ValueError("Gemini returned an empty response")
                return response_model.model_validate_json(raw_response)
            except asyncio.TimeoutError:
                raise
            except (ValidationError, json.JSONDecodeError, ValueError):
                raise
            except Exception as error:
                if attempt == 0 and self._is_retryable(error):
                    continue
                raise

        raise RuntimeError("Gemini request failed")

    @staticmethod
    def _is_retryable(error: Exception) -> bool:
        status = getattr(error, "status_code", None)
        code = getattr(error, "code", None)
        if callable(code):
            code = code()
        if hasattr(code, "value"):
            code = code.value
        return status in {429, 500, 502, 503, 504} or code in {
            429,
            500,
            502,
            503,
            504,
            "RESOURCE_EXHAUSTED",
            "UNAVAILABLE",
            "DEADLINE_EXCEEDED",
        }

    @staticmethod
    def _inline_images(evidence: list[Evidence]) -> list[dict[str, Any]]:
        parts: list[dict[str, Any]] = []
        for item in evidence:
            if item.type != "image" or not item.content.startswith("data:image/"):
                continue
            try:
                header, encoded = item.content.split(",", 1)
                mime_type = header[5:].split(";", 1)[0]
                if mime_type not in {"image/jpeg", "image/png", "image/webp"}:
                    continue
                image_data = base64.b64decode(encoded, validate=True)
                if len(image_data) <= 4 * 1024 * 1024:
                    parts.append({"mime_type": mime_type, "data": image_data})
            except (ValueError, base64.binascii.Error):
                continue
        return parts

    async def start_hearing(self, request: HearingStartRequest) -> HearingStartResponse:
        if self._should_use_demo(request.demo_mode):
            return self._demo_start(request, self._demo_reason(request.demo_mode))

        prompt = f"""You are an impartial facilitator for a friendship-dispute entertainment app.
Analyze both participants' actual statements, the dispute description, and all supplied evidence.
Identify each side's concrete claims, specific contradictions, contextual or intent clues, and important unknowns.
Generate 2-4 follow-up questions that are unique to these facts and directed to the named participants.
Never assume guilt. If evidence is weak, say what cannot be established. Only assess evidence actually provided.
Text evidence can be assessed directly. Inspect image evidence only when image bytes are included; otherwise say its contents were unavailable.

CASE INPUT JSON:
{self._case_json(request)}

Return the requested JSON schema. Questions must name the participant they are for and ask about a concrete fact from this case."""

        try:
            draft = await self._generate_structured(prompt, AnalysisDraft, 35, request.evidence)
            return HearingStartResponse(
                success=True,
                case_summary=draft.case_summary,
                key_claims=draft.key_claims,
                contradictions=draft.contradictions,
                questions=draft.questions,
                evidence_assessment=self._normalize_assessments(
                    draft.evidence_assessment, request.evidence, analyze_images=True
                ),
                is_demo=False,
            )
        except Exception as error:
            return self._demo_start(request, self._demo_reason(False, error))

    async def submit_answer(self, request: HearingAnswerRequest) -> HearingAnswerResponse:
        if self._should_use_demo(request.demo_mode):
            return self._demo_answer(request, self._demo_reason(request.demo_mode))

        prompt = f"""You are continuing an impartial friendship-dispute analysis.
Use the complete case facts and all prior hearing turns below. Compare each answer with both original statements,
note clarifications or inconsistencies, and ask at most one new question only when a material fact remains unclear.
Questions must be specific to the submitted facts, address a named participant, and must not repeat any question already asked.
If the existing record is sufficient for a fair entertainment-only outcome, return no questions and needs_more_info=false.

CASE AND HEARING JSON:
{self._answer_json(request)}

Return only the requested JSON schema."""

        try:
            draft = await self._generate_structured(prompt, FollowUpDraft, 25, request.evidence)
            return HearingAnswerResponse(
                success=True,
                follow_up_questions=draft.follow_up_questions[:1],
                needs_more_info=bool(draft.needs_more_info and draft.follow_up_questions),
                is_demo=False,
            )
        except Exception as error:
            return self._demo_answer(request, self._demo_reason(False, error))

    async def conclude_hearing(
        self, request: HearingConcludeRequest
    ) -> HearingConcludeResponse:
        if self._should_use_demo(request.demo_mode):
            return self._demo_conclude(request, self._demo_reason(request.demo_mode))

        prompt = f"""You are an impartial facilitator for an entertainment-only friendship dispute.
Analyze both statements, the dispute description, supplied evidence, context/intent, and every follow-up answer.
Return a balanced conclusion. Distinguish verified facts from claims, identify contradictions and remaining unknowns,
and do not automatically declare either person guilty. INSUFFICIENT_EVIDENCE is appropriate when accounts conflict
without corroboration. PARTIALLY_RESPONSIBLE is appropriate when both participants materially contributed.
Choose GUILTY only when strong supplied evidence or a clear admission supports it. Responsible parties must be participant names.
Consequences must be harmless, voluntary, and limited to replacing a snack, apologizing, choosing a movie, or buying chai.
Never suggest legal action, humiliation, danger, punishment, or anything degrading. This is not legal advice.
Assess only supplied evidence. Do not claim to inspect an image unless inline image bytes are present.

CASE AND FULL HEARING JSON:
{self._conclude_json(request)}

Return every required field in the requested JSON schema."""

        try:
            draft = await self._generate_structured(prompt, FullVerdict, 45, request.evidence)
            verdict = self._guard_verdict(draft, request)
            verdict = verdict.model_copy(update={
                "evidence_assessment": self._normalize_assessments(
                    draft.evidence_assessment, request.evidence, analyze_images=True
                ),
                "consequence": self._safe_consequence(draft.consequence),
            })
            return HearingConcludeResponse(
                success=True,
                verdict=verdict,
                is_demo=False,
            )
        except Exception as error:
            return self._demo_conclude(request, self._demo_reason(False, error))

    async def reassess_appeal(self, request: AppealRequest) -> AppealResponse:
        if self._should_use_demo(request.demo_mode):
            return self._demo_appeal(request, self._demo_reason(request.demo_mode))

        prompt = f"""You are an impartial reviewer for an entertainment-only friendship dispute.
Reassess the ORIGINAL VERDICT using the complete original case, both statements, submitted evidence, every hearing question and answer,
the appellant's argument, and any new evidence. Do not automatically favor the appellant. An argument alone is not proof.
Return VERDICT_UPHELD when the record does not materially change the original reasoning, VERDICT_MODIFIED when responsibility,
severity, consequence, or reasoning should change, and VERDICT_OVERTURNED only when the new record undermines the original outcome.
INSUFFICIENT_EVIDENCE remains valid. Every consequence must be harmless, friendly, and entertainment-only.
Do not present the result as legal advice. Assess new text as claims, not authenticated documents; assess images only if bytes are included.

APPEAL INPUT JSON:
{self._appeal_json(request)}

Return the requested structured schema. Preserve the original verdict unchanged when the outcome is VERDICT_UPHELD."""

        try:
            draft = await self._generate_structured(prompt, AppealDraft, 45, request.new_evidence)
            same_outcome = self._same_verdict(draft.updated_verdict, request.original_verdict)
            outcome = draft.outcome
            updated_verdict = draft.updated_verdict
            what_changed = draft.what_changed
            if outcome == "VERDICT_UPHELD":
                updated_verdict = request.original_verdict
                what_changed = "The original verdict, responsibility, severity, and consequence are unchanged."
            elif same_outcome:
                outcome = "VERDICT_UPHELD"
                updated_verdict = request.original_verdict
                what_changed = "The reassessment found no substantive change to the original verdict."

            updated_verdict = updated_verdict.model_copy(update={
                "consequence": self._safe_consequence(updated_verdict.consequence)
            })
            result = AppealResult(
                outcome=outcome,
                original_verdict=request.original_verdict,
                appeal_argument=request.appeal_argument,
                appeal_reasoning=draft.appeal_reasoning,
                new_evidence_assessment=self._normalize_assessments(
                    draft.new_evidence_assessment, request.new_evidence, analyze_images=True
                ),
                what_changed=what_changed,
                updated_verdict=updated_verdict,
            )
            return AppealResponse(success=True, appeal=result, is_demo=False)
        except Exception as error:
            return self._demo_appeal(request, self._demo_reason(False, error))

    def _appeal_json(self, request: AppealRequest) -> str:
        return json.dumps({
            "case": json.loads(self._case_json(request)),
            "hearing_questions_and_answers": request.conversation_history,
            "original_verdict": request.original_verdict.model_dump(),
            "appeal_argument": request.appeal_argument,
            "new_evidence": [
                {
                    **item.model_dump(exclude={"content"}),
                    "content": item.content if item.type == "text" else (
                        "[image bytes supplied separately]"
                        if item.content.startswith("data:image/")
                        else "[image bytes unavailable for inspection]"
                    ),
                }
                for item in request.new_evidence
            ],
        }, ensure_ascii=False)

    def _demo_appeal(self, request: AppealRequest, reason: str) -> AppealResponse:
        original = request.original_verdict
        argument = request.appeal_argument.lower()
        original_context = self._combined_text(request).lower()
        new_text = " ".join(item.content for item in request.new_evidence if item.type == "text").lower()
        all_appeal_facts = f"{argument} {new_text}"
        permission_evidence = any(marker in new_text for marker in (
            "alice said i could", "permission to eat", "said it was okay to share",
            "alice said bob could", "bob could share", "told bob he could", "explicit permission",
        ))
        contradictory_evidence = any(marker in new_text for marker in (
            "bob did not eat", "bob didn't eat", "pizza was untouched", "another person ate",
        ))
        shared_context = any(marker in argument for marker in (
            "shared fridge", "shared refrigerator", "looked available", "ownership unclear", "no label",
        ))
        prior_admission = any(marker in original_context for marker in (
            "i should have asked", "i should have checked", "i knew it was reserved",
            "i knew it was yours", "i ignored your request",
        ))

        if permission_evidence or contradictory_evidence:
            outcome: AppealOutcome = "VERDICT_OVERTURNED"
            updated = original.model_copy(update={
                "case_summary": f"[DEMO MODE] Appeal review of {request.title} found new claims that directly challenge the original account.",
                "verdict": VerdictDetail(
                    type="NOT_GUILTY",
                    responsible_parties=[],
                    severity=0,
                    reasoning="[DEMO MODE] The new evidence claims permission was given or that Bob did not eat the item. If accurate, it undermines the original responsibility finding; Demo Mode cannot authenticate the evidence.",
                ),
                "consequence": "No consequence is assigned; the friends can clarify sharing expectations and move on.",
                "friendship_recommendation": "Discuss how shared-fridge food should be labeled and ask before taking it.",
            })
            appeal_reasoning = "The new evidence makes a factual claim that, if accurate, directly undermines the original responsibility finding. It is not independently authenticated in Demo Mode."
            what_changed = "The responsibility finding was overturned based on new evidence that disputes whether the event or lack of permission occurred."
        elif original.verdict.type == "GUILTY" and shared_context and not prior_admission:
            outcome = "VERDICT_MODIFIED"
            updated = original.model_copy(update={
                "case_summary": f"[DEMO MODE] Appeal review of {request.title} considered the shared-fridge context alongside the original statements.",
                "verdict": VerdictDetail(
                    type="INSUFFICIENT_EVIDENCE",
                    responsible_parties=[],
                    severity=0,
                    reasoning="[DEMO MODE] The appeal adds a plausible shared-fridge interpretation, while the record does not independently establish clear notice or intent. Responsibility cannot be assigned confidently.",
                ),
                "consequence": "No consequence is assigned; the friends can agree on clearer food-sharing expectations.",
                "friendship_recommendation": "Label reserved food and clarify whether fridge items are shared.",
            })
            appeal_reasoning = "The appeal's shared-fridge context reduces confidence in the original one-sided finding, but does not establish a contrary account as fact."
            what_changed = "The verdict changed from GUILTY to INSUFFICIENT_EVIDENCE; the assigned responsibility and consequence were removed."
        elif original.verdict.type == "INSUFFICIENT_EVIDENCE" and any(marker in new_text for marker in (
            "i ate it after", "i took it after", "i ignored the warning", "i knew it was reserved",
        )):
            outcome = "VERDICT_MODIFIED"
            updated = original.model_copy(update={
                "case_summary": f"[DEMO MODE] Appeal review of {request.title} considered a new claim that acknowledges the disputed action.",
                "verdict": VerdictDetail(
                    type="PARTIALLY_RESPONSIBLE",
                    responsible_parties=[request.friend_b],
                    severity=2,
                    reasoning="[DEMO MODE] The new text claims the item was taken despite a warning. If accurate, that supports limited responsibility, though the source remains unauthenticated.",
                ),
                "consequence": f"{request.friend_b} can replace the snack and agree to check before taking reserved food.",
            })
            appeal_reasoning = "The new text supplies a claim of an acknowledged action that was not established in the original record. Demo Mode cannot verify its source."
            what_changed = "The verdict changed from INSUFFICIENT_EVIDENCE to PARTIALLY_RESPONSIBLE based on a new claim about the disputed action."
        else:
            outcome = "VERDICT_UPHELD"
            updated = original
            appeal_reasoning = (
                "The appeal argument was considered against both statements, the original evidence, and the hearing answers. "
                "It adds context but no corroborating information that changes the original finding."
            )
            what_changed = "The original verdict, responsibility, severity, and consequence are unchanged."

        result = AppealResult(
            outcome=outcome,
            original_verdict=original,
            appeal_argument=request.appeal_argument,
            appeal_reasoning=appeal_reasoning,
            new_evidence_assessment=self._demo_assessments(request.new_evidence),
            what_changed=what_changed,
            updated_verdict=updated,
        )
        return AppealResponse(success=True, appeal=result, is_demo=True, mode_message=reason)

    @staticmethod
    def _same_verdict(first: FullVerdict, second: FullVerdict) -> bool:
        return (
            first.verdict.model_dump() == second.verdict.model_dump()
            and first.consequence == second.consequence
            and first.friendship_recommendation == second.friendship_recommendation
        )

    @staticmethod
    def _case_json(request: Any) -> str:
        return json.dumps({
            "case_id": request.case_id,
            "title": request.title,
            "category": request.category,
            "friend_a": request.friend_a,
            "friend_b": request.friend_b,
            "description": request.description,
            "statements": [statement.model_dump() for statement in request.statements],
            "evidence": [
                {
                    **evidence.model_dump(exclude={"content"}),
                    "content": evidence.content if evidence.type == "text" else (
                        "[image bytes supplied separately]"
                        if evidence.content.startswith("data:image/")
                        else "[image bytes unavailable for inspection]"
                    ),
                }
                for evidence in request.evidence
            ],
        }, ensure_ascii=False)

    def _answer_json(self, request: HearingAnswerRequest) -> str:
        return json.dumps({
            "case": json.loads(self._case_json(request)),
            "questions_asked": request.questions_asked,
            "answers": [answer.model_dump() for answer in request.answers],
        }, ensure_ascii=False)

    def _conclude_json(self, request: HearingConcludeRequest) -> str:
        return json.dumps({
            "case": json.loads(self._case_json(request)),
            "conversation_history": request.conversation_history,
        }, ensure_ascii=False)

    @staticmethod
    def _normalize_assessments(
        assessments: list[EvidenceAssessment],
        evidence: list[Evidence],
        analyze_images: bool,
    ) -> list[EvidenceAssessment]:
        by_id = {assessment.evidence_id: assessment for assessment in assessments}
        normalized: list[EvidenceAssessment] = []
        for item in evidence:
            assessment = by_id.get(item.id)
            if item.type == "image" and (not analyze_images or not AIService._inline_images([item])):
                normalized.append(EvidenceAssessment(
                    evidence_id=item.id,
                    credibility="low",
                    relevance="low",
                    notes="Image content was not supplied as inline image data, so it could not be inspected.",
                ))
            elif assessment:
                normalized.append(assessment)
            else:
                normalized.append(EvidenceAssessment(
                    evidence_id=item.id,
                    credibility="low",
                    relevance="medium",
                    notes="The evidence was supplied, but no assessment was returned for it.",
                ))
        return normalized

    @staticmethod
    def _combined_text(request: Any) -> str:
        parts = [request.title, request.category, request.description]
        for statement in request.statements:
            parts.extend([statement.statement_text, statement.explanation or ""])
        for item in request.evidence:
            if item.type == "text":
                parts.append(item.content)
        for turn in getattr(request, "conversation_history", []):
            parts.extend([turn.get("question", ""), turn.get("answer", "")])
        for turn in getattr(request, "answers", []):
            parts.extend([turn.question, turn.answer])
        return " ".join(parts)

    @staticmethod
    def _excerpt(text: str, limit: int = 115) -> str:
        compact = re.sub(r"\s+", " ", text).strip().strip(" .!?\"'")
        if len(compact) > limit:
            return compact[:limit].rsplit(" ", 1)[0] + "..."
        return compact

    @staticmethod
    def _dedupe(values: list[str]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for value in values:
            normalized = value.strip().casefold()
            if normalized and normalized not in seen:
                seen.add(normalized)
                result.append(value.strip())
        return result

    def _demo_start(self, request: HearingStartRequest, reason: str) -> HearingStartResponse:
        statements = request.statements
        claims = [
            f'{statement.participant_name} says: "{self._excerpt(statement.statement_text)}."'
            for statement in statements
        ]
        contradictions = []
        if len(statements) >= 2:
            contradictions.append(
                f"{statements[0].participant_name}'s account differs from "
                f"{statements[1].participant_name}'s account about the central event."
            )
        if "pizza" in self._combined_text(request).lower():
            contradictions.append("The accounts disagree about whether the pizza was clearly reserved or reasonably seemed shared.")

        if len(statements) >= 2:
            first_claim = self._excerpt(statements[0].statement_text, 80)
            second_claim = self._excerpt(statements[1].statement_text, 80)
            questions = [
                f"{request.friend_a}, what specific detail supports your account that {first_claim}?",
                f"{request.friend_b}, what did you observe that led you to say {second_claim}?",
            ]
        else:
            only_claim = self._excerpt(statements[0].statement_text) if statements else self._excerpt(request.description)
            questions = [
                f"{request.friend_a}, what detail can you provide to support this account: {only_claim}?",
                f"{request.friend_b}, what is your account of the specific event described as: {self._excerpt(request.description, 80)}?",
            ]

        text_evidence = [item for item in request.evidence if item.type == "text"]
        if text_evidence:
            questions.append(
                f"{text_evidence[0].submitted_by}, what part of the submitted text evidence relates to the disputed claim?"
            )

        summary = (
            f"[DEMO MODE] {request.title}: {request.friend_a} and {request.friend_b} "
            f"gave different accounts. The key issue is whether the stated expectation was clear in this context."
        )
        return HearingStartResponse(
            success=True,
            case_summary=summary,
            key_claims=claims,
            contradictions=contradictions,
            questions=self._dedupe(questions)[:4],
            evidence_assessment=self._demo_assessments(request.evidence),
            is_demo=True,
            mode_message=reason,
        )

    def _demo_answer(self, request: HearingAnswerRequest, reason: str) -> HearingAnswerResponse:
        if len(request.answers) >= 2:
            return HearingAnswerResponse(
                success=True,
                follow_up_questions=[],
                needs_more_info=False,
                is_demo=True,
                mode_message=reason,
            )

        latest = request.answers[-1] if request.answers else None
        if latest:
            other_participant = request.friend_b if latest.participant == request.friend_a else request.friend_a
            related_statement = next(
                (statement.statement_text for statement in request.statements
                 if statement.participant_name == other_participant),
                request.description,
            )
            question = (
                f"{other_participant}, how does {latest.participant}'s detail "
                f'"{self._excerpt(latest.answer, 75)}" compare with your account '
                f'"{self._excerpt(related_statement, 75)}"?'
            )
        else:
            question = (
                f"{request.friend_b}, what did you understand about the expectation described by "
                f"{request.friend_a} in this {request.category.lower()} dispute?"
            )

        return HearingAnswerResponse(
            success=True,
            follow_up_questions=self._dedupe([question]),
            needs_more_info=True,
            is_demo=True,
            mode_message=reason,
        )

    def _demo_conclude(
        self, request: HearingConcludeRequest, reason: str
    ) -> HearingConcludeResponse:
        contributors = self._contributing_parties(request)
        combined_text = self._combined_text(request).lower()
        has_evidence = bool(request.evidence)

        if len(contributors) >= 2:
            verdict_type = "PARTIALLY_RESPONSIBLE"
            responsible = contributors
            reasoning = (
                f"[DEMO MODE] Both {request.friend_a} and {request.friend_b} describe a part they could "
                "have handled differently. The record points to a shared misunderstanding, not a one-sided finding."
            )
            severity = 3
        elif contributors:
            verdict_type = "PARTIALLY_RESPONSIBLE"
            responsible = contributors
            reasoning = (
                f"[DEMO MODE] {contributors[0]} acknowledges a specific choice that contributed to the dispute. "
                "The other account is not independently corroborated, so this supports limited responsibility, not a finding of deliberate wrongdoing."
            )
            severity = 2
        elif not has_evidence:
            verdict_type = "INSUFFICIENT_EVIDENCE"
            responsible = []
            reasoning = (
                "[DEMO MODE] The statements conflict, and no supporting evidence was submitted. "
                "The available record cannot establish which account is accurate, so responsibility cannot fairly be assigned."
            )
            severity = 0
        elif "not" in combined_text and any(item.type == "text" for item in request.evidence):
            verdict_type = "INSUFFICIENT_EVIDENCE"
            responsible = []
            reasoning = (
                "[DEMO MODE] Text evidence was submitted, but this demo cannot reliably authenticate it or establish intent. "
                "It is not enough to make a confident one-sided finding."
            )
            severity = 1
        else:
            verdict_type = "INSUFFICIENT_EVIDENCE"
            responsible = []
            reasoning = "[DEMO MODE] The evidence provided does not resolve the central disagreement with enough confidence."
            severity = 0

        statements = request.statements
        if len(statements) >= 2:
            reasoning += (
                f" The central factual conflict is between {statements[0].participant_name}'s account "
                f'("{self._excerpt(statements[0].statement_text, 80)}") and '
                f'{statements[1].participant_name}\'s account ("{self._excerpt(statements[1].statement_text, 80)}").'
            )
        claims = [
            f'{statement.participant_name} says: "{self._excerpt(statement.statement_text)}."'
            for statement in statements
        ]
        contradictions = []
        if len(statements) >= 2:
            contradictions.append(
                f"{statements[0].participant_name} says \"{self._excerpt(statements[0].statement_text, 75)}\", "
                f"while {statements[1].participant_name} says \"{self._excerpt(statements[1].statement_text, 75)}\"."
            )
        questions = self._dedupe([
            turn.get("question", "") for turn in request.conversation_history
        ])
        if verdict_type == "INSUFFICIENT_EVIDENCE":
            consequence = "No consequence is assigned; the friends can agree on a clearer expectation and share chai if they both want to."
        elif len(responsible) == 2:
            consequence = "Both friends can apologize for their part and let the other choose the next movie."
        elif responsible:
            consequence = f"{responsible[0]} can replace the snack and agree to check before taking shared-fridge food next time."
        else:
            consequence = "The friends can talk through the misunderstanding and agree on clearer sharing rules."

        full_verdict = FullVerdict(
            case_summary=(
                f"[DEMO MODE] {request.title} concerns differing accounts from "
                f"{request.friend_a} and {request.friend_b}. The conclusion reflects the available statements, evidence, and answers."
            ),
            key_claims=claims,
            contradictions=contradictions,
            questions=questions,
            evidence_assessment=self._demo_assessments(request.evidence),
            verdict=VerdictDetail(
                type=verdict_type,
                responsible_parties=responsible,
                severity=severity,
                reasoning=reasoning,
            ),
            consequence=consequence,
            friendship_recommendation=(
                "Talk through what each person understood, then agree on a simple expectation for next time."
            ),
        )
        return HearingConcludeResponse(
            success=True,
            verdict=full_verdict,
            is_demo=True,
            mode_message=reason,
        )

    @staticmethod
    def _contributing_parties(request: HearingConcludeRequest) -> list[str]:
        markers = (
            "i should have", "i could have", "i failed to", "i was unclear", "my fault",
            "i assumed", "i should not have", "i shouldn't have", "i did not ask", "i didn't ask",
        )
        contributors: list[str] = []
        for participant in (request.friend_a, request.friend_b):
            text = " ".join(
                [statement.statement_text + " " + (statement.explanation or "")
                 for statement in request.statements if statement.participant_name == participant]
                + [turn.get("answer", "") for turn in request.conversation_history
                   if turn.get("participant") == participant]
            ).lower()
            if any(marker in text for marker in markers):
                contributors.append(participant)
        return contributors

    @staticmethod
    def _demo_assessments(evidence: list[Evidence]) -> list[EvidenceAssessment]:
        assessments = []
        for item in evidence:
            if item.type == "text":
                assessments.append(EvidenceAssessment(
                    evidence_id=item.id,
                    credibility="medium",
                    relevance="medium",
                    notes="Demo Mode can consider the submitted text, but cannot authenticate its source.",
                ))
            else:
                assessments.append(EvidenceAssessment(
                    evidence_id=item.id,
                    credibility="low",
                    relevance="low",
                    notes="Demo Mode does not inspect image contents; image data was not independently verified.",
                ))
        return assessments

    @staticmethod
    def _safe_consequence(consequence: str) -> str:
        lower = consequence.lower()
        unsafe_terms = ("punish", "humiliate", "shame", "hurt", "threat", "illegal", "force", "degrade")
        allowed_terms = ("replace", "apolog", "snack", "movie", "chai", "talk", "agree", "communicat")
        if any(term in lower for term in unsafe_terms) or not any(term in lower for term in allowed_terms):
            return "They can talk through the misunderstanding, agree on a clear expectation, and share chai if both want to."
        return consequence

    @staticmethod
    def _guard_verdict(draft: FullVerdict, request: HearingConcludeRequest) -> FullVerdict:
        if draft.verdict.type != "GUILTY":
            return draft
        all_text = AIService._combined_text(request).lower()
        clear_admission = any(phrase in all_text for phrase in (
            "i knew it was yours", "i knew it was reserved", "i knew you told me",
            "i ignored your request", "i ate it even though you told me not to",
            "i took it after you said not to",
        ))
        if clear_admission:
            return draft
        guarded_detail = draft.verdict.model_copy(update={
            "type": "INSUFFICIENT_EVIDENCE",
            "responsible_parties": [],
            "reasoning": draft.verdict.reasoning +
            " The record has no corroborating evidence or clear admission, so a guilt finding was not made.",
        })
        return draft.model_copy(update={"verdict": guarded_detail})


ai_service = AIService()