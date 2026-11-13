"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Blueprint "measurement" annotation. Wraps an element and draws dimension
 * lines that extend in from the ends, with end ticks and a live readout that
 * counts up to the element's real, measured size (ResizeObserver keeps it
 * honest when the layout changes).
 *
 * `axes`: "x" = width line above, "y" = height line on the left, "xy" = both.
 */
export default function Measure({
  children,
  axes = "x",
  label,
  unit = "px",
  className = "",
  side = "top",
}: {
  children: ReactNode;
  axes?: "x" | "y" | "xy";
  /** Prefix for the readout, e.g. "W" / "H". */
  label?: { x?: string; y?: string };
  unit?: string;
  className?: string;
  /** Where the width line sits. */
  side?: "top" | "bottom";
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState({ w: 0, h: 0 });
  const [on, setOn] = useState(false);

  // Measure (and re-measure on resize)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Count the readout up to the measured value
  useEffect(() => {
    if (!on) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const id = requestAnimationFrame(() => setShown(size));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const t0 = performance.now();
    const from = { ...shown };
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100);
      const e = 1 - Math.pow(1 - k, 3);
      setShown({ w: from.w + (size.w - from.w) * e, h: from.h + (size.h - from.h) * e });
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, size.w, size.h]);

  const fmt = (v: number) => `${v.toFixed(1)}${unit}`;
  const showX = axes.includes("x");
  const showY = axes.includes("y");

  return (
    <div ref={box} className={`measure relative ${on ? "is-on" : ""} ${className}`}>
      {children}
      {showX && (
        <span className={`measure-x ${side === "bottom" ? "is-bottom" : ""}`} aria-hidden="true">
          <span className="measure-line" />
          <span className="measure-tag">
            {label?.x ?? "W"} {fmt(shown.w)}
          </span>
        </span>
      )}
      {showY && (
        <span className="measure-y" aria-hidden="true">
          <span className="measure-line" />
          <span className="measure-tag">
            {label?.y ?? "H"} {fmt(shown.h)}
          </span>
        </span>
      )}
    </div>
  );
}
