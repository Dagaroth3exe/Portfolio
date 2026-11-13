"use client";

import { useRef } from "react";
import { useReveals } from "../../lib/use-reveals";
import { toolbox } from "../../lib/content";
import SectionHead from "../ui/SectionHead";

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);

  return (
    <section ref={root} id="skills" data-pose="skills" aria-labelledby="skills-title" className="section">
      <div className="wrap">
        <SectionHead n="03" label="Skills" />
        <h2 id="skills-title" className="display text-[clamp(3rem,6vw,6rem)] mt-12" data-split="lines">
          Skills & tools
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--line)] border border-[var(--line)]">
          {toolbox.map((g, i) => (
            <div key={g.group} className="bg-[var(--ink)]/90 p-6 lg:p-8" data-reveal data-delay={String(i * 0.06)}>
              <h3 className="label text-[var(--red)] mb-5">{g.group}</h3>
              <ul className="space-y-2.5">
                {g.items.map((t) => (
                  <li key={t} className="text-[var(--paper)] text-[0.95rem]">{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
