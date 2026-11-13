"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LOGO_HEIGHT, LOGO_POLYS_CENTERED } from "../../lib/logo";
import { sceneStore } from "../../lib/scene-store";

/**
 * An interactive bobblehead: an oversized head wearing the owner's face
 * (from /avatar.jpg, feathered onto the front of the head), on a spring,
 * over a small racing-suit body on a pedestal.
 *
 * - Drag the head to tilt it; let go and it wobbles back on the spring.
 * - Tap / click for a big bobble. Moving the pointer over it nudges it.
 * - Fast page scrolling makes it bob. The head glances toward the pointer.
 *
 * Renders only while on screen. Under reduced motion there is no idle
 * motion, but direct interaction still works.
 */

const SKIN_FALLBACK = "#c68a5e";
const SUIT = "#13245a";
const RED = "#e21b2d";

/* ------------------------------------------------------------- textures */

/** Face: crop the avatar around the face and feather it into an oval. */
function useFaceTexture() {
  const [state, setState] = useState<{ map: THREE.Texture; skin: string } | null>(null);
  useEffect(() => {
    let tex: THREE.CanvasTexture | null = null;
    const img = new window.Image();
    img.src = "/avatar.jpg";
    img.onload = () => {
      const W = 512;
      const H = 640;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d")!;
      // Crop (in the 988×988 source): hair-top to chin, ear to ear
      const sx = 300;
      const sy = 12;
      const sw = 424;
      const sh = 560;
      x.filter = "brightness(1.06) contrast(1.04) saturate(1.05)";
      x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      x.filter = "none";

      // Skin tone sampled from the cheeks, used for the rest of the head
      const sample = (px: number, py: number) => x.getImageData(px, py, 18, 18).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (const d of [sample(120, 390), sample(372, 390)]) {
        for (let i = 0; i < d.length; i += 4) {
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
          n++;
        }
      }
      const skin = n ? `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})` : SKIN_FALLBACK;

      // Feather into an oval so the photo melts into the head
      x.globalCompositeOperation = "destination-in";
      x.save();
      x.translate(W * 0.49, H * 0.5);
      x.scale(0.66, 1);
      const grad = x.createRadialGradient(0, 0, 0, 0, 0, H * 0.48);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.68, "rgba(0,0,0,1)");
      grad.addColorStop(0.9, "rgba(0,0,0,0.35)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = grad;
      x.fillRect(-W, -H, W * 2, H * 2);
      x.restore();

      tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      setState({ map: tex, skin });
    };
    return () => tex?.dispose();
  }, []);
  return state;
}

/** Suit: navy with red side panels, a white chest stripe and a front zip. */
function makeSuitTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = SUIT;
  x.fillRect(0, 0, 512, 256);
  // u: 0/1 = front, 0.25 = right side, 0.5 = back, 0.75 = left side
  x.fillStyle = RED;
  x.fillRect(512 * 0.17, 0, 512 * 0.14, 256);
  x.fillRect(512 * 0.69, 0, 512 * 0.14, 256);
  x.fillStyle = "#f5f7fa";
  x.fillRect(0, 256 * 0.3, 512, 10);
  x.fillStyle = "rgba(255,255,255,0.25)";
  x.fillRect(0, 0, 3, 256);
  x.fillRect(509, 0, 3, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  // The capsule's front sits at u = 0.75; shift so panels land on the sides
  t.wrapS = THREE.RepeatWrapping;
  t.offset.x = 0.25;
  return t;
}

/** Nameplate text. */
function makePlateTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const x = c.getContext("2d")!;
  x.fillStyle = "#0b0f1a";
  x.fillRect(0, 0, 512, 96);
  x.fillStyle = "#f5f7fa";
  x.font = "800 44px Archivo, 'Arial Narrow', sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("RISHABH", 256, 40);
  x.fillStyle = RED;
  x.font = "600 18px 'JetBrains Mono', monospace";
  x.fillText("AI ENGINEER · Nº3", 256, 76);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------- model */

type Spring = { rx: number; rz: number; vx: number; vz: number; y: number; vy: number };

function Figure({ animate, active }: { animate: boolean; active: boolean }) {
  const face = useFaceTexture();
  const head = useRef<THREE.Group>(null);
  const neck = useRef<THREE.Group>(null);
  const { size, invalidate } = useThree();

  const suitTex = useMemo(() => makeSuitTexture(), []);
  const plateTex = useMemo(() => makePlateTexture(), []);
  useEffect(() => () => {
    suitTex.dispose();
    plateTex.dispose();
  }, [suitTex, plateTex]);

  const logoGeo = useMemo(() => {
    const shapes = LOGO_POLYS_CENTERED.map((poly) => {
      const s = new THREE.Shape();
      poly.forEach(([px, py], i) => (i ? s.lineTo(px, py) : s.moveTo(px, py)));
      s.closePath();
      return s;
    });
    const g = new THREE.ExtrudeGeometry(shapes, { depth: 10, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.5, bevelSegments: 2 });
    g.center();
    g.scale(1 / LOGO_HEIGHT, 1 / LOGO_HEIGHT, 1 / LOGO_HEIGHT);
    return g;
  }, []);

  const springGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 5;
    for (let i = 0; i <= 160; i++) {
      const t = i / 160;
      const a = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.11, t * 0.26, Math.sin(a) * 0.11));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.022, 8, false);
  }, []);

  useEffect(() => () => {
    logoGeo.dispose();
    springGeo.dispose();
  }, [logoGeo, springGeo]);

  // Spring state for the head
  const s = useRef<Spring>({ rx: 0, rz: 0, vx: 0, vz: 0, y: 0, vy: 0 });
  const drag = useRef<{ on: boolean; x0: number; y0: number; moved: number; lastX: number; lastY: number } | null>(null);
  const look = useRef({ x: 0, y: 0 });

  // Global pointer: glance + hover nudges + drag tracking
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      look.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      look.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      const d = drag.current;
      if (d?.on) {
        const dx = e.clientX - d.x0;
        const dy = e.clientY - d.y0;
        d.moved = Math.max(d.moved, Math.hypot(dx, dy));
        const k = 2.4 / Math.max(260, size.height);
        const st = s.current;
        const nz = THREE.MathUtils.clamp(-dx * k, -0.7, 0.7);
        const nx = THREE.MathUtils.clamp(dy * k, -0.55, 0.55);
        st.vz = (nz - st.rz) * 30;
        st.vx = (nx - st.rx) * 30;
        st.rz = nz;
        st.rx = nx;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
      }
      invalidate();
    };
    const onUp = () => {
      const d = drag.current;
      if (!d?.on) return;
      // A tap (no real drag) gives a big bobble
      if (d.moved < 6) {
        const st = s.current;
        st.vz += (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 3);
        st.vx += 2 + Math.random() * 2;
        st.vy -= 1.6;
      }
      drag.current = null;
      document.documentElement.style.cursor = "";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [size.height, invalidate]);

  const onHeadDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    drag.current = { on: true, x0: e.clientX, y0: e.clientY, moved: 0, lastX: e.clientX, lastY: e.clientY };
  };
  const onHover = (e: ThreeEvent<PointerEvent>) => {
    if (drag.current?.on) return;
    // Brushing past the head nudges it
    const mx = e.nativeEvent.movementX || 0;
    const my = e.nativeEvent.movementY || 0;
    s.current.vz -= mx * 0.012;
    s.current.vx += my * 0.008;
  };

  useFrame((state, delta) => {
    if (!active) return;
    const st = s.current;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;

    // Page scroll makes it bob
    // (capped: a programmatic jump can report a huge velocity for a frame)
    const v = THREE.MathUtils.clamp(sceneStore.velocity, -30, 30);
    if (animate && Math.abs(v) > 0.5) {
      st.vx += v * 0.06 * dt;
      st.vy -= Math.abs(v) * 0.012 * dt;
    }

    if (!drag.current?.on) {
      // Under-damped springs: wobbly but settling
      const K = 58;
      const C = 2.6;
      const steps = 3;
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        st.vx += (-K * st.rx - C * st.vx) * h;
        st.vz += (-K * st.rz - C * st.vz) * h;
        st.vy += (-120 * st.y - 7 * st.vy) * h;
        st.rx += st.vx * h;
        st.rz += st.vz * h;
        st.y += st.vy * h;
      }
      // The spring can only bend so far: bounce softly off the limits
      const lim = (k: "rx" | "rz", vk: "vx" | "vz", m: number) => {
        if (Math.abs(st[k]) > m) {
          st[k] = Math.sign(st[k]) * m;
          st[vk] *= -0.35;
        }
      };
      lim("rx", "vx", 0.55);
      lim("rz", "vz", 0.7);
      st.y = THREE.MathUtils.clamp(st.y, -0.4, 0.3);
    }

    const idleX = animate ? Math.sin(t * 1.1) * 0.025 : 0;
    const idleZ = animate ? Math.sin(t * 0.8) * 0.03 : 0;
    if (neck.current) {
      neck.current.rotation.set(st.rx + idleX, 0, st.rz + idleZ);
      neck.current.position.y = 1.8 + st.y * 0.15;
    }
    if (head.current) {
      // Glance toward the pointer
      const tx = look.current.x * 0.35;
      const ty = -look.current.y * 0.12;
      head.current.rotation.y += (tx - head.current.rotation.y) * Math.min(1, dt * 4);
      head.current.rotation.x += (ty - head.current.rotation.x) * Math.min(1, dt * 4);
    }
    const moving = Math.abs(st.vx) + Math.abs(st.vz) + Math.abs(st.vy) + Math.abs(st.rx) + Math.abs(st.rz) > 0.002;
    if (!animate && moving) invalidate();
  });

  const skin = face?.skin ?? SKIN_FALLBACK;
  const L = 1.8; // face patch width (radians)
  const T = 2.2; // face patch height (radians)

  return (
    <group position={[0, -1.85, 0]}>
      {/* Pedestal */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.0, 1.06, 0.3, 64]} />
        <meshStandardMaterial color="#0b0f1a" metalness={0.6} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.0, 0.022, 12, 96]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.15, 1.075]} rotation-x={-0.1}>
        <planeGeometry args={[0.82, 0.16]} />
        <meshStandardMaterial map={plateTex} roughness={0.5} />
      </mesh>

      {/* Helmet resting on the base */}
      <group position={[0.62, 0.62, 0.32]} rotation={[0.1, -0.7, 0]}>
        <mesh>
          <sphereGeometry args={[0.32, 32, 24]} />
          <meshStandardMaterial color={RED} metalness={0.4} roughness={0.25} />
        </mesh>
        <mesh rotation-y={Math.PI / 2}>
          <sphereGeometry args={[0.325, 32, 16, -0.9, 1.8, 1.15, 0.6]} />
          <meshStandardMaterial color="#0a0f1d" metalness={0.9} roughness={0.08} />
        </mesh>
        <mesh position={[0, -0.27, 0]}>
          <cylinderGeometry args={[0.24, 0.27, 0.08, 32]} />
          <meshStandardMaterial color="#0b0f1a" />
        </mesh>
      </group>

      {/* Boots + legs */}
      {[-0.17, 0.17].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.38, 0.06]} scale={[1, 0.75, 1.4]}>
            <sphereGeometry args={[0.13, 20, 16]} />
            <meshStandardMaterial color="#0b0f1a" roughness={0.5} />
          </mesh>
          <mesh position={[x, 0.66, 0]}>
            <capsuleGeometry args={[0.12, 0.34, 6, 16]} />
            <meshStandardMaterial color={SUIT} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Torso in race suit */}
      <mesh position={[0, 1.22, 0]} scale={[1, 1, 0.78]}>
        <capsuleGeometry args={[0.37, 0.4, 8, 32]} />
        <meshStandardMaterial map={suitTex} roughness={0.55} />
      </mesh>
      {/* Chest emblem: the signature 3 */}
      <mesh geometry={logoGeo} position={[0.15, 1.36, 0.29]} scale={0.2} rotation={[0, 0.25, 0]}>
        <meshStandardMaterial color={RED} metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Arms + gloves */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0.42 * sd, 1.5, 0]} rotation={[0.05, 0, 0.22 * sd]}>
          <mesh position={[0, -0.27, 0]}>
            <capsuleGeometry args={[0.095, 0.36, 6, 16]} />
            <meshStandardMaterial color={SUIT} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.27, 0.0]} scale={[1.02, 0.25, 1.02]}>
            <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
            <meshStandardMaterial color={RED} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.6, 0.02]}>
            <sphereGeometry args={[0.11, 16, 12]} />
            <meshStandardMaterial color="#111521" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Collar + spring */}
      <mesh position={[0, 1.6, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.2, 0.055, 12, 32]} />
        <meshStandardMaterial color="#f5f7fa" roughness={0.5} />
      </mesh>
      <mesh geometry={springGeo} position={[0, 1.56, 0]}>
        <meshStandardMaterial color="#c9d1e0" metalness={1} roughness={0.2} />
      </mesh>

      {/* Head on the spring */}
      <group ref={neck} position={[0, 1.8, 0]}>
        <group ref={head} position={[0, 0.98, 0]} onPointerDown={onHeadDown} onPointerMove={onHover}>
          <mesh>
            <sphereGeometry args={[1, 64, 48]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          {/* Hair: crown + back */}
          <mesh>
            <sphereGeometry args={[1.03, 64, 24, 0, Math.PI * 2, 0, 1.05]} />
            <meshStandardMaterial color="#1b1512" roughness={0.9} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.025, 48, 32, Math.PI / 2 + 1.45, Math.PI * 2 - 2.9, 0, 1.75]} />
            <meshStandardMaterial color="#1b1512" roughness={0.9} />
          </mesh>
          {/* Ears */}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[0.99 * sd, -0.05, 0.02]} scale={[0.45, 1, 0.75]}>
              <sphereGeometry args={[0.17, 16, 12]} />
              <meshStandardMaterial color={skin} roughness={0.7} />
            </mesh>
          ))}
          {/* Face, wrapped onto the front of the head */}
          {face && (
            <mesh>
              <sphereGeometry args={[1.045, 64, 64, Math.PI / 2 - L / 2, L, Math.PI / 2 - T / 2 - 0.08, T]} />
              <meshStandardMaterial map={face.map} transparent roughness={0.65} depthWrite={false} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- canvas */

export default function Bobblehead({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (host.current) io.observe(host.current);
    return () => {
      mq.removeEventListener("change", sync);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={host} className={`relative touch-none select-none ${className}`}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, 9.2], fov: 27 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={!active ? "never" : reduced ? "demand" : "always"}
        aria-hidden="true"
      >
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[10, 0.6, 1]} />
          <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 0.6, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#176BFF" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
        </Environment>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 6]} intensity={2.1} />
        <pointLight position={[-4, 1, 3]} intensity={14} color="#176BFF" distance={12} />
        <pointLight position={[4, 0, 2]} intensity={10} color="#E21B2D" distance={10} />
        <Figure animate={!reduced} active={active} />
        <ContactShadows position={[0, -1.85, 0]} opacity={0.55} scale={4} blur={2.4} far={2} resolution={256} frames={reduced ? 1 : Infinity} />
      </Canvas>
      <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center label text-[var(--dim)]">
        Drag the head · tap to bobble
      </p>
    </div>
  );
}
