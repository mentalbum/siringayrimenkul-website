import type { Mahalle, Site } from "@/lib/types";
import type { SiteOzet } from "@/components/site/siteler-browser";

const OZET_UZUNLUK = 170;

/** Kartta yalnız ilk üç satır göründüğü için liste sayfasına tam açıklama
 * yerine kısaltılmış özet taşınır — /siteler payload'ını ciddi küçültür. */
function ozetle(s: string): string {
  return s.length <= OZET_UZUNLUK ? s : s.slice(0, OZET_UZUNLUK).replace(/\s+\S*$/, "") + "…";
}

export function inceltGruplar(
  gruplar: { mahalle: Mahalle; siteler: Site[] }[]
): { mahalle: { slug: string; isim: string }; siteler: SiteOzet[] }[] {
  return gruplar.map(({ mahalle, siteler }) => ({
    mahalle: { slug: mahalle.slug, isim: mahalle.isim },
    siteler: siteler.map((site) => ({
      isim: site.isim,
      slug: site.slug,
      mahalleSlug: site.mahalleSlug,
      aciklama: ozetle(site.aciklama),
      alternatifAdlar: site.alternatifAdlar,
    })),
  }));
}

/** Karşı sekmenin arama önerisi için yalnız ad listesi (isim + alternatif adlar). */
export function sekmeAdlari(gruplar: { siteler: Site[] }[]): string[] {
  return gruplar.flatMap(({ siteler }) =>
    siteler.flatMap((site) => [site.isim, ...(site.alternatifAdlar ?? [])])
  );
}
