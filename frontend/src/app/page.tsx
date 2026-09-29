"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FileText, FolderOpen, Plus, Search, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

interface RecentAnalysis {
  id: string;
  title: string;
  category: string;
  status: "in_progress" | "completed";
  createdAt: string;
  participants: string[];
}

export default function Home() {
  const [cases, setCases] = useState<RecentAnalysis[]>([]);
  const [search, setSearch] = useState("");
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    try {
      setCases(JSON.parse(localStorage.getItem("recentCases") || "[]"));
      const current = JSON.parse(localStorage.getItem("currentAnalysis") || "null");
      setDocumentCount(Array.isArray(current?.documents) ? current.documents.length : 0);
    } catch {
      setCases([]);
      setDocumentCount(0);
    }
  }, []);

  const filteredCases = useMemo(() => cases.filter((item) => `${item.title} ${item.category} ${item.id}`.toLowerCase().includes(search.toLowerCase())), [cases, search]);
  const completedCount = cases.filter((item) => item.status === "completed").length;
  const draftCount = cases.filter((item) => item.status === "in_progress").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-9 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-accentGold">FRIEND COURT AI · LEGAL INFORMATION WORKSPACE</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Case analysis</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-textSecondary">Organize case details and prepare a clear, source-aware review. Nothing here predicts a court outcome.</p>
        </div>
        <Link href="/analysis/new"><GlassButton variant="primary" className="w-full px-5 sm:w-auto"><Plus className="h-4 w-4" />Start a new analysis</GlassButton></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl border border-accentCyan/15 bg-accentCyan/5"><FolderOpen className="h-5 w-5 text-accentCyan" /></div><div><p className="text-2xl font-semibold text-white">{cases.length}</p><p className="text-xs text-textSecondary">Saved analyses · this browser</p></div></GlassCard>
        <GlassCard className="flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl border border-accentGold/15 bg-accentGold/5"><FileText className="h-5 w-5 text-accentGold" /></div><div><p className="text-2xl font-semibold text-white">{completedCount}</p><p className="text-xs text-textSecondary">Reports prepared</p></div></GlassCard>
        <GlassCard className="flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03]"><ShieldCheck className="h-5 w-5 text-textSecondary" /></div><div><p className="text-2xl font-semibold text-white">{draftCount}</p><p className="text-xs text-textSecondary">Drafts in progress</p></div></GlassCard>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-[10px] uppercase tracking-[.18em] text-textSecondary">YOUR WORKSPACE</p><h2 className="mt-1 text-xl font-medium text-white">Recent analyses</h2></div>
            <label className="relative block w-full sm:w-64"><span className="sr-only">Search saved analyses</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cases" className="w-full rounded-lg border border-glassBorder bg-surface/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-textSecondary focus:border-accentGold/50 focus:outline-none" /></label>
          </div>

          {filteredCases.length ? <div className="grid gap-3 sm:grid-cols-2">{filteredCases.map((item) => <Link key={item.id} href={`/analysis/new?caseId=${encodeURIComponent(item.id)}`} className="group"><GlassCard className="h-full p-5 transition-colors group-hover:border-accentGold/25">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-base font-medium text-white">{item.title || "Untitled analysis"}</p><p className="mt-1 text-xs text-textSecondary">{item.category || "General"} · {item.id}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider ${item.status === "completed" ? "border-green-300/15 bg-green-300/5 text-green-200/80" : "border-accentCyan/15 bg-accentCyan/5 text-accentCyan"}`}>{item.status === "completed" ? "Report ready" : "Draft"}</span></div>
            <div className="mt-6 flex items-center justify-between border-t border-glassBorderSecondary pt-3 text-xs text-textSecondary"><span className="truncate">{item.participants?.filter(Boolean).join(" · ") || "Parties not added"}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-accentGold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
          </GlassCard></Link>)}</div> : <GlassCard variant="secondary" className="p-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-glassBorder bg-white/[0.025]"><FileText className="h-5 w-5 text-textSecondary" /></div><h3 className="mt-4 font-medium text-white">{search ? "No matching analyses" : "Your workspace is ready"}</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-textSecondary">{search ? "Try another title, category, or case ID." : "Start an analysis to create a private draft. Draft details are stored in this browser."}</p>{!search && <Link href="/analysis/new" className="mt-5 inline-block"><GlassButton variant="secondary">Create your first draft <ArrowUpRight className="h-4 w-4" /></GlassButton></Link>}</GlassCard>}
        </section>

        <aside className="space-y-4">
          <GlassCard className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-accentGold">DATA & SOURCES</p><h3 className="mt-3 text-base font-medium text-white">Private local drafts</h3><p className="mt-2 text-xs leading-relaxed text-textSecondary">Case details and selected file names are saved to this browser. There is no legal research source or document upload service connected.</p><div className="mt-4 flex justify-between border-t border-glassBorderSecondary pt-3 text-xs"><span className="text-textSecondary">Files in current draft</span><span className="text-white">{documentCount}</span></div></GlassCard>
          <GlassCard variant="secondary" className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-textSecondary">IMPORTANT</p><p className="mt-3 text-xs leading-relaxed text-textSecondary">AI-generated information is informational only. It is not legal advice or a court decision. Verify important information with a qualified legal professional and authoritative sources.</p></GlassCard>
        </aside>
      </div>
    </div>
  );
}
