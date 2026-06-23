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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-gold"
    >
      <div className="flex h-32 items-center justify-center bg-navy px-5">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-gold">
          Şirin Gayrimenkul Blog
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <time dateTime={post.tarih} className="text-xs font-medium text-muted">
          {formatTarih(post.tarih)}
        </time>
        <h3 className="text-lg leading-snug">{post.baslik}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-body">{post.ozet}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-gold-dark">
          Devamını Oku
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
