"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertTriangle, Bot, Database, FileCheck2, Scale } from "lucide-react";
import { AnalysisCaseData } from "../types";

interface Step6Props {
  caseData: AnalysisCaseData;
  setCaseData: (data: AnalysisCaseData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step6_AIAnalysis({ caseData, setCaseData, onNext, onPrevious }: Step6Props) {
  const continueToReport = () => {
    setCaseData({ ...caseData, analysis: null });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-accentGold/20 bg-accentGold/10"><Bot className="h-5 w-5 text-accentGold" /></div><div><h2 className="text-xl font-semibold text-white">AI case analysis</h2><p className="text-sm text-textSecondary">Review the available information and integration status.</p></div></div>

      <GlassCard variant="secondary" className="border border-amber-200/15 p-6">
        <div className="flex items-start gap-4"><AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-accentGold" /><div><h3 className="font-semibold text-white">Legal analysis is not connected</h3><p className="mt-2 text-sm leading-relaxed text-textSecondary">No AI-generated legal conclusions, arguments, or outcome predictions are available. The existing AI endpoints are designed for lighthearted friendship disputes, so this workflow does not send your legal case details to them.</p></div></div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <GlassCard className="p-5"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white"><FileCheck2 className="h-4 w-4 text-accentGold" />User-provided information</div><p className="mt-2 text-xs leading-relaxed text-textSecondary">{caseData.description ? "Your case description and party names are included in the local draft." : "No case description has been entered."}</p></GlassCard>
        <GlassCard className="p-5"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white"><Scale className="h-4 w-4 text-accentCyan" />Law and judgment sources</div><p className="mt-2 text-xs leading-relaxed text-textSecondary">{caseData.laws?.length || caseData.similarCases?.length ? "Review the source and verification status of each item before relying on it." : "No legal research service is configured; no authorities were checked."}</p></GlassCard>
      </div>

      <GlassCard variant="secondary" className="flex items-start gap-3 p-4"><Database className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary" /><p className="text-xs leading-relaxed text-textSecondary">Integration points: jurisdiction-aware document analysis, verified legal research, and a legal information model with source citations and uncertainty handling.</p></GlassCard>

      <div className="flex justify-between border-t border-glassBorderSecondary pt-6"><GlassButton variant="secondary" onClick={onPrevious} className="px-6">Previous</GlassButton><GlassButton variant="primary" onClick={continueToReport} className="px-8">Continue to report</GlassButton></div>
    </div>
  );
}
