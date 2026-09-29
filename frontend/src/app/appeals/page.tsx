"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal } from "@/components/layout/SectionReveal";
import { AlertCircle } from "lucide-react";

export default function Appeals() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
      <SectionReveal>
         <h1 className="text-4xl font-bold text-white mb-4">Appellate <span className="text-accentGold">Division</span></h1>
         <p className="text-textSecondary mb-12 max-w-lg mx-auto">
           The appellate division reviews contested verdicts. Submit new evidence to overturn prior intelligence analysis.
         </p>
      </SectionReveal>
      
      <SectionReveal delay={0.2}>
        <GlassCard className="p-16 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-accentGold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="w-20 h-20 rounded-full bg-surface border border-glassBorder flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <AlertCircle className="w-8 h-8 text-textSecondary group-hover:text-accentGold transition-colors duration-500" />
          </div>
          
          <h2 className="text-xl font-medium text-white mb-2 relative z-10">No Active Appeals</h2>
          <p className="text-sm text-textSecondary max-w-sm relative z-10">
            There are currently no cases pending appellate review. You must receive a formal verdict before initiating an appeal.
          </p>
        </GlassCard>
      </SectionReveal>
    </div>
  );
}
