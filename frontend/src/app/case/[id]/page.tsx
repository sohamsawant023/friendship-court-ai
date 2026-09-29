"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SectionReveal } from "@/components/layout/SectionReveal";
import { CourtLoadingMessage } from "@/components/ui/CourtLoadingMessage";
import { ShieldAlert, FileText, Bot, FileSearch, ArrowRight, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import { startHearing, submitAnswer, HearingStartRequest, HearingStartResponse } from "@/lib/api";

interface CaseDraft {
  id: string;
  title: string;
  category: string;
  friendA: string;
  friendB: string;
  description: string;
  demoMode?: boolean;
  statementA?: { statement: string; context?: string };
  statementB?: { statement: string; context?: string };
  evidence?: Array<{ id: string; type: 'image' | 'text'; content: string; submittedBy?: string; submitted_by?: string }>;
  conversationHistory?: ConversationEntry[];
}

interface ConversationEntry {
  question: string;
  answer: string;
  participant: string;
}

interface HearingMessage {
  id: string;
  content: string;
  participant?: string;
  type: 'ai' | 'user';
}

function toHearingRequest(caseData: CaseDraft): HearingStartRequest {
  const statements = [];
  if (caseData.statementA) {
    statements.push({ participant_name: caseData.friendA, statement_text: caseData.statementA.statement, explanation: caseData.statementA.context });
  }
  if (caseData.statementB) {
    statements.push({ participant_name: caseData.friendB, statement_text: caseData.statementB.statement, explanation: caseData.statementB.context });
  }
  return {
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
    demo_mode: caseData.demoMode === true,
  };
}

export default function ActiveHearing({ params }: { params: { id: string } }) {
  const router = useRouter();
  const initialized = useRef(false);
  const [caseData, setCaseData] = useState<CaseDraft | null>(null);
  const [messages, setMessages] = useState<HearingMessage[]>([]);
  const [analysis, setAnalysis] = useState<HearingStartResponse | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [modeMessage, setModeMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const initialize = async (parsed: CaseDraft) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await startHearing(toHearingRequest(parsed));
      const initialQuestions = response.questions.map((item) => item.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
      setCaseData(parsed);
      setAnalysis(response);
      setQuestions(initialQuestions);
      setIsDemoMode(response.is_demo);
      setModeMessage(response.mode_message || "");
      setMessages([{ id: "opening", content: response.case_summary, type: "ai" }]);
      if (initialQuestions.length) {
        const firstQuestion = initialQuestions[0];
        const participant = firstQuestion.includes(parsed.friendA) ? parsed.friendA : parsed.friendB;
        setCurrentParticipant(participant);
        setMessages((previous) => [...previous, { id: "question-0", content: firstQuestion, participant, type: "ai" }]);
        setProgress(30);
      } else {
        setProgress(100);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The hearing service could not be reached.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const savedCase = localStorage.getItem("newCase");
      if (!savedCase) {
        router.push("/case/new");
        return;
      }
      const parsed = JSON.parse(savedCase) as CaseDraft;
      if (parsed.id !== params.id) {
        router.push("/case/new");
        return;
      }
      setCaseData(parsed);
      void initialize(parsed);
    } catch {
      router.push("/case/new");
    }
  }, [params.id, router]);

  const submitCurrentAnswer = async () => {
    if (!caseData || !answer.trim() || isSubmitting || !questions[questionIndex]) return;
    const entry = { question: questions[questionIndex], answer: answer.trim(), participant: currentParticipant };
    const updatedHistory = [...conversationHistory, entry];
    setIsSubmitting(true);
    setErrorMessage("");
    setMessages((previous) => [...previous, { id: `answer-${Date.now()}`, content: entry.answer, participant: currentParticipant, type: "user" }]);
    setConversationHistory(updatedHistory);
    setAnswer("");
    try {
      const response = await submitAnswer({
        ...toHearingRequest(caseData),
        questions_asked: questions.slice(0, questionIndex + 1),
        answers: updatedHistory,
      });
      setIsDemoMode(response.is_demo);
      setModeMessage(response.mode_message || "");
      const queuedQuestion = questions[questionIndex + 1];
      const generatedQuestion = response.follow_up_questions.find((item) => !questions.includes(item));
      const nextQuestion = queuedQuestion || generatedQuestion;
      if (nextQuestion) {
        if (!queuedQuestion && generatedQuestion) setQuestions((previous) => [...previous, generatedQuestion]);
        const participant = nextQuestion.includes(caseData.friendA) ? caseData.friendA : caseData.friendB;
        setCurrentParticipant(participant);
        setMessages((previous) => [...previous, { id: `question-${Date.now()}`, content: nextQuestion, participant, type: "ai" }]);
        setQuestionIndex((previous) => previous + 1);
        setProgress((previous) => Math.min(previous + 15, 79));
      } else {
        setProgress(100);
      }
    } catch (error) {
      setConversationHistory(conversationHistory);
      setMessages((previous) => previous.filter((item) => item.type !== "user" || item.content !== entry.answer));
      setAnswer(entry.answer);
      setErrorMessage(error instanceof Error ? error.message : "The answer could not be analyzed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishHearing = () => {
    if (!caseData || progress < 100) return;
    localStorage.setItem("newCase", JSON.stringify({ ...caseData, conversationHistory, isDemoMode }));
    router.push(`/case/${params.id}/verdict`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex min-h-64 items-center justify-center">
        <CourtLoadingMessage phase="hearing" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Header */}
      <SectionReveal delay={0.1}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">WORKSPACE // {params.id}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-accentCyan/10 text-accentCyan border border-accentCyan/20 animate-pulse">
                Hearing Active
              </span>
            </div>
            <p className="text-sm text-textSecondary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accentGold"></span>
              {isDemoMode ? `Demo Mode: ${modeMessage || "Deterministic responses are active."}` : "AI analysis ready"}
            </p>
          </div>
          <div className="flex gap-3">
            <GlassButton variant="secondary" className="py-2" onClick={() => router.push(`/case/${params.id}/evidence`)}>Back to Evidence</GlassButton>
            <GlassButton variant="primary" className="py-2" onClick={finishHearing} disabled={progress < 100}>Generate Verdict</GlassButton>
          </div>
        </div>
      </SectionReveal>

      {errorMessage && (
        <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage}
          {!messages.length && caseData && <button className="ml-3 underline" onClick={() => void initialize(caseData)}>Retry</button>}
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT: Case Info */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-2 pb-4">
          <SectionReveal delay={0.2}>
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-textSecondary font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Case Details
              </h3>
              <div>
                <h4 className="text-lg font-medium text-white mb-1">{caseData?.title || "Loading case..."}</h4>
                <p className="text-sm text-textSecondary">{caseData?.category}</p>
              </div>
              <div className="pt-4 border-t border-glassBorderSecondary space-y-4">
                <div>
                  <span className="text-[10px] uppercase text-textSecondary block mb-1">Claimant</span>
                  <div className="text-sm text-white font-medium">{caseData?.friendA} (Friend A)</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-textSecondary block mb-1">Defendant</span>
                  <div className="text-sm text-white font-medium">{caseData?.friendB} (Friend B)</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="secondary" className="p-5 mt-4">
              <h3 className="text-xs uppercase tracking-widest text-textSecondary font-semibold mb-4">Timeline</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-glassBorder before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-background bg-accentGold shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.5)] z-10" />
                  <div className="ml-4 md:ml-0 md:mr-4 md:w-full md:text-right">
                     <span className="text-xs text-white">Case Filed</span>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-background bg-surface border-glassBorder shrink-0 z-10" />
                  <div className="ml-4 md:ml-0 md:mr-4 md:w-full md:text-right">
                     <span className="text-xs text-textSecondary">Evidence Gathering</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </SectionReveal>
        </div>

        {/* CENTER: Hearing / Document Viewer */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 overflow-hidden h-full">
          <SectionReveal delay={0.3} className="h-full flex flex-col">
            <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative shadow-2xl border-t-white/10">
              
              {/* Toolbar */}
              <div className="h-12 border-b border-glassBorder bg-surfaceSecondary/50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-sm text-textSecondary">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Active Hearing Session</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse shadow-[0_0_8px_rgba(0,210,255,0.5)]" />
                  <span className="text-xs text-accentCyan font-mono">RECORDING</span>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={message.type === "user" ? "flex justify-end" : "flex gap-4"}
                  >
                    {message.type === "ai" && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surface to-background border border-glassBorder flex items-center justify-center shrink-0 shadow-lg">
                        <Bot className="w-5 h-5 text-accentGold" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl p-4 ${message.type === "user" ? "bg-surface border border-glassBorder rounded-tr-none" : "bg-surfaceSecondary border border-glassBorderSecondary rounded-tl-none"}`}>
                      <span className="text-[10px] uppercase text-accentGold tracking-widest block mb-2">
                        {message.type === "user" ? message.participant : message.participant || "Case Analysis"}
                      </span>
                      <p className="text-sm text-white leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isSubmitting && <CourtLoadingMessage phase="hearing" compact />}
                {progress === 100 && <div className="text-xs text-accentCyan">No further case-specific questions. The hearing is ready to conclude.</div>}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-glassBorder bg-background/50 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder={currentParticipant ? `Enter ${currentParticipant}'s testimony...` : "Waiting for case analysis..."}
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && void submitCurrentAnswer()}
                    disabled={isSubmitting || progress === 100 || !currentParticipant}
                    className="w-full bg-surface border border-glassBorder rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accentCyan transition-colors disabled:opacity-50" 
                  />
                  <button
                    onClick={() => void submitCurrentAnswer()}
                    disabled={isSubmitting || !answer.trim() || progress === 100}
                    aria-label="Submit answer"
                    className="absolute right-2 p-2 rounded-lg bg-accentCyan/10 text-accentCyan hover:bg-accentCyan/20 transition-colors disabled:opacity-40"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </GlassCard>
          </SectionReveal>
        </div>

        {/* RIGHT: AI Analysis Panel */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full overflow-y-auto pr-2 pb-4">
          <SectionReveal delay={0.4}>
            <GlassCard variant="highlight" className="p-5 flex flex-col gap-5">
              
              <div className="flex items-center justify-between border-b border-glassBorderSecondary pb-3">
                 <h3 className="text-xs uppercase tracking-widest text-accentGold font-semibold flex items-center gap-2">
                   <Bot className="w-4 h-4" /> Analysis
                 </h3>
                 <span className="text-[10px] text-textSecondary font-mono">{isDemoMode ? "DEMO DATA" : "GEMINI ANALYSIS"}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase text-textSecondary tracking-widest block mb-2">Case Summary</span>
                  <p className="text-xs leading-relaxed text-slate-200">{analysis?.case_summary || "Waiting for analysis..."}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-textSecondary tracking-widest block">Key Claims</span>
                  {analysis?.key_claims.map((claim, index) => (
                    <div key={`${index}-${claim}`} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accentGold shrink-0 mt-0.5" />
                      <span>{claim}</span>
                    </div>
                  ))}
                </div>
                {analysis?.contradictions.map((contradiction, index) => (
                  <div key={`${index}-${contradiction}`} className="flex items-start gap-2 text-xs text-slate-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-accentCyan shrink-0 mt-0.5" />
                    <span>{contradiction}</span>
                  </div>
                ))}
                {analysis?.evidence_assessment.map((item) => (
                  <div key={item.evidence_id} className="border-t border-glassBorderSecondary pt-3">
                    <div className="flex items-center gap-2 text-xs text-white">
                      <FileSearch className="w-3.5 h-3.5 text-accentCyan" />
                      {item.evidence_id}: {item.relevance} relevance
                    </div>
                    <p className="mt-1 text-[10px] text-textSecondary">{item.notes}</p>
                  </div>
                ))}
              </div>

              {/* Next steps */}
              <div className="mt-auto pt-4 border-t border-glassBorderSecondary">
                <span className="text-[10px] uppercase text-textSecondary tracking-widest block mb-2">Suggested Next Step</span>
                <button onClick={() => router.push(`/case/${params.id}/evidence`)} className="w-full text-left p-3 rounded-lg bg-accentCyan/5 border border-accentCyan/10 hover:bg-accentCyan/10 transition-colors flex items-center justify-between group">
                  <span className="text-xs text-accentCyan">Review Evidence</span>
                  <ChevronRight className="w-4 h-4 text-accentCyan group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </GlassCard>
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
