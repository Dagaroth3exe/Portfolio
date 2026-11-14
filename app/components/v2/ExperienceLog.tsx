"use client";

import { useEffect, useRef, useState } from "react";
import { education, experience, projects } from "../../lib/content";
import { TLink } from "../Transition";
import GlitchText from "./GlitchText";
import { SectionLabel } from "./ProjectsDrawer";

/**
 * Experience as a measured timeline + datasheet.
 *
 * Top: a time axis with each role drawn as a dimension span (end ticks,
 * measured duration). Education runs as a dashed lane underneath.
 * Below: one datasheet row per role. Hovering a row highlights its span and
 * vice versa. Spans draw in when the section comes into view.
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Sep 2026" → months since year 0. "Present" → now. */
function toMonth(s: string) {
  const t = s.trim().toLowerCase();
  if (t.startsWith("present")) {
    const d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }
  const [m, y] = t.split(/\s+/);
  return Number(y) * 12 + Math.max(0, MONTHS.indexOf(m.slice(0, 3)));
}
function span(period: string) {
  const [a, b] = period.split(/\s+[—–-]\s+/);
  const start = toMonth(a);
  const end = toMonth(b ?? a);
  return { start, end: end + 1, months: end - start + 1 }; // inclusive of the end month
}

type Lane = { key: string; label: string; sub: string; period: string; start: number; end: number; months: number; edu?: boolean };

export default function ExperienceLog() {
  const lanes: Lane[] = [
    ...experience.map((e, i) => ({ key: `e${i}`, label: e.company, sub: e.role, period: e.period, ...span(e.period) })),
    { key: "edu", label: education.school, sub: education.degree, period: education.period, ...span(education.period), edu: true },
  ];
  const min = Math.floor(Math.min(...lanes.map((l) => l.start)) / 12) * 12;
  const max = Math.ceil(Math.max(...lanes.map((l) => l.end)) / 12) * 12;
  const total = max - min;
  const pct = (m: number) => ((m - min) / total) * 100;
  const years = Array.from({ length: total / 12 + 1 }, (_, i) => min / 12 + i);

  const [hot, setHot] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const axis = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = axis.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="experience" aria-labelledby="exp-title" className="relative">
      <div className="wrap py-28 md:py-36">
        <SectionLabel n="02" title="Experience" note={`${experience.length} roles · 1 degree`} />
        <h2 id="exp-title" className="display mt-8 text-[clamp(2.8rem,6vw,6rem)] text-[var(--fg)]">
          <GlitchText text="Measured experience." />
        </h2>

        {/* ---- Timeline ---- */}
        <div ref={axis} className={`exp-axis relative mt-16 border border-[var(--line-strong)] px-4 pb-6 pt-10 md:px-8 ${on ? "is-on" : ""}`}>
          <Corners />
          <p className="absolute left-4 top-3 mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] md:left-8">
            T-axis · {years[0]} → {years[years.length - 1]} · 1 tick = 1 quarter
          </p>

          <div className="relative">
            {/* Year gridlines + quarter ticks */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {Array.from({ length: total / 3 + 1 }, (_, q) => (
                <span
                  key={q}
                  className={`absolute top-0 bottom-0 w-px ${q % 4 === 0 ? "bg-[var(--line-strong)]" : "bg-[var(--line)]"}`}
                  style={{ left: `${(q * 3 * 100) / total}%` }}
                />
              ))}
            </div>

            <ul className="relative space-y-5 py-4">
              {lanes.map((l, i) => {
                const left = pct(l.start);
                const width = pct(l.end) - left;
                const active = hot === l.key;
                return (
                  <li key={l.key} className="relative h-10">
                    <button
                      type="button"
                      className={`exp-span absolute top-0 h-full text-left ${active ? "is-hot" : ""} ${l.edu ? "is-edu" : ""}`}
                      style={{ left: `${left}%`, width: `${width}%`, transitionDelay: `${0.15 + i * 0.18}s` }}
                      onMouseEnter={() => setHot(l.key)}
                      onMouseLeave={() => setHot(null)}
                      onFocus={() => setHot(l.key)}
                      onBlur={() => setHot(null)}
                      onClick={() => document.getElementById(`row-${l.key}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                      aria-label={`${l.label}, ${l.period}, ${l.months} months`}
                    >
                      <span className="exp-bar" />
                      <span className="exp-tag mono">
                        Δ {l.months} MO
                      </span>
                    </button>
                    {/* Lane label, outside the bar */}
                    <span
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 mono text-[10px] uppercase tracking-[0.1em] text-[var(--muted)] whitespace-nowrap"
                      style={
                        width > 40
                          ? { left: `${left + width / 2}%`, transform: "translate(-50%, -50%)", background: "var(--bg)", padding: "0 6px" }
                          : left > 55
                            ? { right: `${100 - left + 1}%` }
                            : { left: `calc(${pct(l.end)}% + 10px)` }
                      }
                    >
                      {l.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Year labels */}
          <div className="relative mt-2 h-4 mono text-[10px] text-[var(--muted)]" aria-hidden="true">
            {years.map((y, i) => (
              <span key={y} className="absolute -translate-x-1/2" style={{ left: `${(i * 12 * 100) / total}%` }}>
                {y}
              </span>
            ))}
          </div>
        </div>

        {/* ---- Datasheet ---- */}
        <div className="mt-10 border-t border-[var(--line-strong)]">
          {experience.map((e, i) => {
            const s = span(e.period);
            const key = `e${i}`;
            const cs = e.caseStudy ? projects.find((p) => p.slug === e.caseStudy) : null;
            const items = e.highlights.map((h) => {
              const k = h.indexOf(":");
              return k > 0 && k < 40 ? { name: h.slice(0, k), note: h.slice(k + 1).trim() } : { name: h, note: "" };
            });
            return (
              <article
                key={e.company}
                id={`row-${key}`}
                onMouseEnter={() => setHot(key)}
                onMouseLeave={() => setHot(null)}
                className={`exp-row relative grid gap-6 border-b border-[var(--line-strong)] py-8 transition-colors md:grid-cols-12 md:gap-8 ${hot === key ? "bg-[var(--bg-2)]" : ""}`}
              >
                {/* Index + measured period */}
                <div className="md:col-span-3 mono text-[11px] uppercase tracking-[0.08em]">
                  <p className="text-[var(--fg)]">E-{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-3 text-[var(--fg-2)]">{e.period}</p>
                  <div className="mt-3 flex items-center gap-2 text-[var(--muted)]">
                    <span className="relative h-2 w-16 border-x border-[var(--fg-2)]">
                      <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--fg-2)]" />
                    </span>
                    Δ {s.months} {s.months === 1 ? "month" : "months"}
                  </div>
                  <p className="mt-3 text-[var(--muted)]">{e.type}</p>
                </div>

                {/* Who / what */}
                <div className="md:col-span-4">
                  <h3 className="display text-[clamp(1.6rem,2.4vw,2.2rem)] text-[var(--fg)]">{e.company}</h3>
                  <p className="mt-1 mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">{e.role}</p>
                  <p className="mt-4 text-[var(--fg-2)] leading-relaxed">{e.summary}</p>
                  {cs && (
                    <TLink href={`/work/${cs.slug}`} className="mt-5 inline-flex mono text-[11px] uppercase tracking-[0.1em] text-[var(--fg)] link-underline">
                      Open file: {cs.title} →
                    </TLink>
                  )}
                </div>

                {/* Built + stack */}
                <div className="md:col-span-5">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Shipped / built</p>
                  <ul className="mt-3 space-y-2.5">
                    {items.map((it, k) => (
                      <li key={k} className="grid grid-cols-[1.4rem_1fr] gap-2 text-[0.95rem] leading-snug">
                        <span className="mono text-[11px] text-[var(--fg)] pt-0.5">[✓]</span>
                        <span>
                          <span className="text-[var(--fg)]">{it.name}</span>
                          {it.note && <span className="text-[var(--muted)]"> — {it.note}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Stack</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {e.stack.map((t) => (
                      <li key={t} className="border border-[var(--line-strong)] px-2 py-1 mono text-[10px] uppercase tracking-[0.06em] text-[var(--fg-2)]">
                        {t}
                      </li>
                    ))}
                    {e.explored?.map((t) => (
                      <li key={t} className="border border-dashed border-[var(--line-strong)] px-2 py-1 mono text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]" title="Explored">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}

          {/* Education row */}
          <article
            id="row-edu"
            onMouseEnter={() => setHot("edu")}
            onMouseLeave={() => setHot(null)}
            className={`grid gap-6 border-b border-[var(--line-strong)] py-8 transition-colors md:grid-cols-12 md:gap-8 ${hot === "edu" ? "bg-[var(--bg-2)]" : ""}`}
          >
            <div className="md:col-span-3 mono text-[11px] uppercase tracking-[0.08em]">
              <p className="text-[var(--fg)]">ED-01</p>
              <p className="mt-3 text-[var(--fg-2)]">{education.period}</p>
              <p className="mt-3 text-[var(--muted)]">Δ {span(education.period).months} months · Completed</p>
            </div>
            <div className="md:col-span-9">
              <h3 className="display text-[clamp(1.6rem,2.4vw,2.2rem)] text-[var(--fg)]">{education.degree}</h3>
              <p className="mt-1 mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">{education.school}</p>
            </div>
          </article>
        </div>
        <p className="mt-4 mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
          [ solid ] worked with · [ dashed ] explored
        </p>
      </div>
    </section>
  );
}

function Corners() {
  const c = "absolute h-3 w-3 border-[var(--fg)]";
  return (
    <span aria-hidden="true">
      <span className={`${c} -left-px -top-px border-l border-t`} />
      <span className={`${c} -right-px -top-px border-r border-t`} />
      <span className={`${c} -bottom-px -left-px border-b border-l`} />
      <span className={`${c} -bottom-px -right-px border-b border-r`} />
    </span>
  );
}
