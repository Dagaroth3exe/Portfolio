import { LOGO_PATH, LOGO_VIEWBOX } from "../../lib/logo";

/** Flat SVG variant of the emblem — nav, footer, intro, fallbacks. */
export default function LogoMark({
  className,
  title,
  color = "currentColor",
}: {
  className?: string;
  title?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={LOGO_PATH} fill={color} />
    </svg>
  );
}
