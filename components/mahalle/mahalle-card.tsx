import Link from "next/link";
import type { Mahalle } from "@/lib/types";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/icons";

export function MahalleCard({ mahalle }: { mahalle: Mahalle }) {
  const isYakinda = mahalle.durum === "yakinda";

  return (
    <Link
      href={`/mahalleler/${mahalle.slug}`}
      className="group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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
        {mahalle.alternatifAdlar?.[0] && (
          <span className="text-gold-dark">· {mahalle.alternatifAdlar[0]} olarak da bilinir</span>
        )}
      </p>
      <p className="text-sm leading-relaxed text-body">{mahalle.kisaAciklama}</p>
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-colors duration-200 group-hover:text-gold-dark">
        Mahalleyi İncele
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
