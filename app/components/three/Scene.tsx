"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useState } from "react";
import Background from "./Background";
import Emblem from "./Emblem";
import { Particles } from "./Atmosphere";

/**
 * The persistent WebGL layer. Mounted once in the root layout so the emblem
 * survives route changes and can travel between pages.
 */
export default function Scene({ reduced, onReady }: { reduced: boolean; onReady: () => void }) {
  const [dpr, setDpr] = useState(1.5);
  const animate = !reduced;
  const small = typeof window !== "undefined" && window.innerWidth < 760;

  return (
    <Canvas
      dpr={[1, dpr]}
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      onCreated={() => requestAnimationFrame(onReady)}
      style={{ pointerEvents: "none" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
      />
      <Background animate={animate} />

      {/* Studio lighting: long strip softboxes like a garage light rig */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 4]} scale={[12, 0.6, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 0.5, 1]} />
        <Lightformer form="rect" intensity={3} color="#176BFF" position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={2} color="#E21B2D" position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[10, 1, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[2, 2, -6]} scale={3} />
      </Environment>

      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 6]} intensity={1.6} />
      <pointLight position={[-4, -2, 3]} intensity={18} color="#176BFF" distance={14} />
      <pointLight position={[4, -3, 2]} intensity={12} color="#E21B2D" distance={12} />

      {reduced && <DemandInvalidator />}
      <Emblem animate={animate} />
      <Particles count={small ? 220 : 520} animate={animate} />
    </Canvas>
  );
}

/** With reduced motion the canvas renders on demand — redraw on scroll/input. */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    const id = window.setInterval(on, 500);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    window.addEventListener("livery", on);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      window.removeEventListener("livery", on);
    };
  }, [invalidate]);
  return null;
}
