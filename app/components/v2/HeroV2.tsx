"use client";

import { useEffect, useRef, useState } from "react";
import { hero, person } from "../../lib/content";
import { TLink } from "../Transition";
import GlyphName from "./GlyphName";
import KineticRows from "./KineticRows";
import Measure from "./Measure";
import PixelThree from "./PixelThree";

/**
 * Hero (ink). Left: the statement, glitching in. Right: the "3" as a live
 * dot-matrix, annotated like a drawing — measured width/height, the shear
 * angle and its grid pitch. Below: a kinetic tagline band.
 */
/** Three quick clicks on the 3 open the "Nº 3 × Nº 3" easter egg (see ThreeEgg). */
let clicks: number[] = [];
function tripleClick() {
  const now = performance.now();
  clicks = [...clicks.filter((t) => now - t < 900), now];
  if (clicks.length >= 3) {
    clicks = [];
    window.dispatchEvent(new Event("three-egg"));
  }
}

export default function HeroV2() {

  return (
    <>
      <section id="home" aria-labelledby="hero-title" className="relative min-h-[100svh] overflow-hidden">

        <div className="wrap relative z-[2] flex min-h-[100svh] flex-col pt-[calc(var(--nav-h)+2.5rem)] pb-8">
          {/* File header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mono text-[11px] uppercase tracking-[0.1em] text-[var(--muted)] border-y border-[var(--line)] py-3">
            <span className="text-[var(--fg)]">tty3 — rishabh@rp3</span>
            <span>{person.role}</span>
            <span className="hidden md:inline">Noida, IN · IST</span>
            <span className="hidden md:inline text-right">
              <Uptime />
            </span>
          </div>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="mono crt-glow text-[13px] text-[var(--fg)]" aria-hidden="true">
                <span className="text-[var(--muted)]">rishabh@rp3:~$ </span>
                <TypeOnce text="./whoami --verbose" />
              </p>
              <p className="mt-3 mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {hero.kicker}
              </p>
              <Measure axes="x" label={{ x: "W" }} className="mt-10 inline-block">
                <h1 id="hero-title" className="text-[22vw] lg:text-[clamp(3.4rem,12.4vw,12.4rem)]">
                  <span className="sr-only">{person.name}</span>
                  <GlyphName lines={[person.first, person.last]} />
                </h1>
              </Measure>
              <p className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-[var(--fg-2)]">{hero.sub}</p>
              <HobbyLine />
              <div className="mt-10 flex flex-wrap gap-3 mono text-[11px] uppercase tracking-[0.12em]">
                <TLink href="#work" className="btn-v2 btn-v2--solid">
                  View work ↓
                </TLink>
                <TLink href="#contact" className="btn-v2">
                  Get in touch
                </TLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto w-[min(78vw,460px)]" onClick={tripleClick}>
                <Measure axes="xy" label={{ x: "W", y: "H" }}>
                  <PixelThree className="aspect-square w-full" cell={10} shape="dot" />
                </Measure>
                {/* Drawing callouts */}
                <div className="pointer-events-none absolute -right-2 top-[18%] hidden sm:flex items-center gap-2 mono text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]" aria-hidden="true">
                  <span className="h-px w-10 bg-[var(--line-strong)]" />∠ 22.8° shear
                </div>
                <div className="pointer-events-none absolute -left-16 bottom-[4%] hidden sm:flex items-center gap-2 mono text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]" aria-hidden="true">
                  pitch 10px · dot<span className="h-px w-10 bg-[var(--line-strong)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Proof strip */}
          <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-[var(--line)] mono text-[11px] uppercase tracking-[0.08em]">
            {hero.proof.map((p) => (
              <div key={p.label} className="flex flex-col gap-1 py-4 pr-4">
                <dt className="text-[var(--muted)]">{p.label}</dt>
                <dd className="text-[var(--fg)] normal-case tracking-normal text-sm">
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {p.value}
                    </a>
                  ) : (
                    p.value
                  )}
                </dd>
              </div>
            ))}
            <div className="hidden md:flex flex-col gap-1 py-4 items-end justify-end text-[var(--muted)]">
              <span>Scroll ↓</span>
            </div>
          </dl>
        </div>
      </section>

      {/* Kinetic statement band */}
      <section className="border-t border-[var(--line)]" aria-label="Statement">
        <div className="wrap py-16 md:py-24 overflow-hidden">
          <KineticRows
            className="text-[clamp(0.78rem,1.55vw,1.35rem)] text-[var(--fg)]"
            lines={["AI ENGINEER ✱ LLM AGENTS ✱ VOICE ✱ VISION", "ON-PREMISE, MULTILINGUAL, IN PRODUCTION"]}
          />
        </div>
      </section>
    </>
  );
}

/** Live "uptime" since the page opened, like a terminal status bar. */
function Uptime() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => setS(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return <span className="tabular-nums">up {hh}:{mm}:{ss}</span>;
}

/** Types a command once, after the boot intro (or straight away if there wasn't one). */
function TypeOnce({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let id = 0;
    const start = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(text.length);
      let i = 0;
      id = window.setInterval(() => {
        i++;
        setN(i);
        if (i >= text.length) window.clearInterval(id);
      }, 45);
    };
    if (document.documentElement.classList.contains("intro-on")) {
      window.addEventListener("introdone", start, { once: true });
    } else start();
    return () => {
      window.removeEventListener("introdone", start);
      window.clearInterval(id);
    };
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="term-cursor" />}
    </>
  );
}

/** `> interests[3/10]: anime█` — types each hobby, holds, scrambles it away, next. */
const SCRAMBLE = "█▓▒░#%&@$01<>/=+*";
function HobbyLine() {
  const list = hero.hobbies;
  const [i, setI] = useState(0);
  const [shown, setShown] = useState("");
  const timer = useRef(0);

  useEffect(() => {
    const word = list[i];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer.current = window.setTimeout(() => setShown(word), 0);
      const next = window.setTimeout(() => setI((k) => (k + 1) % list.length), 2400);
      return () => {
        window.clearTimeout(timer.current);
        window.clearTimeout(next);
      };
    }
    let n = 0;
    let phase: "type" | "hold" | "scramble" = "type";
    let ticks = 0;
    const tick = () => {
      if (phase === "type") {
        n++;
        setShown(word.slice(0, n));
        if (n >= word.length) phase = "hold";
        timer.current = window.setTimeout(tick, phase === "hold" ? 1600 : 55);
      } else if (phase === "hold") {
        phase = "scramble";
        tick();
      } else {
        ticks++;
        setShown(
          word
            .split("")
            .map((ch) => (ch === " " ? " " : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]))
            .join("")
            .slice(0, Math.max(0, word.length - ticks * 2)),
        );
        if (ticks * 2 >= word.length) setI((k) => (k + 1) % list.length);
        else timer.current = window.setTimeout(tick, 40);
      }
    };
    timer.current = window.setTimeout(tick, 200);
    return () => window.clearTimeout(timer.current);
  }, [i, list]);

  return (
    <p className="mt-6 mono crt-glow text-[13px] text-[var(--fg)]">
      <span className="text-[var(--muted)]">
        &gt; interests[{i + 1}/{list.length}]:{" "}
      </span>
      <span aria-hidden="true">{shown}</span>
      <span className="term-cursor" aria-hidden="true" />
      <span className="sr-only">Interests: {list.join(", ")}</span>
    </p>
  );
}
