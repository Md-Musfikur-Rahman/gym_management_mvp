"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Activity, ArrowUpRight, Menu, X } from "lucide-react";
import styles from "@/app/landing.module.css";

export const DEMO_URL = "https://gym-management-musfikur.vercel.app/login";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header
      className={styles.header}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link className={styles.brand} href="/" aria-label="Northline home">
          <span className={styles.brandMark}>
            <Activity size={25} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span>northline<span className={styles.brandPeriod}>.</span></span>
        </Link>

        <nav aria-label="Main navigation" className={styles.desktopNav}>
          <a href="#platform">The platform</a>
          <a href="#check-in">How it works</a>
          <a href="#questions">FAQs</a>
        </nav>

        <div className={styles.headerActions}>
          <Link href="/login" className={styles.signIn}>Sign in</Link>
          <a href={DEMO_URL} className={`${styles.button} ${styles.buttonDark} ${styles.headerDemo}`}>
            Explore live demo <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className={styles.mobileNav}>
          <a href="#platform" onClick={() => setMenuOpen(false)}>The platform <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href="#check-in" onClick={() => setMenuOpen(false)}>How it works <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href="#questions" onClick={() => setMenuOpen(false)}>FAQs <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href={DEMO_URL} onClick={() => setMenuOpen(false)}>Explore live demo <ArrowUpRight size={17} aria-hidden="true" /></a>
        </nav>
      )}
    </header>
  );
}
