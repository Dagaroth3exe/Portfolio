"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Edge rulers (desktop): the page is treated as a drawing in a CAD window.
 * Left ruler: ticks that scroll with the page, labelled every 200px.
 * Right ruler: same ticks plus a marker reading the current scroll position.
 * Decorative only; updated straight on the DOM to avoid re-rendering on scroll.
 *
 * Sound: crossing a tick plays a short mechanical click (a heavier detent on
 * labelled 200px marks), synthesised with Web Audio — rate-limited, desktop
 * only, starts after the first click/key (browser autoplay rules), and can be
 * muted from the toggle on the right ruler (remembered per browser).
 */
const MAJOR = 200;
const MINOR = 50;

/** One shared noise buffer + context, created lazily on first user gesture. */
let actx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
function audio() {
  if (actx) return actx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  actx = new AC();
  noise = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.03), actx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return actx;
}
function click(heavy: boolean) {
  const ac = actx;
  if (!ac || !noise || ac.state !== "running") return;
  const t = ac.currentTime;
  // Body: a filtered noise snap
  const src = ac.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = heavy ? 1700 : 3200;
  bp.Q.value = heavy ? 2.5 : 4;
  const g = ac.createGain();
  g.gain.setValueAtTime(heavy ? 0.55 : 0.32, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.035 : 0.018));
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(t);
  src.stop(t + 0.04);
  // Detent: a tiny pitched knock on major ticks
  if (heavy) {
    const o = ac.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.03);
    const og = ac.createGain();
    og.gain.setValueAtTime(0.3, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.connect(og).connect(ac.destination);
    o.start(t);
    o.stop(t + 0.05);
  }
}

export default function PageRulers() {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(true);

  // Restore the mute choice; unlock audio on the first gesture
  useEffect(() => {
    let on = true;
    try {
      on = localStorage.getItem("ruler-sound") !== "off";
    } catch {}
    soundRef.current = on;
    const id = requestAnimationFrame(() => setSound(on));
    const unlock = () => {
      const ac = audio();
      if (ac && ac.state !== "running") ac.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const toggle = () => {
    const next = !soundRef.current;
    soundRef.current = next;
    setSound(next);
    try {
      localStorage.setItem("ruler-sound", next ? "on" : "off");
    } catch {}
    const ac = audio();
    if (ac && ac.state !== "running") ac.resume().catch(() => {});
  };

  useEffect(() => {
    let raf = 0;
    let last = -1;
    let lastTick = Math.floor(window.scrollY / MINOR);
    let lastClick = 0;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      if (y === last) return;
      last = y;
      // Tick sound when a ruler tick passes the top edge
      const tick = Math.floor(y / MINOR);
      if (tick !== lastTick) {
        const lo = Math.min(tick, lastTick) + 1;
        const hi = Math.max(tick, lastTick);
        let heavy = false;
        for (let v = lo; v <= hi; v++) if ((v * MINOR) % MAJOR === 0) heavy = true;
        lastTick = tick;
        const now = performance.now();
        if (soundRef.current && desktop.matches && now - lastClick > (heavy ? 30 : 45)) {
          lastClick = now;
          click(heavy);
        }
      }
      const off = `${-y}px`;
      left.current?.style.setProperty("--ruler-y", off);
      right.current?.style.setProperty("--ruler-y", off);
      // Major tick labels in view
      if (labels.current) {
        let html = "";
        for (let v = Math.floor(y / MAJOR) * MAJOR; v < y + vh + MAJOR; v += MAJOR) {
          html += `<span style="top:${v - y}px">${String(v).padStart(5, "0")}</span>`;
        }
        labels.current.innerHTML = html;
      }
      const k = y / max;
      if (marker.current) marker.current.style.top = `calc(var(--nav-h) + 12px + ${k} * (100% - var(--nav-h) - 24px))`;
      if (readout.current) readout.current.textContent = `Y ${String(Math.round(y)).padStart(5, "0")} · ${String(Math.round(k * 100)).padStart(2, "0")}%`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="page-rulers">
      <div ref={left} className="ruler ruler--left" aria-hidden="true">
        <div ref={labels} className="ruler-labels" />
      </div>
      <div ref={right} className="ruler ruler--right">
        <div ref={marker} className="ruler-marker" aria-hidden="true">
          <span ref={readout} />
        </div>
        <button
          type="button"
          className="ruler-sound"
          onClick={toggle}
          aria-pressed={sound}
          aria-label={sound ? "Mute ruler click sound" : "Unmute ruler click sound"}
          title={sound ? "Ruler clicks: on" : "Ruler clicks: off"}
        >
          SND {sound ? "●" : "○"}
        </button>
      </div>
    </div>
  );
}
