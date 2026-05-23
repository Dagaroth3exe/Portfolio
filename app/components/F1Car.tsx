export default function F1Car({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 160"
      width="540"
      height="160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── REAR WING ── */}
      <rect x="445" y="24" width="90" height="11" rx="2" fill="#e8002d" />
      <rect x="450" y="38" width="80" height="8" rx="1" fill="#b0001c" />
      <rect x="442" y="22" width="7" height="56" rx="1" fill="#888" />
      <rect x="532" y="22" width="7" height="56" rx="1" fill="#888" />
      <rect x="477" y="46" width="11" height="30" rx="2" fill="#444" />

      {/* ── ENGINE COVER / AIRBOX ── */}
      <path d="M330 85 L342 44 L385 36 L430 45 L430 90 L330 90 Z" fill="#b8001e" />
      <path d="M358 36 L385 28 L408 36 L385 36 Z" fill="#900016" />
      <line x1="337" y1="57" x2="430" y2="53" stroke="#9a0018" strokeWidth="1.5" />
      <line x1="337" y1="70" x2="430" y2="67" stroke="#9a0018" strokeWidth="1" />

      {/* ── COCKPIT ── */}
      <path d="M240 62 L330 59 L330 88 L240 88 Z" fill="#e8002d" />
      <path d="M249 62 L322 59 L316 74 L253 74 Z" fill="#060606" />
      <path d="M256 62 L306 60 L301 71 L259 71 Z" fill="#0c1d2e" opacity="0.7" />

      {/* ── HALO ── */}
      <path
        d="M253 62 C255 43 309 37 336 43 L336 57 C311 52 271 56 267 62 Z"
        fill="#555"
        opacity="0.95"
      />
      <rect x="252" y="59" width="9" height="9" rx="1.5" fill="#666" />

      {/* ── SIDEPODS ── */}
      <path d="M145 75 L340 66 L340 88 L145 88 Z" fill="#cc0022" />
      <path d="M148 75 L163 62 L175 71 L160 79 Z" fill="#090909" opacity="0.85" />

      {/* ── FLOOR ── */}
      <path d="M108 86 L430 84 L426 99 L108 101 Z" fill="#e8002d" />
      <path d="M385 95 L430 93 L430 111 L385 109 Z" fill="#700012" />

      {/* ── NOSE ── */}
      <path d="M18 88 L108 84 L108 99 L18 97 Z" fill="#cc0022" />
      <path d="M5 89 L18 88 L18 97 L5 96 Z" fill="#aaaaaa" />

      {/* ── FRONT WING ── */}
      <rect x="3" y="100" width="124" height="9" rx="1.5" fill="#e8002d" />
      <rect x="8" y="111" width="114" height="6" rx="1" fill="#b0001c" />
      <rect x="1" y="90" width="6" height="29" rx="1" fill="#999" />
      <rect x="119" y="97" width="6" height="22" rx="1" fill="#999" />
      <line x1="38" y1="100" x2="38" y2="109" stroke="#900018" strokeWidth="1.5" />
      <line x1="65" y1="100" x2="65" y2="109" stroke="#900018" strokeWidth="1.5" />
      <line x1="92" y1="100" x2="92" y2="109" stroke="#900018" strokeWidth="1.5" />

      {/* ── FRONT TIRE ── */}
      <circle cx="108" cy="128" r="25" fill="#131313" />
      <circle cx="108" cy="128" r="15" fill="#1d1d1d" />
      <circle cx="108" cy="128" r="6" fill="#272727" />
      <circle cx="108" cy="128" r="20" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="108" cy="128" r="10" fill="none" stroke="#2a2a2a" strokeWidth="1" />

      {/* ── REAR TIRE ── */}
      <circle cx="408" cy="128" r="31" fill="#131313" />
      <circle cx="408" cy="128" r="19" fill="#1d1d1d" />
      <circle cx="408" cy="128" r="7" fill="#272727" />
      <circle cx="408" cy="128" r="25" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="408" cy="128" r="13" fill="none" stroke="#2a2a2a" strokeWidth="1" />

      {/* ── LIVERY ACCENTS ── */}
      <path d="M185 87 L262 85 L262 97 L185 98 Z" fill="white" opacity="0.11" />
      <rect x="155" y="88" width="27" height="10" rx="1" fill="#8a0014" opacity="0.6" />
    </svg>
  );
}
