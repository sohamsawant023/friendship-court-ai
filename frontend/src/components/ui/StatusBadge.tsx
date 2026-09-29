"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "resolved" | "pending" | "guilty" | "not-guilty" | "partial" | "insufficient";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    active: { label: "ACTIVE", color: "bg-green-500/10 text-green-400 border-green-500/30" },
    resolved: { label: "RESOLVED", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    pending: { label: "PENDING", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
    guilty: { label: "GUILTY", color: "bg-red-500/10 text-red-400 border-red-500/30" },
    "not-guilty": { label: "NOT GUILTY", color: "bg-green-500/10 text-green-400 border-green-500/30" },
    partial: { label: "PARTIALLY RESPONSIBLE", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    insufficient: { label: "INSUFFICIENT EVIDENCE", color: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
  };

  const { label, color } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "status-badge border px-3 py-1 rounded-full text-xs font-semibold tracking-wider",
        color,
        className
      )}
    >
      {label}
    </motion.div>
  );
}