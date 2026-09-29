"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "primary" | "secondary" | "highlight";
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  variant = "primary",
  className,
  children,
  ...props
}: GlassCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]";
  
  const variants = {
    primary: "glass-panel",
    secondary: "glass-panel-secondary",
    highlight: "glass-panel-highlight",
  };

  return (
    <motion.div
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
