"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SectionReveal({ children, delay = 0, className }: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Cinematic ease-out
      }}
    >
      {children}
    </motion.div>
  );
}
