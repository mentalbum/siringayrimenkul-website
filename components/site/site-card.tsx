import Link from "next/link";
import type { Site } from "@/lib/types";
import { ArrowRightIcon, BuildingIcon } from "@/components/ui/icons";

export function SiteCard({ site }: { site: Site }) {
  return (
    <Link
      href={`/mahalleler/${site.mahalleSlug}/${site.slug}`}
      className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold"
    >
      <div className="flex items-center gap-2">
        <BuildingIcon className="h-5 w-5 shrink-0 text-gold-dark" />
        <h3 className="text-base leading-snug">{site.isim}</h3>
      </div>
      <p className="line-clamp-3 text-sm leading-relaxed text-body">{site.aciklama}</p>
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-gold-dark">
        Detayları Gör
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
