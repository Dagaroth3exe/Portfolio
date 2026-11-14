"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hero, person } from "../../lib/content";
import { bootAudio, bootFadeOut, sfx } from "../../lib/bootSfx";

/**
 * Intro: an old-machine boot on a monochrome CRT.
 *
 *   POST  → BIOS lines, memory count, services coming up, load bar
 *   LOGIN → login lines, then the role typed big
 *   HOBBY → hobbies stream in faster and faster until the counter overflows
 *   HACK  → the screen gets "breached": shake, corrupted text, inverted bars
 *   OFF   → the tube collapses to a line and the portfolio is underneath
 *
 * Everything is derived from elapsed time, so the sequence is deterministic.
 *
 * Sound: browsers only allow audio after a key/click, so the boot waits on a
 * power-on screen ("press any key to boot"); that press starts the machine
 * with synthesised sfx (app/lib/bootSfx.ts). Esc on that screen skips. If the
 * visitor muted site sounds before, it boots straight away, silently.
 * Shown once per session on the home page (the layout's inline script adds
 * `html.intro-on` before first paint). Any click or key skips. Never shown
 * with reduced motion.
 */

const T = { login: 1550, role: 1850, hobby: 3700, hack: 5200, breach: 5450, granted: 5850, end: 6200 };
/** Role beat (ms after T.role): type "AI ENGINE", stall on dots, crash, erase, retype "DEVELOPER". */
const R = { dots: 380, crash: 800, erase: 1050, retype: 1250 };
const ROLE_A = "> AI ENGINE";
const ROLE_B = "> DEVELOPER";
const GLITCH = "█▓▒░#%&@$01<>/\\=+*?!";

const POST: string[] = [
  "RP3 BIOS v3.03   (C) 2003-2026 RP3 Systems",
  "CPU0: NEURAL CORE-3 @ 3.00 GHz",
  "@MEM",
  "Detecting primary drive ..... /dev/brain0",
  "Detecting secondary drive ... /dev/coffee",
  "",
  "[  OK  ] Mounted /home/rishabh",
  "[  OK  ] Started llm-agents.service",
  "[  OK  ] Started voice-pipeline.service",
  "[  OK  ] Started vision.service",
  "[  OK  ] Reached target portfolio.target",
  "",
  "@LOAD",
];
const LINE_MS = 85;

/** Deterministic PRNG so the hobby stream is the same on every run. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function corrupt(s: string, p: number, r: () => number) {
  if (p <= 0) return s;
  let out = "";
  for (const ch of s) out += ch !== " " && r() < p ? GLITCH[(r() * GLITCH.length) | 0] : ch;
  return out;
}

export default function IntroV2() {
  const [gone, setGone] = useState(false);
  const [t, setT] = useState(0);
  const [phase, setPhase] = useState<"gate" | "run">("gate");
  const root = useRef<HTMLDivElement>(null);

  // Hobby stream: entries at accelerating intervals; later ones turn to cipher
  const stream = useMemo(() => {
    const r = rng(3);
    const out: { at: number; text: string; cipher: boolean; k: number }[] = [];
    let at = T.hobby + 350;
    let dt = 150;
    let i = 0;
    while (at < T.hack) {
      const k = (at - T.hobby) / (T.hack - T.hobby);
      const real = hero.hobbies[i % hero.hobbies.length];
      const cipher = r() < k * k * 1.2;
      const text = cipher
        ? Array.from({ length: 4 + ((r() * 9) | 0) }, () => GLITCH[(r() * GLITCH.length) | 0]).join("")
        : real;
      out.push({ at, text, cipher, k });
      at += dt;
      dt = Math.max(11, dt * 0.85);
      i++;
    }
    return out;
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro-on")) return;
    let finished = false;
    let started = false;
    let silent = true;
    let raf = 0;
    let t0 = 0;
    const timers: number[] = [];

    // Sound cues on the same clock as the visuals
    const cues: { at: number; fn: () => void }[] = [];
    POST.forEach((ln, i) => {
      const at = i * LINE_MS;
      if (!ln) return;
      if (ln === "@MEM") cues.push({ at, fn: () => sfx.memory(450) });
      else if (ln === "@LOAD") return;
      else if (ln.startsWith("Detecting")) cues.push({ at, fn: sfx.drive });
      else if (ln.startsWith("[  OK")) cues.push({ at, fn: () => (sfx.line(i), sfx.ok()) });
      else cues.push({ at, fn: () => sfx.line(i) });
    });
    cues.push({ at: T.login, fn: () => sfx.line(0) }, { at: T.login + 70, fn: () => sfx.line(2) });
    for (let i = 1; i <= ROLE_A.length; i++) cues.push({ at: T.role + i * 34, fn: sfx.key });
    for (let j = 0; j < 3; j++) cues.push({ at: T.role + R.dots + j * 120, fn: sfx.dot });
    cues.push({ at: T.role + R.crash, fn: sfx.crash });
    for (let at = T.role + R.erase; at < T.role + R.retype; at += 24) cues.push({ at, fn: sfx.erase });
    cues.push({ at: T.role + R.retype, fn: sfx.land });
    for (let i = 1; i <= ROLE_B.length - 2; i++) cues.push({ at: T.role + R.retype + i * 34, fn: sfx.key });
    cues.push({ at: T.hobby, fn: () => sfx.line(4) });
    stream.forEach((s) => cues.push({ at: s.at, fn: () => sfx.stream(s.k, s.cipher) }));
    cues.push({ at: T.hack, fn: sfx.hack }, { at: T.breach, fn: () => sfx.alarm(T.granted - T.breach) }, { at: T.granted, fn: sfx.granted });
    cues.sort((x, y) => x.at - y.at);
    let ci = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      removeGate();
      removeSkip();
      if (!silent) {
        sfx.off();
        bootFadeOut(1800);
      }
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      root.current?.classList.add("is-out");
      html.classList.remove("intro-on");
      window.dispatchEvent(new Event("introdone"));
      window.setTimeout(() => setGone(true), 650);
    };
    const step = (now: number) => {
      const e = now - t0;
      if (!silent) while (ci < cues.length && cues[ci].at <= e) cues[ci++].fn();
      setT(e);
      if (e < T.end) raf = requestAnimationFrame(step);
      else finish();
    };
    const skipEvents = ["keydown", "pointerdown"] as const;
    const removeSkip = () => skipEvents.forEach((ev) => window.removeEventListener(ev, finish));
    const start = (withSound: boolean) => {
      if (started || finished) return;
      started = true;
      removeGate();
      silent = !withSound;
      if (withSound) {
        const ac = bootAudio();
        // Cues before the context is running are dropped, so wait for it
        if (ac) (ac.state === "running" ? Promise.resolve() : ac.resume()).then(sfx.powerOn, () => {});
      }
      setPhase("run");
      t0 = performance.now() + 120;
      raf = requestAnimationFrame(step);
      // Arm skip a beat later so the press that booted doesn't also skip
      timers.push(window.setTimeout(() => skipEvents.forEach((ev) => window.addEventListener(ev, finish, { once: true })), 450));
    };

    // Power-on screen: the first key/click boots with sound, Esc skips
    const onGate = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") return finish();
      if ((e.target as Element | null)?.closest?.(".boot-gate-skip")) return finish();
      start(true);
    };
    // Phones only allow audio once the finger lifts (pointerup / click), never on
    // pointerdown, so the boot press is taken on release.
    const gateEvents = ["keydown", "pointerup"] as const;
    const removeGate = () => gateEvents.forEach((ev) => window.removeEventListener(ev, onGate));
    let muted = false;
    try {
      muted = localStorage.getItem("ruler-sound") === "off";
    } catch {}
    if (muted) raf = requestAnimationFrame(() => start(false));
    else gateEvents.forEach((ev) => window.addEventListener(ev, onGate));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      removeGate();
      removeSkip();
    };
  }, [stream]);

  if (gone) return null;

  if (phase === "gate")
    return (
      <div ref={root} className="boot" role="dialog" aria-label={`${person.name}, ${person.role}. Press any key to boot with sound, or Escape to skip`}>
        <div className="boot-gate">
          <div className="boot-dim">RP3-3000 // tty3 // standby</div>
          <button type="button" className="boot-gate-btn" autoFocus>
            <span className="boot-led" aria-hidden="true" />[ PRESS ANY KEY TO BOOT ]
          </button>
          <div className="boot-dim">♪ sound on · headphones recommended</div>
          <button type="button" className="boot-gate-skip">
            skip intro [esc]
          </button>
        </div>
        <div className="boot-scan" aria-hidden="true" />
        <div className="boot-vignette" aria-hidden="true" />
      </div>
    );

  const hacked = t >= T.hack;
  const hk = hacked ? Math.min(1, (t - T.hack) / (T.end - T.hack)) : 0;
  // Frame-seeded noise: new garbage every ~30ms, but render stays pure
  const noise = rng(Math.floor(t / 30) + 7);
  const c = (s: string) => corrupt(s, hacked ? 0.08 + hk * 0.7 : 0, noise);

  // POST
  const postShown = Math.min(POST.length, Math.floor(t / LINE_MS) + 1);
  const memAt = 2 * LINE_MS;
  const mem = Math.min(65536, Math.round(Math.max(0, (t - memAt) / 450) * 65536));
  const loadAt = (POST.length - 1) * LINE_MS;
  const load = Math.max(0, Math.min(1, (t - loadAt) / (T.login - 120 - loadAt)));
  const BAR = 32;

  // Login → role: "AI ENGINE..." stalls, crashes, gets wiped, "DEVELOPER" lands
  const rt = t - T.role;
  let roleText = "";
  let roleState: "" | "is-crash" | "is-land" = "";
  let roleErr = false;
  if (rt < R.dots) roleText = ROLE_A.slice(0, Math.max(0, Math.floor(rt / 34)));
  else if (rt < R.crash) roleText = ROLE_A + ".".repeat(Math.min(3, Math.floor((rt - R.dots) / 120) + 1));
  else if (rt < R.erase) {
    const k = (rt - R.crash) / (R.erase - R.crash);
    roleText = corrupt(ROLE_A + "...", 0.1 + k * 0.5, noise);
    roleState = "is-crash";
    roleErr = true;
  } else if (rt < R.retype) {
    const full = ROLE_A + "...";
    const n = Math.max(2, full.length - Math.floor((rt - R.erase) / 12));
    roleText = full.slice(0, n);
    roleErr = true;
  } else {
    roleText = ROLE_B.slice(0, Math.min(ROLE_B.length, 2 + Math.floor((rt - R.retype) / 34)));
    if (rt < R.retype + 520) roleState = "is-land";
  }

  // Hobbies
  const visible = stream.filter((s) => s.at <= t);
  const current = visible[visible.length - 1];
  const hk2 = Math.max(0, Math.min(1, (t - T.hobby - 350) / (T.hack - T.hobby - 350)));
  const count = t >= T.hack - 120 ? "∞" : String(Math.round(Math.pow(10, hk2 * 4.2))).padStart(4, "0");

  // Breach bars (random every frame)
  const bars = hacked
    ? Array.from({ length: 4 + ((hk * 8) | 0) }, () => ({
        top: noise() * 100,
        h: 0.6 + noise() * 9,
        x: (noise() - 0.5) * 40,
      }))
    : [];

  const date = new Date().toDateString();

  return (
    <div ref={root} className={`boot ${hacked ? "is-hacked" : ""}`} role="status" aria-label={`Loading ${person.name}, ${person.role}`}>
      <div className="boot-screen" aria-hidden="true">
        {t < T.login ? (
          <div>
            {POST.slice(0, postShown).map((ln, i) => (
              <div key={i} className="whitespace-pre">
                {ln === "@MEM" ? (
                  <>Memory test: {String(mem).padStart(5, " ")}K {mem >= 65536 ? "OK" : ""}</>
                ) : ln === "@LOAD" ? (
                  <>
                    Loading portfolio [{"#".repeat(Math.round(load * BAR)).padEnd(BAR, ".")}] {Math.round(load * 100)}%
                  </>
                ) : ln.startsWith("[  OK  ]") ? (
                  <>
                    [  <span className="boot-ok">OK</span>  ]{ln.slice(8)}
                  </>
                ) : (
                  ln || " "
                )}
              </div>
            ))}
            <span className="boot-cursor" />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="boot-dim">
              <div>{c(`rp3 login: rishabh`)}</div>
              <div>{c(`Last login: ${date} on tty3`)}</div>
            </div>

            <div className="mt-[6vh]">
              {/* The name lives in the hero; the boot screen only states the role */}
              <div className={`boot-role ${roleState}`}>
                {c(roleText)}
                {t < T.hobby && <span className="boot-cursor" />}
              </div>
              {roleErr && (
                <div className="boot-err mt-3">{c("!! segfault: role.exe — core dumped, rewriting identity")}</div>
              )}
            </div>

            {t >= T.hobby && (
              <div className="mt-[5vh] min-h-0 flex-1 overflow-hidden">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <span>{c("> cat ~/hobbies.txt | wc -l")}</span>
                  <span className="boot-count tabular-nums">[ {count} ]</span>
                </div>
                <div className="boot-current mt-3">
                  {current ? c(current.text) : ""}
                  <span className="boot-cursor" />
                </div>
                <p className="boot-stream mt-4">{c(visible.map((s) => s.text).join("  ·  "))}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breach */}
      {bars.map((b, i) => (
        <span key={i} className="boot-bar" style={{ top: `${b.top}%`, height: `${b.h}%`, transform: `translateX(${b.x}px)` }} aria-hidden="true" />
      ))}
      {t >= T.breach && (
        <div className="boot-alert" aria-hidden="true">
          <div className="boot-alert-box">
            {t < T.granted ? (
              <>
                <div>!! INTRUSION DETECTED !!</div>
                <div className="boot-dim mt-1 text-[0.7em]">{corrupt("tty3 // signal hijacked // all sectors", 0.25, noise)}</div>
              </>
            ) : (
              <>
                <div>ACCESS GRANTED</div>
                <div className="mt-1 text-[0.7em]">root@rp3 — welcome</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="boot-scan" aria-hidden="true" />
      <div className="boot-vignette" aria-hidden="true" />
      <p className="boot-skip" aria-hidden="true">
        press any key to skip
      </p>
    </div>
  );
}
