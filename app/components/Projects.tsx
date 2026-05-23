"use client";
import { useRef, useEffect } from "react";

const projects = [
  {
    number: "01",
    title: "Orchestrix",
    subtitle: "Productivity Hub",
    description:
      "Full-stack productivity web app with integrated notes, task management, Pomodoro timer, and alerts. Features Supabase auth (email/password + OAuth), real-time split-pane dashboard, and smooth Framer Motion animations.",
    tech: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
    github: "https://github.com/Dagaroth3exe/Orchestrix",
    live: "#",
  },
  {
    number: "02",
    title: "EarthFirst",
    subtitle: "Tree-Planting Mobile App",
    description:
      "Cross-platform mobile app promoting environmental sustainability through tree-planting initiatives. Includes Firebase Auth, live event discovery, Tree Buddy matching, sapling tracking journal, and gamified leaderboards.",
    tech: ["React Native", "Firebase", "TypeScript", "React Navigation"],
    github: "https://github.com/Dagaroth3exe/earth-first-1",
    live: "#",
  },
  {
    number: "03",
    title: "Leftover Logic",
    subtitle: "AI Smart Pantry",
    description:
      "AI-powered smart pantry web app that suggests recipes based on leftover ingredients. Modular architecture for complex UI states, integrated AI API for recipe generation, with a focus on performance and accessibility.",
    tech: ["React", "Vite", "Tailwind CSS", "Context API"],
    github: "https://github.com/Dagaroth3exe/Leftover-Logic",
    live: "#",
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

export default function Projects() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="projects" className="py-28 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectorLabel number="03" title="Projects" />

        <h2 className="font-heading text-5xl font-black uppercase text-white mb-3 reveal" style={{ transitionDelay: "50ms" }}>
          Featured Work
        </h2>
        <p className="text-[#555] mb-16 max-w-lg reveal" style={{ transitionDelay: "150ms" }}>
          A selection of projects built with precision and purpose.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <div
              key={p.number}
              className="bg-[#111] border border-[#1e1e1e] p-6 group hover:border-[#e8002d]/30 transition-colors duration-300 flex flex-col reveal"
              style={{ transitionDelay: `${200 + i * 120}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-heading text-5xl font-black text-[#1e1e1e] group-hover:text-[#2a0505] transition-colors duration-300 select-none">
                  {p.number}
                </span>
                <div className="flex gap-4 pt-2">
                  <a href={p.github} aria-label="GitHub" className="text-[#444] hover:text-[#e8002d] transition-colors">
                    <IconGithub />
                  </a>
                  <a href={p.live} aria-label="Live site" className="text-[#444] hover:text-[#e8002d] transition-colors">
                    <IconExternal />
                  </a>
                </div>
              </div>

              <h3 className="font-heading text-2xl font-bold uppercase text-white leading-tight">
                {p.title}
              </h3>
              <p className="font-heading text-[#e8002d] text-xs tracking-widest uppercase mb-3">{p.subtitle}</p>
              <p className="text-[#666] text-sm leading-relaxed mb-6 flex-1">{p.description}</p>

              <div className="flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="font-heading text-[#e8002d] text-xs tracking-wider uppercase border border-[#e8002d]/25 px-2 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconGithub() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
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
