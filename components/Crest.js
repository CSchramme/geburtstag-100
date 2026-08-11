export default function Crest({ size = 96, className = '' }) {
  return (
    <svg
      className={`crest ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Wappen Tamara und Ralph"
    >
      <defs>
        <linearGradient id="crestGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d878" />
          <stop offset="55%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>

      {/* crown */}
      <path
        d="M30 34 L38 16 L48 30 L60 12 L72 30 L82 16 L90 34 L86 40 L34 40 Z"
        fill="url(#crestGold)"
        stroke="#5c4614"
        strokeWidth="1.5"
      />
      <circle cx="38" cy="16" r="3.2" fill="url(#crestGold)" stroke="#5c4614" strokeWidth="1" />
      <circle cx="60" cy="12" r="3.6" fill="url(#crestGold)" stroke="#5c4614" strokeWidth="1" />
      <circle cx="82" cy="16" r="3.2" fill="url(#crestGold)" stroke="#5c4614" strokeWidth="1" />

      {/* shield */}
      <path
        d="M22 42 H98 V78 C98 104 80 122 60 132 C40 122 22 104 22 78 Z"
        fill="#430f16"
        stroke="url(#crestGold)"
        strokeWidth="3"
      />
      <path
        d="M28 48 H92 V77 C92 99 77 114 60 123 C43 114 28 99 28 77 Z"
        fill="none"
        stroke="url(#crestGold)"
        strokeWidth="1"
        opacity="0.55"
      />

      {/* monogram */}
      <text
        x="60"
        y="94"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontWeight="700"
        fontSize="40"
        fill="url(#crestGold)"
      >
        T&amp;R
      </text>
    </svg>
  );
}
