"use client";
import { useRef, useEffect } from "react";

const categories = [
  {
    label: "Frontend",
    skills: ["React.js", "React Native", "Next.js", "TypeScript", "Tailwind CSS", "Vite"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "Express.js", "Firebase", "Supabase (PostgreSQL)", "REST APIs"],
  },
  {
    label: "AI & Automation",
    skills: ["Generative AI", "Prompt Engineering", "n8n", "Make", "Claude Code", "LLM Integration"],
  },
  {
    label: "Design & Tools",
    skills: ["Figma", "Material UI", "Styled Components", "Git", "Responsive Design"],
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

export default function Skills() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="skills" className="py-28 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectorLabel number="02" title="Skills" />

        <h2 className="font-heading text-5xl font-black uppercase text-white mb-3 reveal" style={{ transitionDelay: "50ms" }}>
          Tech Stack
        </h2>
        <p className="text-[#555] mb-16 max-w-lg reveal" style={{ transitionDelay: "150ms" }}>
          The tools and technologies I use to build high-performance applications and AI-powered workflows.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <div
              key={cat.label}
              className="bg-[#111] border border-[#1e1e1e] p-6 hover:border-[#e8002d]/40 transition-colors duration-300 group reveal"
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-7 bg-[#e8002d]" />
                <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                  {cat.label}
                </h3>
              </div>
              <ul className="space-y-3">
                {cat.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-3 text-[#888] text-sm">
                    <span className="w-1 h-1 rounded-full bg-[#e8002d] shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
