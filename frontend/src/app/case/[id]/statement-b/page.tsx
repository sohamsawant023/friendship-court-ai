"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard, GlassButton } from "@/components/ui";
import { FloatingPanel, AnimatedHeading, StatusBadge } from "@/components/ui";
import { User, FileText, ChevronRight } from "lucide-react";

export default function StatementB({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<{ title: string; friendA: string; friendB: string } | null>(null);
  const [statement, setStatement] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const parsed = JSON.parse(savedCase);
        if (parsed.id === params.id) {
          setCaseData(parsed);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!statement.trim()) {
      setError("Statement is required");
      return;
    }

    try {
      const savedCase = localStorage.getItem('newCase');
      if (savedCase) {
        const updatedCase = JSON.parse(savedCase);
        updatedCase.statementB = { statement, context };
        localStorage.setItem('newCase', JSON.stringify(updatedCase));
        router.push(`/case/${params.id}/evidence`);
      } else {
        setError("Case data not found. Please start a new case.");
      }
    } catch (error) {
      console.error('Error saving statement:', error);
      setError("Failed to save statement. Please try again.");
    }
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4"
          >
            ⚖️
          </motion.div>
          <p className="text-textSecondary">Loading case information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <AnimatedHeading delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status="active" />
              <span className="text-xs font-mono text-textSecondary">CASE #{params.id}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              {caseData.title}
            </h1>
            <p className="text-lg text-textSecondary">Party B Statement Phase</p>
          </div>
        </AnimatedHeading>

        <FloatingPanel delay={0.2}>
          <GlassCard variant="primary" className="p-8">
            <div className="mb-8 p-6 glass-panel-secondary rounded-xl border-l-4 border-l-accentGold">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accentGold/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-accentGold" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-textSecondary mb-1">Party B (Defendant)</div>
                  <div className="text-xl font-semibold text-white">{caseData.friendB}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-textPrimary uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accentCyan" />
                  Your Statement
                </label>
                <textarea 
                  placeholder="Tell your side of the story..."
                  rows={6}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className={`input-field w-full resize-none ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-textPrimary uppercase tracking-wider">Additional Context (Optional)</label>
                <textarea 
                  placeholder="Any additional background information..."
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="input-field w-full resize-none"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-lg text-textSecondary hover:text-textPrimary transition-colors"
                >
                  Back
                </button>
                <GlassButton type="submit" variant="primary" className="px-8">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </FloatingPanel>
      </div>
    </div>
  );
}