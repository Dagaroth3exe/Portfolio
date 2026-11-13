"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText } from "../../lib/gsap";
import { hero, person } from "../../lib/content";
import { TLink } from "../Transition";
import LogoMark from "../ui/LogoMark";
import Magnetic from "../ui/Magnetic";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let split: SplitText | null = null;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-hero]", { opacity: 1 });
        return;
      }
      split = SplitText.create(".hero-title-line", { type: "lines", mask: "lines" });
      gsap.set("[data-hero]", { opacity: 1 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(".hero-fade", { opacity: 0, y: 24 });
      gsap.set(".hero-rule", { scaleX: 0 });

      const play = () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(split!.lines, { yPercent: 0, duration: 1.1, stagger: 0.08 })
          .to(".hero-rule", { scaleX: 1, duration: 1.0, ease: "power3.inOut", stagger: 0.1 }, 0.05)
          .to(".hero-fade", { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.3);
      };
      if (document.documentElement.classList.contains("intro-on")) {
        window.addEventListener("introdone", play, { once: true });
      } else play();

      // Scroll-out: copy lifts and thins as the emblem moves on
      gsap.to(".hero-copy", {
        yPercent: -18,
        opacity: 0.08,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-meta", {
        y: 80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "40% top", scrub: true },
      });

      // Pointer parallax on the type layers
      const xTo = gsap.quickTo(".hero-title", "x", { duration: 1.2 });
      const yTo = gsap.quickTo(".hero-title", "y", { duration: 1.2 });
      const onMove = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * -16);
        yTo((e.clientY / window.innerHeight - 0.5) * -9);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }, el);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="home"
      data-pose="hero"
      aria-labelledby="hero-title"
      className="relative min-h-[100svh] flex flex-col"
    >
      {/* Static emblem poster: visible until WebGL is ready */}
      <div className="gl-poster pointer-events-none" aria-hidden="true">
        <LogoMark className="block h-full w-auto" color="#E21B2D" />
      </div>

      <div className="wrap hero-copy relative flex-1 flex flex-col justify-end pt-[calc(var(--nav-h)+40svh)] md:pt-[calc(var(--nav-h)+6rem)] pb-10 md:justify-center">

        {/* Top kicker bar — timing-tower style */}
        <div className="flex items-center gap-3 mb-7 md:mb-9 hero-fade flex-wrap">
          <span className="hero-sector-tag label">{hero.kickerTag}</span>
          <span className="hero-rule h-px flex-1 max-w-[3rem] bg-[var(--red)] origin-left opacity-80" />
          <span className="label text-[var(--muted)]">{hero.kicker}</span>
        </div>

        {/* Main headline */}
        <h1
          id="hero-title"
          className="hero-title display text-[clamp(4rem,12vw,12rem)] md:max-w-[65vw]"
          data-hero
        >
          <span className="sr-only">{person.name} — </span>
          {hero.statement.map((line, i) => (
            <span
              key={line}
              className={`hero-title-line block ${
                i === 0
                  ? ""
                  : i === 1
                  ? "outline-text text-[var(--paper)] pl-[0.55em]"
                  : "text-[var(--red)] italic-slant origin-bottom-left"
              }`}
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Sub + CTAs */}
        <div className="mt-8 md:mt-12 grid md:grid-cols-[minmax(0,32rem)_auto] gap-8 md:gap-16 items-end">
          <p className="hero-fade text-[var(--muted)] text-base md:text-lg leading-relaxed">
            <strong className="text-[var(--paper)] font-medium">{person.name}</strong>
            {" — "}{hero.sub}
          </p>
          <div className="hero-fade flex flex-wrap gap-3">
            <Magnetic>
              <TLink href="#work" className="btn btn--red">
                View projects <span className="btn-arrow" aria-hidden="true">→</span>
              </TLink>
            </Magnetic>
            <Magnetic>
              <TLink href="#experience" className="btn">
                Experience
              </TLink>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Bottom metadata row */}
      <div className="wrap hero-meta relative pb-6 md:pb-8">
        <div className="hero-rule hairline-strong origin-left mb-5" />
        <div className="flex flex-wrap items-end justify-between gap-6">
          <dl className="flex flex-wrap gap-x-10 gap-y-4 md:gap-x-14">
            {hero.proof.map((p) => (
              <div key={p.label} className="hero-fade flex flex-col-reverse gap-1">
                <dt className="label text-[var(--dim)]">{p.label}</dt>
                <dd className="text-[var(--paper)] text-base md:text-lg font-medium tabular-nums">
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
          </dl>
          <div className="hero-fade hidden sm:flex items-center gap-6 label text-[var(--dim)]">
            <span>{person.location}</span>
            <span className="flex items-center gap-3 text-[var(--muted)]">
              Scroll
              <span className="relative block w-px h-10 overflow-hidden bg-[var(--line)]">
                <span className="absolute inset-x-0 top-0 h-1/2 bg-[var(--red)] animate-[scrollcue_1.8s_var(--ease-inout)_infinite]" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
