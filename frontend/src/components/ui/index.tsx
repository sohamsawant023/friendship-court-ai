import React from "react";
export * from "./GlassCard";
export * from "./GlassButton";
export * from "../layout/FloatingPanel";
export * from "../layout/SectionReveal";

export function AnimatedHeading({ children, delay }: { children: React.ReactNode, delay?: number }) {
  return <div style={{ animationDelay: `${delay}s` }}>{children}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className="text-xs uppercase tracking-widest text-accentCyan bg-accentCyan/10 px-2 py-1 rounded">{status}</span>;
}
