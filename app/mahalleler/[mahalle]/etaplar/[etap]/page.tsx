import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllEtaplar,
  getAllMahalleler,
  getEtapByNo,
  getMahalleBySlug,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
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
    title: `Eryaman ${etap.no}. Etap — ${mahalle.isim}`,
    description: `Eryaman ${etap.no}. Etap bölgesinde, ${mahalle.isim} içinde yer alan ${etap.siteler.length} site/rezidans ve ${etap.adalar.length} ada.`,
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
              key={`${ada.no}-${ada.site.slug}`}
              href={`/mahalleler/${mahalle.slug}/adalar/${ada.no}`}
              title={ada.site.isim}
              className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
            >
              {ada.no}
            </Link>
          ))}
        </div>
      </section>

      <FaqSection
        title={`Eryaman ${etap.no}. Etap Hakkında Sık Sorulan Sorular`}
        items={getEtapFaq(etap, mahalle)}
      />

      <div className="mt-14 rounded-2xl bg-navy px-6 py-8 text-center text-white sm:px-10">
        <h2 className="text-xl text-white">Eryaman {etap.no}. Etap&apos;ta Ev mi Arıyorsunuz?</h2>
        <p className="mt-2 text-sm text-white/75">
          Güncel ilanlarımıza sahibinden.com üzerinden ulaşabilirsiniz.
        </p>
        <CtaButton href={siteConfig.sahibindenUrl} external variant="primary" className="mt-5">
          İlanlarımı Gör
        </CtaButton>
      </div>

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
