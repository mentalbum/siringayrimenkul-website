import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { ArrowRightIcon } from "@/components/ui/icons";

function formatTarih(tarih: string) {
  return new Date(tarih).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-navy px-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 320 140"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          <g transform="rotate(-18 268 70)">
            {Array.from({ length: 5 }).map((_, i) => {
              const r = 26 + i * 26;
              return (
                <ellipse
                  key={i}
                  cx={268}
                  cy={70}
                  rx={r}
                  ry={r * 0.82}
                  fill="none"
                  stroke="#FBCA12"
                  strokeWidth={1}
                  strokeOpacity={0.34 - i * 0.055}
                />
              );
            })}
          </g>
          <circle cx={268} cy={70} r={3.5} fill="#FBCA12" />
        </svg>
        <p className="relative text-center text-sm font-semibold uppercase tracking-wide text-gold">
          Şirin Gayrimenkul Blog
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <time dateTime={post.tarih} className="text-xs font-medium text-muted">
          {formatTarih(post.tarih)}
        </time>
        <h3 className="text-lg leading-snug">{post.baslik}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-body">{post.ozet}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-colors duration-200 group-hover:text-gold-dark">
          Devamını Oku
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
