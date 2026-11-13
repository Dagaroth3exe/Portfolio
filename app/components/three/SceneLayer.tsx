"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { gsap } from "../../lib/gsap";
import { sceneStore } from "../../lib/scene-store";
import { useReducedMotion } from "../../lib/use-reduced-motion";

// Three.js is heavy — keep it out of the initial bundle and skip SSR.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    document.documentElement.dataset.gl = "off";
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function SceneLayer() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok = webglAvailable();
    document.documentElement.dataset.gl = ok ? "loading" : "off";
    // Defer the WebGL boot until the browser is idle so first paint stays fast.
    const start = () => setEnabled(ok);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 600 });
    else setTimeout(start, 120);

    const onMove = (e: PointerEvent) => {
      sceneStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneStore.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.gl = "ready";
    // The flat 2D poster sits exactly over the flat start of the 3D emblem;
    // it fades out as the emblem gains depth, so the 3D "3" emerges from it.
    const syncPoster = () => {
      const o = String(Math.max(0, 1 - sceneStore.intro / 0.35));
      document.querySelectorAll<HTMLElement>(".gl-poster").forEach((el) => (el.style.opacity = o));
    };
    if (reduced) {
      sceneStore.intro = 1;
      syncPoster();
    } else {
      // Assemble the emblem as the loading intro clears (or right away)
      const go = () =>
        gsap.to(sceneStore, { intro: 1, duration: 1.8, delay: 0.15, ease: "power2.inOut", onUpdate: syncPoster });
      if (document.documentElement.classList.contains("intro-on")) {
        window.addEventListener("introdone", go, { once: true });
        return () => window.removeEventListener("introdone", go);
      }
      go();
    }
  }, [ready, reduced]);

  return (
    <div className="scene-layer" aria-hidden="true">
      {enabled && (
        <GLBoundary>
          <Scene reduced={reduced} onReady={() => setReady(true)} />
        </GLBoundary>
      )}
    </div>
  );
}
