"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}

export function GlassButton({
  variant = "secondary",
  className,
  children,
  ...props
}: GlassButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 group";
  
  const variants = {
    primary: "bg-gradient-to-r from-accentGold/80 to-[#b5952f] text-[#02040a] hover:from-accentGold hover:to-[#c6a333] shadow-[0_4px_14px_0_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_0_rgba(212,175,55,0.4)] border border-accentGold/50",
    secondary: "glass-panel hover:bg-white/10 text-textPrimary hover:shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] border-glassBorder",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseClasses, variants[variant], "px-6 py-3", className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] z-0" />
      )}
    </motion.button>
  );
}
