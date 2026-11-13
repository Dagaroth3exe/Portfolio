"use client";

import { useEffect, useRef, useState } from "react";
import PixelThree from "./PixelThree";

/**
 * Intro: blurred gradient beams (blue ↔ orange/red) rising on black — the only
 * place colour lives on the site — while the "3" resolves out of pixels and a
 * mono readout counts up. Then the whole frame pixel-dissolves away.
 *
 * Shown once per session on the home page; the decision is made before first
 * paint by the inline script in the layout (adds `html.intro-on`). Any click
 * or key skips it. Never shown with reduced motion.
 */
const DURATION = 2300;

export default function IntroV2() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro-on")) return;
    let finished = false;
    let raf = 0;
    const t0 = performance.now();

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      root.current?.classList.add("is-out");
      html.classList.remove("intro-on");
      window.dispatchEvent(new Event("introdone"));
      window.setTimeout(() => setGone(true), 700);
    };
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / DURATION);
      if (pct.current) pct.current.textContent = String(Math.round(k * 100)).padStart(3, "0");
      if (k < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("pointerdown", finish, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="intro2 inv" role="status" aria-label="Loading">
      <div className="intro2-beams" aria-hidden="true">
        <span className="beam beam-a" />
        <span className="beam beam-b" />
        <span className="beam beam-c" />
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8">
        <PixelThree className="w-[min(34vw,220px)] aspect-square" cell={7} shape="square" interactive={false} />
        <div className="mono text-[11px] tracking-[0.12em] uppercase text-[var(--fg)] flex gap-6">
          <span>Rishabh Parashar</span>
          <span className="text-[var(--muted)]">AI Engineer</span>
          <span className="tabular-nums">
            <span ref={pct}>000</span>%
          </span>
        </div>
      </div>
      {/* Pixel-dissolve exit mask */}
      <div className="intro2-dissolve" aria-hidden="true" />
    </div>
  );
}
