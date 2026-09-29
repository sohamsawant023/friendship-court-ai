"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav-control">
      <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-nav-menu">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" strokeWidth="1.6" strokeLinecap="round"/> : <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.6" strokeLinecap="round"/>}
        </svg>
      </button>
      {open && <nav id="mobile-nav-menu" className="mobile-nav-menu" aria-label="Mobile navigation">
        <Link href="/" onClick={() => setOpen(false)}>Workspace</Link>
        <Link href="/history" onClick={() => setOpen(false)}>Case history</Link>
        <Link href="/appeals" onClick={() => setOpen(false)}>Appeals</Link>
        <Link href="/case/new" onClick={() => setOpen(false)}>Open a case</Link>
      </nav>}
    </div>
  );
}
