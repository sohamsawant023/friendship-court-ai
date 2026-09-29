import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export type CourtLoadingPhase = "hearing" | "verdict" | "appeal";

const sarcasticMessages = [
  { icon: "⚖️", text: "The court is reviewing both sides..." },
  { icon: "🔍", text: "Cross-checking everyone's story..." },
  { icon: "🧠", text: "Detecting suspicious friendship logic..." },
  { icon: "📜", text: "Consulting the Friendship Constitution..." },
  { icon: "👨‍⚖️", text: "Asking the AI Judge to remain unbiased..." },
  { icon: "🔎", text: "Examining the extremely serious evidence..." },
  { icon: "⚖️", text: "Deliberating over this completely unnecessary dispute..." },
  { icon: "📋", text: "Preparing the official friendship verdict..." },
];

interface CourtLoadingMessageProps {
  phase?: CourtLoadingPhase;
  compact?: boolean;
}

export function CourtLoadingMessage({ compact = false }: CourtLoadingMessageProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % sarcasticMessages.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const currentMessage = sarcasticMessages[messageIndex];

  if (compact) {
    return (
      <div role="status" aria-live="polite" className="text-xs text-textSecondary flex items-center gap-2">
        <span className={shouldReduceMotion ? "" : "animate-pulse"}>{currentMessage.icon}</span>
        <span className="italic">{currentMessage.text}</span>
      </div>
    );
  }

  return (
    <div className="text-center flex flex-col items-center justify-center py-12">
      <div className="mb-8 px-4 py-1.5 rounded-full border border-accentGold/20 bg-accentGold/10 text-[10px] uppercase tracking-[0.2em] font-bold text-accentGold inline-flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
        <span className={`w-2 h-2 rounded-full bg-accentGold ${shouldReduceMotion ? "" : "animate-pulse"}`}></span>
        Court In Session
      </div>
      
      <div className="h-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.div 
              animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-6 drop-shadow-2xl"
            >
              {currentMessage.icon}
            </motion.div>
            <p className="text-textSecondary text-lg italic font-medium">{currentMessage.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}