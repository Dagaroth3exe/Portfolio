"use client";

import { useEffect, useRef } from "react";
import type { Project } from "../../lib/content";
import { accentText } from "../../lib/accent";
import { TLink } from "../Transition";
import ProjectCover from "../ui/ProjectCover";
import ProjectName from "../ui/ProjectName";

/**
 * Featured projects as an expanding row.
 *
 * Desktop (≥1024px, hover-capable): compact, equal cards showing a still
 * frame. Hovering (or focusing) a card widens it while its neighbour narrows,
 * plays its app video, and reveals the summary, numbers and link. Pure CSS
 * for the sizing, so nothing jumps on load; a little script starts/stops the
 * video.
 *
 * Smaller / touch screens: cards stack full width with everything visible,
 * and the video plays while it's on screen.
 */
export default function FeaturedRow({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:gap-5 lg:h-[680px]">
      {projects.map((p) => (
        <FeaturedTile key={p.slug} project={p} />
      ))}
    </div>
  );
}

function FeaturedTile({ project: p }: { project: Project }) {
  const vid = useRef<HTMLVideoElement>(null);
  const desk = useRef(false);

  // Decide how the video is driven: hover on desktop, in-view elsewhere
  useEffect(() => {
    const el = vid.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(min-width: 1024px) and (hover: hover)");
    desk.current = mq.matches;
    const onMq = () => {
      desk.current = mq.matches;
      if (desk.current) el.pause();
    };
    mq.addEventListener("change", onMq);
    if (reduced) return () => mq.removeEventListener("change", onMq);

    const io = new IntersectionObserver(
      ([e]) => {
        if (desk.current) return;
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const start = () => {
    const el = vid.current;
    if (!el || !desk.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.preload = "auto";
    el.play().catch(() => {});
  };
  const stop = () => {
    if (desk.current) vid.current?.pause();
  };

  const accent = p.accentTo ?? p.accent;
  const v = p.video;

  return (
    <TLink
      href={`/work/${p.slug}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      aria-label={`${p.title} — ${p.subtitle}. Open case study`}
      style={{ ["--accent" as string]: accent }}
      className={[
        "work-card group/f relative flex flex-col overflow-hidden",
        "border border-[var(--line-strong)] bg-[var(--ink)]/80",
        "transition-[flex-grow,border-color] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none",
        // Desktop sizing: equal at rest, the hovered/focused tile grows
        "lg:basis-0 lg:grow lg:min-w-0 hover:border-[var(--accent)]",
        "lg:hover:grow-[2.6] lg:focus-visible:grow-[2.6]",
      ].join(" ")}
    >
      {/* Media: still frame at rest, the app playing on hover */}
      <div className="relative w-full overflow-hidden border-b border-[var(--line)] bg-[#18181b] lg:flex-1 lg:min-h-0">
        {v ? (
          <video
            ref={vid}
            className="block w-full h-auto lg:absolute lg:inset-0 lg:h-full lg:object-cover"
            style={{ objectPosition: v.cardPosition ?? "center top" }}
            poster={v.poster}
            muted
            loop
            playsInline
            preload="none"
            width={v.width}
            height={v.height}
            aria-label={v.alt}
          >
            <source src={v.mp4} type="video/mp4" />
            {v.webm && <source src={v.webm} type="video/webm" />}
          </video>
        ) : (
          <ProjectCover project={p} art className="w-full aspect-[16/10] lg:aspect-auto lg:h-full" />
        )}
        <span className="chip absolute left-3 top-3 !text-[var(--paper)] bg-[rgba(5,11,24,0.78)] backdrop-blur-sm">
          {p.domain}
        </span>
        {/* Desktop hint, fades once the tile opens */}
        <span
          className="hidden lg:flex absolute right-3 top-3 items-center gap-2 label !text-[0.62rem] text-[var(--paper)] bg-[rgba(5,11,24,0.78)] px-2.5 py-1.5 transition-opacity duration-300 group-hover/f:opacity-0 group-focus-visible/f:opacity-0"
          aria-hidden="true"
        >
          <span className="size-1.5 rounded-full" style={{ background: accent }} /> Hover to play
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col p-5 md:p-7 lg:shrink-0">
        <p className="label text-[var(--muted)] truncate shrink-0">
          <span className="mr-3" style={accentText(p)}>Featured · {p.number}</span>
          {p.subtitle}
        </p>
        <h3 className="display text-[clamp(2.4rem,3.6vw,3.8rem)] mt-3 leading-[0.95] shrink-0">
          <ProjectName project={p} />
        </h3>
        <p className="mt-3 text-[var(--paper)] leading-snug shrink-0">
          <span className="mr-2" style={accentText(p)} aria-hidden="true">→</span>
          {p.outcome}
        </p>

        {/* Revealed when open on desktop; always shown on smaller screens */}
        <div
          className={[
            "mt-4 shrink-0 transition-[opacity,max-height] duration-500 motion-reduce:transition-none",
            // Desktop: collapsed at rest, slides open with the tile
            "lg:max-h-0 lg:overflow-hidden lg:opacity-0",
            "lg:group-hover/f:max-h-[200px] lg:group-hover/f:opacity-100 lg:group-hover/f:delay-150",
            "lg:group-focus-visible/f:max-h-[200px] lg:group-focus-visible/f:opacity-100",
          ].join(" ")}
        >
          <p className="text-[var(--muted)] leading-relaxed max-w-3xl lg:line-clamp-2">{p.summary}</p>
          {p.metrics && (
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)] lg:max-w-4xl">
              {p.metrics.slice(0, 4).map((m) => (
                <div key={m.label} className="bg-[var(--ink)] px-3 py-2.5 flex flex-col-reverse gap-0.5">
                  <dt className="text-[0.75rem] text-[var(--muted)] leading-snug line-clamp-2">{m.label}</dt>
                  <dd className="display text-2xl text-[var(--paper)]">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <span className="mt-5 shrink-0 flex items-center justify-between label text-[var(--paper)]">
          <span className="truncate">{p.tech.slice(0, 4).join(" · ")}</span>
          <span className="shrink-0 ml-4 inline-flex items-center gap-2">
            Case study
            <span className="transition-transform duration-500 group-hover/f:translate-x-1" style={accentText(p)} aria-hidden="true">→</span>
          </span>
        </span>
      </div>
    </TLink>
  );
}
