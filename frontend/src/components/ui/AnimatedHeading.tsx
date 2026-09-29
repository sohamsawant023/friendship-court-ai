"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedHeading({ children, className, delay = 0 }: AnimatedHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}