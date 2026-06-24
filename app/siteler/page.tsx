import type { Metadata } from "next";
import Link from "next/link";
import { getSitelerByMahalle, getYayindaMahalleler } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SiteCard } from "@/components/site/site-card";

export const metadata: Metadata = {
  title: "Tüm Siteler ve Rezidanslar",
  description:
    "Eryaman bölgesindeki tüm site ve rezidansları mahallesine göre listeleyen rehber. Aradığınız siteyi bulun, detaylarını inceleyin.",
  alternates: { canonical: "/siteler" },
};

export default function SitelerPage() {
  const mahalleler = getYayindaMahalleler()
    .map((mahalle) => ({ mahalle, siteler: getSitelerByMahalle(mahalle.slug) }))
    .filter((entry) => entry.siteler.length > 0);

  const toplamSite = mahalleler.reduce((sum, entry) => sum + entry.siteler.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Siteler", href: "/siteler" }]} />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Eryaman Bölgesi
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Tüm Siteler ve Rezidanslar</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman bölgesinde tanıdığımız {toplamSite} site/rezidans, mahallesine göre aşağıda
          listelendi. Aradığınız siteyi bulup detaylarını inceleyebilirsiniz.
        </p>
      </header>

      <div className="mt-12 space-y-14">
        {mahalleler.map(({ mahalle, siteler }) => (
          <section key={mahalle.slug}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl">
                <Link
                  href={`/mahalleler/${mahalle.slug}`}
                  className="cursor-pointer hover:text-gold-dark hover:underline"
                >
                  {mahalle.isim}
                </Link>
              </h2>
              <span className="text-sm text-muted">{siteler.length} site/rezidans</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteler.map((site) => (
                <SiteCard key={site.slug} site={site} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
