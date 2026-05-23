"use client";
import { useRef, useEffect } from "react";

const experiences = [
  {
    company: "First Feather",
    role: "Full Stack App Developer",
    type: "Freelance",
    period: "Jun 2025 — Aug 2025",
    description:
      "Built a React Native cross-platform application for tree-planting initiatives with real-time synchronization using Firebase. Designed reusable UI components ensuring consistent performance across Android and iOS.",
    highlights: [
      "Implemented user auth, live event discovery, and Tree Buddy matching",
      "Engineered gamified leaderboards, reward system, and NGO dashboards",
      "Ensured cross-platform performance across Android and iOS",
    ],
  },
  {
    company: "Blurock Ionic",
    role: "GenAI Research & Web Developer",
    type: "Intern",
    period: "May 2024 — Jan 2025",
    description:
      "Designed and developed a responsive Order Management System UI/UX from Figma wireframes using React, Tailwind CSS, and TypeScript. Leveraged Generative AI tools to accelerate UX research and validate design decisions.",
    highlights: [
      "Built responsive OMS UI from Figma using React, Tailwind CSS, TypeScript",
      "Integrated REST APIs and managed complex application states",
      "Used GenAI tools to accelerate UX research and identify usability issues early",
    ],
  },
];

function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLElement>(
            ".reveal, .reveal-left, .reveal-right, .sector-line"
          ).forEach((child) => child.classList.add("is-visible"));
          obs.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Experience() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="experience" className="py-28 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectorLabel number="04" title="Experience" />

        <h2 className="font-heading text-5xl font-black uppercase text-white mb-3 reveal" style={{ transitionDelay: "50ms" }}>
          Race History
        </h2>
        <p className="text-[#555] mb-16 max-w-lg reveal" style={{ transitionDelay: "150ms" }}>
          The teams I&apos;ve raced with and the wins along the way.
        </p>

        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-[#1e1e1e]" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="relative pl-12 reveal-left"
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                <div className="absolute left-3 top-6 w-2 h-2 rounded-full bg-[#e8002d] -translate-x-1/2 ring-4 ring-[#080808]" />

                <div className="bg-[#111] border border-[#1e1e1e] p-6 hover:border-[#e8002d]/25 transition-colors duration-300">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-heading text-2xl font-bold uppercase text-white leading-tight">
                        {exp.role}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="font-heading text-[#e8002d] text-sm tracking-widest uppercase">
                          {exp.company}
                        </p>
                        <span className="font-heading text-[#333] text-xs tracking-wider uppercase border border-[#222] px-2 py-0.5">
                          {exp.type}
                        </span>
                      </div>
                    </div>
                    <span className="font-heading text-[#444] text-xs tracking-widest uppercase border border-[#222] px-3 py-1.5 whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>

                  <p className="text-[#666] text-sm leading-relaxed mb-5">{exp.description}</p>

                  <ul className="space-y-2">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="flex items-start gap-3 text-[#888] text-sm">
                        <span className="text-[#e8002d] mt-0.5 shrink-0">▸</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mt-16 pl-12 relative reveal" style={{ transitionDelay: "500ms" }}>
          <div className="absolute left-3 top-6 w-2 h-2 rounded-full bg-[#333] -translate-x-1/2 ring-4 ring-[#080808]" />
          <div className="absolute left-3 top-0 bottom-0 w-px bg-[#1e1e1e] -translate-x-full" />
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-white">
                  Bachelor of Computer Applications
                </h3>
                <p className="font-heading text-[#555] text-sm tracking-widest uppercase mt-1">
                  BIT Mesra, Noida Campus
                </p>
              </div>
              <span className="font-heading text-[#333] text-xs tracking-widest uppercase border border-[#1e1e1e] px-3 py-1.5 whitespace-nowrap">
                Aug 2023 — Present
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectorLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-16">
      <span className="font-heading text-[#e8002d] text-xs tracking-[0.4em] uppercase whitespace-nowrap reveal-left">
        Sector {number}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-[#e8002d]/30 to-transparent sector-line" />
      <span className="font-heading text-[#2a2a2a] text-xs tracking-[0.4em] uppercase whitespace-nowrap reveal-right">
        {title}
      </span>
    </div>
  );
}
