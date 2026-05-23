"use client";
import { useRef, useEffect } from "react";
import Image from "next/image";

const specs = [
  ["Base", "Noida, Uttar Pradesh, India"],
  ["Focus", "Frontend & AI Automation"],
  ["Education", "BCA — BIT Mesra, Noida"],
  ["Status", "Open to Opportunities"],
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

export default function About() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="about" className="py-28 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectorLabel number="01" title="About" />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <div className="relative reveal-left">
            <div className="relative aspect-square overflow-hidden bg-[#111] border border-[#222]">
              <Image
                src="/avatar.jpg"
                alt="Rishabh Parashar"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-[#e8002d]" />
            <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-[#e8002d]" />
          </div>

          {/* Content */}
          <div>
            <h2 className="font-heading text-5xl font-black uppercase text-white mb-6 reveal" style={{ transitionDelay: "100ms" }}>
              About Me
            </h2>
            <p className="text-[#aaa] leading-relaxed mb-5 reveal" style={{ transitionDelay: "200ms" }}>
              Frontend &amp; automation-focused developer experienced in React,
              React Native, Next.js, TypeScript, Firebase, Supabase, and AI
              workflow automation. Like an F1 car built for every track condition,
              I adapt fast — translating Figma wireframes into responsive,
              production-ready applications.
            </p>
            <p className="text-[#aaa] leading-relaxed mb-10 reveal" style={{ transitionDelay: "300ms" }}>
              When I&apos;m not shipping features, I&apos;m building AI-powered
              automation pipelines with n8n and Make, or watching race weekends
              and finding parallels between pit-stop precision and clean,
              efficient code.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {specs.map(([key, val], i) => (
                <div
                  key={key}
                  className="border-l-2 border-[#e8002d] pl-4 reveal"
                  style={{ transitionDelay: `${400 + i * 80}ms` }}
                >
                  <p className="text-[#555] text-xs tracking-[0.3em] uppercase mb-1">{key}</p>
                  <p className="text-white font-medium text-sm">{val}</p>
                </div>
              ))}
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
