"use client";
import { useState, useEffect } from "react";
import F1Car from "./F1Car";

export default function Hero() {
  const [litCount, setLitCount] = useState(0);
  const [showLights, setShowLights] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setLitCount(i), i * 270));
    }
    timers.push(setTimeout(() => setLitCount(0), 5 * 270 + 320));
    timers.push(setTimeout(() => setShowLights(false), 5 * 270 + 620));
    timers.push(setTimeout(() => setShowContent(true), 5 * 270 + 720));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]"
    >
      {/* ── START LIGHTS SEQUENCE ── */}
      {showLights && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="font-heading text-[#292929] text-[10px] tracking-[0.65em] uppercase">
              Initializing System
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="w-9 h-9 rounded-full transition-all duration-150"
                  style={
                    litCount >= n
                      ? {
                          background: "#e8002d",
                          boxShadow: "0 0 22px #e8002d, 0 0 45px rgba(232,0,45,0.35)",
                          border: "1px solid #ff1a47",
                        }
                      : { background: "#150000", border: "1px solid #2a0000" }
                  }
                />
              ))}
            </div>
            <p className="font-heading text-[#1c1c1c] text-[9px] tracking-[0.45em] uppercase">
              Lights Out And Away We Go
            </p>
          </div>
        </div>
      )}

      {/* ── BACKGROUND DECORATION ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
          style={{ background: "linear-gradient(135deg, #e8002d 0%, transparent 60%)" }}
        />
        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-[#e8002d]/20 via-[#e8002d]/5 to-transparent" />
        <div
          className="absolute bottom-1/3 left-0 w-2/3 h-px bg-gradient-to-r from-[#e8002d]/10 to-transparent"
          style={{ marginTop: "12px" }}
        />
        {[
          { top: "14%", w: 90,  dur: 4.2, delay: 0   },
          { top: "27%", w: 130, dur: 5.5, delay: 1.4 },
          { top: "41%", w: 70,  dur: 3.8, delay: 2.7 },
          { top: "58%", w: 110, dur: 6.0, delay: 0.9 },
          { top: "72%", w: 85,  dur: 4.7, delay: 3.2 },
          { top: "83%", w: 140, dur: 5.1, delay: 1.8 },
        ].map((line, i) => (
          <div
            key={i}
            className="absolute h-px"
            style={{
              top: line.top,
              width: `${line.w}px`,
              background: "linear-gradient(to left, rgba(232,0,45,0.55), transparent)",
              animation: `ambientLine ${line.dur}s linear infinite`,
              animationDelay: `${line.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── F1 CAR RACING ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none overflow-hidden"
        style={{ bottom: "64px", height: "165px" }}
      >
        <div className="absolute bottom-0" style={{ animation: "f1Race 8s linear infinite" }}>
          <div className="relative" style={{ width: "540px" }}>
            <F1Car />
            <div className="absolute flex flex-col" style={{ left: "540px", top: "58px", gap: "4px" }}>
              <div style={{ width: "210px", height: "2px",   background: "linear-gradient(90deg, rgba(232,0,45,0.75), transparent)" }} />
              <div style={{ width: "280px", height: "1.5px", background: "linear-gradient(90deg, rgba(232,0,45,0.55), transparent)", marginTop: "3px" }} />
              <div style={{ width: "180px", height: "1px",   background: "linear-gradient(90deg, rgba(232,0,45,0.4),  transparent)", marginTop: "3px" }} />
              <div style={{ width: "245px", height: "1px",   background: "linear-gradient(90deg, rgba(232,0,45,0.28), transparent)", marginTop: "5px" }} />
              <div style={{ width: "165px", height: "1px",   background: "linear-gradient(90deg, rgba(232,0,45,0.18), transparent)", marginTop: "2px" }} />
              <div style={{ width: "205px", height: "1px",   background: "linear-gradient(90deg, rgba(232,0,45,0.1),  transparent)", marginTop: "6px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 w-full">
        <p className={`font-heading text-[#e8002d] text-xs tracking-[0.5em] uppercase mb-6 ${showContent ? "hero-label" : "opacity-0"}`}>
          Frontend &amp; AI Automation Developer
        </p>

        <h1
          className="font-heading font-black uppercase leading-none tracking-tight text-white mb-8"
          style={{ fontSize: "clamp(4rem, 13vw, 11rem)" }}
        >
          <span className={`block ${showContent ? "hero-line1" : "opacity-0"}`}>Rishabh</span>
          <span className={`block ${showContent ? "hero-line2" : "opacity-0"}`}>Parashar</span>
        </h1>

        <p className={`text-[#aaa] text-lg max-w-xl mb-14 leading-relaxed ${showContent ? "hero-desc" : "opacity-0"}`}>
          Building high-performance web apps and AI-powered workflows at racing
          speed. Turning Figma wireframes into production-ready interfaces that
          push what&apos;s possible.
        </p>

        <div className={`flex flex-wrap gap-10 mb-14 border-t border-[#1e1e1e] pt-10 ${showContent ? "hero-stats" : "opacity-0"}`}>
          {[
            ["2+", "Years Exp"],
            ["3+", "Projects"],
            ["15+", "Technologies"],
          ].map(([val, label]) => (
            <div key={label}>
              <p className="font-heading text-5xl font-black text-[#e8002d]">{val}</p>
              <p className="text-[#555] text-xs tracking-[0.3em] uppercase mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className={`flex flex-wrap gap-4 ${showContent ? "hero-ctas" : "opacity-0"}`}>
          <a
            href="#projects"
            className="font-heading font-bold text-xs tracking-[0.25em] uppercase bg-[#e8002d] text-white px-8 py-4 hover:bg-white hover:text-[#e8002d] transition-colors duration-200"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="font-heading font-bold text-xs tracking-[0.25em] uppercase border border-[#e8002d] text-[#e8002d] px-8 py-4 hover:bg-[#e8002d] hover:text-white transition-colors duration-200"
          >
            Contact Me
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#e8002d]/60 via-[#e8002d]/20 to-transparent" />
    </section>
  );
}
