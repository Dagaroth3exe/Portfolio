"use client";
import { useState, useEffect } from "react";

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-sm border-b border-[#1a1a1a]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <a
            href="#hero"
            className="font-heading text-xl font-black uppercase tracking-widest text-white"
          >
            RP<span className="text-[#e8002d]">.</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-heading text-xs tracking-[0.25em] uppercase text-[#777] hover:text-white transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#1a1a1a] py-6 space-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block font-heading text-xs tracking-[0.25em] uppercase text-[#777] hover:text-white transition-colors duration-200 py-3 px-2"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-[#e8002d] via-[#e8002d]/40 to-transparent" />
    </nav>
  );
}
