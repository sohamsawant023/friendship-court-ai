"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppealResult } from "@/lib/api";
import { GlassCard, GlassButton } from "@/components/ui";
import { AnimatedHeading, StatusBadge } from "@/components/ui";
import { CourtAnnouncementButton } from "@/components/ui/CourtAnnouncementButton";

interface StoredAppealCase {
  id: string;
  title: string;
  category?: string;
  isDemoMode?: boolean;
  latestAppealResult?: AppealResult;
  latestAppealModeMessage?: string;
}

function readableVerdict(type: string): string {
  return type.replace(/_/g, " ");
}

export default function AppealResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<StoredAppealCase | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("newCase");
      if (!saved) {
        setError("The saved appeal result could not be found.");
        return;
      }
      const parsed = JSON.parse(saved) as StoredAppealCase;
      if (parsed.id !== params.id || !parsed.latestAppealResult) {
        setError("The saved appeal result does not match this case.");
        return;
      }
      setCaseData(parsed);
    } catch {
      setError("The saved appeal result could not be read.");
    }
  }, [params.id]);

  useEffect(() => {
    if (caseData?.latestAppealResult) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const cat = caseData.category ? caseData.category.toLowerCase() : "petty";
        const utterance = new SpeechSynthesisUtterance(`Congratulations. You appealed a ${cat} dispute.`);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [caseData?.latestAppealResult, caseData?.category]);

  if (!caseData?.latestAppealResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p role="alert" className="text-textSecondary">{error || "Loading appeal result..."}</p>
          <GlassButton className="mt-5" variant="secondary" onClick={() => router.push(`/case/${params.id}/appeal`)}>
            Return to Appeal
          </GlassButton>
        </div>
      </div>
    );
  }

  const result = caseData.latestAppealResult;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <AnimatedHeading delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status="resolved" />
              <span className="text-xs font-mono text-textSecondary">CASE #{params.id}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Appeal Reassessment</h1>
            <p className="text-textSecondary">{caseData.title}</p>
          </div>
        </AnimatedHeading>

        {caseData.isDemoMode && (
          <div className="rounded-xl border border-accentGold/20 bg-accentGold/10 p-4 text-center text-sm text-accentGold">
            Demo Mode: {caseData.latestAppealModeMessage || "Deterministic appeal reassessment."}
          </div>
        )}

        <GlassCard variant="highlight" className="p-6">
          <div className="text-xs uppercase tracking-widest text-textSecondary mb-2">Appeal Outcome</div>
          <h2 className="text-3xl font-bold text-white">{readableVerdict(result.outcome)}</h2>
          <p className="mt-3 text-textPrimary">{result.what_changed}</p>
          <CourtAnnouncementButton
            text={`Congratulations. You appealed a ${caseData.title} dispute. The appeal outcome is ${readableVerdict(result.outcome)}.`}
            label="Hear appeal announcement"
          />
        </GlassCard>

        <GlassCard variant="secondary" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Original Verdict</h3>
          <p className="text-textPrimary font-semibold">{readableVerdict(result.original_verdict.verdict.type)}</p>
          <p className="mt-1 text-sm text-textSecondary">Responsible: {result.original_verdict.verdict.responsible_parties.join(", ") || "None"}</p>
          <p className="mt-3 text-sm text-textPrimary">{result.original_verdict.verdict.reasoning}</p>
        </GlassCard>

        <GlassCard variant="secondary" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Appeal Argument</h3>
          <p className="text-textPrimary">{result.appeal_argument}</p>
          <h4 className="text-sm font-semibold text-white mt-5 mb-2">Appeal Reasoning</h4>
          <p className="text-textPrimary leading-relaxed">{result.appeal_reasoning}</p>
        </GlassCard>

        {result.new_evidence_assessment.length > 0 && (
          <GlassCard variant="secondary" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">New Evidence Assessment</h3>
            <ul className="space-y-4">
              {result.new_evidence_assessment.map((item) => (
                <li key={item.evidence_id} className="border-t border-glassBorder pt-3 first:border-0 first:pt-0">
                  <div className="text-sm font-medium text-textPrimary">{item.evidence_id}</div>
                  <div className="text-xs text-textSecondary">Credibility: {item.credibility} · Relevance: {item.relevance}</div>
                  <p className="mt-1 text-sm text-textPrimary">{item.notes}</p>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}

        <GlassCard variant="primary" className="p-6">
          <div className="text-xs uppercase tracking-widest text-textSecondary mb-2">Updated Verdict</div>
          <h3 className="text-2xl font-bold text-white">{readableVerdict(result.updated_verdict.verdict.type)}</h3>
          <p className="mt-2 text-sm text-textSecondary">Responsible: {result.updated_verdict.verdict.responsible_parties.join(", ") || "None"} · Severity {result.updated_verdict.verdict.severity}/10</p>
          <p className="mt-4 text-textPrimary leading-relaxed">{result.updated_verdict.verdict.reasoning}</p>
          <h4 className="text-sm font-semibold text-white mt-5 mb-2">Updated Consequence</h4>
          <p className="text-textPrimary">{result.updated_verdict.consequence}</p>
          <h4 className="text-sm font-semibold text-white mt-5 mb-2">Friendship Recommendation</h4>
          <p className="text-textPrimary">{result.updated_verdict.friendship_recommendation}</p>
        </GlassCard>

        <div className="flex justify-end">
          <GlassButton variant="secondary" onClick={() => router.push("/")}>
            Return to Dashboard
          </GlassButton>
        </div>
        <p className="text-center text-xs text-textSecondary">Entertainment only — not legal advice.</p>
      </div>
    </div>
  );
}