"use client";

import { useRef } from "react";
import { useReveals } from "../../lib/use-reveals";
import { education, experience, projects } from "../../lib/content";
import { TLink } from "../Transition";
import ProjectName from "../ui/ProjectName";
import SectionHead from "../ui/SectionHead";

/** Experience — a plain, scannable list: when on the left, what on the right. */
export default function Experience() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);

  return (
    <section ref={root} id="experience" data-pose="experience" aria-labelledby="experience-title" className="section">
      <div className="wrap">
        <SectionHead n="02" label="Experience" />
        <h2 id="experience-title" className="display text-[clamp(3rem,6vw,6rem)] mt-12" data-split="lines">
          Experience
        </h2>

        <ol className="mt-12 border-t border-[var(--line-strong)]">
          {experience.map((e) => (
            <li key={e.company} className="grid lg:grid-cols-12 gap-x-10 gap-y-4 py-12 border-b border-[var(--line-strong)]">
              <div className="lg:col-span-3" data-reveal>
                <p className="label text-[var(--paper)]">{e.period}</p>
                <p className="label text-[var(--red)] mt-2">{e.company}</p>
                <p className="label text-[var(--dim)] mt-1">{e.type}</p>
              </div>

              <div className="lg:col-span-9">
                <h3 className="display text-[clamp(2rem,3.4vw,3.2rem)]" data-reveal>{e.role}</h3>
                <p className="mt-4 max-w-3xl text-[var(--text)] leading-relaxed" data-reveal>{e.summary}</p>
                <ul className="mt-5 space-y-2 max-w-3xl" data-reveal>
                  {e.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[var(--muted)] text-[0.95rem]">
                      <span className="text-[var(--red)]" aria-hidden="true">—</span>
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-3" data-reveal>
                  <TechRow label="Worked with" items={e.stack} />
                  {e.explored && <TechRow label="Explored" items={e.explored} />}
                </div>
                {e.caseStudy && (
                  <TLink
                    href={`/work/${e.caseStudy}`}
                    className="mt-6 inline-flex items-center gap-2 label text-[var(--paper)] link-underline"
                    data-reveal
                  >
                    Featured work:{" "}
                    {(() => {
                      const cs = projects.find((p) => p.slug === e.caseStudy);
                      return cs ? <ProjectName project={cs} /> : "Case study";
                    })()}
                    <span className="text-[var(--red)]" aria-hidden="true">→</span>
                  </TLink>
                )}
              </div>
            </li>
          ))}

          <li className="grid lg:grid-cols-12 gap-x-10 gap-y-4 py-12 border-b border-[var(--line-strong)]">
            <div className="lg:col-span-3" data-reveal>
              <p className="label text-[var(--paper)]">{education.period}</p>
              <p className="label text-[var(--blue-soft)] mt-2">Education</p>
            </div>
            <div className="lg:col-span-9" data-reveal>
              <h3 className="display text-[clamp(2rem,3.4vw,3.2rem)]">{education.degree}</h3>
              <p className="mt-2 text-[var(--muted)]">{education.school}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}

function TechRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="label text-[var(--dim)] sm:w-24 shrink-0">{label}</span>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className="chip">{s}</li>
        ))}
      </ul>
    </div>
  );
}
