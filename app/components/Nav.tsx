"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "../lib/gsap";
import { person } from "../lib/content";
import { TLink } from "./Transition";
import LogoMark from "./ui/LogoMark";
import Magnetic from "./ui/Magnetic";

export const NAV = [
  { id: "work", label: "Projects", n: "01" },
  { id: "experience", label: "Experience", n: "02" },
  { id: "skills", label: "Skills", n: "03" },
  { id: "about", label: "About", n: "04" },
  { id: "faq", label: "Q&A", n: "05" },
  { id: "contact", label: "Contact", n: "06" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [hidden, setHidden] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const base = pathname === "/" ? "" : "/";

  // Active section + scroll progress + hide on scroll down
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      setHidden(y > 200 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
      let current = "";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) current = n.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Menu open/close choreography + focus management
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduced ? 0 : 1;
    if (open) {
      document.documentElement.classList.add("menu-open");
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { clipPath: "polygon(0 0, 0 0, -20% 100%, -20% 100%)" }, {
        clipPath: "polygon(0 0, 120% 0, 100% 100%, -20% 100%)", duration: 0.7 * d, ease: "power4.inOut",
      });
      gsap.fromTo(el.querySelectorAll(".menu-link"), { yPercent: 110 }, {
        yPercent: 0, duration: 0.8 * d, stagger: 0.05, delay: 0.25 * d, ease: "power4.out",
      });
      el.querySelector<HTMLElement>("a")?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    document.documentElement.classList.remove("menu-open");
    gsap.to(el, {
      clipPath: "polygon(120% 0, 120% 0, 100% 100%, 100% 100%)", duration: 0.55 * d, ease: "power4.inOut",
      onComplete: () => { gsap.set(el, { visibility: "hidden" }); },
    });
  }, [open]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className={`nav ${hidden && !open ? "nav--hidden" : ""}`}>
        <div className="nav-progress" ref={progress} />
        <div className="nav-inner">
          <Magnetic strength={0.25}>
            <TLink href={`${base}#home`} className="nav-brand" aria-label={`${person.name} — home`}>
              <LogoMark className="h-7 w-auto text-[var(--red)]" />
              <span className="nav-brand-text">
                <span>{person.first}</span>
                <span className="text-[var(--muted)]">{person.last}</span>
              </span>
            </TLink>
          </Magnetic>

          <nav aria-label="Primary" className="nav-links">
            {NAV.map((n) => (
              <TLink
                key={n.id}
                href={`${base}#${n.id}`}
                className={`nav-link ${active === n.id && !base ? "is-active" : ""}`}
                aria-current={active === n.id && !base ? "location" : undefined}
              >
                <span className="nav-link-n">{n.n}</span>
                <span className="nav-link-t" data-text={n.label}>{n.label}</span>
              </TLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Magnetic strength={0.3}>
                <TLink href={`${base}#contact`} className="nav-cta">
                  <span className="nav-cta-dot" /> Available
                </TLink>
              </Magnetic>
            </div>
            <button
              ref={toggle}
              className={`nav-toggle ${open ? "is-open" : ""}`}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        ref={menu}
        className="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <div className="menu-grid">
          <nav aria-label="Menu" className="menu-nav">
            {NAV.map((n) => (
              <div key={n.id} className="overflow-hidden">
                <TLink
                  href={`${base}#${n.id}`}
                  className="menu-link"
                  onClick={() => {
                    setOpen(false);
                    toggle.current?.focus();
                  }}
                >
                  <span className="menu-link-n">{n.n}</span>
                  <span className="menu-link-t">{n.label}</span>
                </TLink>
              </div>
            ))}
          </nav>
          <div className="menu-aside">
            <p className="label text-[var(--muted)]">Direct line</p>
            <a href={`mailto:${person.email}`} className="menu-mail">{person.email}</a>
            <div className="flex gap-6 mt-6">
              {person.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="label link-underline">
                  {s.label} ↗
                </a>
              ))}
            </div>
            <LogoMark className="menu-logo" />
          </div>
        </div>
      </div>
    </>
  );
}
