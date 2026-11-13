"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LOGO_HEIGHT, LOGO_POLYS_CENTERED } from "../../lib/logo";
import { LIVERIES, sceneStore } from "../../lib/scene-store";

/**
 * The extruded 3D "3". Its pose is choreographed by scroll: every section
 * declares `data-pose="<name>"`, and the emblem blends between the poses of
 * the sections around the middle of the viewport.
 */

type Pose = {
  x: number; // fraction of half viewport width
  y: number; // fraction of half viewport height
  z: number;
  s: number; // emblem height as fraction of viewport height
  rx: number;
  ry: number;
  rz: number;
  glow: number;
};

const P = (x: number, y: number, s: number, ry = 0, rx = 0, rz = 0, z = 0, glow = 1): Pose => ({
  x, y, z, s, rx, ry, rz, glow,
});

const DESKTOP: Record<string, Pose> = {
  hero: P(0.5, 0.04, 0.54, -0.32, 0.04),
  // Content-heavy sections: the emblem parks out of frame so text stays clear
  work: P(0.15, 1.9, 0.5, 0.6, -0.5, 0.2, 0, 0),
  experience: P(0.15, 1.9, 0.5, 0.6, -0.5, 0.2, 0, 0),
  skills: P(0.78, 0.62, 0.2, -1.25, 0.35, -0.1, 0, 0.5),
  // The bobblehead takes the stage in About; the emblem parks out of frame
  about: P(-0.3, 1.9, 0.45, 0.95, -0.5, 0.05, 0, 0),
  contact: P(0.52, 0.0, 0.56, -0.18, 0.02),
  case: P(0.6, 1.9, 0.45, -0.6, -0.5, 0, 0, 0),
  next: P(0.68, 0.05, 0.46, -0.35, 0.05),
};

const MOBILE: Record<string, Pose> = {
  hero: P(0.0, 0.42, 0.36, -0.3, 0.05),
  work: P(0.1, 1.9, 0.4, 0.6, -0.5, 0, 0, 0),
  experience: P(0.1, 1.9, 0.4, 0.6, -0.5, 0, 0, 0),
  skills: P(0.68, 0.8, 0.11, -1.2, 0.3, 0, 0, 0.4),
  about: P(0.3, 1.9, 0.3, 0.9, -0.5, 0, 0, 0),
  contact: P(0.1, 1.9, 0.4, 0.6, -0.5, 0, 0, 0),
  case: P(0.5, 1.9, 0.3, -0.6, -0.5, 0, 0, 0),
  next: P(0.45, 0.6, 0.22, -0.35, 0.05),
};

type Section = { top: number; bottom: number; pose: string };

function readSections(): Section[] {
  const y = window.scrollY;
  return Array.from(document.querySelectorAll<HTMLElement>("[data-pose]")).map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + y, bottom: r.bottom + y, pose: el.dataset.pose || "hero" };
  });
}

const smooth = (t: number) => t * t * (3 - 2 * t);

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (o[k] = a[k] + (b[k] - a[k]) * t));
  return o;
}

function targetPose(sections: Section[], table: Record<string, Pose>, vh: number): Pose {
  if (!sections.length) return table.hero;
  const probe = window.scrollY + vh * 0.5;
  const zone = vh * 0.45;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const pose = table[s.pose] ?? table.hero;
    const next = sections[i + 1];
    if (next && probe > s.bottom - zone && probe < next.top + zone) {
      const t = smooth(Math.min(1, Math.max(0, (probe - (s.bottom - zone)) / (next.top + zone - (s.bottom - zone)))));
      return lerpPose(pose, table[next.pose] ?? table.hero, t);
    }
    if (probe <= s.bottom || !next) return pose;
  }
  return table.hero;
}

export default function Emblem({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const { viewport, camera, size } = useThree();
  const sections = useRef<Section[]>([]);
  const current = useRef<Pose | null>(null);
  const spinAngle = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const targetColor = useMemo(() => new THREE.Color(), []);
  const targetEmissive = useMemo(() => new THREE.Color(), []);

  const geometry = useMemo(() => {
    const shapes = LOGO_POLYS_CENTERED.map((poly) => {
      const shape = new THREE.Shape();
      poly.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
      shape.closePath();
      return shape;
    });
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: 26,
      bevelEnabled: true,
      bevelThickness: 4,
      bevelSize: 2.6,
      bevelSegments: 5,
      curveSegments: 1,
    });
    g.center();
    const s = 1 / LOGO_HEIGHT;
    g.scale(s, s, s);
    g.computeVertexNormals();
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Keep the section map fresh (layout shifts, route changes, pin spacers).
  useEffect(() => {
    const refresh = () => (sections.current = readSections());
    refresh();
    const id = window.setInterval(refresh, 600);
    window.addEventListener("resize", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  useFrame((state, dt) => {
    if (!group.current || !inner.current || !mat.current) return;
    const mobile = size.width / size.height < 0.85 || size.width < 760;
    const table = mobile ? MOBILE : DESKTOP;
    const target = targetPose(sections.current, table, size.height);
    const k = animate ? 1 - Math.exp(-dt * 3.2) : 1;

    if (!current.current) current.current = { ...target };
    const c = current.current;
    (Object.keys(c) as (keyof Pose)[]).forEach((key) => (c[key] += (target[key] - c[key]) * k));

    // Viewport dimensions at the emblem's depth
    const depthVp = viewport.getCurrentViewport(camera, tmp.set(0, 0, c.z));
    const t = state.clock.elapsedTime;
    const intro = sceneStore.intro;
    const introEase = 1 - Math.pow(1 - intro, 3);

    const px = sceneStore.pointer.x;
    const py = sceneStore.pointer.y;
    const floatY = animate ? Math.sin(t * 0.8) * 0.05 * introEase : 0;

    group.current.position.set(
      (c.x * depthVp.width) / 2,
      (c.y * depthVp.height) / 2 + floatY,
      c.z,
    );
    // Emerge from the flat 2D mark: full size from the start, depth grows in
    const scale = c.s * depthVp.height * (1 + sceneStore.focus * 0.06);
    group.current.scale.setScalar(scale);
    inner.current.scale.z = 0.02 + 0.98 * introEase;

    // Spin impulse (contact interaction) with decay
    if (animate) {
      spinAngle.current += sceneStore.spin * dt;
      sceneStore.spin *= Math.exp(-dt * 1.6);
      if (sceneStore.spin < 1.5) {
        // Settle on the nearest full turn so the emblem always lands on its pose
        const rest = Math.round(spinAngle.current / (Math.PI * 2)) * Math.PI * 2;
        spinAngle.current += (rest - spinAngle.current) * (1 - Math.exp(-dt * 3));
      }
    }

    // Starts square to the camera (matching the 2D mark), then turns into its pose
    group.current.rotation.set(
      (c.rx + (animate ? -py * 0.22 + Math.sin(t * 0.6) * 0.03 : 0)) * introEase,
      (c.ry + (animate ? px * 0.38 : 0)) * introEase + spinAngle.current,
      (c.rz + (animate ? Math.sin(t * 0.45) * 0.02 : 0)) * introEase,
    );
    inner.current.position.x = animate ? Math.sin(t * 0.7) * 0.01 : 0;

    // Livery material blend
    const L = LIVERIES[sceneStore.livery];
    targetColor.set(L.color);
    targetEmissive.set(L.emissive);
    const mk = animate ? 1 - Math.exp(-dt * 4) : 1;
    mat.current.color.lerp(targetColor, mk);
    mat.current.emissive.lerp(targetEmissive, mk);
    mat.current.metalness += (L.metalness - mat.current.metalness) * mk;
    mat.current.roughness += (L.roughness - mat.current.roughness) * mk;

    // Tell the backdrop where the emblem is (aspect-space) for its glow
    tmp.copy(group.current.position).project(camera);
    const aspect = size.width / size.height;
    sceneStore.glow.x = tmp.x * 0.5 * aspect;
    sceneStore.glow.y = tmp.y * 0.5;
    sceneStore.glow.z = c.glow * introEase;
  });

  return (
    <group ref={group}>
      <group ref={inner}>
        <mesh geometry={geometry} castShadow>
          <meshPhysicalMaterial
            ref={mat}
            color="#E21B2D"
            metalness={0.55}
            roughness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.35}
            emissive="#3a0007"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
