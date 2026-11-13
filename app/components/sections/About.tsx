"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { gsap } from "../../lib/gsap";
import { useReveals } from "../../lib/use-reveals";
import { about, person } from "../../lib/content";
import SectionHead from "../ui/SectionHead";

// WebGL-only, so it loads on the client after the page is interactive
const Bobblehead = dynamic(() => import("../three/Bobblehead"), {
  ssr: false,
  loading: () => <div className="h-[440px] sm:h-[520px] lg:h-[620px]" aria-hidden="true" />,
});

export default function About() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);

  // Portrait: slanted mask opens on scroll, image drifts for depth
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".about-portrait", { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }, {
        clipPath: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
        ease: "power4.inOut",
        duration: 1.5,
        scrollTrigger: { trigger: ".about-portrait", start: "top 80%", once: true },
      });
      gsap.fromTo(".about-portrait img", { yPercent: -10, scale: 1.15 }, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: ".about-portrait", start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="about" data-pose="about" aria-labelledby="about-title" className="section">
      <div className="wrap">
        <SectionHead n="04" label="About" />

        {/* Row 1: the emblem occupies the left; the statement sits right */}
        <div className="grid lg:grid-cols-12 gap-10 mt-16 lg:mt-24">
          <div className="lg:col-span-5 lg:-mt-10">
            <Bobblehead className="h-[440px] sm:h-[520px] lg:h-[620px] w-full max-w-[560px] mx-auto" />
          </div>
          <div className="lg:col-span-7">
            <h2 id="about-title" className="display text-[clamp(3.4rem,8vw,8.5rem)]" data-split="lines">
              {about.title.map((l, i) => (
                <span key={l} className={i === 3 ? "text-[var(--blue)]" : ""}>
                  {l}
                  <br />
                </span>
              ))}
            </h2>
            <p className="lede mt-10 max-w-2xl" data-reveal>{about.lede}</p>
          </div>
        </div>

        {/* Row 2: portrait, bio, facts */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 mt-20 lg:mt-32 items-start">
          <figure className="lg:col-span-4 relative">
            <div className="about-portrait relative aspect-[4/5] overflow-hidden bg-[var(--navy)] [clip-path:polygon(0_8%,100%_0,100%_92%,0_100%)]">
              <Image
                src="/avatar.jpg"
                alt={`Portrait of ${person.name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover grayscale contrast-125 transition-[filter] duration-700 hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,107,255,0.35)] via-transparent to-[rgba(226,27,45,0.18)] mix-blend-color pointer-events-none" />
            </div>
            <figcaption className="mt-4 flex justify-between label text-[var(--dim)]">
              <span>{person.name}</span>
              <span>{person.location.split(",")[0]}, IN</span>
            </figcaption>
          </figure>

          <div className="lg:col-span-5 space-y-6 text-[var(--muted)] text-[1.05rem] leading-relaxed">
            {about.body.map((p, i) => (
              <p key={i} data-reveal data-delay={String(i * 0.1)}>{p}</p>
            ))}
          </div>

          <dl className="lg:col-span-3 border-t border-[var(--line-strong)]">
            {about.facts.map(([k, v], i) => (
              <div key={k} className="flex justify-between gap-4 py-4 border-b border-[var(--line)]" data-reveal data-delay={String(i * 0.06)}>
                <dt className="label text-[var(--dim)]">{k}</dt>
                <dd className="text-right text-sm text-[var(--paper)]">
                  {k === "Status" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--yellow)] mr-2 align-middle" />}
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

      </div>

    </section>
  );
}
