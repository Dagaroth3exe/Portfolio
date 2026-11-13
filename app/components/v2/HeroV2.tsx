"use client";

import { hero, person } from "../../lib/content";
import { TLink } from "../Transition";
import GlitchText from "./GlitchText";
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
  const statement = hero.statement.join(" ");

  return (
    <>
      <section id="home" aria-labelledby="hero-title" className="inv relative min-h-[100svh] overflow-hidden">
        {/* Blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />

        <div className="wrap relative flex min-h-[100svh] flex-col pt-[calc(var(--nav-h)+2.5rem)] pb-8">
          {/* File header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mono text-[11px] uppercase tracking-[0.1em] text-[var(--muted)] border-y border-[var(--line)] py-3">
            <span className="text-[var(--fg)]">File Nº 3</span>
            <span>{person.role}</span>
            <span className="hidden md:inline">Noida, IN · IST</span>
            <span className="hidden md:inline text-right">Portfolio · 2026</span>
          </div>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {person.name} — {hero.kicker}
              </p>
              <Measure axes="x" label={{ x: "W" }} className="mt-10 inline-block">
                <h1 id="hero-title" className="display text-[clamp(3.4rem,8.6vw,9rem)] text-[var(--fg)]">
                  <span className="sr-only">{person.name} — </span>
                  <GlitchText text={statement} duration={900} />
                </h1>
              </Measure>
              <p className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-[var(--fg-2)]">{hero.sub}</p>
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
      <section className="inv border-t border-[var(--line)]" aria-label="Statement">
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
