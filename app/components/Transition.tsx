"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "../lib/gsap";
import { scrollToTarget, useLenis } from "./SmoothScroll";
import LogoMark from "./ui/LogoMark";

/**
 * Route transitions: three slanted livery panels (navy / blue / red) sweep
 * across the screen at the emblem's italic angle, the route swaps underneath,
 * then the panels exit the other way.
 */

type Navigate = (href: string) => void;

// Slanted at the emblem's italic angle (≈ 20% horizontal run over full height)
const HIDDEN_LEFT = "polygon(-45% 0%, -45% 0%, -65% 100%, -65% 100%)";
const COVER = "polygon(-45% 0%, 145% 0%, 125% 100%, -65% 100%)";
const HIDDEN_RIGHT = "polygon(145% 0%, 145% 0%, 125% 100%, 125% 100%)";
const TransitionContext = createContext<Navigate>(() => {});
export const useTransitionNavigate = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const overlay = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const first = useRef(true);

  const navigate = useCallback<Navigate>(
    (href) => {
      const [path, hash] = href.split("#");
      const targetPath = path || pathname;

      // Same page: just glide there.
      if (targetPath === pathname) {
        scrollToTarget(lenis, hash ? `#${hash}` : 0);
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !overlay.current) {
        router.push(href);
        return;
      }
      pending.current = true;
      const panels = overlay.current.querySelectorAll(".tr-panel");
      const mark = overlay.current.querySelector(".tr-mark");
      gsap
        .timeline({ onComplete: () => router.push(href, { scroll: false }) })
        .set(overlay.current, { visibility: "visible" })
        .fromTo(panels, { clipPath: HIDDEN_LEFT }, { clipPath: COVER, duration: 0.6, stagger: 0.07, ease: "power4.inOut" })
        .fromTo(mark, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 }, "-=0.2");
    },
    [lenis, pathname, router],
  );

  // When the new route has rendered, reveal it.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = overlay.current;
    if (!el) return;
    const hash = window.location.hash;
    lenis?.scrollTo(hash || 0, { immediate: true, force: true });
    if (!lenis) {
      if (hash) document.querySelector(hash)?.scrollIntoView();
      else window.scrollTo(0, 0);
    }
    if (!pending.current) return;
    pending.current = false;
    const panels = el.querySelectorAll(".tr-panel");
    gsap
      .timeline({ delay: 0.15, onComplete: () => gsap.set(el, { visibility: "hidden" }) })
      .to(el.querySelector(".tr-mark"), { opacity: 0, duration: 0.2 })
      .fromTo(panels, { clipPath: COVER }, { clipPath: HIDDEN_RIGHT, duration: 0.7, stagger: { each: 0.07, from: "end" }, ease: "power4.inOut" }, "<");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div ref={overlay} className="tr-overlay" aria-hidden="true">
        <div className="tr-panel tr-panel--red" />
        <div className="tr-panel tr-panel--blue" />
        <div className="tr-panel tr-panel--navy" />
        <LogoMark className="tr-mark" color="#E21B2D" />
      </div>
    </TransitionContext.Provider>
  );
}

/** Drop-in Link that routes through the transition system. */
export function TLink({
  href,
  children,
  onClick,
  ...rest
}: { href: string; children: ReactNode } & Omit<React.ComponentProps<typeof NextLink>, "href">) {
  const navigate = useTransitionNavigate();
  return (
    <NextLink
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </NextLink>
  );
}
