"use client";
import { useRef, useEffect } from "react";

const socials = [
  { label: "GitHub", href: "https://github.com/Dagaroth3exe" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rishabh-parashar-95440521a/" },
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

export default function Contact() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="contact" className="py-28 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectorLabel number="05" title="Contact" />

        <div className="max-w-2xl">
          <h2
            className="font-heading text-5xl font-black uppercase text-white mb-4 leading-tight reveal"
            style={{ transitionDelay: "50ms" }}
          >
            Let&apos;s Build<br />Something Fast
          </h2>
          <p className="text-[#555] mb-12 text-lg reveal" style={{ transitionDelay: "180ms" }}>
            Ready to race? Get in touch — I&apos;m open to new opportunities,
            collaborations, and interesting projects.
          </p>

          <a
            href="mailto:parasharrishabh1503@gmail.com"
            className="group inline-flex items-center gap-4 mb-14 reveal"
            style={{ transitionDelay: "300ms" }}
          >
            <span className="font-heading text-xl font-bold text-white group-hover:text-[#e8002d] transition-colors duration-200 break-all">
              parasharrishabh1503@gmail.com
            </span>
            <span className="text-[#e8002d] text-xl group-hover:translate-x-1 transition-transform duration-200 shrink-0">
              →
            </span>
          </a>

          <div className="flex flex-wrap gap-4">
            {socials.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-xs tracking-[0.25em] uppercase border border-[#222] text-[#666] px-7 py-3.5 hover:border-[#e8002d] hover:text-white transition-colors duration-200 reveal"
                style={{ transitionDelay: `${380 + i * 80}ms` }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-24 pt-8 border-t border-[#161616]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-heading text-[#333] text-xs tracking-widest uppercase">
            © 2025 Rishabh Parashar. All rights reserved.
          </p>
          <p className="font-heading text-[#333] text-xs tracking-widest uppercase">
            Built with Next.js &amp; Tailwind CSS
          </p>
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
