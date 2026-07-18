import type { Metadata } from "next";
import { getSitelerByMahalle, getYayindaMahalleler } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SitelerBrowser } from "@/components/site/siteler-browser";
import { SitelerTabs } from "@/components/site/siteler-tabs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Eryaman Siteleri ve Rezidansları — Satılık ve Kiralık Daireler İçin Tam Liste",
  description:
    "Eryaman'daki tüm site ve rezidansların tam listesi. Sitenizi bulun; dairenizin satış ve kira değerini siteyi blok blok tanıyan yerel emlakçınızla netleştirin: 0532 363 96 60.",
  alternates: { canonical: "/siteler" },
};

export default function SitelerPage() {
  // Bu sayfa yalnızca Eryaman'ı (Etimesgut) listeler; Yenimahalle tarafındaki
  // siteler kendi sekmesinde yaşar — Özgün'ün net isteği: iki bölge karışmaz.
  const mahalleler = getYayindaMahalleler()
    .filter((mahalle) => mahalle.ilce === "Etimesgut")
    .map((mahalle) => ({ mahalle, siteler: getSitelerByMahalle(mahalle.slug) }))
    .filter((entry) => entry.siteler.length > 0);

  const toplamSite = mahalleler.reduce((sum, entry) => sum + entry.siteler.length, 0);

  let position = 0;
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Eryaman Siteleri ve Rezidansları",
    description: `Eryaman bölgesindeki ${toplamSite} site ve rezidansın tam listesi — Şirin Gayrimenkul`,
    url: `${siteConfig.url}/siteler`,
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
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Siteler", href: "/siteler" }]} />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Eryaman Bölgesi
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman&apos;daki Tüm Siteler ve Rezidanslar</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman bölgesinde tanıdığımız {toplamSite} site/rezidans, mahallesine göre aşağıda
          listelendi. Aradığınız siteyi bulup detaylarını inceleyebilirsiniz.
        </p>
      </header>

      <SitelerTabs aktif="/siteler" />

      <div className="mt-8">
        <SitelerBrowser gruplar={mahalleler} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}
