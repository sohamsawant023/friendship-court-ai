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
  const [caseData, setCaseData] = useState<CaseData>({
    id: `FC-${Math.floor(Math.random() * 9000) + 1000}`,
    title: "",
    category: "",
    description: "",
    location: "",
    jurisdiction: "",
    relevantDates: "",
    parties: [],
    documents: [],
    facts: null,
    laws: null,
    similarCases: null,
    analysis: null,
    report: null,
  });

  const steps: Step[] = [
    { id: 1, label: "Case Input", status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming" },
    { id: 2, label: "Documents", status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : currentStep > 1 ? "upcoming" : "upcoming" },
    { id: 3, label: "Fact Extraction", status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : currentStep > 2 ? "upcoming" : "upcoming" },
    { id: 4, label: "Law Identification", status: currentStep === 4 ? "current" : currentStep > 4 ? "completed" : currentStep > 3 ? "upcoming" : "upcoming" },
    { id: 5, label: "Similar Cases", status: currentStep === 5 ? "current" : currentStep > 5 ? "completed" : currentStep > 4 ? "upcoming" : "upcoming" },
    { id: 6, label: "AI Analysis", status: currentStep === 6 ? "current" : currentStep > 6 ? "completed" : currentStep > 5 ? "upcoming" : "upcoming" },
    { id: 7, label: "Final Report", status: currentStep === 7 ? "current" : currentStep > 7 ? "completed" : currentStep > 6 ? "upcoming" : "upcoming" },
  ];

  const updateSteps = () => {
    steps.forEach((step, index) => {
      if (index + 1 < currentStep) {
        step.status = "completed";
      } else if (index + 1 === currentStep) {
        step.status = "current";
      } else {
        step.status = "upcoming";
      }
    });
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      updateSteps();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      updateSteps();
    }
  };

  const handleSave = useCallback(() => {
    localStorage.setItem("currentAnalysis", JSON.stringify(caseData));
    // Save to recent cases
    const recentCases = JSON.parse(localStorage.getItem("recentCases") || "[]");
    const newCase = {
      id: caseData.id,
      title: caseData.title || "Untitled Case",
      category: caseData.category || "General",
      status: currentStep === 7 ? "completed" : "in_progress",
      createdAt: new Date().toISOString().split("T")[0],
      participants: caseData.parties || ["Party A", "Party B"],
    };
    recentCases.unshift(newCase);
    localStorage.setItem("recentCases", JSON.stringify(recentCases.slice(0, 10)));
  }, [caseData, currentStep]);

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
              <GlassStepper steps={steps} orientation="vertical" />
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
