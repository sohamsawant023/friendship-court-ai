"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SectionReveal } from "@/components/layout/SectionReveal";
import { Scale, Users, Info, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewCase() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "Food & Dining",
    friendA: "",
    friendB: "",
    description: "",
    demoMode: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.friendA.trim() || !formData.friendB.trim() || !formData.description.trim()) {
      setErrorMessage("Enter a title, both participant names, and a dispute description.");
      return;
    }
    if (formData.friendA.trim().toLowerCase() === formData.friendB.trim().toLowerCase()) {
      setErrorMessage("The participants must be different people.");
      return;
    }

    const caseId = `FC-${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem("newCase", JSON.stringify({ ...formData, id: caseId }));
    router.push(`/case/${caseId}/statement-a`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SectionReveal>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-surface border border-glassBorder mb-6">
            <Scale className="w-6 h-6 text-accentGold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-textPrimary tracking-tight mb-4">Initialize Case File</h1>
          <p className="text-textSecondary text-lg max-w-xl mx-auto">
            Input the parameters of the dispute. The intelligence engine requires context to begin processing.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Main Context Panel */}
          <GlassCard className="p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Info className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accentCyan"></span>
                Primary Context
              </h2>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Case Designation (Title)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., The Pizza Incident" 
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Classification</label>
                  <div className="relative">
                    <select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-accentGold transition-colors focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                      <option>Food & Dining</option>
                      <option>Financial</option>
                      <option>Communication</option>
                      <option>Property</option>
                      <option>Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-textSecondary">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Dispute Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    placeholder="Describe what happened and what each person disagrees about..."
                    rows={4}
                    className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentGold transition-colors"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Participants Panel */}
          <GlassCard className="p-8 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Users className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accentGold"></span>
                Involved Parties
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Party A (Claimant)</label>
                  <input 
                    type="text" 
                    placeholder="Enter name..." 
                    value={formData.friendA}
                    onChange={(event) => setFormData({ ...formData, friendA: event.target.value })}
                    className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentCyan transition-colors focus:shadow-[0_0_15px_rgba(0,210,255,0.15)]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-textSecondary">Party B (Defendant)</label>
                  <input 
                    type="text" 
                    placeholder="Enter name..." 
                    value={formData.friendB}
                    onChange={(event) => setFormData({ ...formData, friendB: event.target.value })}
                    className="w-full bg-background border border-glassBorder rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accentCyan transition-colors focus:shadow-[0_0_15px_rgba(0,210,255,0.15)]" 
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-start gap-3">
            <input
              id="demo-mode"
              type="checkbox"
              checked={formData.demoMode}
              onChange={(event) => setFormData({ ...formData, demoMode: event.target.checked })}
              className="mt-1 h-4 w-4 accent-amber-500"
            />
            <div>
              <label htmlFor="demo-mode" className="text-sm font-semibold text-white">Use Demo Mode</label>
              <p className="mt-1 text-xs text-textSecondary">Deterministic case analysis; works without a Gemini API key.</p>
            </div>
          </GlassCard>

          {errorMessage && <p role="alert" className="text-sm text-red-300">{errorMessage}</p>}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <GlassButton type="button" variant="secondary" className="w-full">
                Cancel
              </GlassButton>
            </Link>
            <GlassButton type="submit" variant="primary" className="w-full sm:w-auto px-10">
              <Sparkles className="w-4 h-4" />
              Initialize Analysis
            </GlassButton>
          </div>
        </form>
      </SectionReveal>
    </div>
  );
}
