"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

export interface Step {
  id: number;
  label: string;
  status: "completed" | "current" | "upcoming" | "error";
}

interface GlassStepperProps {
  steps: Step[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function GlassStepper({ steps, orientation = "horizontal", className }: GlassStepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex gap-2",
        isHorizontal ? "flex-row items-center" : "flex-col items-start"
      )}>
        {steps.map((step, index) => (
          <div key={step.id} className={cn(
            "flex items-center",
            isHorizontal ? "flex-1" : "w-full"
          )}>
            {/* Step Content */}
            <div className={cn(
              "flex items-center gap-3 relative",
              isHorizontal ? "flex-1" : "w-full"
            )}>
              {/* Step Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  step.status === "completed" && "bg-accentGold/20 border-accentGold shadow-[0_0_15px_rgba(212,175,55,0.4)]",
                  step.status === "current" && "bg-accentCyan/20 border-accentCyan shadow-[0_0_15px_rgba(0,210,255,0.4)] animate-pulse",
                  step.status === "upcoming" && "bg-surface border-glassBorderSecondary",
                  step.status === "error" && "bg-red-500/20 border-red-500"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="w-5 h-5 text-accentGold" />
                ) : step.status === "current" ? (
                  <Circle className="w-4 h-4 text-accentCyan fill-accentCyan" />
                ) : step.status === "error" ? (
                  <Circle className="w-4 h-4 text-red-500 fill-red-500" />
                ) : (
                  <span className="text-xs text-textSecondary font-semibold">{step.id}</span>
                )}
              </motion.div>

              {/* Step Label */}
              <div className={cn(
                "flex-1",
                !isHorizontal && "ml-2"
              )}>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    step.status === "completed" && "text-accentGold",
                    step.status === "current" && "text-accentCyan",
                    step.status === "upcoming" && "text-textSecondary",
                    step.status === "error" && "text-red-400"
                  )}
                >
                  {step.label}
                </motion.span>
              </div>

              {/* Connector Line */}
              {isHorizontal && index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300",
                  step.status === "completed" ? "bg-accentGold/60" : "bg-glassBorderSecondary"
                )} />
              )}
            </div>

            {/* Vertical Connector */}
            {!isHorizontal && index < steps.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-8">
                <div className={cn(
                  "h-full w-full transition-all duration-300",
                  step.status === "completed" ? "bg-accentGold/60" : "bg-glassBorderSecondary"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
