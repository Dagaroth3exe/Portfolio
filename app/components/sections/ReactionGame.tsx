"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReveals } from "../../lib/use-reveals";
import { kickSpin } from "../../lib/scene-store";
import SectionHead from "../ui/SectionHead";

/**
 * Reaction test. Five red lights come on one per beat, then after a random
 * hold they all switch to green — react then. Reacting before green is a
 * jump start. Times are measured with performance.now()
 * on pointerdown / keydown (not click, which fires late on key release).
 */

type Phase = "idle" | "lighting" | "armed" | "go" | "result" | "jump";

const LIGHTS = 5;
const STEP_MS = 900;
const BEST_KEY = "lights-out-best";

function verdict(ms: number) {
  if (ms < 180) return "Unreal. Are you sure you didn't guess?";
  if (ms < 220) return "Race-starter reflexes.";
  if (ms < 270) return "Sharp. Front row material.";
  if (ms < 350) return "Solid launch. Midfield pace.";
  return "Bogged down off the line. Go again.";
}

const readBest = () => {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
};

export default function ReactionGame() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(0);
  const [time, setTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const timers = useRef<number[]>([]);
  const goAt = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  useReveals(root);

  useEffect(() => {
    // Read the saved best after mount (localStorage is client-only)
    const id = window.setTimeout(() => setBest(readBest()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const set = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = useCallback(() => {
    clear();
    setLit(0);
    setTime(null);
    set("lighting");
    for (let i = 1; i <= LIGHTS; i++) {
      timers.current.push(window.setTimeout(() => setLit(i), STEP_MS * i));
    }
    // After the fifth light: a random hold, then green
    const hold = 300 + Math.random() * 2700;
    timers.current.push(window.setTimeout(() => set("armed"), STEP_MS * LIGHTS));
    timers.current.push(
      window.setTimeout(() => {
        goAt.current = performance.now();
        set("go");
      }, STEP_MS * LIGHTS + hold),
    );
  }, []);

  const react = useCallback(() => {
    const p = phaseRef.current;
    if (p === "idle" || p === "result" || p === "jump") return start();
    if (p === "lighting" || p === "armed") {
      clear();
      setLit(0);
      set("jump");
      return;
    }
    if (p === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      setLit(0);
      setTime(ms);
      setHistory((h) => [ms, ...h].slice(0, 5));
      set("result");
      setBest((b) => {
        if (b === null || ms < b) {
          try {
            localStorage.setItem(BEST_KEY, String(ms));
          } catch {}
          kickSpin(14); // new personal best spins the emblem
          return ms;
        }
        return b;
      });
    }
  }, [start]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault(); // stop page scroll + the late synthetic click
      if (!e.repeat) react();
    }
  };

  const message: Record<Phase, string> = {
    idle: "Press to start. Wait for the lights to turn green, then hit it.",
    lighting: "Hold…",
    armed: "Hold…",
    go: "GO!",
    result: time !== null ? `${time} ms. ${verdict(time)}` : "",
    jump: "Jump start! You went before the lights turned green.",
  };

  const label: Record<Phase, string> = {
    idle: "Start",
    lighting: "Wait",
    armed: "Wait",
    go: "Go!",
    result: "Go again",
    jump: "Try again",
  };

  return (
    <section ref={root} id="pit-lane" data-pose="work" aria-labelledby="game-title" className="section">
      <div className="wrap">
        <SectionHead n="07" label="Pit lane" aside="A quick break" />

        <div className="mt-12 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <h2 id="game-title" className="display text-[clamp(3rem,6vw,6rem)]" data-split="lines">
              Go on green.
            </h2>
            <p className="mt-5 text-[var(--muted)] leading-relaxed max-w-lg" data-reveal>
              Five red lights, one per beat. When they all flip to green, react. Click, tap, or press Space. Going
              early is a jump start.
            </p>
          </div>
          <dl className="lg:col-span-5 grid grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]" data-reveal>
            <div className="bg-[var(--ink)] p-5 flex flex-col-reverse gap-2">
              <dt className="label text-[var(--dim)]">Last</dt>
              <dd className="display text-4xl tabular-nums">{time ?? "—"}<span className="label ml-1 text-[var(--dim)]">ms</span></dd>
            </div>
            <div className="bg-[var(--ink)] p-5 flex flex-col-reverse gap-2">
              <dt className="label text-[var(--dim)]">Personal best</dt>
              <dd className="display text-4xl tabular-nums text-[var(--red)]">{best ?? "—"}<span className="label ml-1 text-[var(--dim)]">ms</span></dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 border border-[var(--line-strong)] bg-[var(--ink)]/80" data-reveal>
          {/* The whole gantry is the hit area */}
          <button
            type="button"
            className="game-pad group block w-full p-6 md:p-10 text-left select-none touch-manipulation"
            data-phase={phase}
            onPointerDown={(e) => {
              if (e.button === 0) react();
            }}
            onKeyDown={onKeyDown}
            aria-describedby="game-status"
          >
            <span className="sr-only">{label[phase]}</span>
            <span className="game-gantry" aria-hidden="true">
              {Array.from({ length: LIGHTS }, (_, i) => (
                <span key={i} className="game-pod">
                  <span className={`game-lamp ${phase === "go" ? "is-go" : i < lit ? "is-on" : ""}`} />
                  <span className={`game-lamp ${phase === "go" ? "is-go" : i < lit ? "is-on" : ""}`} />
                </span>
              ))}
            </span>
            <span className="mt-8 flex flex-wrap items-center justify-between gap-4" aria-hidden="true">
              <span className={`display text-3xl md:text-4xl ${phase === "go" ? "text-[#2bd47d]" : phase === "jump" ? "text-[var(--red)]" : "text-[var(--paper)]"}`}>
                {phase === "result" && time !== null ? `${time} ms` : label[phase]}
              </span>
              <span className="label text-[var(--dim)]">Click · Tap · Space</span>
            </span>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <p id="game-status" className="text-[var(--muted)] max-w-xl" aria-live="polite">
            {message[phase]}
          </p>
          {history.length > 0 && (
            <p className="label text-[var(--dim)]">
              Recent: {history.map((h) => `${h}`).join(" · ")} ms
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
