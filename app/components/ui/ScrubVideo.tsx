"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "../../lib/gsap";
import type { ProjectVideo } from "../../lib/content";

/**
 * Scroll-scrubbed video: the frame sticks while you scroll through a tall
 * track, and scroll position drives playback (scroll back to rewind).
 * The encode uses short keyframe intervals so seeking stays smooth.
 *
 * Reduced motion: no sticky track, just a normal video with controls.
 */
export default function ScrubVideo({
  video,
  accent,
  trackVh = 260,
}: {
  video: ProjectVideo;
  accent: string;
  /** Scroll distance (in viewport heights) the video plays across. */
  trackVh?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    const el = vid.current;
    const tr = track.current;
    if (!el || !tr) return;
    el.muted = true;
    el.defaultMuted = true;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      tr.style.height = "auto";
      el.controls = true;
      return;
    }

    let target = 0;
    let shown = 0;
    let raf = 0;
    let ready = false;

    const prime = () => {
      // Some browsers (iOS Safari) only allow seeking after a play() call
      el.play()
        .then(() => el.pause())
        .catch(() => {});
      ready = true;
    };
    if (el.readyState >= 1) prime();
    else el.addEventListener("loadedmetadata", prime, { once: true });

    const st = ScrollTrigger.create({
      trigger: tr,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
      },
    });

    // Ease the playhead toward the scroll position; only seek on real change
    const tick = () => {
      shown += (target - shown) * 0.18;
      if (ready && el.duration) {
        const t = shown * (el.duration - 0.05);
        if (Math.abs(el.currentTime - t) > 1 / 60) el.currentTime = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      st.kill();
    };
  }, []);

  return (
    <div ref={track} style={{ height: `${trackVh}vh` }} className="relative">
      {/* Width is capped so the whole frame (plus caption) fits the viewport while pinned */}
      <div
        className="sticky top-[calc(var(--nav-h)+1.5rem)] mx-auto"
        style={{ maxWidth: `calc((100svh - var(--nav-h) - 8rem) * ${(video.width / video.height).toFixed(4)})` }}
      >
        <div className="relative border border-[var(--line-strong)] overflow-hidden bg-[#18181b]">
          <video
            ref={vid}
            className="block w-full h-auto"
            poster={video.poster}
            muted
            playsInline
            preload="auto"
            width={video.width}
            height={video.height}
            aria-label={video.alt}
          >
            <source src={video.mp4} type="video/mp4" />
            {video.webm && <source src={video.webm} type="video/webm" />}
          </video>
          {/* Scroll progress */}
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[rgba(173,196,235,0.12)]" aria-hidden="true">
            <div ref={bar} className="h-full origin-left scale-x-0" style={{ background: accent }} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          {video.caption && <p className="text-[var(--muted)] text-[0.95rem]">{video.caption}</p>}
          <p className="label text-[var(--dim)]" aria-hidden="true">Scroll to play ↓</p>
        </div>
      </div>
    </div>
  );
}
