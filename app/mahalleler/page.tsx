import type { Metadata } from "next";
import { getAllMahalleler, getMahalleBoundary } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { RegionMapLoader } from "@/components/maps/region-map-loader";

export const metadata: Metadata = {
  title: "Eryaman Mahalleleri — Etimesgut ve Yenimahalle Emlak Rehberi",
  description:
    "Eryaman bölgesindeki 14 mahalleyi, site/rezidanslarını ve emlak piyasasını tek sayfada keşfedin. Şirin Gayrimenkul olarak her mahalleyi yakından tanıyoruz.",
  alternates: { canonical: "/mahalleler" },
};

export default function MahallelerPage() {
  const mahalleler = getAllMahalleler();
  const etimesgut = mahalleler.filter((mahalle) => mahalle.ilce === "Etimesgut");
  const yenimahalle = mahalleler.filter((mahalle) => mahalle.ilce === "Yenimahalle");
  const mapItems = mahalleler.map((mahalle) => ({
    mahalle,
    boundary: getMahalleBoundary(mahalle),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Mahalleler", href: "/mahalleler" }]} />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Eryaman Bölgesi
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman Mahalleleri</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman; Etimesgut ve Yenimahalle ilçe sınırlarını birlikte kapsayan, planlı etap
          yapılaşmasıyla tanınan ve Ankara metrosuna bağlı bir semt. İdari olarak 11 mahalleyle
          Etimesgut&apos;a, 3 mahalleyle Yenimahalle&apos;ye bağlıdır; bu 14 mahallenin tamamını
          ve içlerindeki 500&apos;den fazla site ile rezidansı Şirin Gayrimenkul olarak yakından
          tanıyoruz.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Evinizi satmak veya kiraya vermek istiyorsanız, mahallenizi seçerek o bölgedeki
          uzman danışmanımıza ulaşın.
        </p>
      </header>

      <div className="mt-8 h-[420px] overflow-hidden rounded-2xl border border-border">
        <RegionMapLoader items={mapItems} />
      </div>

      <section className="mt-12">
        <h2 className="text-xl">Etimesgut&apos;a Bağlı Mahalleler</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etimesgut.map((mahalle) => (
            <MahalleCard key={mahalle.slug} mahalle={mahalle} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Yenimahalle&apos;ye Bağlı Mahalleler</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {yenimahalle.map((mahalle) => (
            <MahalleCard key={mahalle.slug} mahalle={mahalle} />
          ))}
        </div>
      </section>
    </div>
  );
}
