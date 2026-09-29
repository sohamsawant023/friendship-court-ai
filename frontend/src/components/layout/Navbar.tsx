"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, Scale, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const bgOpacity = useTransform(scrollY, [0, 100], [0.02, 0.08]);
  const blurValue = useTransform(scrollY, [0, 100], [8, 24]);
  const borderColor = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)"]);

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "New Analysis", href: "/analysis/new" },
    { name: "History", href: "/history" },
    { name: "Appeals", href: "/appeals" },
  ];

  return (
    <motion.header
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <motion.div 
        className="flex items-center justify-between w-full max-w-5xl rounded-2xl px-6 py-3 border shadow-lg"
        style={{
          backgroundColor: useTransform(bgOpacity, v => `rgba(2, 4, 10, ${v})`),
          backdropFilter: useTransform(blurValue, v => `blur(${v}px)`),
          borderColor: borderColor,
        }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-accentGold to-[#8a7224] p-1.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-shadow duration-500">
            <Scale className="w-5 h-5 text-background" />
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:block">
            Friendship <span className="text-accentGold font-medium">Court</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg hover:text-white",
                  isActive ? "text-white" : "text-textSecondary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-xs font-medium text-accentCyan shadow-[0_0_10px_rgba(0,210,255,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accentCyan animate-pulse"></span>
            Local workspace
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-glassBorderSecondary bg-white/5 p-2 text-textPrimary"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute left-4 right-4 top-[calc(100%+10px)] grid gap-1 rounded-xl border border-glassBorderSecondary bg-[#080b10]/95 p-2 shadow-2xl backdrop-blur-2xl md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn("rounded-lg px-4 py-3 text-sm transition-colors", pathname === item.href ? "bg-white/10 text-white" : "text-textSecondary hover:bg-white/5 hover:text-white")}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </motion.div>
    </motion.header>
  );
}
