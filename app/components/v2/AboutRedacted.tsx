"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "../../lib/gsap";
import { about, person } from "../../lib/content";
import LogoMark from "../ui/LogoMark";
import GlitchText from "./GlitchText";
import { SectionLabel } from "./ProjectsDrawer";

/**
 * About as a declassified file. Selected words start under redaction bars;
 * as you scroll through the document the bars peel away in reading order and
 * the words settle in from slightly scattered positions. Reduced motion:
 * fully declassified from the start.
 */
export default function AboutRedacted() {
  const doc = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);

  const paras = useMemo(() => [about.lede, ...about.body], []);
  // Deterministic redaction picks: medium/long words, spread through the text
  const tokens = useMemo(() => {
    let order = 0;
    return paras.map((p, pi) =>
      p.split(/(\s+)/).map((w, wi) => {
        const isWord = /\S/.test(w);
        const redact = isWord && w.replace(/\W/g, "").length > 4 && (wi * 7 + pi * 3) % 9 === 0;
        return { w, redact, order: redact ? order++ : -1, seed: ((wi * 37 + pi * 11) % 17) - 8 };
      }),
    );
  }, [paras]);
  const total = tokens.flat().filter((t) => t.redact).length;

  useEffect(() => {
    const el = doc.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => {
        setProgress(1);
        setInView(true);
      });
      return () => cancelAnimationFrame(id);
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      end: "bottom 60%",
      onUpdate: (self) => setProgress(self.progress),
      onEnter: () => setInView(true),
    });
    return () => st.kill();
  }, []);

  const revealed = Math.floor(progress * (total + 1));

  return (
    <section id="about" aria-labelledby="about-title" className="relative">
      <div className="wrap py-28 md:py-36">
        <SectionLabel n="04" title="About" note="Declassified" />
        <h2 id="about-title" className="display mt-8 text-[clamp(2.8rem,6vw,6rem)] text-[var(--fg)]">
          <GlitchText text="Personnel file." />
        </h2>

        <div ref={doc} className="doc paper-grain relative mx-auto mt-16 max-w-4xl border border-[var(--line-strong)] bg-[var(--bg-2)] px-6 py-10 md:px-14 md:py-14">
          {/* Release header */}
          <p className="mono text-center text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Approved for release 2026/11/14 : RP-0003-PORTFOLIO
          </p>
          <div className="mt-6 flex items-start justify-between gap-6">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--fg-2)] space-y-1">
              <p>File Nº 3 — Personnel</p>
              <p className="text-[var(--muted)]">Subject: {person.name}</p>
            </div>
            {/* Attached photo */}
            <figure className="relative w-24 shrink-0 rotate-[3deg] border border-[var(--line-strong)] bg-[var(--fg)] p-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.5)] md:w-32">
              <span className="absolute -top-3 left-1/2 h-6 w-3 -translate-x-1/2 rounded-full border-2 border-[#777]" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src="/avatar.jpg" alt={`Photo of ${person.name}`} fill sizes="128px" className="object-cover grayscale contrast-125" />
              </div>
            </figure>
          </div>

          {/* Stamp */}
          <div
            className={`pointer-events-none absolute right-8 top-40 hidden rotate-[-12deg] border-[3px] border-[var(--fg)] px-3 py-1 mono text-xl font-semibold uppercase tracking-[0.18em] text-[var(--fg)] transition-opacity duration-500 md:block ${
              revealed >= total ? "opacity-70" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            Declassified
          </div>

          <div className="mt-10 space-y-6 text-[1.05rem] leading-[1.75] text-[var(--fg-2)]" style={{ fontFamily: "var(--ff-mono), monospace", fontSize: "0.95rem" }}>
            {tokens.map((para, pi) => (
              <p key={pi} className={pi === 0 ? "text-[var(--fg)]" : ""}>
                {para.map((t, ti) =>
                  /\S/.test(t.w) ? (
                    <span
                      key={ti}
                      className={`doc-word ${t.redact ? "doc-redact" : ""} ${t.redact && t.order < revealed ? "is-open" : ""} ${inView ? "is-in" : ""}`}
                      style={{ ["--dx" as string]: `${t.seed * 0.6}px`, ["--dy" as string]: `${(t.seed % 5) * 1.6}px`, transitionDelay: `${(ti % 40) * 12}ms` }}
                    >
                      {t.w}
                    </span>
                  ) : (
                    t.w
                  ),
                )}
              </p>
            ))}
          </div>

          {/* Form fields */}
          <dl className="mt-12 grid gap-x-10 gap-y-4 border-t border-[var(--line-strong)] pt-6 sm:grid-cols-2">
            {about.facts.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-3 border-b border-dotted border-[var(--line-strong)] pb-2">
                <dt className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] w-24 shrink-0">{k}</dt>
                <dd className="mono text-[13px] text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex items-center justify-between mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
            <span>— 3 —</span>
            <LogoMark className="h-5 w-auto text-[var(--fg)]" />
            <span>
              {Math.min(revealed, total)}/{total} declassified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
