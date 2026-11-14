"use client";

import { useEffect, useRef } from "react";
import { LOGO_HEIGHT, LOGO_PATH, LOGO_WIDTH } from "../../lib/logo";
import { ALT3_HEIGHT, ALT3_PATH, ALT3_WIDTH } from "../../lib/three-alt";

/**
 * The signature "3" (exact emblem geometry) rendered as a dot-matrix /
 * pixel grid on canvas.
 *
 * - Reveal: cells resolve from a coarse pixelation down to full detail.
 * - Glitch: every few seconds, bands of rows tear sideways, a few cells
 *   drop out, and a block of cells flashes inverted — then it snaps back.
 * - Cursor: cells near the pointer swell and brighten (a sparkle trail).
 *
 * Colour follows the surrounding `--fg`, so it works on paper and ink.
 * Reduced motion: drawn once, fully resolved, no glitching.
 */
export default function PixelThree({
  className = "",
  cell = 9,
  shape = "dot",
  glitch = true,
  interactive = true,
  padding = 0.08,
  glyph = "emblem",
  fill,
  outline,
}: {
  className?: string;
  /** Grid pitch in CSS px. */
  cell?: number;
  shape?: "dot" | "square";
  glitch?: boolean;
  interactive?: boolean;
  /** Fraction of the box kept empty around the mark. */
  padding?: number;
  /** "emblem" = the signature 3; "alt" = the second 3 from three-alt.ts (easter egg). */
  glyph?: "emblem" | "alt";
  /** Fill colour; defaults to the surrounding text colour. */
  fill?: string;
  /** A ring of `width` cells around the shape, in `color`. */
  outline?: { color: string; width: number };
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ow = outline?.width ?? 0;
  const ocolor = outline?.color ?? "";

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const path = new Path2D(glyph === "alt" ? ALT3_PATH : LOGO_PATH);
    const GW = glyph === "alt" ? ALT3_WIDTH : LOGO_WIDTH;
    const GH = glyph === "alt" ? ALT3_HEIGHT : LOGO_HEIGHT;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let mask: Uint8Array = new Uint8Array(0);
    let ring: Uint8Array = new Uint8Array(0);
    let seed: Float32Array = new Float32Array(0);
    let color = "#121212";
    let raf = 0;
    let visible = true;
    const start = performance.now();
    const pointer = { x: -1e4, y: -1e4 };
    // Glitch state
    let gUntil = 0;
    let gNext = start + 2200;
    let bands: { r0: number; r1: number; dx: number }[] = [];
    let flash = { c0: 0, r0: 0, w: 0, h: 0 };

    /** Rasterise the 3 into a cols×rows mask at pitch `pitch`. */
    const sample = (pitch: number) => {
      const c = Math.max(1, Math.floor(W / pitch));
      const r = Math.max(1, Math.floor(H / pitch));
      const off = document.createElement("canvas");
      off.width = c;
      off.height = r;
      const o = off.getContext("2d")!;
      o.fillStyle = "#000";
      const s = Math.min((c * (1 - padding * 2)) / GW, (r * (1 - padding * 2)) / GH);
      o.translate((c - GW * s) / 2, (r - GH * s) / 2);
      o.scale(s, s);
      o.fill(path);
      const d = o.getImageData(0, 0, c, r).data;
      const m = new Uint8Array(c * r);
      for (let i = 0; i < c * r; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
      return { c, r, m };
    };

    const layout = () => {
      const rect = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const s = sample(cell);
      cols = s.c;
      rows = s.r;
      mask = s.m;
      // Outline ring: empty cells within `ow` cells (square neighbourhood) of the shape
      ring = new Uint8Array(cols * rows);
      if (ow > 0)
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            if (mask[r * cols + c]) continue;
            search: for (let dr = -ow; dr <= ow; dr++)
              for (let dc = -ow; dc <= ow; dc++) {
                const rr = r + dr, cc = c + dc;
                if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && mask[rr * cols + cc]) {
                  ring[r * cols + c] = 1;
                  break search;
                }
              }
          }
      seed = new Float32Array(cols * rows);
      for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
      color = fill ?? (getComputedStyle(cv).color || color);
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = (now - start) / 1000;

      // Reveal: coarse → fine over ~0.9s (stepped, so it reads as pixelation)
      const reveal = reduced ? 1 : Math.min(1, t / 0.9);
      const coarse = reveal < 1 ? [6, 4, 3, 2, 1][Math.min(4, Math.floor(reveal * 5))] : 1;

      // Glitch scheduling
      const glitching = glitch && !reduced && now < gUntil;
      if (glitch && !reduced && now > gNext && reveal >= 1) {
        gUntil = now + 220 + Math.random() * 260;
        gNext = now + 2600 + Math.random() * 3200;
        bands = Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => {
          const r0 = Math.floor(Math.random() * rows);
          return { r0, r1: Math.min(rows, r0 + 1 + Math.floor(Math.random() * 5)), dx: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 4)) };
        });
        flash = {
          c0: Math.floor(Math.random() * cols * 0.7),
          r0: Math.floor(Math.random() * rows * 0.7),
          w: 3 + Math.floor(Math.random() * 6),
          h: 2 + Math.floor(Math.random() * 4),
        };
      }

      ctx.fillStyle = color;
      const pr = cell;
      const base = shape === "dot" ? pr * 0.34 : pr * 0.42;
      for (let r = 0; r < rows; r++) {
        let dx = 0;
        if (glitching) for (const b of bands) if (r >= b.r0 && r < b.r1) dx = b.dx;
        for (let c = 0; c < cols; c++) {
          // Sample at the current pixelation level
          const sc = coarse > 1 ? Math.floor(c / coarse) * coarse : c;
          const sr = coarse > 1 ? Math.floor(r / coarse) * coarse : r;
          const i = r * cols + c;
          let on = mask[sr * cols + sc] === 1;
          const edge = !on && ring[sr * cols + sc] === 1;
          const inFlash = glitching && c >= flash.c0 && c < flash.c0 + flash.w && r >= flash.r0 && r < flash.r0 + flash.h;
          if (inFlash) on = !on;
          if (!on && !edge) continue;
          ctx.fillStyle = on ? color : ocolor;
          if (glitching && seed[i] > 0.93) continue; // dropouts
          const x = (c + dx + 0.5) * pr;
          const y = (r + 0.5) * pr;
          // Pointer sparkle
          let k = 1;
          let a = edge ? 1 : 0.88;
          if (interactive) {
            const d = Math.hypot(x - pointer.x, y - pointer.y);
            if (d < 90) {
              const f = 1 - d / 90;
              k = 1 + f * 0.55;
              a = 0.88 + f * 0.12;
            }
          }
          // A few cells shimmer
          if (!reduced && seed[i] > 0.985) a *= 0.55 + 0.45 * Math.sin(t * 6 + seed[i] * 40);
          ctx.globalAlpha = a;
          const rad = base * k;
          if (shape === "dot") {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    };

    layout();
    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) draw(performance.now());
    });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      cv.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [cell, shape, glitch, interactive, padding, glyph, fill, ow, ocolor]);

  return <canvas ref={canvas} className={`block text-[var(--fg)] ${className}`} aria-hidden="true" />;
}
