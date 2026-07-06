import type { Metadata } from "next";
import { getAllMahalleler, getMahalleBoundary } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { RegionMapLoader } from "@/components/maps/region-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Eryaman ve Yenimahalle Mahalleleri — Emlak Rehberi",
  description:
    "Eryaman'ın 11 mahallesi ile komşu Yenimahalle mahallelerini (Ata, Susuz, Cumhuriyet), site/rezidanslarını ve emlak piyasasını tek sayfada keşfedin.",
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
    name: "Eryaman ve Yenimahalle Mahalleleri",
    description:
      "Eryaman'ın 11 mahallesi ile komşu Yenimahalle mahallelerinin emlak rehberi — Şirin Gayrimenkul",
    url: `${siteConfig.url}/mahalleler`,
    numberOfItems: mahalleler.length,
    itemListElement: mahalleler.map((m, i) => ({
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
          Hizmet Bölgemiz
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman ve Yenimahalle Mahalleleri</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman; Etimesgut ilçesine bağlı, planlı etap yapılaşmasıyla tanınan ve Ankara
          metrosuna bağlı bir semt. 11 mahallenin tamamını ve içlerindeki 500&apos;den fazla
          site ile rezidansı Şirin Gayrimenkul olarak yakından tanıyoruz. Bölgeyle iç içe
          yaşayan komşu Yenimahalle mahallelerine — Ata, Susuz ve Cumhuriyet — de hizmet
          veriyoruz.
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
        <h2 className="text-xl">Eryaman Mahalleleri</h2>
        <p className="mt-2 text-sm text-muted">Etimesgut ilçesi — Eryaman bölgesinin 11 mahallesi.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eryamanMahalleleri.map((mahalle) => (
            <MahalleCard key={mahalle.slug} mahalle={mahalle} />
          ))}
        </div>
      </section>

      {yenimahalleMahalleleri.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">Yenimahalle Mahalleleri</h2>
          <p className="mt-2 text-sm text-muted">
            Eryaman&apos;a komşu, günlük yaşamı bölgeyle iç içe olan ve hizmet verdiğimiz
            Yenimahalle mahalleleri.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {yenimahalleMahalleleri.map((mahalle) => (
              <MahalleCard key={mahalle.slug} mahalle={mahalle} />
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
