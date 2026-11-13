"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Kinetic tagline rows: the same two-line statement repeated in a stepped
 * "V", each row revealing a different amount of it (as if mid-type). Rows
 * type in on mount, then highlight blocks hop between words — inverted
 * ink/paper blocks rather than colour, to stay monochrome.
 *
 * Purely decorative: the real statement is given to screen readers once.
 */
export default function KineticRows({
  lines,
  fractions = [0.28, 0.5, 0.74, 1, 0.74, 0.5, 0.28],
  className = "",
}: {
  lines: [string, string];
  /** How much of the statement each row shows (0..1). */
  fractions?: number[];
  className?: string;
}) {
  const full = `${lines[0]}\n${lines[1]}`;
  const total = full.length;
  const mid = (fractions.length - 1) / 2;

  // Word spans with their char offsets, for highlighting
  const words = useMemo(() => {
    const out: { start: number; end: number }[] = [];
    const re = /[^\s\n]+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(full))) out.push({ start: m.index, end: m.index + m[0].length });
    return out;
  }, [full]);

  const [typed, setTyped] = useState<number[]>(() => fractions.map(() => 0));
  const [hl, setHl] = useState<number[][]>(() => fractions.map(() => []));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = fractions.map((f) => Math.round(total * f));
    if (reduced) {
      const id = requestAnimationFrame(() => {
        setTyped(targets);
        setHl(fractions.map((_, r) => [(r * 3) % words.length]));
      });
      return () => cancelAnimationFrame(id);
    }
    // Type rows in, staggered from the middle out
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = now - t0;
      const next = targets.map((tg, r) => {
        const delay = Math.abs(r - mid) * 120;
        const k = Math.max(0, Math.min(1, (t - delay) / 900));
        return Math.round(tg * k);
      });
      setTyped(next);
      if (t < 900 + mid * 120 + 50) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Hop the highlight blocks
    const id = window.setInterval(() => {
      setHl(
        targets.map((tg) => {
          const visible = words.filter((w) => w.end <= tg);
          const n = visible.length ? 1 + Math.floor(Math.random() * Math.min(3, visible.length)) : 0;
          return Array.from({ length: n }, () => words.indexOf(visible[Math.floor(Math.random() * visible.length)]));
        }),
      );
      setTick((k) => k + 1);
    }, 160);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [fractions, mid, total, words]);

  return (
    <div className={`kinetic ${className}`}>
      <p className="sr-only">{`${lines[0]} ${lines[1]}`}</p>
      {fractions.map((_, r) => {
        const n = typed[r] ?? 0;
        const shown = full.slice(0, n);
        const rowLines = shown.split("\n");
        const indent = (mid - Math.abs(r - mid)) * 3.2; // ch
        return (
          <div key={r} className="kinetic-row" style={{ paddingLeft: `${indent}ch` }} aria-hidden="true">
            {rowLines.map((ln, li) => {
              const offset = li === 0 ? 0 : lines[0].length + 1;
              return (
                <div key={li} className="whitespace-pre">
                  {renderLine(ln, offset, words, hl[r] ?? [])}
                  {li === rowLines.length - 1 && (
                    <span className={`kinetic-mark ${(tick + r) % 3 === 0 ? "is-inv" : ""}`}>✱</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderLine(line: string, offset: number, words: { start: number; end: number }[], hl: number[]) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  words.forEach((w, wi) => {
    const s = w.start - offset;
    const e = w.end - offset;
    if (e <= 0 || s >= line.length) return;
    const cs = Math.max(0, s);
    const ce = Math.min(line.length, e);
    if (cs > cursor) parts.push(line.slice(cursor, cs));
    const text = line.slice(cs, ce);
    parts.push(
      hl.includes(wi) ? (
        <span key={wi} className="kinetic-hl">
          {text}
        </span>
      ) : (
        text
      ),
    );
    cursor = ce;
  });
  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts;
}
