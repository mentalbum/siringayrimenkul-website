import Link from "next/link";
import { ArrowRightIcon, BuildingIcon } from "@/components/ui/icons";

/** Kartın gerçekten kullandığı alanlar — tam Site da, liste için inceltilmiş
 * özet de bu şekle uyar (structural typing). */
interface SiteKartVerisi {
  isim: string;
  slug: string;
  mahalleSlug: string;
  aciklama: string;
  /** Kayıt metninde yazılı daire tipleri; yoksa rozet hiç çizilmez. */
  odaTipleri?: string[];
}

export function SiteCard({ site }: { site: SiteKartVerisi }) {
  return (
    <Link
      href={`/mahalleler/${site.mahalleSlug}/${site.slug}`}
      className="cv-auto group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-center gap-2">
        <BuildingIcon className="h-5 w-5 shrink-0 text-gold-dark" />
        <h3 className="text-base leading-snug">{site.isim}</h3>
      </div>
      <p className="line-clamp-3 text-sm leading-relaxed text-body">{site.aciklama}</p>
      {site.odaTipleri && site.odaTipleri.length > 0 && (
        // "Kayıtta:" öneki düşürülemez: çıplak "2+1" doğrulanmış bir öznitelik
        // gibi okunur, oysa liste açık küme — kayıtta yazan tipleri gösterir,
        // sitenin tüm tiplerini değil.
        <span className="text-xs text-muted">Kayıtta: {site.odaTipleri.join(", ")}</span>
      )}
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy transition-colors duration-200 group-hover:text-gold-dark">
        Detayları Gör
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
