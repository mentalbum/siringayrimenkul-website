import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAllMahalleler,
  getMahalleBySlug,
  getSiteBoundary,
  getSiteBySlug,
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
import { Reveal } from "@/components/ui/reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getSiteFaq } from "@/lib/faq";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { inferSiteTipi } from "@/lib/site-tipi";
import { bulunmaHali } from "@/lib/turkce";

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

  // The money query is "{site adı} eryaman emlakçı" — make sure all three
  // terms live in the title (without doubling "Eryaman" for site names that
  // already contain it, e.g. "Bahçen Eryaman Konutları").
  // Asıl hedef kitle bu sitede EVİ OLANLAR: "{site} satılık daire",
  // "{site} daire fiyatları", "evimi satmak/kiraya vermek" niyetli aramalar.
  const isimdeEryamanVar = /eryaman/i.test(site.isim);
  // Ev sahibinin gerçek arama kalıpları ("X satılık daire", "X kiralık daire",
  // "X daire fiyatları", "X emlakçı") başlıkta birebir karşılansın; açıklama
  // fiyat/değer vaadi + hız taahhüdüyle tıklamaya davet etsin.
  return {
    title: isimdeEryamanVar
      ? `${site.isim} Satılık ve Kiralık Daireler — Emlakçısı ve Daire Fiyatları`
      : `${site.isim} Satılık ve Kiralık Daireler — Eryaman Emlakçısı ve Daire Fiyatları`,
    description: truncateForMeta(
      `${bulunmaHali(site.isim)} eviniz mi var? Satış ve kira değerini siteyi blok blok tanıyan yerel emlakçınızla netleştirin. Aynı gün dönüş: ${siteConfig.phoneDisplay}.`
    ),
    alternates: { canonical: `/mahalleler/${mahalle.slug}/${site.slug}` },
    ...(site.alternatifAdlar?.length && {
      keywords: [
        site.isim,
        ...site.alternatifAdlar,
        `${mahalle.isim} emlakçı`,
        "Eryaman emlakçı",
      ],
    }),
    ...(site.gorsel && {
      // Nested openGraph replaces the root layout's wholesale — restate the
      // shared fields alongside the per-site image.
      openGraph: {
        type: "website" as const,
        locale: "tr_TR",
        siteName: siteConfig.name,
        images: [{ url: site.gorsel, alt: site.isim }],
      },
      twitter: { card: "summary_large_image" as const, images: [site.gorsel] },
    }),
  };
}

export default async function SitePage({ params }: Props) {
  const { mahalle: mahalleSlug, site: siteSlug } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const site = getSiteBySlug(mahalleSlug, siteSlug);
  if (!mahalle || !site) notFound();

  const mahalleSiteleri = getSitelerByMahalle(mahalleSlug);
  // Komşu siteler: koordinatı olan sitelerde coğrafi olarak en yakın 6 komşu
  // (ziyaretçiye gerçek komşuluk, tarayıcıya zengin iç bağlantı ağı). Koordinatı
  // olmayanlarda eski sıralı-pencere mantığı devrede kalır.
  const digerSiteSayisi = Math.min(6, mahalleSiteleri.length - 1);
  const siteIndex = mahalleSiteleri.findIndex((item) => item.slug === site.slug);
  const halkaSiteler =
    siteIndex === -1
      ? mahalleSiteleri.filter((item) => item.slug !== site.slug).slice(0, digerSiteSayisi)
      : Array.from(
          { length: digerSiteSayisi },
          (_, i) => mahalleSiteleri[(siteIndex + 1 + i) % mahalleSiteleri.length]
        );
  const merkez = site.koordinat;
  const digerSiteler = merkez
    ? (() => {
        const uzaklikKare = (k: { lat: number; lng: number }) => {
          const dLat = k.lat - merkez.lat;
          const dLng = (k.lng - merkez.lng) * Math.cos((merkez.lat * Math.PI) / 180);
          return dLat * dLat + dLng * dLng;
        };
        const yakinlar = mahalleSiteleri
          .filter((item) => item.slug !== site.slug && item.koordinat)
          .sort((a, b) => uzaklikKare(a.koordinat!) - uzaklikKare(b.koordinat!))
          .slice(0, digerSiteSayisi);
        // Koordinatlı komşu azsa halkadan tamamla (tekrarsız).
        for (const aday of halkaSiteler) {
          if (yakinlar.length >= digerSiteSayisi) break;
          if (!yakinlar.some((item) => item.slug === aday.slug)) yakinlar.push(aday);
        }
        return yakinlar;
      })()
    : halkaSiteler;
  const sinir = getSiteBoundary(site);
  const tipi = inferSiteTipi(site.isim);

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: site.isim,
    ...(site.alternatifAdlar?.length && { alternateName: site.alternatifAdlar }),
    description: site.aciklama,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
    ...(site.gorsel && { image: `${siteConfig.url}${site.gorsel}` }),
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
      containedInPlace: {
        "@type": "Place",
        name: `Eryaman, ${mahalle.ilce}, Ankara`,
      },
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
          Eryaman · {mahalle.isim} · {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{site.isim}</h1>
        {tipi && (
          <span className="mt-2 inline-flex items-center rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark">
            {tipi}
          </span>
        )}
        {site.adres && <p className="mt-2 text-sm text-muted">{site.adres}</p>}
        {/* İlan niyetiyle gelen ziyaretçinin beklentisi İLK ekranda karşılansın:
            gerçek ilanlar sahibinden mağazamızda — dürüst ve tek tık. */}
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-body">
          <span>
            {site.isim} ve çevresindeki <strong className="text-navy">güncel satılık ve kiralık ilanlarımız</strong> için:
          </span>
          <TrackedCtaLink
            href={siteConfig.sahibindenUrl}
            gaEvent="site_ust_sahibinden"
            variant="ghost"
            className="px-0 font-semibold text-gold-dark"
          >
            sahibinden.com mağazamız →
          </TrackedCtaLink>
        </p>
      </header>

      <div className={`mt-8 grid gap-8 ${site.koordinat ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="space-y-4">
          {site.gorsel && (
            <div className="overflow-hidden rounded-2xl border border-border">
              <Image
                src={site.gorsel}
                alt={`${site.isim} — Eryaman ${mahalle.isim}`}
                width={1440}
                height={1080}
                priority
                className="h-auto w-full object-cover"
                sizes="(min-width: 1024px) 590px, 100vw"
              />
            </div>
          )}
          <p className="text-base font-medium text-navy">
            {`${site.isim}, Eryaman'da ${mahalle.isim} sınırları içinde yer alan ${
              tipi ? `${tipi} ` : ""
            }bir yerleşimdir. Bu sitede eviniz mi var? Satmak veya kiraya vermek istiyorsanız, ${site.isim} emlakçısı olarak size yardımcı oluyoruz.`}
          </p>
          <p className="text-base leading-relaxed text-body">{site.aciklama}</p>
          {site.aciklama.includes("sözlüğümüzdeki kat irtifakı maddesinde") && (
            <p className="text-sm leading-relaxed text-muted">
              İlgili terim:{" "}
              <Link href="/sozluk#kat-irtifaki" className="font-semibold text-gold-dark hover:underline">
                kat irtifakı nedir?
              </Link>
            </p>
          )}
          {site.aciklama.includes("sözlüğümüzdeki rezidans tapusu maddesinde") && (
            <p className="text-sm leading-relaxed text-muted">
              İlgili terim:{" "}
              <Link href="/sozluk#rezidans-tapu" className="font-semibold text-gold-dark hover:underline">
                rezidans tapusu nedir?
              </Link>
            </p>
          )}
          <p className="text-sm leading-relaxed text-muted">{mahalle.kisaAciklama}</p>
          {site.adalar && site.adalar.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {site.adalar.map((ada) => (
                <Link
                  key={adaRouteKey(ada)}
                  href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(ada)}`}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                >
                  {adaDisplayLabel(ada)} Ada
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
            <ResourceHints />
            <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
              <MahalleMapLoader
                center={site.koordinat}
                siteler={[{ site, boundary: sinir }]}
              />
            </div>
            {sinir && (
              <p className="text-right text-xs text-muted">
                Sınır verisi: TKGM parsel sorgu verisine dayalıdır; bilgilendirme amaçlıdır,
                resmi kadastro belgesi yerine geçmez.
              </p>
            )}
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl">{`${site.isim} Satılık ve Kiralık Daireler`}</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
          {`Bu sitede eviniz mi var? Satılık ya da kiralık vermeden önce `}
          <Link
            href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${site.slug}`}
            className="font-semibold text-gold-dark hover:underline"
          >
            satış öncesi değerleme
          </Link>
          {` alın; kira artışı, tapu harcı ve komisyon rakamları için `}
          <Link href="/araclar" className="font-semibold text-gold-dark hover:underline">
            ev sahibi hesap araçlarımız
          </Link>
          {` elinizin altında. ${bulunmaHali(site.isim)} satılık veya kiralık daire mi arıyorsunuz? Güncel ilanlarımız sahibinden.com mağazamızda yayınlanıyor; aradığınız daire şu anda listede yoksa bize ulaşın, bu sitede portföyümüze eklenen daireleri ilk öğrenen siz olun.`}
        </p>
        <CtaButton
          href={siteConfig.sahibindenUrl}
          external
          variant="outline"
          className="mt-4"
        >
          sahibinden.com&apos;daki İlanlarımız
        </CtaButton>
      </section>

      <CtaBanner
        className="mt-12"
        baslik="Bu Sitede Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?"
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton
          href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${site.slug}`}
          variant="primary"
        >
          Evinizi Değerlendirelim
        </CtaButton>
        <TrackedCtaLink
          href={`${siteConfig.whatsappUrl}?text=${encodeURIComponent(
            `Merhaba! ${site.isim} (${mahalle.isim}) — bu sitedeki dairem için satış/kiralama değerlendirmesi almak istiyorum.`
          )}`}
          gaEvent="site_whatsapp_cta"
          variant="outline-light"
          openInNewTab
        >
          WhatsApp&apos;tan Yazın
        </TrackedCtaLink>
      </CtaBanner>

      {digerSiteler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">
            {site.koordinat
              ? `Komşu Siteler — ${mahalle.isim}`
              : `${mahalle.isim}'ndeki Diğer Siteler`}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {digerSiteler.map((item, i) => (
              <Reveal key={item.slug} delay={(i % 3) * 60} className="h-full">
                <SiteCard site={item} />
              </Reveal>
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
