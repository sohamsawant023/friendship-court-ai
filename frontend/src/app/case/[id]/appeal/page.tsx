"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Evidence as EvidenceType } from "@/lib/types";
import { AppealResult, FullVerdict, submitAppeal } from "@/lib/api";
import { CourtLoadingMessage } from "@/components/ui/CourtLoadingMessage";

interface StoredCase {
  id: string;
  title: string;
  category: string;
  friendA: string;
  friendB: string;
  description: string;
  demoMode?: boolean;
  isDemoMode?: boolean;
  statementA?: { statement: string; context?: string };
  statementB?: { statement: string; context?: string };
  evidence?: Array<{ id: string; type: 'image' | 'text'; content: string; submittedBy?: string; submitted_by?: string }>;
  conversationHistory?: Array<{ question: string; answer: string; participant: string }>;
  fullVerdict?: FullVerdict;
  originalVerdict?: FullVerdict;
  appeals?: AppealResult[];
  latestAppealResult?: AppealResult;
  latestAppealModeMessage?: string;
}

function readableVerdict(type: string): string {
  return type.replace(/_/g, ' ');
}

export default function Appeal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<StoredCase | null>(null);
  const [counterArgument, setCounterArgument] = useState("");
  const [newEvidence, setNewEvidence] = useState<EvidenceType[]>([]);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidenceText, setNewEvidenceText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load case data from localStorage with error handling
    try {
      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const parsed = JSON.parse(savedCase);
        // Verify case ID matches
        if (parsed.id === params.id) {
          setCaseData(parsed);
          if (!parsed.fullVerdict) {
            setError("The original structured verdict is missing. Return to the case and generate its verdict before appealing.");
          }
        } else {
          router.push('/case/new');
        }
      } else {
        router.push('/case/new');
      }
    } catch (error) {
      console.error('Error loading case data:', error);
      router.push('/case/new');
    }
  }, [params.id, router]);

  const addEvidence = () => {
    if (!newEvidenceText.trim()) return;

    const evidence: EvidenceType = {
      id: `EVI-${Date.now()}`,
      type: 'text',
      content: newEvidenceText,
      submittedBy: 'Appellant'
    };

    setNewEvidence([...newEvidence, evidence]);
    setNewEvidenceText("");
    setShowAddEvidence(false);
  };

  const removeEvidence = (id: string) => {
    setNewEvidence(newEvidence.filter(e => e.id !== id));
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseData?.fullVerdict) {
      setError("The original structured verdict is unavailable. No appeal was submitted.");
      return;
    }
    if (!counterArgument.trim()) {
      setError("Counterargument is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const statements = [];
    if (caseData.statementA) {
      statements.push({ participant_name: caseData.friendA, statement_text: caseData.statementA.statement, explanation: caseData.statementA.context });
    }
    if (caseData.statementB) {
      statements.push({ participant_name: caseData.friendB, statement_text: caseData.statementB.statement, explanation: caseData.statementB.context });
    }

    try {
      const response = await submitAppeal({
        case_id: caseData.id,
        title: caseData.title,
        category: caseData.category,
        friend_a: caseData.friendA,
        friend_b: caseData.friendB,
        description: caseData.description,
        statements,
        evidence: (caseData.evidence || []).map((item) => ({
          id: item.id,
          type: item.type,
          content: item.content,
          submitted_by: item.submitted_by || item.submittedBy || "Unknown",
        })),
        demo_mode: caseData.demoMode === true || caseData.isDemoMode === true,
        conversation_history: caseData.conversationHistory || [],
        original_verdict: caseData.originalVerdict || caseData.fullVerdict,
        appeal_argument: counterArgument.trim(),
        new_evidence: newEvidence.map((item) => ({
          id: item.id,
          type: item.type,
          content: item.content,
          submitted_by: item.submittedBy,
        })),
      });

      if (!response.success) throw new Error("The appeal service did not confirm reassessment.");
      const caseRecord = JSON.parse(localStorage.getItem('newCase') || "{}");
      const updatedCase: StoredCase = {
        ...caseRecord,
        originalVerdict: caseRecord.originalVerdict || response.appeal.original_verdict,
        fullVerdict: response.appeal.updated_verdict,
        isDemoMode: response.is_demo,
        appeals: [...(caseRecord.appeals || []), response.appeal],
        latestAppealResult: response.appeal,
        latestAppealModeMessage: response.mode_message || "",
      };
      localStorage.setItem('newCase', JSON.stringify(updatedCase));
      router.push(`/case/${params.id}/appeal/result`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Appeal reassessment failed. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center">
          <p role={error ? "alert" : undefined} className="text-slate-400">{error || "Loading case information..."}</p>
        </div>
      </div>
    );
  }

  const originalVerdict = caseData.originalVerdict || caseData.fullVerdict;

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CourtLoadingMessage phase="appeal" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <div className="text-sm text-slate-500 font-mono mb-2">CASE #{params.id}</div>
        <h1 className="text-3xl font-bold text-white mb-2">File an Appeal</h1>
        <p className="text-slate-400">Disagree with the verdict? Present your case to the Appeals Court.</p>
      </div>

      <div className="space-y-6">
        {/* Current Verdict Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Original Verdict</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Verdict:</span>
              <span className="text-amber-500 font-medium">
                {originalVerdict ? readableVerdict(originalVerdict.verdict.type) : "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Responsible Party:</span>
              <span className="text-white">{originalVerdict?.verdict.responsible_parties.join(", ") || "None"}</span>
            </div>
            {originalVerdict && (
              <div className="text-xs text-slate-400">
                Severity: {originalVerdict.verdict.severity}/10
              </div>
            )}
          </div>
        </div>

        {/* Appeal Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <form onSubmit={handleSubmitAppeal} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Counterargument</label>
              <textarea 
                placeholder="Explain why you believe the verdict was incorrect..."
                rows={6}
                value={counterArgument}
                onChange={(e) => setCounterArgument(e.target.value)}
                className={`w-full bg-slate-950 border rounded-lg p-3 text-white focus:outline-none transition-colors resize-none ${
                  error ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-amber-500'
                }`}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {isSubmitting && <CourtLoadingMessage phase="appeal" compact />}

            {/* New Evidence Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">New Evidence (Optional)</label>
                <button
                  type="button"
                  onClick={() => setShowAddEvidence(!showAddEvidence)}
                  className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {showAddEvidence ? 'Cancel' : '+ Add Evidence'}
                </button>
              </div>

              {showAddEvidence && (
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                  <textarea
                    placeholder="Describe new evidence..."
                    rows={3}
                    value={newEvidenceText}
                    onChange={(e) => setNewEvidenceText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none mb-3"
                  />
                  <button
                    type="button"
                    onClick={addEvidence}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-1 px-4 rounded-lg text-sm transition-colors"
                  >
                    Add to Appeal
                  </button>
                </div>
              )}

              {/* Evidence List */}
              {newEvidence.length > 0 && (
                <div className="space-y-3">
                  {newEvidence.map((evidence) => (
                    <div key={evidence.id} className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-slate-500 font-mono">{evidence.id}</div>
                        <button
                          type="button"
                          onClick={() => removeEvidence(evidence.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-sm text-slate-300">{evidence.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !originalVerdict}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Reassessing...' : 'Submit Appeal'}
              </button>
            </div>
          </form>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-sm font-semibold text-amber-500 mb-1">Appeal Process</h4>
              <p className="text-xs text-slate-500">
                Appeals are reviewed by a different AI judge. This process is for entertainment purposes only 
                and should not be used for actual legal disputes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}