"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loading intro: a face badge laps an original circuit in ~1s, then the
 * overlay sweeps away. Plays once per session.
 *
 * Whether it shows is decided by an inline script in the layout before first
 * paint (adds `html.intro-on`), so there's no flash of page content and
 * nothing is hidden for reduced-motion users or when JS is off.
 */

const LAP_MS = 1000;
const OUT_MS = 550;

/** Original circuit layout (not a real track) in a 400×230 viewBox. */
const TRACK =
  "M70 180 L255 180 C292 180 304 160 314 138 L346 70 C356 48 336 30 312 42 L254 76 C238 85 222 78 216 62 L206 38 C198 18 172 16 160 34 L118 100 C108 116 88 114 78 102 L60 82 C44 64 22 78 28 100 L40 152 C45 170 54 180 70 180 Z";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Intro() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const car = useRef<SVGGElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    // Not playing this visit: the overlay stays display:none via CSS
    if (!html.classList.contains("intro-on")) return;
    const p = path.current!;
    const len = p.getTotalLength();
    trail.current!.style.strokeDasharray = `${len}`;
    let raf = 0;
    let start = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      root.current?.classList.add("intro--out");
      html.classList.remove("intro-on");
      window.dispatchEvent(new Event("introdone"));
      window.setTimeout(() => setDone(true), OUT_MS);
    };

    const frame = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / LAP_MS);
      const d = ease(t) * len;
      const pt = p.getPointAtLength(d);
      const ahead = p.getPointAtLength(Math.min(len, d + 1));
      const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
      car.current!.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      car.current!.querySelector(".intro-nose")!.setAttribute("transform", `rotate(${angle})`);
      trail.current!.style.strokeDashoffset = `${len - d}`;
      if (pct.current) pct.current.textContent = String(Math.round(t * 100)).padStart(3, "0");
      if (t < 1) raf = requestAnimationFrame(frame);
      else window.setTimeout(finish, 160);
    };
    raf = requestAnimationFrame(frame);

    // Any key or click skips straight to the site
    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro" role="status" aria-label="Loading">
      <div className="intro-inner">
        <svg viewBox="0 0 400 230" className="intro-track" aria-hidden="true">
          {/* Tarmac, kerb line, then the red trail drawn behind the badge */}
          <path d={TRACK} className="intro-tarmac" />
          <path ref={path} d={TRACK} className="intro-centre" />
          <path ref={trail} d={TRACK} className="intro-trail" />
          {/* Start / finish line */}
          <g transform="translate(70 180)">
            <rect x="-2" y="-9" width="4" height="18" fill="#F5F7FA" />
            <rect x="-2" y="-9" width="2" height="4.5" fill="#081326" />
            <rect x="0" y="-4.5" width="2" height="4.5" fill="#081326" />
            <rect x="-2" y="0" width="2" height="4.5" fill="#081326" />
            <rect x="0" y="4.5" width="2" height="4.5" fill="#081326" />
          </g>
          <g ref={car} transform="translate(70 180)">
            <g className="intro-nose">
              <path d="M26 0 L18 -6 L18 6 Z" fill="#E21B2D" />
            </g>
            <circle r="20" fill="#E21B2D" />
            <image href="/face.webp" x="-17.5" y="-17.5" width="35" height="35" clipPath="url(#intro-face)" />
            <clipPath id="intro-face">
              <circle r="17.5" />
            </clipPath>
          </g>
        </svg>

        <div className="intro-meta label">
          <span className="text-[var(--paper)]">Rishabh Parashar</span>
          <span className="text-[var(--dim)]">Lap 1 / 1</span>
          <span className="text-[var(--red)] tabular-nums">
            <span ref={pct}>000</span>%
          </span>
        </div>
      </div>
    </div>
  );
}
