"use client";

import { useEffect, useState } from "react";
import { GLYPHS, GLYPH_METRICS } from "../../lib/name-glyphs";

/**
 * The name as a type-design specimen / glyph inspector.
 *
 * Intro: guides (baseline, x-height, cap height) rule across, each letter's
 * outline draws on with its real on-curve points, off-curve handles and
 * coordinate readouts; the letters fill with hatching, then resolve solid and
 * the construction fades. After that, hovering a letter opens it back up in
 * wireframe with its glyph info (unicode, advance, point count).
 *
 * Outlines are Inter Tight SemiBold — the site's display face — extracted to
 * app/lib/name-glyphs.ts, set with the same tight tracking as the headings.
 * Decorative SVG; the accessible name is rendered once as text by the caller.
 */
const { upm, cap, xh } = GLYPH_METRICS;
const u = upm / 1000; // everything below is designed per 1000 units
const TRACK = -0.045 * upm; // matches .display letter-spacing
const PAD_X = 60 * u;
const TOP = cap + 190 * u; // room above cap for labels
const BOTTOM = 150 * u; // room below baseline for metrics
const INTRO_MS = 3600;

export default function GlyphName({ lines, className = "" }: { lines: string[]; className?: string }) {
  const [phase, setPhase] = useState<"idle" | "intro" | "done">("idle");

  useEffect(() => {
    let t = 0;
    const start = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPhase("done");
        return;
      }
      setPhase("intro");
      t = window.setTimeout(() => setPhase("done"), INTRO_MS);
    };
    let raf = 0;
    if (document.documentElement.classList.contains("intro-on")) {
      window.addEventListener("introdone", start, { once: true });
    } else raf = requestAnimationFrame(start);
    return () => {
      window.removeEventListener("introdone", start);
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  let gi = 0; // global glyph index for stagger
  return (
    <div className={`glyph-name is-${phase} ${className}`} aria-hidden="true" style={{ ["--u" as string]: u }}>
      {lines.map((line, li) => {
        const chars = line.split("").filter((ch) => GLYPHS[ch]);
        // Pen positions with tracking
        const xs: number[] = [];
        let pen = 0;
        chars.forEach((ch, i) => {
          xs.push(pen);
          pen += GLYPHS[ch].adv + (i < chars.length - 1 ? TRACK : 0);
        });
        const width = pen;
        const W = width + PAD_X * 2;
        const first = GLYPHS[chars[0]];
        return (
          <svg
            key={li}
            className="glyph-line"
            viewBox={`${-PAD_X} ${-TOP} ${W} ${TOP + BOTTOM}`}
            style={{ width: `${W / upm}em`, height: `${(TOP + BOTTOM) / upm}em` }}
          >
            <defs>
              <pattern id={`gl-hatch-${li}`} width={34 * u} height={34 * u} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2={34 * u} stroke="currentColor" strokeWidth={7 * u} />
              </pattern>
            </defs>

            {/* Guides */}
            <g className="gl-guides">
              {[0, -xh, -cap].map((y) => (
                <line key={y} className="gl-guide" x1={-PAD_X} x2={width + PAD_X} y1={y} y2={y} pathLength={1} />
              ))}
              {li === lines.length - 1 && (
                <>
                  <text className="gl-label gl-label--guide" x={width + PAD_X - 6 * u} y={-cap - 26 * u} textAnchor="end">
                    cap {cap}
                  </text>
                  <text className="gl-label gl-label--guide" x={width + PAD_X - 6 * u} y={-xh - 26 * u} textAnchor="end">
                    x-height {xh}
                  </text>
                  <text className="gl-label gl-label--guide" x={width + PAD_X - 6 * u} y={80 * u} textAnchor="end">
                    baseline 0
                  </text>
                </>
              )}
              {/* Advance ticks under the baseline */}
              {xs.map((x, i) => (
                <line key={i} className="gl-tick" x1={x} x2={x} y1={20 * u} y2={70 * u} />
              ))}
              <line className="gl-tick" x1={width} x2={width} y1={20 * u} y2={70 * u} />
              <text className="gl-label gl-label--guide" x={first.adv / 2} y={135 * u} textAnchor="middle">
                ← {first.adv} →
              </text>
            </g>

            {chars.map((ch, i) => {
              const g = GLYPHS[ch];
              const ox = Math.round(xs[i]);
              const k = gi++;
              // Coordinate readout: the top-most, then left-most anchor
              const top = [...g.anchors].sort((a, b) => a[1] - b[1] || a[0] - b[0])[0];
              const showCoord = k % 3 === 0;
              const s = u; // point sizes scale with the units
              return (
                <g key={i} className="gl-glyph" transform={`translate(${ox} 0)`} style={{ ["--i" as string]: k }}>
                  <rect className="gl-hit" x={0} y={-cap - 60 * u} width={g.adv + TRACK} height={cap + 120 * u} />
                  <path className="gl-fill" d={g.d} />
                  <path className="gl-hatch" d={g.d} fill={`url(#gl-hatch-${li})`} />
                  <path className="gl-line" d={g.d} pathLength={1} />
                  <g className="gl-pts">
                    {g.ctrls.map((c, j) => (
                      <g key={j}>
                        <line x1={c[0]} y1={c[1]} x2={c[2]} y2={c[3]} />
                        {c.length > 4 && <line x1={c[0]} y1={c[1]} x2={c[4]} y2={c[5]} />}
                        <circle cx={c[0]} cy={c[1]} r={13 * s} />
                      </g>
                    ))}
                    {g.anchors.map(([ax, ay], j) => (
                      <rect key={j} x={ax - 15 * s} y={ay - 15 * s} width={30 * s} height={30 * s} />
                    ))}
                  </g>
                  {showCoord && top && (
                    <text className="gl-label gl-coord" x={top[0]} y={top[1] - 34 * u}>
                      x{ox + top[0]} y{-top[1]}
                    </text>
                  )}
                  <text className="gl-label gl-info" x={g.adv / 2} y={-cap - 118 * u} textAnchor="middle">
                    {ch} · U+{g.unicode.toString(16).toUpperCase().padStart(4, "0")} · {g.anchors.length} pts
                  </text>
                </g>
              );
            })}
          </svg>
        );
      })}
    </div>
  );
}
