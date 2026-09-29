"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-9 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-accentGold">FRIENDSHIP COURT AI</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Turning tiny friendship arguments into unnecessarily serious AI court cases</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-textSecondary">The AI Judge hears your case, examines evidence, and delivers a verdict on your friendship disputes.</p>
        </div>
        <Link href="/case/new"><GlassButton variant="primary" className="w-full px-5 sm:w-auto"><Plus className="h-4 w-4" />Start a New Case</GlassButton></Link>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[.18em] text-textSecondary">HOW IT WORKS</p>
            <h2 className="mt-1 text-xl font-medium text-white">The Court Process</h2>
          </div>

          <div className="grid gap-4">
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accentGold/20 text-accentGold font-bold">1</div>
                <div>
                  <h3 className="font-medium text-white">File Your Case</h3>
                  <p className="mt-1 text-sm text-textSecondary">Submit your friendship dispute with details about what happened.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accentCyan/20 text-accentCyan font-bold">2</div>
                <div>
                  <h3 className="font-medium text-white">Present Statements</h3>
                  <p className="mt-1 text-sm text-textSecondary">Both parties present their side of the story.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accentGold/20 text-accentGold font-bold">3</div>
                <div>
                  <h3 className="font-medium text-white">Submit Evidence</h3>
                  <p className="mt-1 text-sm text-textSecondary">Provide supporting evidence like screenshots or messages.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accentCyan/20 text-accentCyan font-bold">4</div>
                <div>
                  <h3 className="font-medium text-white">Receive Verdict</h3>
                  <p className="mt-1 text-sm text-textSecondary">The AI Judge analyzes everything and delivers a fair verdict.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <aside className="space-y-4">
          <GlassCard className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-accentGold">DISCLAIMER</p>
            <h3 className="mt-3 text-base font-medium text-white">Not Real Court</h3>
            <p className="mt-2 text-xs leading-relaxed text-textSecondary">This is a fun AI-powered tool for resolving friendship disputes. The verdicts are not legally binding and should be taken in good humor.</p>
          </GlassCard>
          <GlassCard variant="secondary" className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-textSecondary">APPEALS</p>
            <p className="mt-3 text-xs leading-relaxed text-textSecondary">Don&apos;t agree with the verdict? You can file an appeal with additional evidence or arguments.</p>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
