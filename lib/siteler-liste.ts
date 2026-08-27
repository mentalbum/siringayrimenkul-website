import type { Mahalle, Site } from "@/lib/types";
import type { SiteOzet } from "@/components/site/siteler-browser";
import { cikarKunye } from "@/lib/kunye";

const OZET_UZUNLUK = 170;

/** Kartta yalnız ilk üç satır göründüğü için liste sayfasına tam açıklama
 * yerine kısaltılmış özet taşınır — /siteler payload'ını ciddi küçültür. */
function ozetle(s: string): string {
  return s.length <= OZET_UZUNLUK ? s : s.slice(0, OZET_UZUNLUK).replace(/\s+\S*$/, "") + "…";
}

export function inceltSiteler(siteler: Site[]): SiteOzet[] {
  return siteler.map((site) => {
    // Daire tipi kayıt metninden TÜRETİLİR, JSON'da alan olarak durmaz: 227
    // içerik dosyasına alan yazmak `npm run lastmod`'u o dosyalara bugünün
    // damgasını basmaya zorlar ve AGENTS.md'nin uyardığı "topluca tazelenmiş
    // lastmod" durumunu, tazelik sinyali yeni onarılmışken geri getirir.
    const odaTipleri = cikarKunye(site).odaTipleri;
    return {
      isim: site.isim,
      slug: site.slug,
      mahalleSlug: site.mahalleSlug,
      aciklama: ozetle(site.aciklama),
      alternatifAdlar: site.alternatifAdlar,
      // Boşsa hiç taşınmaz — payload'a 723 boş dizi eklemek anlamsız.
      ...(odaTipleri.length > 0 ? { odaTipleri } : {}),
    };
  });
}

export function inceltGruplar(
  gruplar: { mahalle: Mahalle; siteler: Site[] }[]
): { mahalle: { slug: string; isim: string }; siteler: SiteOzet[] }[] {
  return gruplar.map(({ mahalle, siteler }) => ({
    mahalle: { slug: mahalle.slug, isim: mahalle.isim },
    siteler: inceltSiteler(siteler),
  }));
}
