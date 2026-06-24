import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllMahalleler,
  getMahalleBySlug,
  getSiteBoundary,
  getSiteBySlug,
  getSitelerByMahalle,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { FaqSection } from "@/components/ui/faq-section";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { SiteCard } from "@/components/site/site-card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getSiteFaq } from "@/lib/faq";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type Props = {
  params: Promise<{ mahalle: string; site: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      mahalle: mahalle.slug,
      site: site.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, site: siteSlug } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const site = getSiteBySlug(mahalleSlug, siteSlug);
  if (!mahalle || !site) return {};

  return {
    title: `${site.isim} (${mahalle.isim})`,
    description: truncateForMeta(site.aciklama),
  };
}

export default async function SitePage({ params }: Props) {
  const { mahalle: mahalleSlug, site: siteSlug } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const site = getSiteBySlug(mahalleSlug, siteSlug);
  if (!mahalle || !site) notFound();

  const digerSiteler = getSitelerByMahalle(mahalleSlug)
    .filter((item) => item.slug !== site.slug)
    .slice(0, 3);
  const sinir = getSiteBoundary(site);

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: site.isim,
    description: site.aciklama,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
    ...(site.adres && {
      address: {
        "@type": "PostalAddress",
        streetAddress: site.adres,
        addressLocality: mahalle.ilce,
        addressRegion: "Ankara",
        addressCountry: "TR",
      },
    }),
    ...(site.koordinat && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.koordinat.lat,
        longitude: site.koordinat.lng,
      },
    }),
    containedInPlace: {
      "@type": "Place",
      name: mahalle.isim,
      url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
          { label: site.isim, href: `/mahalleler/${mahalle.slug}/${site.slug}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.isim} · {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{site.isim}</h1>
        {site.adres && <p className="mt-2 text-sm text-muted">{site.adres}</p>}
      </header>

      <div className={`mt-8 grid gap-8 ${site.koordinat ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-body">{site.aciklama}</p>
          {site.adalar && site.adalar.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {site.adalar.map((ada) => (
                <Link
                  key={ada.no}
                  href={`/mahalleler/${mahalle.slug}/adalar/${ada.no}`}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                >
                  {ada.no} Ada
                  {ada.blok ? ` (${ada.blok})` : ""}
                  <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
                </Link>
              ))}
            </div>
          )}
          {site.ozellikler && site.ozellikler.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 text-sm text-body">
              {site.ozellikler.map((ozellik) => (
                <li key={ozellik} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {ozellik}
                </li>
              ))}
            </ul>
          )}
          {!site.koordinat && (
            <CtaButton href={`/mahalleler/${mahalle.slug}`} variant="outline">
              {mahalle.isim} Haritasını Görüntüle
            </CtaButton>
          )}
        </div>
        {site.koordinat && (
          <div className="flex flex-col gap-2">
            <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
              <MahalleMapLoader center={site.koordinat} boundary={sinir} siteler={[site]} />
            </div>
            {sinir && (
              <p className="text-right text-xs text-muted">
                Sınır verisi: TKGM parsel sorgu görüntüsünden türetilmiş tahmini sınırdır, resmi
                kadastro verisi değildir.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 rounded-2xl bg-navy px-6 py-8 text-center text-white sm:px-10">
        <h2 className="text-xl text-white">{site.isim} Hakkında Bilgi mi İstiyorsunuz?</h2>
        <p className="mt-2 text-sm text-white/75">
          Bu site/rezidanstaki güncel ilanlarımıza sahibinden.com üzerinden ulaşabilirsiniz.
        </p>
        <CtaButton href={siteConfig.sahibindenUrl} external variant="primary" className="mt-5">
          İlanlarımı Gör
        </CtaButton>
      </div>

      {digerSiteler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">{mahalle.isim}&apos;ndeki Diğer Siteler</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {digerSiteler.map((item) => (
              <SiteCard key={item.slug} site={item} />
            ))}
          </div>
        </section>
      )}

      <FaqSection title={`${site.isim} Hakkında Sık Sorulan Sorular`} items={getSiteFaq(site, mahalle)} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
    </div>
  );
}
