import Link from "next/link";
import type { Mahalle } from "@/lib/types";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/icons";

export function MahalleCard({ mahalle }: { mahalle: Mahalle }) {
  const isYakinda = mahalle.durum === "yakinda";

  return (
    <Link
      href={`/mahalleler/${mahalle.slug}`}
      className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg leading-snug">{mahalle.isim}</h3>
        {isYakinda ? (
          <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted">
            Yakında
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark">
            Rehber Hazır
          </span>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <MapPinIcon className="h-3.5 w-3.5" />
        {mahalle.ilce}
      </p>
      <p className="text-sm leading-relaxed text-body">{mahalle.kisaAciklama}</p>
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-gold-dark">
        Mahalleyi İncele
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
