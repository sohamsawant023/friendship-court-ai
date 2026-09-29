"use client";

import { cn } from "@/lib/utils";
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
  onStepClick?: (stepId: number) => void;
}

export function GlassStepper({ steps, orientation = "horizontal", className, onStepClick }: GlassStepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <nav aria-label="Analysis progress" className={cn("relative", className)}>
      <ol className={cn("flex", isHorizontal ? "items-center gap-2" : "flex-col gap-0")}>
        {steps.map((step, index) => {
          const canReturn = Boolean(onStepClick && step.status === "completed");
          const content = <>
            <span className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
              step.status === "completed" && "border-accentGold/40 bg-accentGold/10 text-accentGold",
              step.status === "current" && "border-accentCyan/50 bg-accentCyan/10 text-accentCyan shadow-[0_0_18px_rgba(0,210,255,.12)]",
              step.status === "upcoming" && "border-glassBorderSecondary bg-surface text-textSecondary",
              step.status === "error" && "border-red-400/40 bg-red-400/10 text-red-300",
            )}>
              {step.status === "completed" ? <Check className="h-4 w-4" /> : step.status === "current" ? <Circle className="h-3.5 w-3.5 fill-current" /> : step.status === "error" ? <Circle className="h-3.5 w-3.5 fill-current" /> : <span className="text-xs font-medium">{step.id}</span>}
            </span>
            <span className={cn(
              "text-sm leading-snug",
              step.status === "completed" && "text-accentGold",
              step.status === "current" && "font-medium text-white",
              step.status === "upcoming" && "text-textSecondary",
              step.status === "error" && "text-red-300",
            )}>{step.label}</span>
          </>;

          return <li key={step.id} className={cn("relative", isHorizontal ? "flex min-w-0 flex-1 items-center" : "min-h-[58px] pl-1")}>
            {canReturn ? <button type="button" onClick={() => onStepClick?.(step.id)} className={cn("flex items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accentGold", isHorizontal && "min-w-0")} aria-label={`Return to completed step ${step.id}: ${step.label}`}>{content}</button> : <div className={cn("flex items-center gap-3", isHorizontal && "min-w-0")} aria-current={step.status === "current" ? "step" : undefined}>{content}</div>}
            {isHorizontal && index < steps.length - 1 && <span aria-hidden="true" className={cn("mx-2 h-px flex-1", step.status === "completed" ? "bg-accentGold/40" : "bg-glassBorderSecondary")} />}
            {!isHorizontal && index < steps.length - 1 && <span aria-hidden="true" className={cn("absolute left-[18px] top-10 h-[26px] w-px", step.status === "completed" ? "bg-accentGold/35" : "bg-glassBorderSecondary")} />}
          </li>;
        })}
      </ol>
    </nav>
  );
}
