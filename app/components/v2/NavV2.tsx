"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { person } from "../../lib/content";
import { TLink } from "../Transition";
import LogoMark from "../ui/LogoMark";
import GlitchText from "./GlitchText";

export const NAV_V2 = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/**
 * Minimal mono nav. `mix-blend-difference` keeps it legible over both paper
 * and ink sections without swapping colours.
 */
export default function NavV2() {
  const pathname = usePathname();
  const base = pathname === "/" ? "" : "/";
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[120] border-b border-[var(--line)] bg-[var(--bg)] text-white md:border-0 md:bg-transparent md:mix-blend-difference">
      <a href="#main" className="skip-link">Skip to content</a>
      <nav className="wrap flex h-[var(--nav-h)] items-center justify-between gap-6 mono text-[11px] uppercase tracking-[0.1em]" aria-label="Primary">
        <TLink href={`${base}#home`} className="flex items-center gap-3" aria-label={`${person.name} — home`}>
          <LogoMark className="h-5 w-auto" color="#fff" />
          <span className="hidden sm:inline">{person.name}</span>
        </TLink>

        <ul className="hidden md:flex items-center gap-7">
          {NAV_V2.map((n, i) => (
            <li key={n.id}>
              <TLink href={`${base}#${n.id}`} className="inline-flex items-baseline gap-1.5 hover:opacity-100 opacity-80">
                <span className="opacity-50">0{i + 1}</span>
                <GlitchText text={n.label} duration={380} />
              </TLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <span className="hidden lg:inline tabular-nums opacity-70">NOI {time || "--:--"}</span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" /> Available
          </span>
          <button
            type="button"
            className="md:hidden border border-white/40 px-3 py-1.5"
            aria-expanded={open}
            aria-controls="mnav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
      {open && (
        <ul id="mnav" className="md:hidden fixed inset-x-0 bottom-0 top-[var(--nav-h)] wrap overflow-y-auto bg-[var(--bg)] pt-8 pb-10 mono text-lg uppercase tracking-[0.08em] space-y-5">
          {NAV_V2.map((n, i) => (
            <li key={n.id}>
              <TLink href={`${base}#${n.id}`} onClick={() => setOpen(false)} className="flex gap-3">
                <span className="opacity-50">0{i + 1}</span>
                {n.label}
              </TLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
