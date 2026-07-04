import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAllAdalar,
  getAllMahalleler,
  getBlogPostsByMahalle,
  getMahalleBoundary,
  getMahalleBySlug,
  getNearbyMahalleler,
  getSiteBoundary,
  getSitelerByMahalle,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { FaqSection } from "@/components/ui/faq-section";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { SiteCard } from "@/components/site/site-card";
import { getMahalleFaq } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";

type Props = {
  params: Promise<{ mahalle: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().map((mahalle) => ({ mahalle: mahalle.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: slug } = await params;
  const mahalle = getMahalleBySlug(slug);
  if (!mahalle) return {};

  const siteSayisi = getSitelerByMahalle(mahalle.slug).length;
  const sitelerParcasi =
    siteSayisi > 0 ? `mahalledeki ${siteSayisi} site ve rezidansı tek tek tanıyor` : "mahalledeki siteleri tek tek tanıyor";

  return {
    title: `${mahalle.isim} Emlakçısı — Eryaman Emlak Rehberi`,
    description: `${mahalle.isim} emlakçısı Şirin Gayrimenkul: ${sitelerParcasi}, satılık/kiralık piyasayı yakından takip ediyoruz. Ücretsiz ev değerleme için bize ulaşın.`,
    alternates: { canonical: `/mahalleler/${mahalle.slug}` },
    robots:
      mahalle.durum === "yakinda" ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function MahallePage({ params }: Props) {
  const { mahalle: slug } = await params;
  const mahalle = getMahalleBySlug(slug);
  if (!mahalle) notFound();

  if (mahalle.durum === "yakinda") {
    const yakindakiler = getNearbyMahalleler(mahalle, 4);
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl">{mahalle.isim}</h1>
        <p className="mt-4 text-base text-body">{mahalle.kisaAciklama}</p>
        <p className="mt-6 text-sm text-muted">
          Bu mahalle için detaylı rehberimizi hazırlıyoruz. O zamana kadar Tunahan Mahallesi
          rehberimize göz atabilir veya doğrudan bizi arayabilirsiniz.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CtaButton href="/mahalleler" variant="outline">
            Tüm Mahalleler
          </CtaButton>
          <TrackedCtaLink href={`tel:${siteConfig.phoneTel}`} gaEvent="phone_click" variant="primary">
            Bizi Arayın
          </TrackedCtaLink>
        </div>

        {yakindakiler.length > 0 && (
          <div className="mt-14 text-left">
            <h2 className="text-center text-base font-semibold text-navy">
              Yakındaki Mahalleler
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {yakindakiler.map(({ mahalle: yakin, uzaklikKm }) => (
                <Link
                  key={yakin.slug}
                  href={`/mahalleler/${yakin.slug}`}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-navy">{yakin.isim}</span>
                    {yakin.durum === "yakinda" && (
                      <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
                        Yakında
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">~{uzaklikKm.toFixed(1)} km</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const siteler = getSitelerByMahalle(mahalle.slug);
  const boundary = getMahalleBoundary(mahalle);
  const siteMapEntries = siteler.map((site) => ({ site, boundary: getSiteBoundary(site) }));
  const hasSiteParcel = siteMapEntries.some((entry) => entry.boundary);
  const haritaliSayisi = siteMapEntries.filter((entry) => entry.boundary).length;
  const adalar = getAllAdalar(mahalle.slug);
  const yakindakiler = getNearbyMahalleler(mahalle, 4);
  const ilgiliYazilar = getBlogPostsByMahalle(mahalle.slug);
  const etaplar = (
    Array.from(new Set(adalar.map((ada) => ada.etap).filter(Boolean))) as string[]
  ).sort((a, b) => Number(a) - Number(b));

  const mahalleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: mahalle.isim,
    description: mahalle.kisaAciklama,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: mahalle.merkezKoordinat.lat,
      longitude: mahalle.merkezKoordinat.lng,
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${mahalle.ilce}, Ankara`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ResourceHints />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{mahalle.isim}</h1>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <dd className="text-2xl font-semibold tabular-nums text-navy">{siteler.length}</dd>
          <dt className="mt-1 text-xs font-medium text-muted">Site &amp; Rezidans</dt>
        </div>
        {adalar.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <dd className="text-2xl font-semibold tabular-nums text-navy">{adalar.length}</dd>
            <dt className="mt-1 text-xs font-medium text-muted">Kayıtlı Ada / Parsel</dt>
          </div>
        )}
        {etaplar.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <dd className="text-2xl font-semibold tabular-nums text-navy">{etaplar.length}</dd>
            <dt className="mt-1 text-xs font-medium text-muted">Etap</dt>
          </div>
        )}
        {siteler.length > 0 && haritaliSayisi === siteler.length && (
          <div className="rounded-2xl border border-gold bg-surface p-4">
            <dd className="text-2xl font-semibold tabular-nums text-navy">
              {haritaliSayisi}/{siteler.length}
            </dd>
            <dt className="mt-1 text-xs font-medium text-gold-dark">
              Tapu Sınırlarıyla Haritalı Site
            </dt>
          </div>
        )}
      </dl>
      {siteler.length > 0 && haritaliSayisi === siteler.length && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-body">
          {mahalle.isim}&apos;ndeki sitelerin <strong>tamamını</strong> gerçek tapu (TKGM) ada/parsel
          sınırlarıyla haritaladık. Evinizin değerini mahalle ortalamasından değil, sitenizin
          gerçeğinden yola çıkarak konuşuyoruz.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          {mahalle.uzunAciklama?.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-body">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-[360px] overflow-hidden rounded-2xl border border-border lg:h-full">
            <MahalleMapLoader
              center={mahalle.merkezKoordinat}
              mahalleBoundary={boundary}
              siteler={siteMapEntries}
            />
          </div>
          {(boundary || hasSiteParcel) && (
            <p className="text-right text-xs text-muted">
              {boundary && "Mahalle sınırı verisi: © OpenStreetMap katkıda bulunanları"}
              {boundary && hasSiteParcel && " · "}
              {hasSiteParcel &&
                "Site sınırları: TKGM parsel sorgu verisine dayalıdır; bilgilendirme amaçlıdır, resmi kadastro belgesi yerine geçmez."}
            </p>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-xl">{mahalle.isim}&apos;ndeki Siteler ve Rezidanslar</h2>
        <p className="mt-2 text-sm text-muted">
          {siteler.length > 0
            ? `${siteler.length} site/rezidans listelendi.`
            : "Bu mahalledeki siteler yakında eklenecek."}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {siteler.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      </section>

      {etaplar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">{mahalle.isim}&apos;ndeki Etaplar ve Adalar</h2>
          <p className="mt-2 text-sm text-muted">
            Eryaman bölgesindeki yapılaşma etap ve ada numaralarına göre düzenlenmiştir.
          </p>
          <div className="mt-5 space-y-6">
            {etaplar.map((etap) => (
              <div key={etap}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                  <Link
                    href={`/mahalleler/${mahalle.slug}/etaplar/${etap}`}
                    className="cursor-pointer hover:underline"
                  >
                    {etap}. Etap
                  </Link>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {adalar
                    .filter((ada) => ada.etap === etap)
                    .map((ada) => (
                      <Link
                        key={adaRouteKey(ada)}
                        href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(ada)}`}
                        title={ada.site.isim}
                        className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                      >
                        {adaDisplayLabel(ada)}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <FaqSection
        title={`${mahalle.isim} Hakkında Sık Sorulan Sorular`}
        items={getMahalleFaq(mahalle, siteler.length)}
      />

      {ilgiliYazilar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">{mahalle.isim} ile İlgili Blog Yazıları</h2>
          <div className="mt-5 space-y-4">
            {ilgiliYazilar.map((yazi) => (
              <Link
                key={yazi.slug}
                href={`/blog/${yazi.slug}`}
                className="block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold"
              >
                <p className="text-sm font-semibold text-navy hover:text-gold-dark">{yazi.baslik}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{yazi.ozet}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {yakindakiler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">Yakındaki Mahalleler</h2>
          <p className="mt-2 text-sm text-muted">
            {mahalle.isim}&apos;ne en yakın mahalleler.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {yakindakiler.map(({ mahalle: yakin, uzaklikKm }) => (
              <Link
                key={yakin.slug}
                href={`/mahalleler/${yakin.slug}`}
                className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-navy">{yakin.isim}</span>
                  {yakin.durum === "yakinda" && (
                    <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
                      Yakında
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">~{uzaklikKm.toFixed(1)} km</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CtaBanner
        className="mt-14"
        baslik={`${mahalle.isim}'nde Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
        aciklama="Ücretsiz değerlendirme için doğrudan bizimle iletişime geçin; aracısız ve hızlı dönüş alın."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Ücretsiz Değerleme Alın
        </CtaButton>
      </CtaBanner>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mahalleJsonLd) }}
      />
    </div>
  );
}
