/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassStepper, Step } from "@/components/ui/GlassStepper";
import { Scale, ArrowLeft, Save } from "lucide-react";
import Step1_CaseInput from "./steps/Step1_CaseInput";
import Step2_Documents from "./steps/Step2_Documents";
import Step3_FactExtraction from "./steps/Step3_FactExtraction";
import Step4_LawIdentification from "./steps/Step4_LawIdentification";
import Step5_SimilarCases from "./steps/Step5_SimilarCases";
import Step6_AIAnalysis from "./steps/Step6_AIAnalysis";
import Step7_FinalReport from "./steps/Step7_FinalReport";

interface CaseData {
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
  report: any;
}

export default function NewAnalysis() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [caseData, setCaseData] = useState<CaseData>({
    id: "",
    title: "",
    category: "",
    description: "",
    location: "",
    jurisdiction: "",
    relevantDates: "",
    parties: ["", ""],
    documents: [],
    facts: null,
    laws: null,
    similarCases: null,
    analysis: null,
    report: null,
  });

  const labels = ["Case Input", "Documents", "Fact Extraction", "Law Identification", "Similar Cases", "AI Analysis", "Final Report"];
  const steps: Step[] = labels.map((label, index) => ({
    id: index + 1,
    label,
    status: index + 1 < currentStep ? "completed" : index + 1 === currentStep ? "current" : "upcoming",
  }));

  useEffect(() => {
    const caseId = new URLSearchParams(window.location.search).get("caseId");
    const saved = caseId ? localStorage.getItem(`analysis:${caseId}`) : localStorage.getItem("currentAnalysis");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCaseData((current) => ({ ...current, ...parsed }));
        setCurrentStep(Math.max(1, Math.min(7, Number(parsed.currentStep) || 1)));
      } catch {
        localStorage.removeItem(caseId ? `analysis:${caseId}` : "currentAnalysis");
      }
    }
    setCaseData((current) => ({ ...current, id: current.id || `FC-${Date.now().toString().slice(-8)}` }));
    setIsReady(true);
  }, []);

  const handleNext = () => {
    setCurrentStep((step) => Math.min(7, step + 1));
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) setCurrentStep(stepId);
  };

  const handleSave = useCallback(() => {
    if (!isReady || !caseData.id) return;
    const savedData = { ...caseData, currentStep };
    localStorage.setItem("currentAnalysis", JSON.stringify(savedData));
    localStorage.setItem(`analysis:${caseData.id}`, JSON.stringify(savedData));
    const recentCases = JSON.parse(localStorage.getItem("recentCases") || "[]") as Array<{ id: string; createdAt?: string; [key: string]: any }>;
    const previous = recentCases.find((item) => item.id === caseData.id);
    const newCase = {
      id: caseData.id,
      title: caseData.title || "Untitled Case",
      category: caseData.category || "General",
      status: currentStep === 7 ? "completed" : "in_progress",
      createdAt: previous?.createdAt || new Date().toISOString().split("T")[0],
      participants: caseData.parties.filter(Boolean),
    };
    localStorage.setItem("recentCases", JSON.stringify([newCase, ...recentCases.filter((item) => item.id !== caseData.id)].slice(0, 10)));
  }, [caseData, currentStep, isReady]);

  useEffect(() => {
    handleSave();
  }, [handleSave]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_CaseInput caseData={caseData} setCaseData={setCaseData} onNext={handleNext} />;
      case 2:
        return <Step2_Documents caseData={caseData} setCaseData={setCaseData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <Step3_FactExtraction caseData={caseData} setCaseData={setCaseData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 4:
        return <Step4_LawIdentification caseData={caseData} setCaseData={setCaseData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 5:
        return <Step5_SimilarCases caseData={caseData} setCaseData={setCaseData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 6:
        return <Step6_AIAnalysis caseData={caseData} setCaseData={setCaseData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 7:
        return <Step7_FinalReport caseData={caseData} onPrevious={handlePrevious} />;
      default:
        return null;
    }
  };

  if (!isReady) return <div className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16 text-sm text-textSecondary">Loading your local draft…</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-glassBorder bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassButton variant="secondary" onClick={() => router.push("/")} className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </GlassButton>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface border border-glassBorder flex items-center justify-center">
                  <Scale className="w-5 h-5 text-accentGold" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Case Analysis</h1>
                  <p className="text-xs text-textSecondary">{caseData.id}</p>
                </div>
              </div>
            </div>
            <GlassButton variant="secondary" onClick={handleSave} className="px-4">
              <Save className="w-4 h-4" />
              Save Progress
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Stepper */}
          <div className="lg:col-span-3">
            <GlassCard className="p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Analysis Workflow</h3>
              <GlassStepper steps={steps} orientation="vertical" onStepClick={handleStepClick} />
            </GlassCard>
          </div>

          {/* Right Content - Current Step */}
          <div className="lg:col-span-9">
            <GlassCard className="p-8 min-h-[600px]">
              {renderStep()}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="container mx-auto px-6 py-8">
        <GlassCard variant="secondary" className="p-4 text-center">
          <p className="text-xs text-textSecondary">
            AI-generated information is for informational purposes and does not constitute legal advice or a court decision. 
            Verify important information with a qualified legal professional and authoritative legal sources.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
