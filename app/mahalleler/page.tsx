import type { Metadata } from "next";
import { getAllMahalleler, getMahalleBoundary } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { Reveal } from "@/components/ui/reveal";
import { RegionMapLoader } from "@/components/maps/region-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  // absolute: kök şablonun " | Şirin Gayrimenkul" eki (19 karakter) başlığı
  // 60 karakterin üstüne çıkarıyordu; Google orada kesiyor ve uzun başlıkları
  // yeniden yazıyor. Site/mahalle şablonlarında bu ek zaten kaldırılmıştı
  // (2026-08-07/08); dönüşüm ve araç sayfaları atlanmıştı. Marka alan adında,
  // og:site_name ve JSON-LD'de duruyor. Baş terim başta kalacak biçimde kısaltıldı.
  title: { absolute: "Eryaman Mahalleleri — Etimesgut Emlak Rehberi" },
  description:
    "Eryaman'ın 11 mahallesini, site/rezidanslarını ve emlak piyasasını tek sayfada keşfedin. Ek hizmet bölgemiz Yenimahalle'de Ata, Susuz ve Cumhuriyet de rehberde.",
  alternates: { canonical: "/mahalleler" },
};

export default function MahallelerPage() {
  const mahalleler = getAllMahalleler();
  const eryamanMahalleleri = mahalleler.filter((m) => m.ilce === "Etimesgut");
  const yenimahalleMahalleleri = mahalleler.filter((m) => m.ilce === "Yenimahalle");
  const mapItems = mahalleler.map((mahalle) => ({
    mahalle,
    boundary: getMahalleBoundary(mahalle),
  }));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Eryaman Mahalleleri",
    description: "Eryaman bölgesindeki 11 mahallenin emlak rehberi — Şirin Gayrimenkul",
    url: `${siteConfig.url}/mahalleler`,
    numberOfItems: eryamanMahalleleri.length,
    itemListElement: eryamanMahalleleri.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.isim,
      url: `${siteConfig.url}/mahalleler/${m.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ResourceHints />
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Mahalleler", href: "/mahalleler" }]} />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Eryaman Bölgesi
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman Mahalleleri</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman; Etimesgut ilçesine bağlı, planlı etap yapılaşmasıyla tanınan ve Ankara
          metrosuna bağlı bir semt. 11 mahallenin tamamını ve içlerindeki 700&apos;den fazla
          site ile rezidansı Şirin Gayrimenkul olarak yakından tanıyoruz.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Evinizi satmak veya kiraya vermek istiyorsanız, mahallenizi seçerek o bölgedeki
          uzman danışmanımıza ulaşın.
        </p>
      </header>

      <div className="mt-8 h-[420px] overflow-hidden rounded-2xl border border-border sm:h-[520px]">
        <RegionMapLoader items={mapItems} />
      </div>

      <section className="mt-12">
        <h2 className="text-xl">Eryaman&apos;ın 11 Mahallesi</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eryamanMahalleleri.map((mahalle, i) => (
            <Reveal key={mahalle.slug} delay={(i % 3) * 70} className="h-full">
              <MahalleCard mahalle={mahalle} />
            </Reveal>
          ))}
        </div>
      </section>

      {yenimahalleMahalleleri.length > 0 && (
        <section className="mt-16 rounded-3xl border border-[#8FA3BF]/40 bg-[#8FA3BF]/[0.06] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#5f7699]">
            Ek Hizmet Bölgemiz
          </p>
          <h2 className="mt-2 text-xl">Yenimahalle: Ata, Susuz ve Cumhuriyet</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-body">
            Önceliğimiz Eryaman — ama günlük yaşamı Eryaman&apos;la iç içe olan bu üç komşu
            mahalleye de aynı yakınlıkla hizmet veriyoruz. Haritada mavi-gri çerçeveyle
            gördüğünüz bölge burasıdır.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {yenimahalleMahalleleri.map((mahalle, i) => (
              <Reveal key={mahalle.slug} delay={(i % 3) * 70} className="h-full">
                <MahalleCard mahalle={mahalle} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}
