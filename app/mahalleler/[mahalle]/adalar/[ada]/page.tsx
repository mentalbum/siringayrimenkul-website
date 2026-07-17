import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAdaEntriesByRouteKey,
  getAllAdalar,
  getAllMahalleler,
  getMahalleBySlug,
  getSiteBoundary,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { ArrowRightIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";
import { tamlayanEk } from "@/lib/turkce";

type Props = {
  params: Promise<{ mahalle: string; ada: string }>;
};

export function generateStaticParams() {
  // Bir parseli birden fazla site paylaşabilir — rota anahtarlarını tekilleştir.
  return getAllMahalleler().flatMap((mahalle) =>
    Array.from(new Set(getAllAdalar(mahalle.slug).map((ada) => adaRouteKey(ada)))).map((key) => ({
      mahalle: mahalle.slug,
      ada: key,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, ada: adaKey } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const entries = getAdaEntriesByRouteKey(mahalleSlug, adaKey);
  if (!mahalle || entries.length === 0) return {};
  const ada = entries[0];

  const label = adaDisplayLabel(ada);
  const etapBilgi = ada.etap ? ` Eryaman ${ada.etap}. Etap,` : "";
  const siteIsimleri = entries.map((entry) => entry.site.isim).join(", ");
  return {
    title:
      entries.length > 1
        ? `${label} Ada — ${mahalle.isim} | Eryaman`
        : `${label} Ada — ${ada.site.isim} | ${mahalle.isim}`,
    description: `${etapBilgi} ${mahalle.isim} içindeki ${label} Ada (${siteIsimleri}). Bu adadaki dairenizi satmayı veya kiraya vermeyi düşünüyorsanız Şirin Gayrimenkul ile fiyatı birlikte belirleyin.`.trim(),
    alternates: { canonical: `/mahalleler/${mahalle.slug}/adalar/${adaKey}` },
  };
}

export default async function AdaPage({ params }: Props) {
  const { mahalle: mahalleSlug, ada: adaKey } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const entries = getAdaEntriesByRouteKey(mahalleSlug, adaKey);
  if (!mahalle || entries.length === 0) notFound();
  const ada = entries[0];

  const label = adaDisplayLabel(ada);
  const tumAdalar = getAllAdalar(mahalleSlug);
  const ayniEtapMap = new Map(
    tumAdalar
      .filter((item) => item.etap === ada.etap && adaRouteKey(item) !== adaKey)
      .map((item) => [adaRouteKey(item), item] as const)
  );
  const buNo = Number.parseInt(ada.no, 10);
  const ayniEtaptakiler = Array.from(ayniEtapMap.values())
    .sort(
      (a, b) =>
        Math.abs(Number.parseInt(a.no, 10) - buNo) - Math.abs(Number.parseInt(b.no, 10) - buNo)
    )
    .slice(0, 12);

  const adaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name:
      entries.length > 1
        ? `${label} Ada — ${mahalle.isim}`
        : `${label} Ada — ${ada.site.isim}`,
    description: `${label} Ada, ${mahalle.isim} içinde yer alır (${entries
      .map((entry) => entry.site.isim)
      .join(", ")}).`,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/adalar/${adaKey}`,
    ...(ada.site.koordinat && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: ada.site.koordinat.lat,
        longitude: ada.site.koordinat.lng,
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
          { label: `${label} Ada`, href: `/mahalleler/${mahalle.slug}/adalar/${adaKey}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.isim}
          {ada.etap && (
            <>
              {" · "}
              <Link
                href={`/mahalleler/${mahalle.slug}/etaplar/${ada.etap}`}
                className="cursor-pointer hover:underline"
              >
                Eryaman {ada.etap}. Etap
              </Link>
            </>
          )}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{label} Ada</h1>
      </header>

      <div className={`mt-8 grid gap-8 ${ada.site.koordinat ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="space-y-4">
          {entries.length === 1 ? (
            <p className="text-base leading-relaxed text-body">
              {label} Ada, {mahalle.isim} içinde yer alan{" "}
              <Link
                href={`/mahalleler/${mahalle.slug}/${ada.site.slug}`}
                className="font-semibold text-navy hover:text-gold-dark"
              >
                {ada.site.isim}
              </Link>
              {tamlayanEk(ada.site.isim)} bir parçasıdır
              {ada.blok ? ` (${ada.blok} Blok)` : ""}.
            </p>
          ) : (
            <>
              <p className="text-base leading-relaxed text-body">
                {`${label} Ada, ${mahalle.isim} içinde yer alır ve bu parselde ${entries.length} ayrı site bulunur:`}
              </p>
              <div className="grid gap-2">
                {entries.map((entry) => (
                  <Link
                    key={entry.site.slug}
                    href={`/mahalleler/${mahalle.slug}/${entry.site.slug}`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    {entry.site.isim}
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}
          {!ada.site.koordinat && (
            <CtaButton href={`/mahalleler/${mahalle.slug}`} variant="outline">
              {mahalle.isim} Haritasını Görüntüle
            </CtaButton>
          )}
        </div>
        {ada.site.koordinat && (
          <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
            <ResourceHints />
            <MahalleMapLoader
              center={ada.site.koordinat}
              siteler={entries.map((entry) => ({
                site: entry.site,
                boundary: getSiteBoundary(entry.site),
              }))}
            />
          </div>
        )}
      </div>

      <CtaBanner
        className="mt-12"
        baslik={`${label} Ada'da Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton
          href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${ada.site.slug}`}
          variant="primary"
        >
          Evinizi Değerlendirelim
        </CtaButton>
      </CtaBanner>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(adaJsonLd) }}
      />

      {ayniEtaptakiler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">
            <Link
              href={`/mahalleler/${mahalle.slug}/etaplar/${ada.etap}`}
              className="cursor-pointer hover:text-gold-dark hover:underline"
            >
              Eryaman {ada.etap}. Etap
            </Link>
            &apos;taki Diğer Adalar
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ayniEtaptakiler.map((item) => (
              <Link
                key={adaRouteKey(item)}
                href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(item)}`}
                className="group flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">{adaDisplayLabel(item)} Ada</p>
                  <p className="text-xs text-muted">{item.site.isim}</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-dark" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
