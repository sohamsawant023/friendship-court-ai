"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "gold" | "cyan" | "green";
}

export function GlassProgress({
  value,
  max = 100,
  className,
  showLabel = false,
  size = "md",
  color = "gold"
}: GlassProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  const colors = {
    gold: "bg-gradient-to-r from-accentGold/80 to-accentGold shadow-[0_0_10px_rgba(212,175,55,0.5)]",
    cyan: "bg-gradient-to-r from-accentCyan/80 to-accentCyan shadow-[0_0_10px_rgba(0,210,255,0.5)]",
    green: "bg-gradient-to-r from-green-400/80 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-textSecondary">Progress</span>
          <span className="text-xs font-mono text-accentGold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        "w-full rounded-full overflow-hidden bg-surfaceSecondary border border-glassBorderSecondary",
        sizes[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-all duration-300",
            colors[color]
          )}
        />
      </div>
    </div>
  );
}
