import type { ReactNode } from "react";

interface CtaBannerProps {
  baslik: string;
  aciklama?: string;
  /** CTA buttons */
  children: ReactNode;
  size?: "default" | "large";
  className?: string;
}

/** The navy call-to-action band used across the site, carrying the brand's
 * topographic-ring signature (same motif as the homepage hero) faintly in
 * the corner so every page echoes the "map of Eryaman" identity. */
export function CtaBanner({
  baslik,
  aciklama,
  children,
  size = "default",
  className = "",
}: CtaBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-navy px-6 text-center text-white ${
        size === "large" ? "py-12 sm:px-12" : "py-8 sm:px-10"
      } ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 600 240"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g transform="rotate(-18 520 120)">
          {Array.from({ length: 5 }).map((_, i) => {
            const r = 48 + i * 42;
            return (
              <ellipse
                key={i}
                cx={520}
                cy={120}
                rx={r}
                ry={r * 0.82}
                fill="none"
                stroke="#FBCA12"
                strokeWidth={1}
                strokeOpacity={0.2 - i * 0.03}
              />
            );
          })}
        </g>
        <circle cx={520} cy={120} r={3.5} fill="#FBCA12" fillOpacity={0.5} />
      </svg>

      <div className="relative flex flex-col items-center gap-2">
        <h2 className={`text-white ${size === "large" ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          {baslik}
        </h2>
        {aciklama && <p className="max-w-xl text-sm text-white/75">{aciklama}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">{children}</div>
      </div>
    </div>
  );
}
