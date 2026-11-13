"use client";

import { useEffect, useRef, useState } from "react";
import { useReveals } from "../../lib/use-reveals";
import { person, thesis } from "../../lib/content";
import SectionHead from "../ui/SectionHead";

const GH_USER = "Dagaroth3exe";

type Signals = { repos: number; followers: number; lastPush: string | null } | null;

/** Relative "3 days ago" style date. */
function ago(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months} mo ago` : `${Math.round(months / 12)} yr ago`;
}

/**
 * The through-line, three captioned numbers, and a strip of signals.
 * GitHub figures are fetched live in the browser; if the request fails they
 * read "not checked" rather than showing a stale or invented number.
 */
export default function Thesis() {
  const root = useRef<HTMLElement>(null);
  const [gh, setGh] = useState<Signals>(null);
  const [failed, setFailed] = useState(false);
  useReveals(root);

  useEffect(() => {
    const ctrl = new AbortController();
    const opts = { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } };
    Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`, opts).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=1`, opts).then((r) =>
        r.ok ? r.json() : Promise.reject(),
      ),
    ])
      .then(([user, repos]) =>
        setGh({ repos: user.public_repos, followers: user.followers, lastPush: repos[0]?.pushed_at ?? null }),
      )
      .catch(() => {
        if (!ctrl.signal.aborted) setFailed(true);
      });
    return () => ctrl.abort();
  }, []);

  const live = (v: string | number | undefined) => (gh ? String(v) : failed ? "not checked" : "checking…");

  const signals: { label: string; value: string; live: boolean }[] = [
    { label: "Public repos", value: live(gh?.repos), live: !!gh },
    { label: "Last push", value: gh ? (gh.lastPush ? ago(gh.lastPush) : "—") : live(undefined), live: !!gh },
    { label: "Followers", value: live(gh?.followers), live: !!gh },
    { label: "Based in", value: "Noida, IN", live: false },
    { label: "Status", value: person.status, live: false },
  ];

  return (
    <section ref={root} id="thesis" data-pose="work" aria-labelledby="thesis-title" className="section">
      <div className="wrap">
        <SectionHead n="00" label="In short" />

        <div className="mt-12 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <h2 id="thesis-title" className="lg:col-span-6 display text-[clamp(2.6rem,5vw,5rem)]" data-split="lines">
            {thesis.title}
          </h2>
          <div className="lg:col-span-6 space-y-5 text-[var(--muted)] text-base md:text-lg leading-relaxed lg:pt-3">
            {thesis.body.map((p) => (
              <p key={p} data-reveal>
                {p}
              </p>
            ))}
          </div>
        </div>

        <dl className="mt-16 grid sm:grid-cols-3 border-t border-[var(--line)]">
          {thesis.stats.map((s, i) => (
            <div
              key={s.caption}
              className="pt-6 pb-2 sm:pr-8 sm:border-l sm:first:border-l-0 sm:pl-8 sm:first:pl-0 border-[var(--line)] flex flex-col-reverse gap-3"
              data-reveal
              data-delay={String(i * 0.08)}
            >
              <dt className="text-[var(--muted)] leading-snug max-w-[18rem]">{s.caption}</dt>
              <dd className="display text-6xl text-[var(--paper)]">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16" data-reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="label text-[var(--paper)]">Signals</h3>
            <p className="label text-[var(--dim)] flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[var(--blue)]" aria-hidden="true" /> live from GitHub
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full border border-[var(--dim)]" aria-hidden="true" /> typed in
              </span>
            </p>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-5 border border-[var(--line)]" aria-live="polite">
            {signals.map((s) => (
              <div key={s.label} className="p-4 md:p-5 border-[var(--line)] border-b md:border-b-0 md:border-r md:last:border-r-0 odd:border-r flex flex-col-reverse gap-2">
                <dt className="label text-[var(--dim)]">{s.label}</dt>
                <dd className={`flex items-center gap-2 ${s.live ? "text-[var(--paper)]" : "text-[var(--muted)]"}`}>
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${s.live ? "bg-[var(--blue)]" : "border border-[var(--dim)]"}`}
                    aria-hidden="true"
                  />
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
