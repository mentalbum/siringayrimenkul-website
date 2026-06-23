import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllMahalleler,
  getMahalleBySlug,
  getSiteBySlug,
  getSitelerByMahalle,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { SiteCard } from "@/components/site/site-card";
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
    description: site.aciklama,
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-body">{site.aciklama}</p>
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
        </div>
        <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
          <MahalleMapLoader center={site.koordinat} siteler={[site]} />
        </div>
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
    </div>
  );
}
