/**
 * The "3" emblem — single source of truth.
 *
 * Both the SVG mark (nav, favicon, intro) and the extruded 3D hero logo are
 * generated from these polygons, so editing the points here updates the brand
 * everywhere at once.
 *
 * Construction (y-up units, before italic shear):
 *  - 32u top/bottom bars and spine, top-right + bottom-left aero chamfers
 *  - middle arm ends in a forward-pointing chevron
 * The whole mark is then sheared to a racing italic.
 */

type Pt = [number, number];

const SHEAR = 0.42;

const BODY: Pt[] = [
  [0, 160],
  [84, 160],
  [100, 144],
  [100, 0],
  [14, 0],
  [0, 14],
  [0, 32],
  [68, 32],
  [68, 66],
  [32, 66],
  [18, 80],
  [32, 94],
  [68, 94],
  [68, 128],
  [0, 128],
];

const shear = (p: Pt): Pt => [p[0] + p[1] * SHEAR, p[1]];

const RAW = [BODY].map((poly) => poly.map(shear));

const xs = RAW.flat().map((p) => p[0]);
const ys = RAW.flat().map((p) => p[1]);
const minX = Math.min(...xs);
const maxX = Math.max(...xs);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);

export const LOGO_WIDTH = maxX - minX;
export const LOGO_HEIGHT = maxY - minY;

/** Polygons centred on the origin, y-up — used for the 3D extrusion. */
export const LOGO_POLYS_CENTERED: Pt[][] = RAW.map((poly) =>
  poly.map(([x, y]) => [x - (minX + maxX) / 2, y - (minY + maxY) / 2]),
);

/** SVG path in a `0 0 LOGO_WIDTH LOGO_HEIGHT` viewBox (y-down). */
export const LOGO_PATH = RAW.map(
  (poly) =>
    "M" +
    poly
      .map(([x, y]) => `${(x - minX).toFixed(2)} ${(maxY - y).toFixed(2)}`)
      .join("L") +
    "Z",
).join("");

export const LOGO_VIEWBOX = `0 0 ${LOGO_WIDTH.toFixed(2)} ${LOGO_HEIGHT.toFixed(2)}`;

