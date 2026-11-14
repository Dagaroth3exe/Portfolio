"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Edge rulers (desktop): the page is treated as a drawing in a CAD window.
 * Left ruler: ticks that scroll with the page, labelled every 200px.
 * Right ruler: same ticks plus a marker reading the current scroll position.
 * Decorative only; updated straight on the DOM to avoid re-rendering on scroll.
 *
 * Sound: crossing a tick plays a thin knob-detent tick (a double tick on
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
  noise = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.015), actx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return actx;
}
function click(heavy: boolean) {
  const ac = actx;
  if (!ac || !noise || ac.state !== "running") return;
  const t = ac.currentTime;
  // Thin, crisp tick like a rotary-encoder / keyboard knob detent:
  // a few ms of high-passed noise through a narrow resonant peak.
  const tick = (at: number, freq: number, level: number) => {
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 1.4 + Math.random() * 0.3;
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3800;
    const pk = ac.createBiquadFilter();
    pk.type = "peaking";
    pk.frequency.value = freq;
    pk.Q.value = 7;
    pk.gain.value = 14;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(level, at + 0.0006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.007);
    src.connect(hp).connect(pk).connect(g).connect(ac.destination);
    src.start(at);
    src.stop(at + 0.012);
  };
  const f = 6200 + Math.random() * 500;
  tick(t, f, heavy ? 0.3 : 0.2);
  // Detent on labelled marks: a second, slightly lower tick right after
  if (heavy) tick(t + 0.009, f * 0.72, 0.22);
}

export default function PageRulers() {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(true);
  /** Browsers keep audio locked until a click/tap/key on the page. */
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);

  // Restore the mute choice; unlock audio on the first gesture
  useEffect(() => {
    let on = true;
    try {
      on = localStorage.getItem("ruler-sound") !== "off";
    } catch {}
    soundRef.current = on;
    const id = requestAnimationFrame(() => setSound(on));
    const EVENTS = ["pointerdown", "pointerup", "touchend", "keydown", "click"] as const;
    const onState = () => {
      const running = actx?.state === "running";
      armedRef.current = running;
      setArmed(running);
    };
    const unlock = () => {
      const ac = audio();
      if (!ac) return;
      ac.onstatechange = onState;
      if (ac.state !== "running") ac.resume().then(onState, () => {});
      else onState();
    };
    EVENTS.forEach((e) => window.addEventListener(e, unlock, { capture: true }));
    return () => {
      cancelAnimationFrame(id);
      EVENTS.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
    };
  }, []);

  const toggle = () => {
    // First press while locked means "turn sound on", never "mute"
    const next = armedRef.current ? !soundRef.current : true;
    soundRef.current = next;
    setSound(next);
    try {
      localStorage.setItem("ruler-sound", next ? "on" : "off");
    } catch {}
    const ac = audio();
    if (!ac) return;
    const confirm = () => {
      armedRef.current = true;
      setArmed(true);
      if (next) click(true); // audible confirmation
    };
    if (ac.state !== "running") ac.resume().then(confirm, () => {});
    else confirm();
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
          aria-pressed={armed && sound}
          aria-label={!armed ? "Enable ruler click sound" : sound ? "Mute ruler click sound" : "Unmute ruler click sound"}
          title={!armed ? "Click to enable sound" : sound ? "Ruler clicks: on" : "Ruler clicks: off"}
          data-state={!armed ? "locked" : sound ? "on" : "off"}
        >
          {!armed ? "SND · CLICK" : `SND ${sound ? "●" : "○"}`}
        </button>
      </div>
    </div>
  );
}
