import type { CSSProperties } from "react";

/*
 * The design language is monochrome: every project accent resolves to ink.
 * (Accent values stay in content.ts in case colour ever returns.)
 * Callers still pass the project, so the signatures accept (and ignore) it.
 */
export function accentBg(...args: unknown[]): string {
  void args;
  return "var(--fg)";
}
export function accentText(...args: unknown[]): CSSProperties {
  void args;
  return { color: "var(--fg)" };
}
