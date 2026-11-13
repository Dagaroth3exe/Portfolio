"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import { useReveals } from "../../lib/use-reveals";
import { projects } from "../../lib/content";
import { TLink } from "../../components/Transition";
import ProjectCover from "../../components/ui/ProjectCover";
import ProjectName from "../../components/ui/ProjectName";
import ScrubVideo from "../../components/ui/ScrubVideo";
import { accentBg, accentText } from "../../lib/accent";
import Magnetic from "../../components/ui/Magnetic";

export default function CaseStudy({ index }: { index: number }) {
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const root = useRef<HTMLElement>(null);
  useReveals(root, [p.slug]);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".cs-cover", { clipPath: "polygon(0 0, 0 0, -20% 100%, -20% 100%)" }, {
        clipPath: "polygon(0 0, 120% 0, 100% 100%, -20% 100%)", duration: 1.4, ease: "power4.inOut", delay: 0.4,
      });
      gsap.fromTo(".cs-cover-inner", { scale: 1.25 }, { scale: 1, duration: 2, ease: "power3.out", delay: 0.4 });
      gsap.to(".cs-cover-inner", {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".cs-cover", start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, [p.slug]);

  return (
    <main id="main" ref={root} style={{ ["--accent" as string]: p.accent }}>
      <section data-pose="case" className="relative pt-[calc(var(--nav-h)+4rem)] pb-16">
        <div className="wrap">
          <div className="flex flex-wrap items-center gap-4 label" data-reveal>
            <TLink href="/#work" className="text-[var(--muted)] link-underline">← All work</TLink>
            <span className="h-px w-10 bg-[var(--line-strong)]" />
            <span style={accentText(p)}>Case {p.number} / {String(projects.length).padStart(2, "0")}</span>
          </div>

          <h1 className="display text-[clamp(4.5rem,15vw,15rem)] mt-10" data-split="lines"><ProjectName project={p} /></h1>
          {p.context && (
            <p className="label text-[var(--muted)] mt-4" data-reveal>
              {p.context}
            </p>
          )}
          <div className="grid lg:grid-cols-12 gap-10 mt-8">
            <p className="lede lg:col-span-7" data-reveal>{p.summary}</p>
            <dl className="lg:col-span-4 lg:col-start-9 grid grid-cols-2 gap-6 border-t border-[var(--line-strong)] pt-6" data-reveal data-delay="0.1">
              <div>
                <dt className="label text-[var(--dim)]">Type</dt>
                <dd className="mt-1 text-[var(--paper)]">{p.subtitle}</dd>
              </div>
              <div>
                <dt className="label text-[var(--dim)]">Source</dt>
                <dd className="mt-1">
                  {p.github ? (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="link-underline text-[var(--paper)]">GitHub ↗</a>
                  ) : (
                    <span className="text-[var(--muted)]">Private (company)</span>
                  )}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="label text-[var(--dim)]">Stack</dt>
                <dd className="mt-1 text-[var(--paper)]">{p.tech.join(" · ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="cs-cover relative overflow-hidden aspect-[16/9] lg:aspect-[21/9]">
          <div className="cs-cover-inner absolute inset-[-8%]">
            <ProjectCover project={p} art className="w-full h-full" />
          </div>
        </div>
      </div>

      {p.metrics && (
        <section className="wrap mt-12" aria-label="Results">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)]" data-reveal>
            {p.metrics.map((m) => (
              <div key={m.label} className="bg-[var(--ink)] p-5 md:p-6 flex flex-col-reverse gap-2">
                <dt className="text-[var(--muted)] leading-snug text-[0.95rem]">{m.label}</dt>
                <dd className="display text-[clamp(2.5rem,4vw,3.75rem)]" style={accentText(p)}>{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="section" aria-labelledby="cs-brief">
        <div className="wrap grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="label" style={accentText(p)} data-reveal>01 — The brief</p>
            <h2 id="cs-brief" className="display text-6xl mt-3" data-split="lines">The problem</h2>
          </div>
          <p className="lede lg:col-span-7 lg:col-start-6" data-reveal>{p.challenge}</p>
        </div>
      </section>

      <section className="section pt-0" aria-labelledby="cs-build">
        <div className="wrap grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="label" style={accentText(p)} data-reveal>02 — The build</p>
            <h2 id="cs-build" className="display text-6xl mt-3" data-split="lines">How it&apos;s made</h2>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6 border-t border-[var(--line-strong)]">
            {p.build.map((b, i) => (
              <li key={i} className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-[var(--line)]" data-reveal data-delay={String(i * 0.08)}>
                <span className="display text-3xl" style={accentText(p)}>0{i + 1}</span>
                <p className="text-[var(--text)] leading-relaxed">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {p.video ? (
        <section data-pose="case" className="section pt-0" aria-labelledby="cs-screen">
          <div className="wrap">
            <p className="label" style={accentText(p)} data-reveal>In use</p>
            <h2 id="cs-screen" className="display text-6xl mt-3" data-split="lines">The interface</h2>
            <div className="mt-10">
              <ScrubVideo video={p.video} accent={accentBg(p)} />
            </div>
          </div>
        </section>
      ) : p.image && (
        <section className="section pt-0" aria-labelledby="cs-screen">
          <div className="wrap">
            <p className="label" style={accentText(p)} data-reveal>In use</p>
            <h2 id="cs-screen" className="display text-6xl mt-3" data-split="lines">The interface</h2>
            <figure className="mt-10" data-reveal>
              <div className="border border-[var(--line-strong)] overflow-hidden bg-[#18181b]">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  sizes="(min-width: 1600px) 1500px, 100vw"
                  className="w-full h-auto"
                />
              </div>
              {p.image.caption && (
                <figcaption className="mt-4 text-[var(--muted)] text-[0.95rem]">{p.image.caption}</figcaption>
              )}
            </figure>
          </div>
        </section>
      )}

      <section className="section pt-0" aria-labelledby="cs-features">
        <div className="wrap grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="label" style={accentText(p)} data-reveal>03 — Feature set</p>
            <h2 id="cs-features" className="display text-6xl mt-3" data-split="lines">On the car</h2>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6 grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
            {p.features.map((f, i) => (
              <li key={f} className="bg-[var(--ink)]/90 p-5 flex items-center gap-4" data-reveal data-delay={String(i * 0.05)}>
                <span className="tick" style={{ background: accentBg(p) }} aria-hidden="true" />
                <span className="text-[var(--paper)]">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section pt-0" aria-label="Source">
        <div className="wrap flex flex-wrap items-center gap-3" data-reveal>
          {p.github ? (
            <Magnetic>
              <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn--red">
                View source <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
            </Magnetic>
          ) : (
            p.sourceNote && <p className="text-[var(--muted)]">{p.sourceNote}</p>
          )}
          {p.live && (
            <Magnetic>
              <a href={p.live} target="_blank" rel="noopener noreferrer" className="btn">
                Live build <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
            </Magnetic>
          )}
        </div>
      </section>

      {/* Next project — a big directional sweep into the next case */}
      <section data-pose="next" className="relative border-t border-[var(--line-strong)]">
        <TLink href={`/work/${next.slug}`} className="group block wrap py-24 lg:py-36">
          <p className="label text-[var(--muted)]">Next case — {next.number}</p>
          <p className="display text-[clamp(3.6rem,9vw,9.5rem)] mt-4 max-w-[60%] max-lg:max-w-none transition-[color,transform] duration-700 ease-[var(--ease-out)] group-hover:translate-x-6 group-hover:text-[var(--accent-next)]" style={{ ["--accent-next" as string]: next.accent }}>
            <ProjectName project={next} /> <span className="inline-block transition-transform duration-700 group-hover:translate-x-4" aria-hidden="true">→</span>
          </p>
          <p className="text-[var(--muted)] max-w-xl mt-4">{next.subtitle}</p>
        </TLink>
      </section>
    </main>
  );
}
