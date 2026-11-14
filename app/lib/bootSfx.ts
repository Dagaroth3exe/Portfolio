/**
 * Boot sound design, synthesised with Web Audio (no audio files).
 *
 * Dry, cryptic film-UI texture: typing, data ticks and glitch stutters only
 * (no bass, drones or impacts), with a little room reverb and stereo placement.
 *
 *   sources → bus ─┬─────────────→ master → compressor → out
 *                  └→ reverb (IR) ─┘
 *
 * Call `bootAudio()` from a user gesture (browser autoplay rules).
 */
let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let master: GainNode | null = null;
let verbSend: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let shaper: WaveShaperNode | null = null;
const MASTER = 0.8;


function impulse(c: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

export function bootAudio() {
  if (ctx) {
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    return ctx;
  }
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  // iOS: play through the ringer/silent switch like media, not as UI sound
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
  } catch {}
  const c = new AC();
  ctx = c;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  master = c.createGain();
  master.gain.value = MASTER;
  master.connect(comp).connect(c.destination);

  bus = c.createGain();
  bus.connect(master);
  const verb = c.createConvolver();
  verb.buffer = impulse(c, 3.2, 3.2);
  verbSend = c.createGain();
  verbSend.gain.value = 0.18;
  const verbTone = c.createBiquadFilter();
  verbTone.type = "lowpass";
  verbTone.frequency.value = 5200;
  bus.connect(verbSend).connect(verb).connect(verbTone).connect(master);

  noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  shaper = c.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 6);
  }
  shaper.curve = curve;
  shaper.connect(bus);

  if (c.state !== "running") c.resume().catch(() => {});
  return c;
}

const ok = () => !!ctx && !!bus && ctx.state === "running";
const now = (at = 0) => ctx!.currentTime + at;

function out(node: AudioNode, pan = 0, dest?: AudioNode) {
  const c = ctx!;
  if (pan) {
    const p = c.createStereoPanner();
    p.pan.value = pan;
    node.connect(p).connect(dest ?? bus!);
  } else node.connect(dest ?? bus!);
}

function env(g: GainNode, at: number, level: number, attack: number, dur: number) {
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(level, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
}

type ToneOpts = { at?: number; to?: number; attack?: number; lp?: number; hp?: number; pan?: number; drive?: boolean; detune?: number };
function tone(type: OscillatorType, freq: number, dur: number, level: number, o: ToneOpts = {}) {
  if (!ok()) return;
  const c = ctx!;
  const at = now(o.at);
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (o.detune) osc.detune.value = o.detune;
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, at + dur);
  const g = c.createGain();
  env(g, at, level, o.attack ?? 0.004, dur);
  let n: AudioNode = osc.connect(g);
  if (o.lp) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    n = n.connect(f);
  }
  if (o.hp) {
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = o.hp;
    n = n.connect(f);
  }
  out(n, o.pan, o.drive ? shaper! : undefined);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}


type NoiseOpts = { at?: number; type?: BiquadFilterType; freq?: number; to?: number; q?: number; pan?: number; attack?: number; drive?: boolean };
function noise(dur: number, level: number, o: NoiseOpts = {}) {
  if (!ok()) return;
  const c = ctx!;
  const at = now(o.at);
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, at);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, at + dur);
  f.Q.value = o.q ?? 0.8;
  const g = c.createGain();
  env(g, at, level, o.attack ?? 0.002, dur);
  out(s.connect(f).connect(g), o.pan, o.drive ? shaper! : undefined);
  s.start(at, Math.random() * 1.5);
  s.stop(at + dur + 0.05);
}


const rp = () => Math.random() * 1.6 - 0.8;

export function bootFadeOut(ms = 400) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + ms / 1000);
  const m = master;
  window.setTimeout(() => (m.gain.value = MASTER), ms + 3500);
}




/** Glitch: a stutter of distorted, band-limited noise grains. */
function glitch(n: number, level: number, o: { at?: number; spread?: number } = {}) {
  for (let i = 0; i < n; i++)
    noise(0.012 + Math.random() * 0.03, level * (0.6 + Math.random() * 0.4), {
      at: (o.at ?? 0) + i * (o.spread ?? 0.035) + Math.random() * 0.01,
      type: "bandpass",
      freq: 1500 + Math.random() * 6500,
      q: 6 + Math.random() * 8,
      drive: true,
      pan: rp(),
    });
}

/**
 * Only typing, data ticks and glitches — no impacts, drones, bass or tones
 * underneath, so it stays dry and cryptic.
 */
export const sfx = {
  /** Power-on: a short static crackle as the tube wakes. */
  powerOn() {
    glitch(4, 0.07, { spread: 0.05 });
  },
  /** Telemetry tick for a printed line. */
  line(k = 0) {
    const f = 2600 + ((k * 397) % 2200);
    tone("sine", f, 0.03, 0.04, { pan: rp() });
    noise(0.008, 0.05, { type: "highpass", freq: 7000, pan: rp() });
  },
  /** Memory scan: a soft granular data texture. */
  memory(ms: number) {
    if (!ok()) return;
    const n = Math.floor(ms / 20);
    for (let i = 0; i < n; i++) tone("sine", 3000 + Math.random() * 4000, 0.018, 0.02, { at: i * 0.02, pan: rp() });
  },
  /** Drive: a few dry seek clicks. */
  drive() {
    for (let i = 0; i < 3; i++) noise(0.01, 0.12, { at: i * 0.05 + Math.random() * 0.02, type: "bandpass", freq: 1600, q: 4, pan: rp() * 0.4 });
  },
  ok() {
    noise(0.006, 0.05, { at: 0.03, type: "highpass", freq: 6000, pan: rp() });
  },
  /** Typed character: a crisp, dry key. */
  key() {
    noise(0.009, 0.16, { type: "bandpass", freq: 3200 + Math.random() * 1500, q: 1.5, pan: rp() * 0.3 });
    noise(0.005, 0.08, { type: "highpass", freq: 7000 });
  },
  /** Stall on the dots: a single quiet key tap each. */
  dot() {
    noise(0.009, 0.12, { type: "bandpass", freq: 2800, q: 1.5 });
  },
  /** Crash: glitch stutter. */
  crash() {
    glitch(8, 0.13);
  },
  erase() {
    noise(0.006, 0.08, { type: "highpass", freq: 6000, pan: rp() * 0.4 });
  },
  /** DEVELOPER: a short glitch snap before it types. */
  land() {
    glitch(3, 0.1, { spread: 0.02 });
  },
  /** Hobby stream: data ticks climbing in pitch; cipher entries are static. */
  stream(k: number, cipher: boolean) {
    if (cipher) noise(0.016, 0.05 + k * 0.05, { type: "bandpass", freq: 2000 + k * 6000, q: 7, pan: rp(), drive: true });
    else tone("sine", 1800 + k * 3200, 0.025, 0.035, { pan: rp() });
  },
  /** Breach: a long, dense glitch burst. */
  hack() {
    glitch(14, 0.15, { spread: 0.022 });
  },
  /** Intrusion: intermittent glitch stutters instead of a siren. */
  alarm(ms: number) {
    const n = Math.floor(ms / 110);
    for (let i = 0; i < n; i++) if (Math.random() < 0.7) glitch(2, 0.08, { at: i * 0.11, spread: 0.02 });
  },
  /** Access granted: three clean confirming key taps. */
  granted() {
    for (let i = 0; i < 3; i++) noise(0.009, 0.14, { at: i * 0.06, type: "bandpass", freq: 3400, q: 1.5 });
  },
  /** Tube off: a final glitch crackle. */
  off() {
    glitch(5, 0.08, { spread: 0.03 });
  },
};
