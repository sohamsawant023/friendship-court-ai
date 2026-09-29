/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertTriangle, BookOpen, Search } from "lucide-react";

interface Step5Props {
  caseData: { similarCases: Array<{ id: string; name: string; court: string; year: string; issue: string; relevance: string; source: string }> | null };
  setCaseData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step5_SimilarCases({ caseData, setCaseData, onNext, onPrevious }: Step5Props) {
  const continueWithoutResults = () => {
    setCaseData({ ...caseData, similarCases: null });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-accentCyan/20 bg-accentCyan/10"><Search className="h-5 w-5 text-accentCyan" /></div><div><h2 className="text-xl font-semibold text-white">Similar cases</h2><p className="text-sm text-textSecondary">Search verified court decisions for related issues.</p></div></div>
      <GlassCard variant="secondary" className="p-7">
        <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accentCyan/20 bg-accentCyan/10"><BookOpen className="h-5 w-5 text-accentCyan" /></div><div><h3 className="font-semibold text-white">No case-law source is connected</h3><p className="mt-2 text-sm leading-relaxed text-textSecondary">The backend does not provide a search for court judgments. No case names, courts, years, citations, or references are shown because they cannot currently be verified.</p></div></div>
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.025] p-4"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accentGold" /><p className="text-xs leading-relaxed text-textSecondary">Integration point: add an authoritative case-law service for the selected jurisdiction, then return source links with each result.</p></div>
      </GlassCard>
      <div className="flex justify-between border-t border-glassBorderSecondary pt-6"><GlassButton variant="secondary" onClick={onPrevious} className="px-6">Previous</GlassButton><GlassButton variant="primary" onClick={continueWithoutResults} className="px-8">Continue to AI analysis</GlassButton></div>
    </div>
  );
}
