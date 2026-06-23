export function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 480" aria-hidden="true" className="h-full w-full">
      <circle cx="240" cy="240" r="220" fill="var(--color-surface-muted)" />
      <polygon
        points="130,170 300,115 385,250 295,375 115,335 75,225"
        fill="none"
        stroke="var(--color-navy)"
        strokeWidth="2.5"
        strokeDasharray="8 8"
        opacity="0.45"
      />
      <circle cx="175" cy="205" r="7" fill="var(--color-navy)" opacity="0.8" />
      <circle cx="265" cy="165" r="7" fill="var(--color-navy)" opacity="0.8" />
      <circle cx="330" cy="255" r="7" fill="var(--color-navy)" opacity="0.8" />
      <circle cx="205" cy="305" r="7" fill="var(--color-navy)" opacity="0.8" />
      <circle cx="275" cy="325" r="7" fill="var(--color-navy)" opacity="0.8" />
      <g transform="translate(240,145)">
        <path
          d="M0 0C-33 0-60 27-60 60c0 45 60 100 60 100s60-55 60-100C60 27 33 0 0 0Z"
          fill="var(--color-gold)"
          stroke="var(--color-navy)"
          strokeWidth="3"
        />
        <circle cx="0" cy="60" r="24" fill="var(--color-navy)" />
        <path
          d="M-10 60l7 7 14-16"
          stroke="var(--color-gold)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
