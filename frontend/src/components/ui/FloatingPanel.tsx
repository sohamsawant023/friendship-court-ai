"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingPanelProps extends HTMLMotionProps<"div"> {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export function FloatingPanel({
  delay = 0,
  className,
  children,
  ...props
}: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={cn(
        "glass-panel animate-float",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}