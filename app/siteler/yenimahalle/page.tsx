import type { Metadata } from "next";
import { getSitelerByMahalle, getYayindaMahalleler } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SitelerBrowser } from "@/components/site/siteler-browser";
import { inceltGruplar, sekmeAdlari } from "@/lib/siteler-liste";
import { SitelerTabs } from "@/components/site/siteler-tabs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  // absolute: kök şablonun " | Şirin Gayrimenkul" eki (19 karakter) başlığı
  // 60 karakterin üstüne çıkarıyordu; Google orada kesiyor ve uzun başlıkları
  // yeniden yazıyor. Site/mahalle şablonlarında bu ek zaten kaldırılmıştı
  // (2026-08-07/08); dönüşüm ve araç sayfaları atlanmıştı. Marka alan adında,
  // og:site_name ve JSON-LD'de duruyor. Baş terim başta kalacak biçimde kısaltıldı.
  title: { absolute: "Yenimahalle Siteleri — Ata, Susuz, Cumhuriyet Mahalleleri" },
  description:
    "Eryaman'a komşu Yenimahalle mahallelerindeki (Ata, Susuz, Cumhuriyet) site ve rezidansların rehberi. Satmak veya kiraya vermek için yerel emlakçınıza ulaşın.",
  alternates: { canonical: "/siteler/yenimahalle" },
};

export default function YenimahalleSitelerPage() {
  const mahalleler = getYayindaMahalleler()
    .filter((mahalle) => mahalle.ilce === "Yenimahalle")
    .map((mahalle) => ({ mahalle, siteler: getSitelerByMahalle(mahalle.slug) }))
    .filter((entry) => entry.siteler.length > 0);

  const toplamSite = mahalleler.reduce((sum, entry) => sum + entry.siteler.length, 0);

  let position = 0;
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Yenimahalle Siteleri ve Rezidansları",
    description: `Ata, Susuz ve Cumhuriyet mahallelerindeki ${toplamSite} site ve rezidansın listesi — Şirin Gayrimenkul`,
    url: `${siteConfig.url}/siteler/yenimahalle`,
    numberOfItems: toplamSite,
    itemListElement: mahalleler.flatMap(({ mahalle, siteler }) =>
      siteler.map((site) => ({
        "@type": "ListItem",
        position: ++position,
        name: site.isim,
        url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
      }))
    ),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Siteler", href: "/siteler" },
          { label: "Yenimahalle", href: "/siteler/yenimahalle" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Komşu Bölge — Yenimahalle
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">
          Yenimahalle&apos;deki Siteler ve Rezidanslar
        </h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman&apos;la iç içe yaşayan Ata, Susuz ve Cumhuriyet mahallelerinde tanıdığımız
          {toplamSite > 0 ? ` ${toplamSite} site/rezidans aşağıda listelendi.` : " site ve rezidanslar yakında burada listelenecek."}
        </p>
      </header>

      <SitelerTabs aktif="/siteler/yenimahalle" />

      <div className="mt-8">
        {mahalleler.length > 0 ? (
          <SitelerBrowser
            gruplar={inceltGruplar(mahalleler)}
            digerSekme={{
              etiket: "Eryaman",
              href: "/siteler",
              adlar: sekmeAdlari(
                getYayindaMahalleler()
                  .filter((mahalle) => mahalle.ilce === "Etimesgut")
                  .map((mahalle) => ({ siteler: getSitelerByMahalle(mahalle.slug) }))
              ),
            }}
          />
        ) : (
          <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
            Bu bölgenin site listesi hazırlanıyor. Ata, Susuz veya Cumhuriyet
            mahallelerindeki eviniz için bize doğrudan ulaşabilirsiniz.
          </p>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}
