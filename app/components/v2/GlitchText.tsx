"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

const GLYPHS = "█▓▒░#%&@$01<>/\\=+*";

/**
 * Text that arrives (and re-arrives on hover) as a pixel glitch: characters
 * scramble through block glyphs and resolve left → right, while CSS slices
 * of the word tear sideways (see `.glitch` in globals.css).
 *
 * The real text is always in the DOM for screen readers; the scramble is a
 * visual layer only.
 */
export default function GlitchText({
  text,
  as: Tag = "span",
  className = "",
  hover = true,
  duration = 650,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Re-run the glitch on pointer enter. */
  hover?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(text);
  const [active, setActive] = useState(false);
  const raf = useRef(0);

  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    setActive(true);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const lock = Math.floor(k * text.length);
      setShown(
        text
          .split("")
          .map((ch, i) => (ch === " " || i < lock ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (k < 1) raf.current = requestAnimationFrame(step);
      else {
        setShown(text);
        setActive(false);
      }
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag
      ref={ref}
      className={`glitch ${active ? "is-glitching" : ""} ${className}`}
      data-text={text}
      onPointerEnter={hover ? run : undefined}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </Tag>
  );
}
