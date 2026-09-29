/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertTriangle, BookOpen, ExternalLink, Scale } from "lucide-react";

interface Step4Props {
  caseData: { laws: Array<{ id: number; name: string; section: string; explanation: string; relevance: string }> | null };
  setCaseData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step4_LawIdentification({ caseData, setCaseData, onNext, onPrevious }: Step4Props) {
  const continueWithoutResults = () => {
    setCaseData({ ...caseData, laws: null });
    onNext();
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-accentGold/20 bg-accentGold/10"><Scale className="h-5 w-5 text-accentGold" /></div><div><h2 className="text-xl font-semibold text-white">Relevant laws</h2><p className="text-sm text-textSecondary">Potential statutes and provisions for your jurisdiction.</p></div></div>

      {(
        <GlassCard variant="secondary" className="p-7">
          <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accentGold/20 bg-accentGold/10"><BookOpen className="h-5 w-5 text-accentGold" /></div><div><h3 className="font-semibold text-white">Legal research is not connected</h3><p className="mt-2 text-sm leading-relaxed text-textSecondary">This application has no law database or legal research endpoint configured. No statutes, section numbers, or relevance ratings are being generated.</p></div></div>
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200/10 bg-amber-200/[0.035] p-4"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accentGold" /><p className="text-xs leading-relaxed text-textSecondary">Connect a jurisdiction-specific, authoritative source and verify results with a qualified legal professional before showing legal provisions here.</p></div>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-textSecondary"><ExternalLink className="h-3.5 w-3.5" />Integration point: authoritative legal-source API</p>
        </GlassCard>
      )}

      <div className="flex justify-between border-t border-glassBorderSecondary pt-6"><GlassButton variant="secondary" onClick={onPrevious} className="px-6">Previous</GlassButton><GlassButton variant="primary" onClick={continueWithoutResults} className="px-8">Continue to similar cases</GlassButton></div>
    </div>
  );
}
