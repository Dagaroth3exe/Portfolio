"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore } from "../../lib/scene-store";

/**
 * Full-screen shader backdrop: faceted midnight-navy "low-poly" field,
 * thin technical guide lines at the emblem's italic angle, a key glow that
 * follows the emblem, and film grain. Rendered as a clip-space quad.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uSpeed;
  uniform vec3 uGlow;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Shade of the simplex-grid triangle containing p (low-poly facets).
  float facet(vec2 p) {
    const float F = 0.366025404;
    const float G = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * F);
    vec2 x0 = p - i + (i.x + i.y) * G;
    float tri = step(x0.y, x0.x);
    return hash21(i + tri * 17.31);
  }

  float line(float d, float w) {
    return 1.0 - smoothstep(0.0, w, abs(d));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    float px = 1.4 / uRes.y;

    vec3 deep = vec3(0.020, 0.043, 0.094);
    vec3 navy = vec3(0.047, 0.098, 0.200);
    vec3 col = mix(deep, navy, smoothstep(-0.7, 0.6, p.y + p.x * 0.25));

    vec2 fp = p * 2.6 + vec2(uTime * 0.012, -uScroll * 1.6);
    float f = facet(fp);
    float f2 = facet(fp * 0.55 + 7.0);
    col += (f - 0.5) * 0.026 + (f2 - 0.5) * 0.03;
    col += vec3(0.0, 0.015, 0.05) * smoothstep(0.6, 1.0, f2);

    vec2 g = p - uGlow.xy;
    col += vec3(0.09, 0.42, 1.0) * exp(-dot(g, g) * 3.2) * uGlow.z * 0.17;
    vec2 g2 = g - vec2(0.18, -0.12);
    col += vec3(0.89, 0.11, 0.18) * exp(-dot(g2, g2) * 6.0) * uGlow.z * 0.06;

    vec2 m = p - uMouse * vec2(aspect * 0.5, 0.5);
    col += vec3(0.09, 0.42, 1.0) * exp(-dot(m, m) * 9.0) * 0.035;

    float lines = 0.0;
    for (int k = 0; k < 6; k++) {
      float y = uGlow.y - 0.13 + float(k) * 0.052;
      lines += line(p.y - y, px);
    }
    col += vec3(0.55, 0.65, 0.8) * lines * 0.06 * smoothstep(0.95, 0.1, abs(p.x - uGlow.x * 0.5));

    float d = p.x - p.y * 0.42 + uScroll * 0.6;
    for (int k = 0; k < 4; k++) {
      float off = 0.08 + float(k) * 0.045;
      col += vec3(0.6, 0.7, 0.9) * line(d - off, px) * 0.055 * smoothstep(0.7, -0.2, p.y);
    }

    col += vec3(0.09, 0.42, 1.0) * uSpeed * 0.05 * smoothstep(0.5, 0.0, abs(p.y));

    col *= 1.0 - smoothstep(0.4, 1.25, length(p * vec2(0.8, 1.1)));
    col += (hash21(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Background({ animate }: { animate: boolean }) {
  const size = useThree((s) => s.size);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
      uSpeed: { value: 0 },
      uGlow: { value: new THREE.Vector3(0.3, 0, 1) },
    }),
    [],
  );

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    if (animate) u.uTime.value += dt;
    u.uRes.value.set(size.width, size.height);
    const k = animate ? 0.05 : 1;
    u.uMouse.value.x += (sceneStore.pointer.x - u.uMouse.value.x) * k;
    u.uMouse.value.y += (sceneStore.pointer.y - u.uMouse.value.y) * k;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    u.uScroll.value = window.scrollY / max;
    u.uSpeed.value += (Math.min(Math.abs(sceneStore.velocity) / 40, 1) - u.uSpeed.value) * 0.08;
    u.uGlow.value.set(sceneStore.glow.x, sceneStore.glow.y, sceneStore.glow.z);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
