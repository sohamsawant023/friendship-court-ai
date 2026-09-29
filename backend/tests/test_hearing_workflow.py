import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.structured_ai_service import AIService


class HearingWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.service = AIService()
        self.client = TestClient(app)

    def pizza_case(self) -> dict:
        return {
            "case_id": "FC-PIZZA",
            "title": "The Pizza Incident",
            "category": "Food",
            "friend_a": "Alice",
            "friend_b": "Bob",
            "description": "Alice says Bob ate pizza after being asked not to. Bob says the shared-fridge pizza looked available.",
            "statements": [
                {
                    "participant_name": "Alice",
                    "statement_text": "I told Bob not to eat the pizza because I saved it for lunch.",
                    "explanation": "We share a fridge but usually ask first.",
                },
                {
                    "participant_name": "Bob",
                    "statement_text": "The pizza was in the shared fridge and appeared available.",
                    "explanation": "Food is sometimes shared in our apartment.",
                },
            ],
            "evidence": [],
            "demo_mode": True,
        }

    def test_demo_workflow_uses_case_facts_and_returns_valid_verdict(self) -> None:
        case = self.pizza_case()
        with patch("app.api.hearing.ai_service", self.service):
            start = self.client.post("/api/hearing/start", json=case)
            self.assertEqual(start.status_code, 200)
            start_body = start.json()
            self.assertTrue(start_body["is_demo"])
            self.assertTrue(any("pizza" in question.lower() for question in start_body["questions"]))

            answer_request = {
                **case,
                "questions_asked": start_body["questions"],
                "answers": [
                    {
                        "question": start_body["questions"][0],
                        "answer": "I should have checked before taking it.",
                        "participant": "Bob",
                    }
                ],
            }
            answer = self.client.post("/api/hearing/answer", json=answer_request)
            self.assertEqual(answer.status_code, 200)
            answer_body = answer.json()
            self.assertTrue(answer_body["is_demo"])
            self.assertTrue(answer_body["follow_up_questions"])

            conclude_request = {
                **case,
                "conversation_history": answer_request["answers"],
            }
            conclude = self.client.post("/api/hearing/conclude", json=conclude_request)
            self.assertEqual(conclude.status_code, 200)
            verdict = conclude.json()
            self.assertTrue(verdict["is_demo"])
            self.assertIn(verdict["verdict"]["verdict"]["type"], {
                "GUILTY", "NOT_GUILTY", "PARTIALLY_RESPONSIBLE", "INSUFFICIENT_EVIDENCE"
            })
            self.assertTrue(verdict["verdict"]["key_claims"])

    def test_conflicting_statements_without_evidence_allow_insufficient_evidence(self) -> None:
        case = self.pizza_case()
        case.update({
            "title": "The Missing Charger",
            "category": "Friendship",
            "description": "Two conflicting accounts about where a charger was left.",
            "statements": [
                {"participant_name": "Alice", "statement_text": "I left the charger on the desk."},
                {"participant_name": "Bob", "statement_text": "The charger was not on the desk when I arrived."},
            ],
        })
        with patch("app.api.hearing.ai_service", self.service):
            response = self.client.post("/api/hearing/conclude", json={
                **case,
                "conversation_history": [],
            })
        self.assertEqual(response.status_code, 200)
        verdict = response.json()["verdict"]["verdict"]
        self.assertEqual(verdict["type"], "INSUFFICIENT_EVIDENCE")
        self.assertEqual(verdict["responsible_parties"], [])

    def test_both_parties_contributing_allows_partial_responsibility(self) -> None:
        case = self.pizza_case()
        case.update({
            "title": "The Unclear Movie Plan",
            "description": "Both friends forgot to confirm the agreed movie time.",
            "statements": [
                {"participant_name": "Alice", "statement_text": "I should have confirmed the time before leaving."},
                {"participant_name": "Bob", "statement_text": "I should have checked the message instead of assuming."},
            ],
        })
        with patch("app.api.hearing.ai_service", self.service):
            response = self.client.post("/api/hearing/conclude", json={
                **case,
                "conversation_history": [],
            })
        self.assertEqual(response.status_code, 200)
        verdict = response.json()["verdict"]["verdict"]
        self.assertEqual(verdict["type"], "PARTIALLY_RESPONSIBLE")
        self.assertEqual(verdict["responsible_parties"], ["Alice", "Bob"])

    def test_demo_questions_change_with_case_facts(self) -> None:
        first = self.pizza_case()
        second = self.pizza_case()
        second.update({
            "title": "The Shared Umbrella",
            "category": "Friendship",
            "description": "Alice says Bob borrowed her umbrella during a storm and did not return it.",
            "statements": [
                {"participant_name": "Alice", "statement_text": "I lent Bob my red umbrella before the rain started."},
                {"participant_name": "Bob", "statement_text": "I thought Alice said I could keep it until the weekend."},
            ],
        })
        first_result = asyncio.run(self.service.start_hearing(
            self.start_request(first)
        ))
        second_result = asyncio.run(self.service.start_hearing(
            self.start_request(second)
        ))
        self.assertNotEqual(first_result.questions, second_result.questions)
        self.assertNotEqual(first_result.key_claims, second_result.key_claims)
        from app.models.schemas import HearingConcludeRequest

        first_verdict = asyncio.run(self.service.conclude_hearing(
            HearingConcludeRequest.model_validate({**first, "conversation_history": []})
        ))
        second_verdict = asyncio.run(self.service.conclude_hearing(
            HearingConcludeRequest.model_validate({**second, "conversation_history": []})
        ))
        self.assertNotEqual(
            first_verdict.verdict.verdict.reasoning,
            second_verdict.verdict.verdict.reasoning,
        )

    def test_malformed_gemini_json_uses_labeled_demo_fallback(self) -> None:
        class MalformedModel:
            def generate_content(self, *args, **kwargs):
                return SimpleNamespace(text="not valid json")

        service = AIService()
        service.api_key = "test-key"
        service.force_demo = False
        service.model = MalformedModel()
        with patch("app.services.structured_ai_service.genai", object()):
            response = asyncio.run(service.start_hearing(
                self.start_request(self.pizza_case(), demo_mode=False)
            ))
        self.assertTrue(response.is_demo)
        self.assertIn("invalid structured response", response.mode_message)

    def appeal_request(self, verdict_type: str, argument: str, new_evidence: list | None = None) -> dict:
        case = self.pizza_case()
        case["conversation_history"] = [
            {"question": "Did you check first?", "answer": "I should have asked.", "participant": "Bob"}
        ]
        case["original_verdict"] = {
            "case_summary": "Original pizza dispute review.",
            "key_claims": ["Alice says the pizza was reserved.", "Bob says it looked available."],
            "contradictions": ["The parties disagree about permission."],
            "questions": ["Did Bob see a label?"],
            "evidence_assessment": [],
            "verdict": {
                "type": verdict_type,
                "responsible_parties": ["Bob"] if verdict_type != "INSUFFICIENT_EVIDENCE" else [],
                "severity": 3 if verdict_type != "INSUFFICIENT_EVIDENCE" else 0,
                "reasoning": "Original hearing reasoning.",
            },
            "consequence": "Bob can replace the snack and apologize.",
            "friendship_recommendation": "Clarify fridge-sharing expectations.",
        }
        case["appeal_argument"] = argument
        case["new_evidence"] = new_evidence or []
        return case

    def test_appeal_endpoint_upholds_partial_verdict_when_argument_adds_no_evidence(self) -> None:
        request = self.appeal_request("PARTIALLY_RESPONSIBLE", "The shared fridge made ownership unclear.")
        with patch("app.api.appeal.ai_service", self.service):
            response = self.client.post("/api/appeal", json=request)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["appeal"]["outcome"], "VERDICT_UPHELD")
        self.assertEqual(body["appeal"]["original_verdict"]["verdict"]["type"], "PARTIALLY_RESPONSIBLE")
        self.assertEqual(body["appeal"]["updated_verdict"]["verdict"]["type"], "PARTIALLY_RESPONSIBLE")

    def test_appeal_endpoint_can_modify_guilty_to_insufficient_evidence(self) -> None:
        request = self.appeal_request("GUILTY", "The shared fridge made ownership unclear.")
        request["conversation_history"] = []
        with patch("app.api.appeal.ai_service", self.service):
            response = self.client.post("/api/appeal", json=request)
        self.assertEqual(response.status_code, 200)
        appeal = response.json()["appeal"]
        self.assertEqual(appeal["outcome"], "VERDICT_MODIFIED")
        self.assertEqual(appeal["updated_verdict"]["verdict"]["type"], "INSUFFICIENT_EVIDENCE")

    def test_appeal_endpoint_can_overturn_on_case_specific_new_evidence(self) -> None:
        request = self.appeal_request(
            "GUILTY",
            "Bob had permission to take the pizza.",
            [{
                "id": "EVI-NEW-1",
                "type": "text",
                "content": "Alice said Bob could share the pizza.",
                "submitted_by": "Bob",
            }],
        )
        request["conversation_history"] = []
        with patch("app.api.appeal.ai_service", self.service):
            response = self.client.post("/api/appeal", json=request)
        self.assertEqual(response.status_code, 200)
        appeal = response.json()["appeal"]
        self.assertEqual(appeal["outcome"], "VERDICT_OVERTURNED")
        self.assertEqual(appeal["updated_verdict"]["verdict"]["type"], "NOT_GUILTY")
        self.assertEqual(appeal["new_evidence_assessment"][0]["evidence_id"], "EVI-NEW-1")

    @staticmethod
    def start_request(case: dict, demo_mode: bool | None = None):
        from app.models.schemas import HearingStartRequest

        request = {**case}
        if demo_mode is not None:
            request["demo_mode"] = demo_mode
        return HearingStartRequest.model_validate(request)


if __name__ == "__main__":
    unittest.main()