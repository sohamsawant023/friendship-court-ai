"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Scale, CheckCircle, Zap } from "lucide-react";

interface AnalysisItem {
  label: string;
  value: string | string[];
  icon?: React.ReactNode;
  displayType?: "text" | "list";
  itemType?: "alert";
}

interface GlassAnalysisPanelProps {
  title: string;
  items: AnalysisItem[];
  className?: string;
  isLoading?: boolean;
}

export function GlassAnalysisPanel({ title, items, className, isLoading }: GlassAnalysisPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl bg-surface/80 backdrop-blur-xl border border-glassBorder p-6 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-glassBorderSecondary pb-4">
        <div className="w-10 h-10 rounded-lg bg-accentGold/10 border border-accentGold/20 flex items-center justify-center">
          <Scale className="w-5 h-5 text-accentGold" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-textSecondary">AI-powered analysis</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-surfaceSecondary rounded w-1/3 mb-2" />
              <div className="h-3 bg-surfaceSecondary rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border",
                item.itemType === "alert"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-surfaceSecondary border-glassBorderSecondary"
              )}
            >
              <div className="flex items-start gap-3">
                {item.icon && (
                  <div className="w-8 h-8 rounded-lg bg-surface border border-glassBorder flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                    {item.label}
                  </p>
                  {item.displayType === "list" && Array.isArray(item.value) ? (
                    <ul className="space-y-2">
                      {item.value.map((val, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white">
                          <CheckCircle className="w-4 h-4 text-accentGold shrink-0 mt-0.5" />
                          <span>{val}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white leading-relaxed">{item.value as string}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Processing Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-accentCyan">
          <Zap className="w-4 h-4 animate-pulse" />
          <span className="animate-pulse">Processing with AI...</span>
        </div>
      )}
    </motion.div>
  );
}
