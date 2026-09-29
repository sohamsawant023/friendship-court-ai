"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Verdict as VerdictType } from "@/lib/types";
import { concludeHearing, FullVerdict } from "@/lib/api";
import { GlassCard, GlassButton } from "@/components/ui";
import { AnimatedHeading, StatusBadge } from "@/components/ui";
import { CourtLoadingMessage } from "@/components/ui/CourtLoadingMessage";
import { CourtAnnouncementButton } from "@/components/ui/CourtAnnouncementButton";
import { ChevronRight, Scale, FileText, AlertTriangle } from "lucide-react";

export default function Verdict({ params }: { params: { id: string } }) {
  const router = useRouter();
  const verdictStarted = useRef(false);
  const [caseData, setCaseData] = useState<{ title: string; friendA: string; friendB: string; category: string; description: string; demoMode?: boolean; statementA?: { statement: string; context: string }; statementB?: { statement: string; context: string }; evidence?: Array<{ id: string; type: string; content: string; submittedBy: string; submitted_by?: string }>; conversationHistory?: Array<{ question: string; answer: string; participant: string }> } | null>(null);
  const [verdict, setVerdict] = useState<VerdictType | null>(null);
  const [fullVerdict, setFullVerdict] = useState<FullVerdict | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [modeMessage, setModeMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (verdictStarted.current) return;
    verdictStarted.current = true;

    try {
      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const parsed = JSON.parse(savedCase);
        if (parsed.id === params.id) {
          setCaseData(parsed);
          setIsDemoMode(parsed.demoMode || false);
          generateVerdict(parsed);
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

  const generateVerdict = async (parsed: { id: string; title: string; category: string; friendA: string; friendB: string; description: string; demoMode?: boolean; statementA?: { statement: string; context: string }; statementB?: { statement: string; context: string }; evidence?: Array<{ id: string; type: string; content: string; submittedBy: string; submitted_by?: string }>; conversationHistory?: Array<{ question: string; answer: string; participant: string }> }) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const statements = [];
      if (parsed.statementA) {
        statements.push({
          participant_name: parsed.friendA,
          statement_text: parsed.statementA.statement,
          explanation: parsed.statementA.context
        });
      }
      if (parsed.statementB) {
        statements.push({
          participant_name: parsed.friendB,
          statement_text: parsed.statementB.statement,
          explanation: parsed.statementB.context
        });
      }

      const response = await concludeHearing({
        case_id: parsed.id,
        title: parsed.title,
        category: parsed.category,
        friend_a: parsed.friendA,
        friend_b: parsed.friendB,
        description: parsed.description,
        statements,
        evidence: (parsed.evidence || []).map((ev: { id: string; type: string; content: string; submittedBy: string; submitted_by?: string }) => ({
          id: ev.id,
          type: ev.type as 'image' | 'text',
          content: ev.content,
          submitted_by: ev.submitted_by || ev.submittedBy || "Unknown"
        })),
        conversation_history: parsed.conversationHistory || [],
        demo_mode: parsed.demoMode === true
      });

      setIsDemoMode(response.is_demo);
      setModeMessage(response.mode_message || "");
      setFullVerdict(response.verdict);

      const typeMapping: Record<string, 'GUILTY' | 'NOT GUILTY' | 'PARTIALLY RESPONSIBLE' | 'INSUFFICIENT EVIDENCE'> = {
        'GUILTY': 'GUILTY',
        'NOT_GUILTY': 'NOT GUILTY',
        'PARTIALLY_RESPONSIBLE': 'PARTIALLY RESPONSIBLE',
        'INSUFFICIENT_EVIDENCE': 'INSUFFICIENT EVIDENCE'
      };
      
      const legacyVerdict: VerdictType = {
        verdictType: typeMapping[response.verdict.verdict.type] || 'INSUFFICIENT_EVIDENCE',
        responsibleParty: response.verdict.verdict.responsible_parties.join(", ") || "None",
        severityScore: response.verdict.verdict.severity,
        evidenceStrength: response.verdict.evidence_assessment.length > 0 ? "Reviewed" : "None submitted",
        keyFindings: response.verdict.key_claims,
        reasoning: response.verdict.verdict.reasoning,
        consequence: response.verdict.consequence,
        friendshipRecommendation: response.verdict.friendship_recommendation
      };
      setVerdict(legacyVerdict);

      const storedCase = localStorage.getItem('newCase');
      if (storedCase) {
        const caseRecord = JSON.parse(storedCase);
        if (caseRecord.id === parsed.id) {
          caseRecord.fullVerdict = response.verdict;
          caseRecord.verdict = legacyVerdict;
          caseRecord.isDemoMode = response.is_demo;
          localStorage.setItem('newCase', JSON.stringify(caseRecord));
        }
      }

    } catch (error) {
      console.error('Error generating verdict:', error);
      setErrorMessage(error instanceof Error ? error.message : "The verdict service could not be reached.");
    }
    
    setIsLoading(false);
  };

  const handleAppeal = () => {
    router.push(`/case/${params.id}/appeal`);
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CourtLoadingMessage phase="verdict" />
      </div>
    );
  }

  if (!caseData || !verdict || !fullVerdict) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚖️</div>
          <p role={errorMessage ? "alert" : undefined} className="text-textSecondary">
            {errorMessage || "Unable to load verdict."}
          </p>
          {caseData && errorMessage && (
            <button
              onClick={() => generateVerdict({ ...caseData, id: params.id })}
              className="mt-4 bg-accentGold hover:bg-accentGold/80 text-background font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Retry Analysis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <AnimatedHeading delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status="resolved" />
              <span className="text-xs font-mono text-textSecondary">CASE #{params.id}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Case perspective
            </h1>
            <p className="text-lg text-textSecondary">An AI-generated review to help you continue the conversation.</p>
          </div>
        </AnimatedHeading>

        <div className="space-y-6">
          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accentGold/10 border border-accentGold/20 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-accentGold">
                <span className="text-xl">🎭</span>
                <span className="font-semibold">Demo Mode</span>
              </div>
              <p className="text-sm text-accentGold/80 mt-1">{modeMessage || "Deterministic demo data was used for this analysis."}</p>
            </motion.div>
          )}

          {/* Case Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard variant="primary" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-accentCyan" />
                <h3 className="text-lg font-semibold text-white">Case Summary</h3>
              </div>
              <p className="text-textPrimary leading-relaxed">{fullVerdict.case_summary}</p>
            </GlassCard>
          </motion.div>

          {/* Verdict Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard variant="highlight" className="p-8 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-5xl mb-4"
              >
                ⚖️
              </motion.div>
              <h2 className="text-4xl font-bold mb-2 text-gradient">{verdict.verdictType}</h2>
              <p className="text-lg text-textPrimary">Responsible Party: <span className="font-semibold text-accentGold">{verdict.responsibleParty}</span></p>
              <CourtAnnouncementButton text="The court has reached a verdict. Please try not to start another argument." label="Hear verdict announcement" />
            </GlassCard>
          </motion.div>

          {/* Case Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard variant="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Case Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-textSecondary uppercase font-semibold mb-1">Case Number</div>
                  <div className="text-textPrimary">#{params.id}</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary uppercase font-semibold mb-1">Category</div>
                  <div className="text-textPrimary">{caseData.category}</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary uppercase font-semibold mb-1">Severity</div>
                  <div className="text-textPrimary">{verdict.severityScore}/10</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary uppercase font-semibold mb-1">Evidence Strength</div>
                  <div className="text-textPrimary">{verdict.evidenceStrength}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {fullVerdict.contradictions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard variant="secondary" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-accentGold" />
                  <h3 className="text-lg font-semibold text-white">Contradictions</h3>
                </div>
                <ul className="space-y-3">
                  {fullVerdict.contradictions.map((item, index) => (
                    <li key={`${index}-${item}`} className="text-textPrimary flex items-start gap-2">
                      <span className="text-accentGold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          )}

          {fullVerdict.questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard variant="secondary" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-5 h-5 text-accentCyan" />
                  <h3 className="text-lg font-semibold text-white">Hearing Questions</h3>
                </div>
                <ul className="space-y-3">
                  {fullVerdict.questions.map((item, index) => (
                    <li key={`${index}-${item}`} className="text-textPrimary p-3 bg-surface rounded-lg border border-glassBorder">
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          )}

          {fullVerdict.evidence_assessment.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GlassCard variant="secondary" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-accentGold" />
                  <h3 className="text-lg font-semibold text-white">Evidence Assessment</h3>
                </div>
                <ul className="space-y-4">
                  {fullVerdict.evidence_assessment.map((item) => (
                    <li key={item.evidence_id} className="border-t border-glassBorder pt-3 first:border-0 first:pt-0">
                      <div className="text-sm font-medium text-textPrimary">{item.evidence_id}</div>
                      <div className="text-xs text-textSecondary">Credibility: {item.credibility} · Relevance: {item.relevance}</div>
                      <p className="mt-1 text-sm text-textPrimary">{item.notes}</p>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          )}

          {/* Key Findings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <GlassCard variant="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
              <ul className="space-y-3">
                {verdict.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-accentGold mt-1">•</span>
                    <span className="text-textPrimary">{finding}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* Reasoning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <GlassCard variant="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reasoning</h3>
              <p className="text-textPrimary leading-relaxed">{verdict.reasoning}</p>
            </GlassCard>
          </motion.div>

          {/* Consequence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <GlassCard variant="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Consequence</h3>
              <p className="text-textPrimary leading-relaxed">{verdict.consequence}</p>
            </GlassCard>
          </motion.div>

          {/* Friendship Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <GlassCard variant="secondary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Friendship Recommendation</h3>
              <p className="text-textPrimary leading-relaxed">{verdict.friendshipRecommendation}</p>
            </GlassCard>
          </motion.div>

          {/* Appeal Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <GlassCard variant="primary" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Disagree with the verdict?</h3>
              <p className="text-textSecondary mb-6">You have the right to appeal this decision within 7 days.</p>
              <div className="flex gap-4">
                <GlassButton
                  onClick={handleAppeal}
                  variant="primary"
                  className="px-8"
                >
                  File an Appeal
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
                <GlassButton
                  onClick={handleBackToDashboard}
                  variant="secondary"
                  className="px-8"
                >
                  Return to Dashboard
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <GlassCard variant="secondary" className="p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="text-sm font-semibold text-accentGold mb-1">Entertainment Only</h4>
                  <p className="text-xs text-textSecondary">
                    This verdict is generated by an AI for entertainment purposes only. It is not legal advice, 
                    not binding, and should not be taken seriously. Please resolve real disputes through appropriate channels.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
