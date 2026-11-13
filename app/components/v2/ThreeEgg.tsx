"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import KineticRows from "./KineticRows";
import PixelThree from "./PixelThree";

/**
 * Easter egg — "Nº 3 × Nº 3".
 *
 * Trigger: type "max" anywhere (outside text fields), or triple-click the
 * dot-matrix 3 in the hero (it dispatches a `three-egg` window event).
 *
 * A dark panel pixel-glitches in with two dot-matrix 3s: the owner's emblem
 * and a second, original racing-style 3 for Max Verstappen's race number
 * (see lib/three-alt.ts — built from scratch, not a copy of any logo). A dimension line between them counts down to
 * "Δ 0 — same number", over a kinetic "DU DU DU DU" band.
 * Closes on click, Esc, or after a few seconds.
 */
const SECRET = "max";
const OPEN_MS = 7000;

export default function ThreeEgg() {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(100);
  const buffer = useRef("");
  const closeBtn = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback(() => {
    setOpen(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), OPEN_MS);
  }, []);
  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setOpen(false);
  }, []);

  // Triggers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return hide();
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer.current === SECRET) {
        buffer.current = "";
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("three-egg", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("three-egg", show);
      window.clearTimeout(timer.current);
    };
  }, [show, hide]);

  // On open: focus, and count the measured gap down to zero
  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = reduced ? 1 : Math.min(1, (now - t0 - 500) / 1400);
      setDelta(Math.max(0, Math.round(100 * (1 - Math.max(0, k)) * (1 - Math.max(0, k)))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="three-egg inv fixed inset-0 z-[190] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Easter egg: number 3 and number 3"
      onClick={hide}
    >
      {/* Header */}
      <div className="wrap flex items-center justify-between border-b border-[var(--line)] py-4 mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span className="text-[var(--fg)]">Easter egg · Nº 3 × Nº 3</span>
        <button ref={closeBtn} type="button" onClick={hide} className="btn-v2 !h-8 text-[10px]">
          Close · Esc
        </button>
      </div>

      {/* Two threes, measured against each other */}
      <div className="wrap grid flex-1 grid-cols-2 items-center gap-6 py-8 md:gap-16">
        <figure className="flex flex-col items-center gap-5">
          <PixelThree className="aspect-square w-[min(36vw,360px)]" cell={9} shape="dot" interactive={false} />
          <figcaption className="text-center mono text-[11px] uppercase tracking-[0.1em]">
            <span className="block text-[var(--fg)]">Nº 3 — R. Parashar</span>
            <span className="text-[var(--muted)]">AI engineer</span>
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-5">
          <PixelThree className="aspect-square w-[min(36vw,360px)]" cell={9} shape="square" glyph="alt" interactive={false} />
          <figcaption className="text-center mono text-[11px] uppercase tracking-[0.1em]">
            <span className="block text-[var(--fg)]">Nº 3 — M. Verstappen</span>
            <span className="text-[var(--muted)]">Racing driver</span>
          </figcaption>
        </figure>
      </div>

      {/* Dimension line between them */}
      <div className="wrap -mt-6 mb-6" aria-live="polite">
        <div className="relative mx-auto h-4 w-[min(70vw,780px)] border-x border-[var(--fg)]">
          <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--fg)]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg)] px-3 mono text-[11px] uppercase tracking-[0.1em] text-[var(--fg)] tabular-nums">
            Δ {delta} {delta === 0 ? "— same number" : ""}
          </span>
        </div>
      </div>

      {/* Kinetic chant */}
      <div className="border-t border-[var(--line)]">
        <div className="wrap overflow-hidden py-6">
          <KineticRows
            className="text-[clamp(0.7rem,1.2vw,1rem)] text-[var(--fg)]"
            fractions={[0.4, 0.75, 1, 0.75, 0.4]}
            lines={["DU DU DU DU ✱ Nº 3 ✱ Nº 3", "SAME NUMBER, DIFFERENT TRACK"]}
          />
        </div>
      </div>
    </div>
  );
}
