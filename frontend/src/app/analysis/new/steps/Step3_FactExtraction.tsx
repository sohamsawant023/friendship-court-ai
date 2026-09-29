"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { FileText, Info, Users, MapPin, CalendarDays } from "lucide-react";
import { AnalysisCaseData } from "../types";

interface Step3Props {
  caseData: AnalysisCaseData;
  setCaseData: (data: AnalysisCaseData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step3_FactExtraction({ caseData, setCaseData, onNext, onPrevious }: Step3Props) {
  const detailRows = [
    { label: "Parties", value: caseData.parties.filter(Boolean).join(", ") || "Not provided", icon: Users },
    { label: "Dates", value: caseData.relevantDates || "Not provided", icon: CalendarDays },
    { label: "Location and jurisdiction", value: [caseData.location, caseData.jurisdiction].filter(Boolean).join(" · ") || "Not provided", icon: MapPin },
    { label: "Selected file names", value: caseData.documents.map((file) => file.name).join(", ") || "No files selected", icon: FileText },
  ];

  const continueWithFacts = () => {
    setCaseData({
      ...caseData,
      facts: {
        summary: caseData.description,
        keyClaims: [],
        contradictions: [],
        parties: caseData.parties.filter(Boolean),
        dates: caseData.relevantDates ? [caseData.relevantDates] : [],
        events: [],
        evidence: caseData.documents.map((file) => file.name),
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-accentGold/20 bg-accentGold/10"><FileText className="h-5 w-5 text-accentGold" /></div>
        <div><h2 className="text-xl font-semibold text-white">Review case details</h2><p className="text-sm text-textSecondary">A structured view of the information you entered.</p></div>
      </div>

      <GlassCard variant="secondary" className="flex items-start gap-3 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accentGold" />
        <p className="text-xs leading-relaxed text-textSecondary">Automatic document reading and fact extraction are not connected. The summary below repeats your input; it has not been independently verified or analyzed.</p>
      </GlassCard>

      <GlassCard className="space-y-5 p-6">
        <div><p className="text-[10px] uppercase tracking-widest text-textSecondary">CASE SUMMARY · PROVIDED BY YOU</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white">{caseData.description || "No description provided."}</p></div>
        <div className="grid gap-4 border-t border-glassBorderSecondary pt-5 sm:grid-cols-2">
          {detailRows.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border border-glassBorderSecondary bg-surfaceSecondary p-4"><div className="flex items-center gap-2 text-xs text-textSecondary"><Icon className="h-3.5 w-3.5 text-accentGold" />{label}</div><p className="mt-2 break-words text-sm text-white">{value}</p></div>)}
        </div>
        <div className="rounded-xl border border-dashed border-glassBorderSecondary p-4"><p className="text-xs font-medium text-white">Not extracted</p><p className="mt-1 text-xs leading-relaxed text-textSecondary">Key claims, contradictions, dates, event timelines, and document contents need a verified document-analysis integration before they can be shown here.</p></div>
      </GlassCard>

      <div className="flex justify-between border-t border-glassBorderSecondary pt-6">
        <GlassButton variant="secondary" onClick={onPrevious} className="px-6">Previous</GlassButton>
        <GlassButton variant="primary" onClick={continueWithFacts} className="px-8">Continue to legal sources</GlassButton>
      </div>
    </div>
  );
}
