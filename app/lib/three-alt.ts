/**
 * A second, original "3" used in the Nº 3 × Nº 3 easter egg to stand for
 * Max Verstappen's race number. Built from scratch in the style of a racing
 * numeral — three square-ended bars on a steeply slanted spine, the middle
 * bar shorter, a short spur rising from the bottom bar's left end — not
 * traced from any logo.
 *
 * Construction (upright, y-up, before shear): 100 × 160 units, five equal
 * 32u bands (bar / counter / bar / counter / bar), spine 33u wide.
 */
type Pt = [number, number];

const SHEAR = 0.6;

const BODY: Pt[] = [
  [0, 160],
  [100, 160],
  [100, 0],
  [0, 0],
  // Bottom-left spur: the bottom bar's left end rises into the lower counter
  [0, 48],
  [15, 48],
  [15, 32],
  [67, 32],
  [67, 64],
  [35, 64],
  [35, 96],
  [67, 96],
  [67, 128],
  [0, 128],
];

const RAW = BODY.map(([x, y]) => [x + y * SHEAR, y] as Pt);
const xs = RAW.map((p) => p[0]);
const ys = RAW.map((p) => p[1]);
const minX = Math.min(...xs);
const maxX = Math.max(...xs);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);

export const ALT3_WIDTH = maxX - minX;
export const ALT3_HEIGHT = maxY - minY;
/** SVG path in a `0 0 ALT3_WIDTH ALT3_HEIGHT` box (y-down). */
export const ALT3_PATH =
  "M" + RAW.map(([x, y]) => `${(x - minX).toFixed(2)} ${(maxY - y).toFixed(2)}`).join("L") + "Z";
