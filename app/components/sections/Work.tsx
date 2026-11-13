"use client";

import { useRef } from "react";
import { useReveals } from "../../lib/use-reveals";
import { person, projects, type Project } from "../../lib/content";
import { TLink } from "../Transition";
import ProjectCover from "../ui/ProjectCover";
import ProjectName from "../ui/ProjectName";
import { accentText } from "../../lib/accent";
import SectionHead from "../ui/SectionHead";
import FeaturedRow from "./FeaturedRow";

/** Projects — a simple, scannable grid. Each card opens its case study. */
export default function Work() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);

  return (
    <section ref={root} id="work" data-pose="work" aria-labelledby="work-title" className="section">
      <div className="wrap">
        <SectionHead n="01" label="Projects" />
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
          <h2 id="work-title" className="display text-[clamp(3rem,6vw,6rem)]" data-split="lines">
            Selected projects
          </h2>
          <a href={person.socials[0].href} target="_blank" rel="noopener noreferrer" className="label text-[var(--muted)] link-underline">
            More on GitHub ↗
          </a>
        </div>

        <div data-reveal>
          <FeaturedRow projects={projects.filter((p) => p.featured)} />
        </div>

        <ul className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.filter((p) => !p.featured).map((p, i) => (
            <li key={p.slug} className="h-full" data-reveal data-delay={String(i * 0.08)}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>

        <ProjectIndex />
      </div>
    </section>
  );
}

/**
 * Grid card: a framed panel with the cover on top (domain tag overlaid),
 * one-line subtitle, title, outcome, a clamped summary, tech chips, and the
 * case-study link pinned to the bottom so every card in a row lines up.
 */
function ProjectCard({ project: p }: { project: Project }) {
  const accent = p.accentTo ?? p.accent;
  const shown = p.tech.slice(0, 3);
  const more = p.tech.length - shown.length;
  return (
    <TLink
      href={`/work/${p.slug}`}
      className="work-card group flex h-full flex-col border border-[var(--line)] bg-[var(--ink)]/60 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-[var(--accent)]"
      style={{ ["--accent" as string]: accent }}
      aria-label={`${p.title} — ${p.subtitle}. Open case study`}
    >
      <div className="relative overflow-hidden aspect-[16/10] border-b border-[var(--line)]">
        <ProjectCover project={p} className="w-full h-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
        <span className="chip absolute left-3 top-3 !text-[var(--paper)] bg-[rgba(5,11,24,0.78)] backdrop-blur-sm">{p.domain}</span>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="label text-[var(--muted)] truncate" title={p.subtitle}>
          <span className="mr-3" style={accentText(p)}>{p.number}</span>
          {p.subtitle}
        </p>
        <h3 className="display text-4xl mt-3"><ProjectName project={p} /></h3>
        <p className="mt-2 text-[var(--paper)] leading-snug">
          <span className="mr-2" style={accentText(p)} aria-hidden="true">→</span>
          {p.outcome}
        </p>
        <p className="mt-3 text-[var(--muted)] text-[0.95rem] leading-relaxed line-clamp-3">{p.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech">
          {shown.map((t) => (
            <li key={t} className="chip !h-7 !px-2.5">{t}</li>
          ))}
          {more > 0 && <li className="chip !h-7 !px-2.5 !text-[var(--dim)]">+{more}</li>}
        </ul>

        <span className="mt-auto pt-6 block">
          <span className="flex items-center justify-between border-t border-[var(--line)] pt-4 label text-[var(--muted)] transition-colors group-hover:text-[var(--paper)]">
            Case study
            <span className="transition-transform duration-500 group-hover:translate-x-1" style={accentText(p)} aria-hidden="true">→</span>
          </span>
        </span>
      </div>
    </TLink>
  );
}

/** Was → Became: each project as a problem and what the build turned it into. */
function ProjectIndex() {
  return (
    <div className="mt-24" data-reveal>
      <h3 className="label text-[var(--paper)] mb-5">Index — was / became</h3>
      <table className="w-full text-left border-collapse">
        <caption className="sr-only">Each project: the problem it started from and what it became</caption>
        <thead className="hidden md:table-header-group">
          <tr className="label text-[var(--dim)] border-b border-[var(--line-strong)]">
            <th scope="col" className="py-3 pr-6 font-medium w-[22%]">Project</th>
            <th scope="col" className="py-3 pr-6 font-medium">Was</th>
            <th scope="col" className="py-3 font-medium">Became</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.slug} className="block md:table-row border-b border-[var(--line)] py-5 md:py-0">
              <th scope="row" className="block md:table-cell md:py-6 pr-6 align-top font-normal">
                <TLink href={`/work/${p.slug}`} className="display text-2xl link-underline">
                  <ProjectName project={p} />
                </TLink>
                <span className="block label text-[var(--dim)] mt-1">{p.domain}</span>
              </th>
              <td className="block md:table-cell mt-3 md:mt-0 md:py-6 pr-6 align-top text-[var(--muted)] leading-relaxed">
                <span className="label text-[var(--dim)] md:hidden mr-2">Was</span>
                {p.was}
              </td>
              <td className="block md:table-cell mt-2 md:mt-0 md:py-6 align-top text-[var(--paper)] leading-relaxed">
                <span className="label text-[var(--red)] md:hidden mr-2">Became</span>
                {p.became}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
