"use client";

import { useEffect, useRef } from "react";
import { kickSpin, sceneStore, setLivery } from "../lib/scene-store";

const SECRET = "max";

/**
 * Easter egg: type "max" anywhere (outside text fields) and the 3D "3"
 * switches to Dutch orange. Type it again to switch back to racing red.
 */
export default function EasterEgg() {
  const buffer = useRef("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer.current !== SECRET) return;
      buffer.current = "";

      const on = sceneStore.livery !== "orange";
      setLivery(on ? "orange" : "racing");
      kickSpin(on ? 16 : 10);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
