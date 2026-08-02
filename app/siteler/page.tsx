import Link from "next/link";
import type { Metadata } from "next";
import { getSitelerByMahalle, getYayindaMahalleler } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SitelerBrowser } from "@/components/site/siteler-browser";
import { inceltGruplar, sekmeAdlari } from "@/lib/siteler-liste";
import { SitelerTabs } from "@/components/site/siteler-tabs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  // Ticari mesaj ev sahibine seslenir (Özgün kararı, 2026-08-01) — gerekçe
  // app/mahalleler/[mahalle]/[site]/page.tsx generateMetadata içinde.
  title: "Eryaman Siteleri ve Rezidansları — Evinizi Satalım, Kiraya Verelim",
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
          listelendi. Aradığınız siteyi bulup detaylarını inceleyebilirsiniz. Site, rezidans,
          villa ve kooperatif arasındaki farkları{" "}
          <Link
            href="/blog/eryamanda-konut-turleri"
            className="font-semibold text-gold-dark hover:underline"
          >
            konut türleri rehberimizde
          </Link>
          , alım aşamasındaysanız dikkat edilecekleri{" "}
          <Link
            href="/blog/eryamanda-ev-alirken-dikkat-edilmesi-gerekenler"
            className="font-semibold text-gold-dark hover:underline"
          >
            alım rehberimizde
          </Link>{" "}
          anlattık.
        </p>
      </header>

      <SitelerTabs aktif="/siteler" />

      <div className="mt-8">
        <SitelerBrowser
          gruplar={inceltGruplar(mahalleler)}
          digerSekme={{
            etiket: "Yenimahalle (Ata, Susuz, Cumhuriyet)",
            href: "/siteler/yenimahalle",
            adlar: sekmeAdlari(
              getYayindaMahalleler()
                .filter((mahalle) => mahalle.ilce === "Yenimahalle")
                .map((mahalle) => ({ siteler: getSitelerByMahalle(mahalle.slug) }))
            ),
          }}
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}
