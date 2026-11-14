"use client";

import { useState } from "react";
import { contact, person } from "../../lib/content";
import LogoMark from "../ui/LogoMark";
import { TLink } from "../Transition";
import GlitchText from "./GlitchText";
import Measure from "./Measure";
import { SectionLabel } from "./ProjectsDrawer";

/**
 * Contact as a printer test page: registration marks, greyscale ramps with
 * the "3" silhouette, a type specimen of the email at stepped sizes, fine
 * lines, shapes and pencil scribbles — then the actual ways to get in touch.
 */
export default function ContactTestPage() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${person.email}`;
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative">
      <div className="wrap py-28 md:py-36">
        <SectionLabel n="05" title="Contact" note="Test page" />
        <h2 id="contact-title" className="display mt-8 text-[clamp(2.8rem,6vw,6rem)] text-[var(--fg)]">
          <GlitchText text={contact.headline.join(" ")} />
        </h2>

        <div className="paper-grain relative mt-16 border border-[var(--line-strong)] bg-[var(--bg-2)] p-5 md:p-10">
          <RegMark className="absolute left-3 top-3" />
          <RegMark className="absolute right-3 top-3" />
          <RegMark className="absolute bottom-3 left-3" />
          <RegMark className="absolute bottom-3 right-3" />
          <p className="absolute left-3.5 top-1/2 hidden -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] md:block" aria-hidden="true">
            Test page — contact
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:pl-6">
            {/* Ramps + silhouette */}
            <Panel label="01. Greyscale ramps" className="md:col-span-5">
              <div className="relative grid h-[260px] grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} style={{ background: `linear-gradient(180deg, rgba(18,18,18,${0.95 - i * 0.16}), rgba(18,18,18,0.04))` }} />
                ))}
                <LogoMark className="absolute left-1/2 top-1/2 h-[78%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-80" color="var(--fg)" />
              </div>
            </Panel>

            {/* Type specimen */}
            <Panel label="02. Type specimen" className="md:col-span-7">
              <div className="space-y-2 overflow-hidden">
                {[10, 13, 18, 26, 38].map((pt) => (
                  <p key={pt} className="flex items-baseline gap-4 whitespace-nowrap text-[var(--fg)]" style={{ fontSize: `${pt}px`, lineHeight: 1.15 }}>
                    <span className="mono w-10 shrink-0 text-[10px] text-[var(--muted)]">{pt}px</span>
                    <span className="truncate">Say hello — {person.email}</span>
                  </p>
                ))}
              </div>
            </Panel>

            {/* Interests, drawn as test-sheet line art */}
            <Panel label="03. Motorsport · lap trace" className="md:col-span-4">
              <MotorsportArt />
            </Panel>
            <Panel label="04. Anime · speed lines" className="md:col-span-4">
              <AnimeArt />
            </Panel>
            <Panel label="05. Japan · san = three" className="md:col-span-4">
              <JapanArt />
            </Panel>
          </div>

          {/* Pencil scribbles */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            <path d="M840 70 C 900 40, 960 110, 905 140 C 850 170, 820 90, 880 80 C 940 70, 950 150, 890 160" fill="none" stroke="var(--fg)" strokeOpacity="0.45" strokeWidth="1.4" />
            <path d="M60 520 c 40 -30 90 20 50 40 c -40 20 -70 -40 -10 -50 c 60 -10 80 50 20 60 c -50 10 -60 -30 -20 -40" fill="none" stroke="var(--fg)" strokeOpacity="0.4" strokeWidth="1.3" />
          </svg>

          {/* The actual contact */}
          <div className="relative mt-10 grid gap-10 border-t border-[var(--line-strong)] pt-10 md:grid-cols-12 md:pl-6">
            <div className="md:col-span-7">
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Primary output</p>
              <Measure axes="x" side="bottom" label={{ x: "W" }} className="mt-4 inline-block max-w-full">
                <a href={`mailto:${person.email}`} className="display block break-all text-[clamp(1.6rem,3.6vw,3.2rem)] text-[var(--fg)] underline-offset-[6px] hover:underline">
                  {person.email}
                </a>
              </Measure>
              <div className="mt-10 flex flex-wrap gap-3 mono text-[11px] uppercase tracking-[0.12em]">
                <button type="button" onClick={copy} className="btn-v2" aria-live="polite">
                  {copied ? "Copied ✓" : "Copy address"}
                </button>
                {person.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="btn-v2">
                    {s.label} ↗
                  </a>
                ))}
              </div>
              <p className="mt-8 max-w-lg text-[var(--fg-2)] leading-relaxed">{contact.text}</p>
            </div>
            <div className="md:col-span-5 space-y-8">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">What I take on</p>
                <ul className="mt-3 space-y-2 mono text-[13px] text-[var(--fg)]">
                  {contact.takeOn.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span aria-hidden="true">→</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">How it starts</p>
                <p className="mt-3 text-[var(--fg-2)] leading-relaxed">{contact.howItStarts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`min-w-0 border border-[var(--line-strong)] bg-[var(--bg)]/40 p-4 ${className}`}>
      <p className="mb-3 mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      {children}
    </div>
  );
}

function RegMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${className}`} aria-hidden="true">
      <circle cx="10" cy="10" r="5" fill="none" stroke="var(--fg)" strokeWidth="1" />
      <line x1="0" y1="10" x2="20" y2="10" stroke="var(--fg)" strokeWidth="1" />
      <line x1="10" y1="0" x2="10" y2="20" stroke="var(--fg)" strokeWidth="1" />
    </svg>
  );
}

export function FooterV2() {
  return (
    <footer className="inv">
      <div className="wrap flex flex-wrap items-center justify-between gap-6 py-8 mono text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
        <span className="flex items-center gap-3 text-[var(--fg)]">
          <LogoMark className="h-4 w-auto" color="currentColor" /> © {new Date().getFullYear()} {person.name}
        </span>
        <span>Set in Inter Tight &amp; JetBrains Mono</span>
        <TLink href="#home" className="link-underline text-[var(--fg)]">
          Back to top ↑
        </TLink>
      </div>
    </footer>
  );
}

/* ---------- Interest panels: original ink line art, no marks or characters ---------- */
const INK = "var(--fg)";

/** Motorsport: checkered strip + a speed trace through one lap, with braking dips and sector ticks. */
function MotorsportArt() {
  // Speed (0..1) at points around a lap: straights, brake, apex, exit…
  const v = [0.62, 0.78, 0.9, 0.96, 0.4, 0.28, 0.55, 0.74, 0.86, 0.5, 0.42, 0.66, 0.82, 0.92, 0.98, 0.36, 0.3, 0.58, 0.8, 0.9];
  const x0 = 46;
  const w = 186;
  const pts = v.map((s, i) => `${(x0 + (i / (v.length - 1)) * w).toFixed(1)},${(96 - s * 74).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 240 110" className="h-[110px] w-full" aria-hidden="true">
      {/* Checkered flag strip */}
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => (
          <rect key={`${r}-${c}`} x={6 + c * 9} y={10 + r * 15} width="9" height="15" fill={(r + c) % 2 ? "none" : INK} stroke={INK} strokeWidth="0.6" />
        )),
      )}
      {/* Axes + sector ticks */}
      <line x1={x0} y1="96" x2={x0 + w} y2="96" stroke={INK} strokeWidth="0.8" />
      <line x1={x0} y1="14" x2={x0} y2="96" stroke={INK} strokeWidth="0.8" />
      {[1, 2].map((k) => (
        <g key={k}>
          <line x1={x0 + (k * w) / 3} y1="14" x2={x0 + (k * w) / 3} y2="96" stroke={INK} strokeWidth="0.5" strokeDasharray="2 3" />
          <text x={x0 + (k * w) / 3 + 3} y="21" fontSize="7" fill={INK} style={{ fontFamily: "var(--ff-mono), monospace" }}>S{k + 1}</text>
        </g>
      ))}
      <text x={x0 + 3} y="21" fontSize="7" fill={INK} style={{ fontFamily: "var(--ff-mono), monospace" }}>S1</text>
      {/* Speed trace */}
      <polyline points={pts} fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Braking zones */}
      {[4, 10, 15].map((i) => (
        <circle key={i} cx={x0 + (i / (v.length - 1)) * w} cy={96 - v[i] * 74} r="2.6" fill="var(--bg-2)" stroke={INK} strokeWidth="1.1" />
      ))}
      <text x={x0 + w} y="106" textAnchor="end" fontSize="7" fill={INK} style={{ fontFamily: "var(--ff-mono), monospace" }}>LAP · v(t)</text>
    </svg>
  );
}

/** Anime: manga focus/speed lines bursting from the centre, halftone tone, a "!?" bubble and sparkles. */
function AnimeArt() {
  const cx = 120;
  const cy = 55;
  const rays = Array.from({ length: 44 }, (_, i) => {
    const a = (i / 44) * Math.PI * 2 + (i % 3) * 0.02;
    const r0 = 30 + ((i * 7) % 11);
    return { x1: cx + Math.cos(a) * r0, y1: cy + Math.sin(a) * r0 * 0.62, x2: cx + Math.cos(a) * 160, y2: cy + Math.sin(a) * 100, w: 0.4 + ((i * 5) % 4) * 0.35 };
  });
  return (
    <svg viewBox="0 0 240 110" className="h-[110px] w-full" aria-hidden="true">
      <defs>
        <pattern id="tone" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.85" fill={INK} />
        </pattern>
        <clipPath id="anime-clip">
          <rect width="240" height="110" />
        </clipPath>
      </defs>
      <g clipPath="url(#anime-clip)">
        {rays.map((r, i) => (
          <line key={i} x1={r.x1.toFixed(2)} y1={r.y1.toFixed(2)} x2={r.x2.toFixed(2)} y2={r.y2.toFixed(2)} stroke={INK} strokeWidth={r.w} />
        ))}
        {/* Halftone tone patch */}
        <rect x="0" y="78" width="70" height="32" fill="url(#tone)" opacity="0.8" />
        {/* Spiky shout bubble */}
        <path d="M120 30 l8 9 12 -4 -2 12 12 6 -12 6 3 12 -12 -3 -7 10 -6 -10 -12 3 3 -12 -12 -6 12 -6 -2 -12 12 4 z" fill="var(--bg-2)" stroke={INK} strokeWidth="1.4" />
        <text x="121" y="61" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK} style={{ fontFamily: "var(--ff-body), sans-serif" }}>!?</text>
        {/* Sparkles */}
        {[
          [200, 22, 7],
          [214, 40, 4],
          [36, 26, 5],
        ].map(([x, y, s], i) => (
          <path key={i} d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`} fill={INK} />
        ))}
      </g>
    </svg>
  );
}

/** Japan: halftoned Mt. Fuji with a sun disc, and 三 ("san", three) as three brush strokes. */
function JapanArt() {
  return (
    <svg viewBox="0 0 240 110" className="h-[110px] w-full" aria-hidden="true">
      <defs>
        <pattern id="fuji-tone" width="3.6" height="3.6" patternUnits="userSpaceOnUse">
          <circle cx="1.8" cy="1.8" r="0.9" fill={INK} />
        </pattern>
      </defs>
      {/* Sun disc */}
      <circle cx="104" cy="34" r="16" fill={INK} />
      {/* Fuji: halftone body, snow cap with a jagged line */}
      <path d="M8 100 L66 36 C70 32 76 32 80 36 L138 100 Z" fill="url(#fuji-tone)" stroke={INK} strokeWidth="1.2" />
      <path d="M57 46 L66 36 C70 32 76 32 80 36 L89 46 L83 52 L77 45 L71 53 L65 46 L60 51 Z" fill="var(--bg-2)" stroke={INK} strokeWidth="1.1" />
      <line x1="4" y1="100" x2="140" y2="100" stroke={INK} strokeWidth="1" />
      {/* 三 — three brush strokes, drawn (no font needed) */}
      <g fill={INK}>
        <path d="M168 26 C178 22 196 21 210 23 C213 24 213 27 210 28 C196 28 180 29 169 31 C165 31 164 27 168 26 Z" />
        <path d="M172 54 C182 51 196 51 206 52 C209 53 209 56 206 57 C196 57 183 58 173 59 C169 59 168 55 172 54 Z" />
        <path d="M160 86 C176 81 204 80 224 83 C228 84 228 88 224 89 C204 89 180 90 162 92 C157 92 156 87 160 86 Z" />
      </g>
      <text x="196" y="104" textAnchor="middle" fontSize="7" fill={INK} style={{ fontFamily: "var(--ff-mono), monospace" }}>SAN · 3</text>
    </svg>
  );
}
