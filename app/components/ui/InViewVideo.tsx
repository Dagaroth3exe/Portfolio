"use client";

import { useEffect, useRef } from "react";
import type { ProjectVideo } from "../../lib/content";

/**
 * Muted looping video that plays only while it's on screen and pauses when it
 * leaves. With reduced motion it stays on the poster frame.
 */
export default function InViewVideo({
  video,
  className = "",
  style,
}: {
  video: ProjectVideo;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Autoplay is only allowed when muted; set the property, not just the attribute
    el.muted = true;
    el.defaultMuted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      poster={video.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={video.alt}
    >
      <source src={video.mp4} type="video/mp4" />
      {video.webm && <source src={video.webm} type="video/webm" />}
    </video>
  );
}
