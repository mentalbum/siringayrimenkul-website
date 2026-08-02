import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAllEtaplar,
  getAllMahalleler,
  getEtapByNo,
  getMahalleBySlug,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { FaqSection } from "@/components/ui/faq-section";
import { SiteCard } from "@/components/site/site-card";
import { getEtapFaq } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";

type Props = {
  params: Promise<{ mahalle: string; etap: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getAllEtaplar(mahalle.slug).map((etap) => ({
      mahalle: mahalle.slug,
      etap: etap.no,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, etap: etapNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const etap = getEtapByNo(mahalleSlug, etapNo);
  if (!mahalle || !etap) return {};

  return {
    // Ticari mesaj ev sahibine seslenir — gerekçe site sayfası şablonunda.
    title: `Eryaman ${etap.no}. Etap Emlakçı | Evinizi Satalım, Kiraya Verelim | ${mahalle.isim}`,
    description: `Eryaman ${etap.no}. Etap'ta eviniz mi var? ${etap.siteler.length} site ve ${etap.adalar.length} adayı tek tek tanıyoruz; satış ve kira değerini yerel emlakçınızla netleştirin: ${siteConfig.phoneDisplay}.`,
    alternates: { canonical: `/mahalleler/${mahalle.slug}/etaplar/${etap.no}` },
  };
}

export default async function EtapPage({ params }: Props) {
  const { mahalle: mahalleSlug, etap: etapNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const etap = getEtapByNo(mahalleSlug, etapNo);
  if (!mahalle || !etap) notFound();

  const digerEtaplar = getAllEtaplar(mahalleSlug).filter((item) => item.no !== etap.no);

  const etapJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `Eryaman ${etap.no}. Etap`,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/etaplar/${etap.no}`,
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
          { label: `${etap.no}. Etap`, href: `/mahalleler/${mahalle.slug}/etaplar/${etap.no}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.isim} · {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman {etap.no}. Etap</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman {etap.no}. Etap bölgesi {mahalle.isim} içinde yer alıyor; bu bölgede{" "}
          {etap.siteler.length} site/rezidans ve {etap.adalar.length} ada bulunuyor.
          {etap.no === "5" &&
            " Bölge, adını verdiği Eryaman 5 metro istasyonuna ev sahipliği yapıyor; Ankaray ve metro hattına yürüme mesafesinde ulaşım sağlıyor."}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl">{etap.no}. Etap&apos;taki Siteler</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etap.siteler.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">{etap.no}. Etap&apos;taki Adalar</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {etap.adalar.map((ada) => (
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
      </section>

      <FaqSection
        title={`Eryaman ${etap.no}. Etap Hakkında Sık Sorulan Sorular`}
        items={getEtapFaq(etap, mahalle)}
      />

      <CtaBanner
        className="mt-14"
        baslik={`Eryaman ${etap.no}. Etap'ta Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
      </CtaBanner>

      {digerEtaplar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">{mahalle.isim}&apos;ndeki Diğer Etaplar</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {digerEtaplar.map((item) => (
              <Link
                key={item.no}
                href={`/mahalleler/${mahalle.slug}/etaplar/${item.no}`}
                className="cursor-pointer rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
              >
                {item.no}. Etap
              </Link>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(etapJsonLd) }}
      />
    </div>
  );
}
