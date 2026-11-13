/** "Sector" header used at the top of every section. */
export default function SectionHead({
  n,
  label,
  aside,
}: {
  n: string;
  label: string;
  aside?: string;
}) {
  return (
    <div className="sector label" data-reveal>
      <span className="sector-n">{n}</span>
      <span className="tick" aria-hidden="true" />
      <span className="text-[var(--paper)]">{label}</span>
      <span className="sector-rule" data-rule aria-hidden="true" />
      {aside && <span className="text-[var(--dim)] hidden sm:inline">{aside}</span>}
    </div>
  );
}
