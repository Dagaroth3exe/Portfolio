"use client";

import { useEffect, useRef, useState } from "react";
import { useReveals } from "../../lib/use-reveals";
import { contact, person } from "../../lib/content";
import { kickSpin, setFocus } from "../../lib/scene-store";
import { TLink } from "../Transition";
import LogoMark from "../ui/LogoMark";
import Magnetic from "../ui/Magnetic";
import SectionHead from "../ui/SectionHead";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  useReveals(root);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      kickSpin(12);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${person.email}`;
    }
  };

  return (
    <section ref={root} id="contact" data-pose="contact" aria-labelledby="contact-title" className="section min-h-[100svh] flex flex-col">
      <div className="wrap flex-1 flex flex-col">
        <SectionHead n="06" label="Contact" />

        <div className="flex-1 grid lg:grid-cols-12 gap-10 items-center pt-12 lg:pt-16">
          <div className="lg:col-span-7">
            <h2 id="contact-title" className="display text-[clamp(3.8rem,10vw,10.5rem)]" data-split="lines">
              {contact.headline.map((l, i) => (
                <span key={l} className={i === 2 ? "text-[var(--red)]" : ""}>
                  {l}
                  <br />
                </span>
              ))}
            </h2>
            <p className="lede mt-8 max-w-xl text-[var(--muted)]" data-reveal>{contact.text}</p>

            <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4" data-reveal>
              <Magnetic strength={0.2}>
                <a
                  href={`mailto:${person.email}`}
                  className="contact-mail group inline-flex items-center gap-4"
                 
                  onMouseEnter={() => setFocus(1)}
                  onMouseLeave={() => setFocus(0)}
                >
                  <span className="display-wide text-[clamp(1.05rem,2.5vw,2.2rem)] break-all sm:break-normal link-underline">{person.email}</span>
                  <span className="text-[var(--red)] text-3xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-rotate-45" aria-hidden="true">→</span>
                </a>
              </Magnetic>
              <button type="button" onClick={copy} className="chip hover:text-[var(--paper)] hover:border-[var(--paper)] transition-colors self-start sm:self-auto" aria-live="polite">
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <ul className="mt-10 flex flex-wrap gap-3" data-reveal>
              {person.socials.map((s) => (
                <li key={s.label}>
                  <Magnetic>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn">
                      {s.label} <span className="btn-arrow" aria-hidden="true">↗</span>
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>

            <div className="mt-16 grid sm:grid-cols-2 gap-10 border-t border-[var(--line)] pt-8" data-reveal>
              <div>
                <h3 className="label text-[var(--paper)] mb-4">What I take on</h3>
                <ul className="space-y-2.5 text-[var(--muted)]">
                  {contact.takeOn.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="text-[var(--red)]" aria-hidden="true">→</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="label text-[var(--paper)] mb-4">How it starts</h3>
                <p className="text-[var(--muted)] leading-relaxed">{contact.howItStarts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="wrap mt-24 pb-8">
      <div className="hairline-strong mb-6" />
      <div className="flex flex-wrap items-center justify-between gap-6 label text-[var(--dim)]">
        <div className="flex items-center gap-4">
          <LogoMark className="h-5 w-auto text-[var(--red)]" />
          <span>© {new Date().getFullYear()} {person.name}</span>
        </div>
        <span>Noida · {time || "--:--"} IST</span>
        <span className="hidden md:inline">Next.js · Three.js · GSAP</span>
        <TLink href="#home" className="link-underline text-[var(--muted)]">Back to grid ↑</TLink>
      </div>
    </footer>
  );
}
