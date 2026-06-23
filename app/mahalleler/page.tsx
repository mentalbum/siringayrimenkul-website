import type { Metadata } from "next";
import { getAllMahalleler } from "@/lib/content";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { RegionMapLoader } from "@/components/maps/region-map-loader";

export const metadata: Metadata = {
  title: "Mahalleler",
  description:
    "Eryaman bölgesindeki (Etimesgut ve Yenimahalle) tüm mahalleler için Şirin Gayrimenkul'un hazırladığı yerel emlak rehberi: yaşam, ulaşım ve site/rezidans bilgileri.",
};

export default function MahallelerPage() {
  const mahalleler = getAllMahalleler();
  const etimesgut = mahalleler.filter((mahalle) => mahalle.ilce === "Etimesgut");
  const yenimahalle = mahalleler.filter((mahalle) => mahalle.ilce === "Yenimahalle");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Eryaman Bölgesi
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Mahalleler</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman; Etimesgut ve Yenimahalle ilçe sınırlarını birlikte kapsayan, Ankara&apos;nın en
          yoğun yaşanan bölgelerinden biri. Şirin Gayrimenkul olarak bölgedeki her mahalleyi ve
          içindeki site/rezidansları tek tek tanıyoruz. Aşağıdan mahallenizi seçin.
        </p>
      </header>

      <div className="mt-8 h-[420px] overflow-hidden rounded-2xl border border-border">
        <RegionMapLoader mahalleler={mahalleler} />
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
