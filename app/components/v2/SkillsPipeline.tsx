"use client";

import { useEffect, useRef, useState } from "react";
import { toolbox } from "../../lib/content";
import GlitchText from "./GlitchText";
import { SectionLabel } from "./ProjectsDrawer";

/**
 * The stack as a pipeline diagram: five stage nodes (textured panels with a
 * dotted "port" block) joined by strings. Each string is drawn on reveal and
 * labelled with its own measured length — the diagram measures itself.
 */

// Grid placement (desktop) and node tone, in toolbox order:
// LLMs & Agents, Voice & Vision, Model R&D & Evals, Backend & Deployment, Frontend
const PLACE = [
  "lg:col-start-1 lg:col-span-4 lg:row-start-1",
  "lg:col-start-1 lg:col-span-4 lg:row-start-3",
  "lg:col-start-5 lg:col-span-4 lg:row-start-2",
  "lg:col-start-9 lg:col-span-4 lg:row-start-1",
  "lg:col-start-9 lg:col-span-4 lg:row-start-3",
];
const TONE: ("paper" | "grey" | "ink")[] = ["paper", "grey", "ink", "paper", "grey"];
const EDGES: [number, number, "h" | "v"][] = [
  [0, 2, "h"],
  [1, 2, "h"],
  [2, 3, "h"],
  [3, 4, "v"],
];

type Seg = { d: string; mx: number; my: number; len: number };

export default function SkillsPipeline() {
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const compute = () => {
      if (window.innerWidth < 1024) return setSegs([]);
      const box = el.getBoundingClientRect();
      const r = (i: number) => {
        const b = nodes.current[i]!.getBoundingClientRect();
        return { l: b.left - box.left, r: b.right - box.left, t: b.top - box.top, b: b.bottom - box.top, cx: b.left - box.left + b.width / 2, cy: b.top - box.top + b.height / 2 };
      };
      setSegs(
        EDGES.map(([a, b, dir]) => {
          const A = r(a);
          const B = r(b);
          if (dir === "v") {
            const x1 = A.cx, y1 = A.b, x2 = B.cx, y2 = B.t;
            return { d: `M${x1} ${y1} L${x2} ${y2}`, mx: x1, my: (y1 + y2) / 2, len: Math.hypot(x2 - x1, y2 - y1) };
          }
          const x1 = A.r, y1 = A.cy, x2 = B.l, y2 = B.cy;
          const c = (x2 - x1) / 2;
          const d = `M${x1} ${y1} C${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
          // Approximate curve length
          let len = 0, px = x1, py = y1;
          for (let t = 1; t <= 24; t++) {
            const k = t / 24, u = 1 - k;
            const x = u * u * u * x1 + 3 * u * u * k * (x1 + c) + 3 * u * k * k * (x2 - c) + k * k * k * x2;
            const y = u * u * u * y1 + 3 * u * u * k * y1 + 3 * u * k * k * y2 + k * k * k * y2;
            len += Math.hypot(x - px, y - py);
            px = x;
            py = y;
          }
          return { d, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, len };
        }),
      );
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.25 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section id="stack" aria-labelledby="stack-title" className="relative">
      <div className="wrap py-28 md:py-36">
        <SectionLabel n="03" title="Stack" note={`${toolbox.length} stages`} />
        <h2 id="stack-title" className="display mt-8 text-[clamp(2.8rem,6vw,6rem)] text-[var(--fg)]">
          <GlitchText text="The pipeline." />
        </h2>
        <p className="mt-6 max-w-xl text-[var(--fg-2)] leading-relaxed">
          How the pieces connect: models and speech go through evaluation before anything is deployed, and the interface sits at the end.
        </p>

        <div ref={wrap} className={`pipeline relative mt-16 grid gap-6 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-x-10 lg:gap-y-14 ${on ? "is-on" : ""}`}>
          {/* Strings */}
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block" aria-hidden="true">
            {segs.map((s, i) => (
              <g key={i} className="pipe-seg" style={{ ["--len" as string]: `${s.len}`, transitionDelay: `${0.2 + i * 0.25}s` }}>
                <path d={s.d} fill="none" stroke="var(--fg)" strokeWidth="1.2" strokeDasharray={s.len} strokeDashoffset={on ? 0 : s.len} style={{ transition: `stroke-dashoffset 1.2s var(--ease-out) ${0.2 + i * 0.25}s` }} />
                <circle cx={s.d.split(" ")[0].slice(1)} cy={s.d.split(" ")[1]} r="3.5" fill="var(--fg)" />
                <g style={{ opacity: on ? 1 : 0, transition: `opacity 0.4s ${0.9 + i * 0.25}s` }}>
                  <rect x={s.mx - 34} y={s.my - 9} width="68" height="18" fill="var(--bg)" stroke="var(--line-strong)" />
                  <text x={s.mx} y={s.my + 3.5} textAnchor="middle" fontSize="10" fill="var(--fg-2)" style={{ fontFamily: "var(--ff-mono), monospace" }}>
                    Δ {s.len.toFixed(0)}px
                  </text>
                </g>
              </g>
            ))}
          </svg>

          {toolbox.map((g, i) => (
            <div key={g.group} ref={(el) => void (nodes.current[i] = el)} className={`relative ${PLACE[i]}`}>
              <Node index={i} group={g.group} items={g.items} tone={TONE[i]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Node({ index, group, items, tone }: { index: number; group: string; items: string[]; tone: "paper" | "grey" | "ink" }) {
  const cls =
    tone === "ink"
      ? "inv border-[var(--fg)]"
      : tone === "grey"
        ? "bg-[#cfcbc1] border-[var(--line-strong)]"
        : "bg-[var(--bg)] border-[var(--line-strong)]";
  return (
    <article className={`paper-grain relative border ${cls}`}>
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2 mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>Stage {String(index + 1).padStart(2, "0")}</span>
        <span className="bg-[var(--fg)] px-1.5 py-0.5 text-[var(--bg)]">{group.split(" ")[0]}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
        <h3 className="display text-[1.7rem] leading-none text-[var(--fg)]">{group}</h3>
        {/* Port block: rows of dots, some filled */}
        <svg viewBox="0 0 56 40" className="h-10 w-14" aria-hidden="true">
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 6 }, (_, c) => (
              <circle key={`${r}-${c}`} cx={4 + c * 9.6} cy={4 + r * 10.6} r="2.6" fill={(r * 7 + c * 3 + index) % 4 === 0 ? "var(--fg)" : "none"} stroke="var(--fg)" strokeWidth="0.9" />
            )),
          )}
        </svg>
      </div>
      <ul className="space-y-1.5 px-4 pb-5 mono text-[12px] text-[var(--fg-2)]">
        {items.map((it, k) => (
          <li key={it} className="flex gap-2.5">
            <span aria-hidden="true">{k === 0 ? "●" : "○"}</span>
            {it}
          </li>
        ))}
      </ul>
    </article>
  );
}
