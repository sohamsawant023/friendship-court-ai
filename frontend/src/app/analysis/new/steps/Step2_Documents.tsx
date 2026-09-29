"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassFileUpload } from "@/components/ui/GlassFileUpload";
import { FileText, Upload } from "lucide-react";
import { AnalysisCaseData } from "../types";

interface Step2Props {
  caseData: AnalysisCaseData;
  setCaseData: (data: AnalysisCaseData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step2_Documents({ caseData, setCaseData, onNext, onPrevious }: Step2Props) {
  const handleFilesChange = (files: Array<{ id: string; name: string; size: number; type: string; status: string }>) => {
    setCaseData({
      ...caseData,
      documents: files
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accentCyan/10 border border-accentCyan/20 flex items-center justify-center">
          <Upload className="w-5 h-5 text-accentCyan" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Documents & Evidence</h2>
          <p className="text-sm text-textSecondary">Upload relevant documents and evidence</p>
        </div>
      </div>

      <GlassCard variant="secondary" className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <FileText className="w-5 h-5 text-accentGold mt-1" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Files for your draft</h3>
            <p className="text-xs text-textSecondary">
              Select contracts, agreements, or correspondence to keep their names in this browser draft. File contents are not uploaded or analyzed.
            </p>
          </div>
        </div>

        <GlassFileUpload
          initialFiles={caseData.documents}
          onFilesChange={handleFilesChange}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          maxSize={10 * 1024 * 1024}
          maxFiles={5}
        />
      </GlassCard>

      <GlassCard variant="secondary" className="p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Selected files · local draft only</h3>
        {caseData.documents.length > 0 ? (
          <div className="space-y-2">
            {caseData.documents.map((doc: { id: string; name: string; size: number; type: string; status: string }) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-glassBorder">
                <FileText className="w-4 h-4 text-textSecondary" />
                <div className="flex-1">
                  <p className="text-sm text-white">{doc.name}</p>
                  <p className="text-xs text-textSecondary">{(doc.size / 1024).toFixed(1)} KB</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  "bg-white/5 text-textSecondary"
                }`}>
                  Selected locally
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-textSecondary text-center py-4">
            No documents uploaded yet. You can proceed without documents, but they may help with analysis.
          </p>
        )}
      </GlassCard>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-glassBorderSecondary">
        <GlassButton variant="secondary" onClick={onPrevious} className="px-6">
          Previous
        </GlassButton>
        <GlassButton variant="primary" onClick={onNext} className="px-8">
          Continue to Fact Extraction
        </GlassButton>
      </div>
    </div>
  );
}
