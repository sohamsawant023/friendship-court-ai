"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, MessageCircle, FileText, Smartphone, Gavel, Cpu, Sparkles } from "lucide-react";

interface LandingAnimationProps {
  onComplete: () => void;
}

export function LandingAnimation({ onComplete }: LandingAnimationProps) {
  const [scene, setScene] = useState(1);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const dialogue = [
    { speaker: "A", text: "THAT WAS MY PIZZA!" },
    { speaker: "B", text: "YOU SAID I COULD HAVE IT!" },
    { speaker: "A", text: "I SAID ONE BITE!" },
    { speaker: "B", text: "THIS IS ONE BITE!" },
  ];

  useEffect(() => {
    // Scene 1: Dialogue Progression
    if (scene === 1) {
      const interval = setInterval(() => {
        setDialogueIndex((prev) => {
          if (prev < dialogue.length - 1) return prev + 1;
          clearInterval(interval);
          setTimeout(() => setScene(2), 1500);
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
    
    // Scene 2: Escalation to Freeze
    if (scene === 2) {
      const timer = setTimeout(() => setScene(3), 3000);
      return () => clearTimeout(timer);
    }

    // Scene 3: AI Judge
    if (scene === 3) {
      const timer = setTimeout(() => setScene(4), 4500);
      return () => clearTimeout(timer);
    }

    // Scene 4: Courtroom Transition
    if (scene === 4) {
      const timer = setTimeout(() => {
        setScene(5);
        setTimeout(onComplete, 1000);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [scene, onComplete, dialogue.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1c] overflow-hidden text-white font-sans">
      
      {/* Background ambient lighting */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: scene >= 3 
            ? "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.15) 0%, rgba(10,15,28,1) 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(25,35,55,1) 0%, rgba(10,15,28,1) 100%)"
        }}
        transition={{ duration: 1.5 }}
      />

      <AnimatePresence mode="wait">
        {/* SCENE 1 & 2: The Argument */}
        {(scene === 1 || scene === 2) && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: scene === 2 ? 0.7 : 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
            className="relative w-full max-w-4xl h-[600px] flex items-center justify-between px-20"
          >
            {/* Friend A (Left) */}
            <motion.div 
              className="flex flex-col items-center relative"
              animate={scene === 2 ? { x: -50, opacity: 0.5 } : {}}
            >
              <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-red-500/30 flex items-center justify-center mb-4 relative overflow-hidden">
                <span className="text-4xl">😤</span>
                <div className="absolute bottom-0 right-0 text-2xl">📦</div>
              </div>
              <span className="text-red-400 font-bold tracking-widest uppercase text-sm">Friend A</span>
              
              <AnimatePresence>
                {dialogue[dialogueIndex].speaker === "A" && scene === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-16 bg-white text-black px-4 py-2 rounded-2xl rounded-bl-none font-bold shadow-xl whitespace-nowrap z-10"
                  >
                    {dialogue[dialogueIndex].text}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Evidence that appears in Scene 2 */}
            <AnimatePresence>
              {scene === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <motion.div initial={{ y: -100, x: -100, rotate: -20, opacity: 0 }} animate={{ y: -50, x: -80, rotate: -10, opacity: 1 }} transition={{ delay: 0.2 }} className="absolute text-4xl"><Smartphone className="text-blue-400 w-12 h-12"/></motion.div>
                  <motion.div initial={{ y: 100, x: 100, rotate: 45, opacity: 0 }} animate={{ y: 60, x: 120, rotate: 25, opacity: 1 }} transition={{ delay: 0.4 }} className="absolute text-4xl"><FileText className="text-gray-400 w-12 h-12"/></motion.div>
                  <motion.div initial={{ y: -80, x: 150, rotate: 15, opacity: 0 }} animate={{ y: -40, x: 100, rotate: 5, opacity: 1 }} transition={{ delay: 0.6 }} className="absolute text-5xl">🍽️</motion.div>
                  <motion.div initial={{ y: 120, x: -120, rotate: -45, opacity: 0 }} animate={{ y: 80, x: -90, rotate: -15, opacity: 1 }} transition={{ delay: 0.8 }} className="absolute text-5xl">🧾</motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Friend B (Right) */}
            <motion.div 
              className="flex flex-col items-center relative"
              animate={scene === 2 ? { x: 50, opacity: 0.5 } : {}}
            >
              <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-blue-500/30 flex items-center justify-center mb-4 relative overflow-hidden">
                <span className="text-4xl">🤷‍♂️</span>
                <div className="absolute bottom-0 left-0 text-2xl">🍕</div>
              </div>
              <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Friend B</span>

              <AnimatePresence>
                {dialogue[dialogueIndex].speaker === "B" && scene === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-16 bg-white text-black px-4 py-2 rounded-2xl rounded-br-none font-bold shadow-xl whitespace-nowrap z-10"
                  >
                    {dialogue[dialogueIndex].text}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* "ENOUGH." Text in Scene 2 */}
            <AnimatePresence>
              {scene === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-20"
                >
                  <motion.h1 
                    className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  >
                    ENOUGH.
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-4 text-2xl text-accentGold tracking-widest font-bold uppercase"
                  >
                    Take it to court.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* SCENE 3: AI Judge Arrives */}
        {scene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(5px)" }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center relative z-10"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-10 border border-accentGold/20 rounded-full border-dashed"
              />
              <div className="w-40 h-40 bg-surface border-2 border-accentGold rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)] relative z-10">
                <Cpu className="w-12 h-12 text-accentGold mb-2" />
                <span className="text-xs font-bold text-accentGold tracking-widest">HONORABLE AI</span>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 1 }}
              className="mt-12 bg-surface/80 backdrop-blur-md border border-accentGold/30 p-6 rounded-2xl flex flex-col items-center"
            >
              <div className="text-xs text-accentCyan mb-2 font-mono flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> CASE DETECTED
              </div>
              <h2 className="text-2xl font-bold text-white tracking-widest mb-1">FRIENDSHIP DISPUTE</h2>
              <div className="text-sm text-textSecondary font-mono bg-black/50 px-3 py-1 rounded-full">CASE #001</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5, type: "spring" }}
              className="mt-8 flex flex-col items-center"
            >
              <Gavel className="w-16 h-16 text-accentGold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
                className="mt-4 text-3xl font-bold text-white tracking-widest"
              >
                COURT IS NOW IN SESSION
              </motion.h3>
            </motion.div>
          </motion.div>
        )}

        {/* SCENE 4: Courtroom Transition */}
        {scene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full flex flex-col items-center justify-center relative p-10"
          >
            {/* Courtroom Setup */}
            <div className="absolute inset-0 flex justify-between items-center px-32 opacity-30">
              <div className="w-32 h-64 bg-surface border-r-4 border-red-500/50 rounded-r-3xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <span className="text-red-400 font-bold uppercase rotate-[-90deg] tracking-widest text-2xl">Plaintiff</span>
              </div>
              <div className="w-32 h-64 bg-surface border-l-4 border-blue-500/50 rounded-l-3xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <span className="text-blue-400 font-bold uppercase rotate-[90deg] tracking-widest text-2xl">Defendant</span>
              </div>
            </div>

            {/* AI Judge Desk Center */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-20 flex flex-col items-center"
            >
              <Scale className="w-12 h-12 text-accentGold mb-4 opacity-50" />
              <div className="px-8 py-3 bg-surface border-b-2 border-accentGold rounded-b-3xl">
                <h1 className="text-2xl font-bold text-white tracking-widest">FRIENDSHIP COURT AI</h1>
              </div>
            </motion.div>

            {/* UI Dashboard appearing */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="z-10 mt-32 w-full max-w-3xl bg-surface/80 backdrop-blur-xl border border-glassBorder rounded-2xl p-8 flex flex-col items-center shadow-2xl"
            >
              <div className="text-accentGold font-mono text-sm mb-2">CASE #001</div>
              <h2 className="text-4xl font-bold text-white mb-8">&quot;WHO ATE THE PIZZA?&quot;</h2>
              
              <div className="grid grid-cols-3 gap-6 w-full">
                <div className="bg-surfaceSecondary/50 p-4 rounded-xl border border-glassBorderSecondary flex flex-col items-center justify-center gap-2">
                  <MessageCircle className="w-6 h-6 text-textSecondary" />
                  <span className="text-xs tracking-widest text-textSecondary">STATEMENTS</span>
                </div>
                <div className="bg-surfaceSecondary/50 p-4 rounded-xl border border-glassBorderSecondary flex flex-col items-center justify-center gap-2">
                  <FileText className="w-6 h-6 text-textSecondary" />
                  <span className="text-xs tracking-widest text-textSecondary">EVIDENCE</span>
                </div>
                <div className="bg-accentGold/10 p-4 rounded-xl border border-accentGold/30 flex flex-col items-center justify-center gap-2">
                  <Cpu className="w-6 h-6 text-accentGold" />
                  <span className="text-xs tracking-widest text-accentGold font-bold">AI HEARING</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
