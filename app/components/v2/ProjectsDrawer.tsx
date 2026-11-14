"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "../../lib/gsap";
import { projects, type Project } from "../../lib/content";
import { TLink } from "../Transition";
import ProjectCover from "../ui/ProjectCover";
import GlitchText from "./GlitchText";
import Measure from "./Measure";

/**
 * Projects as a filing drawer. On desktop the section pins while you scroll;
 * scroll position picks the open folder, which lifts out of the stack and its
 * file — a dark terminal card with the app footage — slides out beside it.
 * Click a folder tab to jump to it. On small screens: a plain list of files.
 */
export default function ProjectsDrawer() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = projects.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999));
        setActive((prev) => (prev === i ? prev : i));
      },
    });
    return () => st.kill();
  }, [n]);

  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / n), behavior: "smooth" });
  };

  return (
    <section id="work" aria-labelledby="work-title" className="relative">
      <div className="wrap pt-28 md:pt-36">
        <SectionLabel n="01" title="Work" note={`${n} files`} />
        <h2 id="work-title" className="display mt-8 text-[clamp(2.8rem,6vw,6rem)] text-[var(--fg)]">
          <GlitchText text="Selected work." />
        </h2>
      </div>

      {/* Desktop: pinned drawer */}
      <div ref={track} className="relative hidden lg:block" style={{ height: `${n * 75 + 40}vh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center">
          <div className="wrap grid w-full grid-cols-12 items-center gap-10">
            {/* Folder stack */}
            <div className="col-span-5">
              <ul className="relative" style={{ height: `${n * 52 + 120}px` }}>
                {projects.map((p, i) => (
                  <li
                    key={p.slug}
                    className="absolute inset-x-0 transition-transform duration-500 ease-[var(--ease-out)]"
                    style={{
                      top: `${i * 52}px`,
                      transform: `translateY(${i === active ? -14 : i < active ? -4 : 0}px)`,
                      zIndex: i + 1,
                    }}
                  >
                    <Folder project={p} index={i} active={i === active} onSelect={() => jump(i)} />
                  </li>
                ))}
                {/* Drawer front */}
                <li className="absolute inset-x-0 h-[120px] border border-[var(--line-strong)] bg-[var(--bg)] flex items-end justify-center pb-5 mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]" style={{ top: `${n * 52}px`, zIndex: n + 2 }}>
                  Work / {String(n).padStart(2, "0")} files
                </li>
              </ul>
            </div>

            {/* The open file */}
            <div className="col-span-7">
              <div key={projects[active].slug} className="file-in">
                <FileCard project={projects[active]} index={active} total={n} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: list */}
      <ul className="wrap mt-12 space-y-8 pb-10 lg:hidden">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <FileCard project={p} index={i} total={n} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** `§ 01  rishabh@rp3:~$ cd ./work█ ──── note` — section labels read as shell prompts. */
export function SectionLabel({ n, title, note, cmd }: { n: string; title: string; note?: string; cmd?: string }) {
  return (
    <div className="flex items-center gap-4 mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
      <span className="text-[var(--fg)]">§ {n}</span>
      <span>
        <span className="text-[var(--dim)] normal-case">rishabh@rp3:~$</span> <span className="normal-case">{cmd ?? `cd ./${title.toLowerCase()}`}</span>
        <span className="sr-only"> — {title}</span>
        <span className="term-cursor ml-1 opacity-70" aria-hidden="true" />
      </span>
      <span className="h-px flex-1 bg-[var(--line-strong)]" />
      {note && <span>{note}</span>}
    </div>
  );
}

function Folder({ project: p, index, active, onSelect }: { project: Project; index: number; active: boolean; onSelect: () => void }) {
  const right = index % 2 === 1;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open ${p.title}`}
      aria-current={active ? "true" : undefined}
      className="group relative block h-[112px] w-full text-left"
    >
      {/* Tab */}
      <span
        className={`absolute -top-[22px] h-[23px] min-w-[150px] px-4 flex items-center gap-2 mono text-[10px] uppercase tracking-[0.12em] border border-b-0 transition-colors ${
          right ? "right-6" : "left-6"
        } ${active ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]" : "bg-[var(--bg)] text-[var(--fg-2)] border-[var(--line-strong)] group-hover:bg-[var(--bg-2)]"}`}
        style={{ clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 100%, 0 100%)" }}
      >
        <span className="opacity-60">{p.number}</span> {p.title}
      </span>
      {/* Body */}
      <span
        className={`absolute inset-0 border bg-[var(--bg)] transition-colors ${
          active ? "border-[var(--fg)]" : "border-[var(--line-strong)] group-hover:border-[var(--fg-2)]"
        }`}
      />
    </button>
  );
}

function FileCard({ project: p, index, total }: { project: Project; index: number; total: number }) {
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <article className="inv border border-[var(--line-strong)]">
      {/* Terminal header */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-2.5 mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>
          File {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {p.slug}
          {p.video ? ".mp4" : ".svg"}
        </span>
        <span className="hidden sm:inline">{p.domain}</span>
      </div>

      <Measure axes="x" side="bottom" label={{ x: "W" }}>
        <div className="group/m relative aspect-[16/9] overflow-hidden bg-black">
          {p.video ? (
            <video
              ref={vid}
              className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.05] transition-[filter] duration-700 group-hover/m:grayscale-0"
              style={{ objectPosition: p.video.cardPosition ?? "center top" }}
              poster={p.video.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={p.video.alt}
            >
              <source src={p.video.mp4} type="video/mp4" />
              {p.video.webm && <source src={p.video.webm} type="video/webm" />}
            </video>
          ) : (
            <ProjectCover project={p} art className="absolute inset-0 h-full w-full grayscale contrast-125 transition-[filter] duration-700 group-hover/m:grayscale-0" />
          )}
        </div>
      </Measure>

      <div className="grid gap-6 px-5 pb-6 pt-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{p.subtitle}</p>
          <h3 className="display mt-2 text-[clamp(2.2rem,3.6vw,3.4rem)] text-[var(--fg)]">{p.title}</h3>
          <p className="mt-3 max-w-xl text-[var(--fg-2)] leading-snug">→ {p.outcome}</p>
          {p.metrics && (
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 mono text-[11px]">
              {p.metrics.slice(0, 3).map((m) => (
                <div key={m.label} className="flex items-baseline gap-2">
                  <dd className="text-[var(--fg)] text-base">{m.value}</dd>
                  <dt className="text-[var(--muted)] max-w-[14rem] truncate">{m.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
        <TLink href={`/work/${p.slug}`} className="btn-v2 btn-v2--solid mono text-[11px] uppercase tracking-[0.12em] self-start md:self-end">
          Open file →
        </TLink>
      </div>
      <p className="border-t border-[var(--line)] px-5 py-2.5 mono text-[10px] uppercase tracking-[0.1em] text-[var(--dim)] truncate">
        {p.tech.join(" · ")}
      </p>
    </article>
  );
}
