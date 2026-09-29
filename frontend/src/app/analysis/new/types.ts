export interface AnalysisCaseData {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  jurisdiction: string;
  relevantDates: string;
  parties: string[];
  documents: Array<{ id: string; name: string; size: number; type: string; status: string }>;
  facts: {
    summary: string;
    keyClaims: string[];
    contradictions: string[];
    parties: string[];
    dates: string[];
    events: string[];
    evidence: string[];
  } | null;
  laws: Array<{ id: number; name: string; section: string; explanation: string; relevance: string }> | null;
  similarCases: Array<{ id: string; name: string; court: string; year: string; issue: string; relevance: string; source: string }> | null;
  analysis: {
    summary: string;
    keyFacts: string[];
    relevantLaws: string[];
    argumentsA: string[];
    argumentsB: string[];
    supportingEvidence: string[];
    similarCases: string[];
    legalIssues: string[];
    questions: string[];
  } | null;
  report: string | null;
  currentStep?: number;
}
