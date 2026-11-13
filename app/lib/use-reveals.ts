"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText } from "./gsap";

/**
 * Shared motion vocabulary. Inside `scope`, elements opt in with:
 *  - data-split="chars|words|lines"  masked type reveal
 *  - data-reveal                      rise + fade
 *  - data-wipe                        slanted clip-path wipe (the "sector" sweep)
 *  - data-rule                        technical line draws in
 *  - data-count                       numeric counter
 *  - data-delay="0.2"                 per-element delay
 * Elements start hidden via CSS only when JS + motion are available
 * (html.js-motion), so content is never lost without JS.
 */
export function useReveals(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const trigger = (el: Element, start = "top 85%") => ({ trigger: el, start, once: true });
      const delay = (el: Element) => parseFloat((el as HTMLElement).dataset.delay || "0");

      if (reduced) {
        gsap.set(root.querySelectorAll("[data-split],[data-reveal],[data-wipe],[data-rule]"), {
          clearProps: "all", opacity: 1,
        });
        return;
      }

      root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        const type = (el.dataset.split || "lines") as "chars" | "words" | "lines";
        const split = SplitText.create(el, {
          type: type === "chars" ? "lines,chars" : type === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
        });
        splits.push(split);
        const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;
        gsap.set(el, { opacity: 1 });
        gsap.from(targets, {
          yPercent: 115,
          rotate: type === "chars" ? 6 : 2,
          duration: type === "chars" ? 1.05 : 1.1,
          stagger: type === "chars" ? 0.025 : type === "words" ? 0.04 : 0.09,
          ease: "power4.out",
          delay: delay(el),
          scrollTrigger: trigger(el, "top 88%"),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1, delay: delay(el), scrollTrigger: trigger(el),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-wipe]").forEach((el) => {
        gsap.fromTo(el,
          { clipPath: "polygon(0 0, 0 0, -25% 100%, -25% 100%)", opacity: 1 },
          {
            clipPath: "polygon(0 0, 125% 0, 100% 100%, -25% 100%)",
            duration: 1.3, ease: "power4.inOut", delay: delay(el), scrollTrigger: trigger(el),
          });
      });

      root.querySelectorAll<HTMLElement>("[data-rule]").forEach((el) => {
        gsap.fromTo(el, { scaleX: 0, opacity: 1 }, {
          scaleX: 1, transformOrigin: "left center", duration: 1.4, ease: "power3.inOut",
          delay: delay(el), scrollTrigger: trigger(el, "top 92%"),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count || "0");
        const pad = el.dataset.pad ? parseInt(el.dataset.pad) : 0;
        const suffix = el.dataset.suffix || "";
        const o = { v: 0 };
        gsap.to(o, {
          v: end, duration: 1.6, ease: "power2.out", delay: delay(el),
          scrollTrigger: trigger(el),
          onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(pad, "0") + suffix),
        });
      });
    }, root);

    // Fonts can shift line breaks; re-measure once they are in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      splits.forEach((s) => s.revert());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
