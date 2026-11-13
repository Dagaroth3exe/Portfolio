"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Deterministic PRNG so geometry is stable between renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const particleVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPx;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * (0.05 + aSeed * 0.08) + uScroll * (0.4 + aSeed) + 7.0, 14.0) - 7.0;
    p.x += sin(uTime * 0.2 + aSeed * 30.0) * 0.2;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.2 + aSeed * 2.4) * uPx * (8.0 / -mv.z);
    vAlpha = smoothstep(-16.0, -4.0, mv.z) * (0.25 + aSeed * 0.5);
    vSeed = aSeed;
  }
`;

const particleFragment = /* glsl */ `
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    vec3 c = mix(vec3(0.55, 0.7, 1.0), vec3(1.0, 0.35, 0.4), step(0.93, vSeed));
    gl_FragColor = vec4(c, a);
  }
`;

/** Fine dust drifting through the space — gives the camera depth cues. */
export function Particles({ count, animate }: { count: number; animate: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uPx: { value: 1 } }), []);
  const attrs = useMemo(() => {
    const r = rng(7);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 22;
      pos[i * 3 + 1] = (r() - 0.5) * 14;
      pos[i * 3 + 2] = -r() * 14 + 3;
      seed[i] = r();
    }
    return { pos, seed };
  }, [count]);

  useFrame((state, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    if (animate) u.uTime.value += dt;
    u.uScroll.value = window.scrollY / 400;
    u.uPx.value = state.gl.getPixelRatio();
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.pos, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[attrs.seed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
