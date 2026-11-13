# Rishabh Parashar: Portfolio

An immersive portfolio built around a 3D "3" emblem. Next.js 16 (App Router), React 19,
React Three Fiber, GSAP and Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure

```
app/
  lib/
    content.ts        ← ALL copy and data (projects, experience, skills…)
    logo.ts           ← emblem geometry: single source for SVG + 3D + favicon
    scene-store.ts    ← shared state between DOM and WebGL (pointer, spin)
    use-reveals.ts    ← scroll motion vocabulary (data-split / data-reveal / …)
  components/
    three/            ← persistent WebGL layer: Emblem, Background shader, Atmosphere
    sections/         ← Hero, Work (projects), Experience, Skills, About, Contact
    ui/               ← LogoMark, Magnetic, SectionHead, ProjectCover
    Transition.tsx    ← slanted route-transition sweeps + <TLink>
  work/[slug]/        ← statically generated case-study pages
```

### How the 3D choreography works

Each section declares `data-pose="hero|about|…"`. The emblem (`three/Emblem.tsx`) blends
between the poses in the `DESKTOP` / `MOBILE` tables, based on which section is at the
middle of the viewport. To change where the emblem sits in a section, edit that section's
pose there.

### Adding a project

Add an entry to `projects` in `content.ts`. It appears in the gallery and gets a case-study
page at `/work/<slug>`. To give it a generative cover, add a branch in
`ui/ProjectCover.tsx`.

### Accessibility and performance

- `prefers-reduced-motion`: no smooth scroll, static reveals, and the WebGL scene renders
  on demand.
- Three.js is code-split and booted on idle. A flat SVG emblem shows until WebGL is ready
  (or permanently if WebGL is unavailable).
- Adaptive DPR (`PerformanceMonitor`), and fewer particles on small screens.
- Skip link, keyboard-operable menu (Escape closes it), focus styles, ARIA on interactive pieces.

See `CONTENT_NOTES.md` for content that still needs input.
