"use client";

import { useRef } from "react";
import { useReveals } from "../../lib/use-reveals";
import { faq } from "../../lib/content";
import SectionHead from "../ui/SectionHead";

/** Plain-language Q&A — native <details>, so it works without JS and with keyboards. */
export default function Faq() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);

  return (
    <section ref={root} id="faq" data-pose="work" aria-labelledby="faq-title" className="section">
      <div className="wrap grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <SectionHead n="05" label="Q&A" />
          <h2 id="faq-title" className="display text-[clamp(3rem,6vw,6rem)] mt-12" data-split="lines">
            Ask me anything.
          </h2>
          <p className="mt-6 text-[var(--muted)] leading-relaxed max-w-sm" data-reveal>
            The questions I get asked most, answered in plain words. Anything else, the email is at the bottom.
          </p>
        </div>

        <div className="lg:col-span-8 lg:pt-24" data-reveal>
          {faq.map((f, i) => (
            <details key={f.q} className="faq group border-b first:border-t border-[var(--line)]" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-baseline gap-5 py-5 md:py-6 [&::-webkit-details-marker]:hidden">
                <span className="label text-[var(--dim)] w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-lg md:text-xl text-[var(--paper)] font-medium transition-colors group-hover:text-white">
                  {f.q}
                </span>
                <span
                  className="text-[var(--red)] text-xl leading-none transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="pb-6 pl-11 pr-8 text-[var(--muted)] leading-relaxed max-w-2xl">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
