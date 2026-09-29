"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SectionReveal } from "@/components/layout/SectionReveal";
import { ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

export default function History() {
  const cases = [
    {
      id: "FC-1029",
      title: "The Pizza Incident",
      date: "2026-09-28",
      verdict: "GUILTY",
      parties: "Alice vs Bob",
      category: "Food & Dining"
    },
    {
      id: "FC-0842",
      title: "Unanswered Texts",
      date: "2026-09-15",
      verdict: "NOT GUILTY",
      parties: "Charlie vs Dave",
      category: "Communication"
    },
    {
      id: "FC-0711",
      title: "The Borrowed Sweater",
      date: "2026-08-30",
      verdict: "PARTIALLY RESPONSIBLE",
      parties: "Eve vs Frank",
      category: "Property"
    }
  ];

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "GUILTY": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "NOT GUILTY": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "PARTIALLY RESPONSIBLE": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <SectionReveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-glassBorder pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Archive <span className="text-accentGold">Records</span>
            </h1>
            <p className="text-textSecondary">Review past rulings, verdicts, and case transcripts.</p>
          </div>
          <div className="flex gap-3">
            <GlassButton variant="secondary" className="px-4 py-2">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </GlassButton>
            <Link href="/case/new">
              <GlassButton variant="primary" className="px-6 py-2">Initialize New</GlassButton>
            </Link>
          </div>
        </div>
      </SectionReveal>

      <div className="grid gap-4">
        {cases.map((c, i) => (
          <SectionReveal key={c.id} delay={0.1 * (i + 1)}>
            <Link href={`/case/${c.id}`}>
              <GlassCard variant="secondary" className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-accentGold/30">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] text-textSecondary font-mono tracking-widest bg-background px-2 py-1 rounded">
                      {c.id}
                    </span>
                    <span className="text-[10px] uppercase text-textSecondary">{c.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-accentGold transition-colors">{c.title}</h3>
                  <div className="text-sm text-textSecondary flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-glassBorder"></span>
                    {c.parties}
                    <span className="w-1 h-1 rounded-full bg-glassBorder"></span>
                    {c.category}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVerdictColor(c.verdict)}`}>
                    {c.verdict}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-surface border border-glassBorder flex items-center justify-center group-hover:bg-accentGold group-hover:text-background transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          </SectionReveal>
        ))}
      </div>
    </div>
  );
}
