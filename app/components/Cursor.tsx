"use client";

import { useEffect, useRef } from "react";
import { sceneStore } from "../lib/scene-store";

/**
 * Simple cursor with a live speedo: a dot on the pointer, a trailing ring,
 * and a small readout showing real pointer speed (px/s), a "gear", and a
 * strip of shift lights (green → red → blue) that fill with speed and flash
 * at the limiter. The readout fades out when the mouse is still.
 *
 * Easter egg: while the "max" orange livery is on, the ring is replaced by
 * the word MAX, which decrypts in (glyphs cycle, then lock left to right) and
 * scrambles back out when the livery is switched off.
 *
 * Fine pointers only, and off for reduced motion — the native cursor stays.
 */

const WORD = "MAX";
const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$01ABCDEFGHJKLMNPQRSTUVWXYZ";
const DECRYPT_MS = 700;

const LEDS = 10;
const LED_COLOR = ["g", "g", "g", "g", "r", "r", "r", "b", "b", "b"];
const REDLINE = 4000; // px/s — all lights on
const GEARS = [0, 250, 600, 1100, 1700, 2400, 3200, 4000]; // px/s thresholds for gears 1–8

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const gear = useRef<HTMLSpanElement>(null);
  const leds = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");
    const ledEls = Array.from(leds.current?.children ?? []) as HTMLElement[];

    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let lastMove = { x: 0, y: 0, t: 0 };
    let speed = 0; // smoothed px/s
    let shown = -1;
    let lastActive = 0;
    let visible = false;
    let raf = 0;

    // MAX word: mode "in" decrypts, "out" scrambles away; t0 = start time
    const max = { on: false, mode: "" as "" | "in" | "out", t0: 0, nextGlyph: 0 };
    const onLivery = () => {
      const on = sceneStore.livery === "orange";
      if (on === max.on) return;
      max.on = on;
      max.mode = on ? "in" : "out";
      max.t0 = performance.now();
    };
    window.addEventListener("livery", onLivery);
    const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const t = e.timeStamp;
      if (!visible) {
        visible = true;
        lag.x = e.clientX;
        lag.y = e.clientY;
        lastMove = { x: e.clientX, y: e.clientY, t };
        html.classList.add("cursor-visible");
      }
      // Instantaneous speed from this event, smoothed
      const dt = (t - lastMove.t) / 1000;
      if (dt > 0.004) {
        const v = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / dt;
        speed += (Math.min(v, 9999) - speed) * 0.35;
        lastMove = { x: e.clientX, y: e.clientY, t };
      }
      pos.x = e.clientX;
      pos.y = e.clientY;
      lastActive = performance.now();
      const target = e.target as Element | null;
      ring.current?.classList.toggle(
        "is-hover",
        !!target?.closest("a, button, [role='button'], summary, label, input, select, textarea"),
      );
    };
    const onLeave = () => {
      visible = false;
      html.classList.remove("cursor-visible");
    };

    const tick = () => {
      const now = performance.now();
      // No events → the pointer has stopped; bleed the needle down
      if (now - lastMove.t > 60 && now - lastActive > 60) speed *= 0.82;
      if (speed < 1) speed = 0;

      lag.x += (pos.x - lag.x) * 0.22;
      lag.y += (pos.y - lag.y) * 0.22;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;

      // MAX cipher text in place of the ring
      const w = word.current;
      if (w) {
        // Pinned to the exact pointer (the word is the pointer while it's shown)
        w.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
        if (max.mode) {
          const k = Math.min(1, (now - max.t0) / DECRYPT_MS);
          // Characters lock in left → right while decrypting; unlock right → left when leaving
          const locked = max.mode === "in" ? Math.floor(k * (WORD.length + 1)) : Math.floor((1 - k) * WORD.length);
          if (now >= max.nextGlyph || k >= 1) {
            max.nextGlyph = now + 45;
            w.textContent = WORD.split("")
              .map((ch, i) => (i < locked ? ch : rand()))
              .join("");
          }
          const shown = max.mode === "in" ? 1 : 1 - k;
          w.style.opacity = String(shown);
          if (ring.current) ring.current.style.opacity = String(1 - shown);
          if (dot.current) dot.current.style.opacity = String(1 - shown);
          if (k >= 1) {
            if (max.mode === "in") w.textContent = WORD;
            max.mode = "";
          }
        }
      }

      const p = panel.current;
      if (p) {
        // Sit bottom-right of the pointer; flip near the edges
        const w = p.offsetWidth;
        const h = p.offsetHeight;
        const x = pos.x + 22 + w > window.innerWidth ? pos.x - 22 - w : pos.x + 22;
        const y = pos.y + 22 + h > window.innerHeight ? pos.y - 22 - h : pos.y + 22;
        p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        p.style.opacity = now - lastActive < 1200 || speed > 5 ? "1" : "0";

        const rounded = Math.round(speed / 10) * 10;
        if (rounded !== shown) {
          shown = rounded;
          if (num.current) num.current.textContent = String(rounded);
          let g = 1;
          for (let i = 1; i < GEARS.length; i++) if (speed >= GEARS[i]) g = i + 1;
          if (gear.current) gear.current.textContent = speed < 5 ? "N" : String(Math.min(8, g));
          const lit = Math.min(LEDS, Math.round((speed / REDLINE) * LEDS));
          ledEls.forEach((el, i) => el.classList.toggle("on", i < lit));
          p.classList.toggle("is-limit", lit >= LEDS);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("livery", onLivery);
      document.removeEventListener("mouseleave", onLeave);
      html.classList.remove("has-cursor", "cursor-visible");
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor-ring" />
      <div
        ref={word}
        className="fixed left-0 top-0 whitespace-nowrap font-mono text-[15px] font-bold tracking-[0.18em] will-change-transform"
        style={{ opacity: 0, color: "#FF7A1A", textShadow: "0 0 10px rgba(255,122,26,0.65)", paddingLeft: "0.18em" }}
      >
        {WORD}
      </div>
      <div ref={dot} className="cursor-dot" />
      <div ref={panel} className="speedo" style={{ opacity: 0 }}>
        <div ref={leds} className="speedo-leds">
          {LED_COLOR.map((c, i) => (
            <span key={i} className={`speedo-led ${c}`} />
          ))}
        </div>
        <div className="speedo-row">
          <span>
            <span ref={num} className="speedo-num">0</span> <span className="speedo-unit">px/s</span>
          </span>
          <span ref={gear} className="speedo-gear">N</span>
        </div>
      </div>
    </div>
  );
}
