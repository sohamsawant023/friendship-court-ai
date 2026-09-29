const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Statement {
  participant_name: string;
  statement_text: string;
  explanation?: string;
}

export interface Evidence {
  id: string;
  type: 'image' | 'text';
  content: string;
  submitted_by: string;
}

export interface EvidenceAssessment {
  evidence_id: string;
  credibility: 'high' | 'medium' | 'low';
  relevance: 'high' | 'medium' | 'low';
  notes: string;
}

export interface HearingStartRequest {
  case_id: string;
  title: string;
  category: string;
  friend_a: string;
  friend_b: string;
  description: string;
  statements: Statement[];
  evidence: Evidence[];
  demo_mode: boolean;
}

export interface HearingStartResponse {
  success: boolean;
  case_summary: string;
  key_claims: string[];
  contradictions: string[];
  questions: string[];
  evidence_assessment: EvidenceAssessment[];
  is_demo: boolean;
  mode_message?: string | null;
}

export interface HearingAnswerRequest extends HearingStartRequest {
  questions_asked: string[];
  answers: Array<{ question: string; answer: string; participant: string }>;
}

export interface HearingAnswerResponse {
  success: boolean;
  follow_up_questions: string[];
  needs_more_info: boolean;
  is_demo: boolean;
  mode_message?: string | null;
}

export interface HearingConcludeRequest extends HearingStartRequest {
  conversation_history: Array<{ question: string; answer: string; participant: string }>;
}

export interface VerdictDetail {
  type: 'GUILTY' | 'NOT_GUILTY' | 'PARTIALLY_RESPONSIBLE' | 'INSUFFICIENT_EVIDENCE';
  responsible_parties: string[];
  severity: number;
  reasoning: string;
}

export interface FullVerdict {
  case_summary: string;
  key_claims: string[];
  contradictions: string[];
  questions: string[];
  evidence_assessment: EvidenceAssessment[];
  verdict: VerdictDetail;
  consequence: string;
  friendship_recommendation: string;
}

export interface HearingConcludeResponse {
  success: boolean;
  verdict: FullVerdict;
  is_demo: boolean;
  mode_message?: string | null;
}

export type AppealOutcome = 'VERDICT_UPHELD' | 'VERDICT_MODIFIED' | 'VERDICT_OVERTURNED';

export interface AppealRequest extends HearingStartRequest {
  conversation_history: Array<{ question: string; answer: string; participant: string }>;
  original_verdict: FullVerdict;
  appeal_argument: string;
  new_evidence: Evidence[];
}

export interface AppealResult {
  outcome: AppealOutcome;
  original_verdict: FullVerdict;
  appeal_argument: string;
  appeal_reasoning: string;
  new_evidence_assessment: EvidenceAssessment[];
  what_changed: string;
  updated_verdict: FullVerdict;
}

export interface AppealResponse {
  success: boolean;
  appeal: AppealResult;
  is_demo: boolean;
  mode_message?: string | null;
}

async function postJson<T>(path: string, request: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let detail = response.statusText || 'The backend could not process the request.';
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch {
      // Keep the HTTP status message when the response has no JSON body.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function startHearing(request: HearingStartRequest): Promise<HearingStartResponse> {
  return postJson('/api/hearing/start', request);
}

export function submitAnswer(request: HearingAnswerRequest): Promise<HearingAnswerResponse> {
  return postJson('/api/hearing/answer', request);
}

export function concludeHearing(request: HearingConcludeRequest): Promise<HearingConcludeResponse> {
  return postJson('/api/hearing/conclude', request);
}

export function submitAppeal(request: AppealRequest): Promise<AppealResponse> {
  return postJson('/api/appeal', request);
}
