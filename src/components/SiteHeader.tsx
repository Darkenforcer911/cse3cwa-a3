"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-top">
        <div>
          <p className="student-number">
 CSE3CWA Assessment 3 — Data-driven Application and Reporting
 </p>

<h1>Phoneme Activity Builder</h1>
        </div>

        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </div>

      <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
        <Link href="/">Home</Link>
        <Link href="/wordle">Wordle</Link>
        <Link href="/word-search">Word Search</Link>
        <Link href="/about">About</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/settings">Settings</Link>
        <Link href="/activities">Saved Activities</Link>
        
      </nav>
    </header>
  );
}