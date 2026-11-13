/**
 * A tiny mutable store shared between the DOM and the WebGL scene.
 * Written from event handlers, read every frame inside useFrame — no React
 * re-renders involved, which keeps the 3D loop cheap.
 */

export type Livery = "racing" | "midnight" | "chrome" | "volt" | "orange";

export const LIVERIES: Record<
  Livery,
  { label: string; color: string; metalness: number; roughness: number; emissive: string }
> = {
  racing: { label: "Racing Red", color: "#E21B2D", metalness: 0.55, roughness: 0.22, emissive: "#3a0007" },
  midnight: { label: "Midnight", color: "#1A3AA8", metalness: 0.7, roughness: 0.28, emissive: "#020a2a" },
  chrome: { label: "Chrome", color: "#D9DEE7", metalness: 1, roughness: 0.08, emissive: "#000000" },
  volt: { label: "Volt", color: "#FFD21F", metalness: 0.45, roughness: 0.3, emissive: "#2a1d00" },
  // Easter egg (type "max"): Dutch orange
  orange: { label: "Orange", color: "#FF7A1A", metalness: 0.4, roughness: 0.22, emissive: "#6a2600" },
};

export const sceneStore = {
  /** Normalised pointer, -1..1, y up. */
  pointer: { x: 0, y: 0 },
  /** Smoothed scroll velocity in px/frame (from Lenis). */
  velocity: 0,
  livery: "racing" as Livery,
  /** Impulse that spins the logo; decays in the scene. */
  spin: 0,
  /** Hover boost for interactive moments (0..1). */
  focus: 0,
  /** Intro progress 0..1 — the logo assembles while the intro plays. */
  intro: 0,
  /** Emblem position in backdrop aspect-space (x, y) + glow strength (z). */
  glow: { x: 0.3, y: 0, z: 1 },
};

/* Mutators — keep writes in one place (and out of React render scope). */
export function setLivery(l: Livery) {
  sceneStore.livery = l;
  window.dispatchEvent(new Event("livery"));
}
export function kickSpin(amount: number) {
  sceneStore.spin = Math.max(sceneStore.spin, amount);
  window.dispatchEvent(new Event("livery"));
}
export function setFocus(v: number) {
  sceneStore.focus = v;
}
