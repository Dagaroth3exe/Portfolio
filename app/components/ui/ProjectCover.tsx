import Image from "next/image";
import type { ReactNode } from "react";
import InViewVideo from "./InViewVideo";
import type { Project } from "../../lib/content";

/**
 * Project covers. A real video or screenshot wins when the project has one;
 * otherwise a quiet, editorial cover: a muted tonal field with soft light
 * and fine grain, and a single hairline mark that hints at the project.
 * No UI, no text, no neon: just shape, tone and space.
 */

const W = 800;
const H = 520;

/** Second glow colour per project (the first is the accent). */
const GLOW2: Record<string, string> = {
  vaultai: "#5EC8FF",
  "microfinance-assistant": "#2F6BFF",
  "face-attendance": "#FF5EA8",
  orchestrix: "#22D3EE",
  earthfirst: "#22C3B5",
  "leftover-logic": "#FF7A1A",
};

export default function ProjectCover({
  project,
  className = "",
  art = false,
}: {
  project: Project;
  className?: string;
  /** Force the generated artwork even if a video/screenshot exists. */
  art?: boolean;
}) {
  if (project.video && !art) {
    return (
      <div className={`cover relative overflow-hidden bg-[#18181b] ${className}`}>
        <InViewVideo
          video={project.video}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: project.video.cardPosition ?? "center top" }}
        />
      </div>
    );
  }
  if (project.image && !art) {
    return (
      <div className={`cover relative overflow-hidden bg-[#18181b] ${className}`}>
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const id = `cv-${project.slug}`;
  const a = project.accent;
  const b = project.accentTo ?? GLOW2[project.slug] ?? a;
  const ART: Record<string, (p: ArtProps) => ReactNode> = {
    vaultai: Vault,
    "microfinance-assistant": Mfi,
    "face-attendance": Face,
    orchestrix: Orchestrix,
    earthfirst: EarthFirst,
    "leftover-logic": Leftover,
  };
  const Art = ART[project.slug];

  return (
    <div className={`cover relative overflow-hidden grayscale ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <Backdrop id={id} a={a} b={b} />
        {Art && <Art id={id} a={a} b={b} />}
        <rect width={W} height={H} filter={`url(#${id}-grain)`} opacity="0.35" />
      </svg>
    </div>
  );
}

type ArtProps = { id: string; a: string; b: string };

/* ---------------------------------------------------------------- shared */

function Backdrop({ id, a, b }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#0d1324" />
          <stop offset="1" stopColor="#080c17" />
        </linearGradient>
        {/* Two very soft light pools in the project's tones */}
        <radialGradient id={`${id}-g1`} cx="0.72" cy="0.3" r="0.7">
          <stop offset="0" stopColor={a} stopOpacity="0.26" />
          <stop offset="0.6" stopColor={a} stopOpacity="0.04" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-g2`} cx="0.15" cy="0.9" r="0.65">
          <stop offset="0" stopColor={b} stopOpacity="0.12" />
          <stop offset="1" stopColor={b} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.08" />
          </feComponentTransfer>
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-base)`} />
      <rect width={W} height={H} fill={`url(#${id}-g1)`} />
      <rect width={W} height={H} fill={`url(#${id}-g2)`} />
    </>
  );
}

/** Hairline style shared by every mark. */
const HAIR = { fill: "none", stroke: "rgba(245,247,250,0.55)", strokeWidth: 1.25, vectorEffect: "non-scaling-stroke" as const };
const FAINT = { ...HAIR, stroke: "rgba(245,247,250,0.18)" };

/** A soft, blurred pool of colour behind the mark, for depth. */
const Pool = ({ id, cx, cy, r, c, o = 0.35 }: { id: string; cx: number; cy: number; r: number; c: string; o?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill={c} opacity={o} filter={`url(#${id}-blur)`} />
);

/* ---------------------------------------------------------------- marks */

/* VaultAI: a quiet orb with rings — listening */
function Vault({ id, a, b }: ArtProps) {
  return (
    <g>
      <Pool id={id} cx={400} cy={260} r={110} c={b} o={0.3} />
      {[150, 118, 86].map((r, i) => (
        <circle key={r} cx="400" cy="260" r={r} {...(i === 0 ? FAINT : HAIR)} strokeOpacity={i === 0 ? 1 : 0.6 + i * 0.2} />
      ))}
      <circle cx="400" cy="260" r="40" fill={a} opacity="0.35" />
      <circle cx="400" cy="260" r="40" {...HAIR} stroke="rgba(255,255,255,0.5)" />
    </g>
  );
}

/* MFI Assistant: two overlapping conversation shapes */
function Mfi({ id, a }: ArtProps) {
  return (
    <g>
      <Pool id={id} cx={430} cy={250} r={120} c={a} o={0.22} />
      <path d="M300 180 h170 a28 28 0 0 1 28 28 v74 a28 28 0 0 1 -28 28 h-120 l-34 30 v-30 h-16 a28 28 0 0 1 -28 -28 v-74 a28 28 0 0 1 28 -28 z" {...HAIR} />
      <path d="M380 250 h150 a26 26 0 0 1 26 26 v62 a26 26 0 0 1 -26 26 h-14 v28 l-32 -28 h-104 a26 26 0 0 1 -26 -26 v-62 a26 26 0 0 1 26 -26 z" fill={a} fillOpacity="0.16" stroke={a} strokeOpacity="0.8" strokeWidth="1.25" />
      <circle cx="440" cy="306" r="3.5" fill={a} />
      <circle cx="456" cy="306" r="3.5" fill={a} opacity="0.7" />
      <circle cx="472" cy="306" r="3.5" fill={a} opacity="0.45" />
    </g>
  );
}

/* Face Attendance: an oval, framed */
function Face({ id, a }: ArtProps) {
  return (
    <g>
      <Pool id={id} cx={400} cy={250} r={110} c={a} o={0.25} />
      <ellipse cx="400" cy="250" rx="78" ry="100" {...HAIR} />
      <ellipse cx="400" cy="250" rx="112" ry="138" {...FAINT} />
      <g stroke={a} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M300 160 v-30 h30 M500 160 v-30 h-30 M300 340 v30 h30 M500 340 v30 h-30" />
      </g>
      <line x1="322" y1="250" x2="478" y2="250" stroke={a} strokeOpacity="0.5" strokeWidth="1" />
    </g>
  );
}

/* Orchestrix: three panels, gently offset */
function Orchestrix({ id, a }: ArtProps) {
  return (
    <g>
      <Pool id={id} cx={420} cy={250} r={120} c={a} o={0.22} />
      <rect x="270" y="150" width="200" height="140" rx="14" {...FAINT} />
      <rect x="310" y="190" width="200" height="140" rx="14" {...HAIR} />
      <rect x="350" y="230" width="200" height="140" rx="14" fill={a} fillOpacity="0.14" stroke={a} strokeOpacity="0.8" strokeWidth="1.25" />
      <circle cx="510" cy="270" r="16" {...HAIR} stroke={a} />
    </g>
  );
}

/* EarthFirst: a single sprout */
function EarthFirst({ id, a }: ArtProps) {
  return (
    <g>
      <Pool id={id} cx={400} cy={260} r={110} c={a} o={0.22} />
      <path d="M400 380 C 400 320, 400 280, 400 230" {...HAIR} />
      <path d="M400 268 C 360 268, 330 240, 326 196 C 370 196, 398 222, 400 268 Z" fill={a} fillOpacity="0.16" stroke={a} strokeOpacity="0.85" strokeWidth="1.25" />
      <path d="M400 236 C 436 236, 466 210, 470 170 C 430 170, 402 194, 400 236 Z" {...HAIR} />
      <path d="M300 380 Q 400 360 500 380" {...FAINT} />
    </g>
  );
}

/* Leftover Logic: a bowl, three ingredients above */
function Leftover({ id, a }: ArtProps) {
  return (
    <g>
      <Pool id={id} cx={400} cy={270} r={110} c={a} o={0.22} />
      <path d="M290 270 h220 a110 110 0 0 1 -220 0 z" fill={a} fillOpacity="0.12" stroke={a} strokeOpacity="0.8" strokeWidth="1.25" />
      <line x1="270" y1="270" x2="530" y2="270" {...HAIR} />
      <circle cx="350" cy="200" r="18" {...HAIR} />
      <circle cx="400" cy="178" r="22" {...HAIR} />
      <circle cx="452" cy="204" r="15" {...FAINT} />
    </g>
  );
}
