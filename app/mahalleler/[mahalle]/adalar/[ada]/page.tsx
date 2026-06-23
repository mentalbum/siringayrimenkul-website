import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdaByNo,
  getAllAdalar,
  getAllMahalleler,
  getMahalleBySlug,
  getSiteBoundary,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { ArrowRightIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

type Props = {
  params: Promise<{ mahalle: string; ada: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getAllAdalar(mahalle.slug).map((ada) => ({
      mahalle: mahalle.slug,
      ada: ada.no,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, ada: adaNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const ada = getAdaByNo(mahalleSlug, adaNo);
  if (!mahalle || !ada) return {};

  return {
    title: `${ada.no} Ada (${ada.site.isim}) — ${mahalle.isim}`,
    description: `${ada.no} Ada, ${mahalle.isim} içinde yer alan ${ada.site.isim}'nin bir parçasıdır.`,
  };
}

export default async function AdaPage({ params }: Props) {
  const { mahalle: mahalleSlug, ada: adaNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const ada = getAdaByNo(mahalleSlug, adaNo);
  if (!mahalle || !ada) notFound();

  const tumAdalar = getAllAdalar(mahalleSlug);
  const ayniEtaptakiler = tumAdalar.filter(
    (item) => item.etap === ada.etap && item.no !== ada.no
  );
  const sinir = getSiteBoundary(ada.site);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
          { label: `${ada.no} Ada`, href: `/mahalleler/${mahalle.slug}/adalar/${ada.no}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.isim}
          {ada.etap ? ` · Eryaman ${ada.etap}. Etap` : ""}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{ada.no} Ada</h1>
      </header>

      <div className={`mt-8 grid gap-8 ${ada.site.koordinat ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-body">
            {ada.no} Ada, {mahalle.isim} içinde yer alan{" "}
            <Link
              href={`/mahalleler/${mahalle.slug}/${ada.site.slug}`}
              className="font-semibold text-navy hover:text-gold-dark"
            >
              {ada.site.isim}
            </Link>
            &apos;nin bir parçasıdır
            {ada.blok ? ` (${ada.blok} Blok)` : ""}.
          </p>
          {!ada.site.koordinat && (
            <CtaButton href={`/mahalleler/${mahalle.slug}`} variant="outline">
              {mahalle.isim} Haritasını Görüntüle
            </CtaButton>
          )}
        </div>
        {ada.site.koordinat && (
          <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
            <MahalleMapLoader
              center={ada.site.koordinat}
              boundary={sinir}
              siteler={[ada.site]}
            />
          </div>
        )}
      </div>

      <div className="mt-12 rounded-2xl bg-navy px-6 py-8 text-center text-white sm:px-10">
        <h2 className="text-xl text-white">{ada.no} Ada Hakkında Bilgi mi İstiyorsunuz?</h2>
        <p className="mt-2 text-sm text-white/75">
          Bu adadaki güncel ilanlarımıza sahibinden.com üzerinden ulaşabilirsiniz.
        </p>
        <CtaButton href={siteConfig.sahibindenUrl} external variant="primary" className="mt-5">
          İlanlarımı Gör
        </CtaButton>
      </div>

      {ayniEtaptakiler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">
            Eryaman {ada.etap}. Etap&apos;taki Diğer Adalar
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ayniEtaptakiler.map((item) => (
              <Link
                key={`${item.no}-${item.site.slug}`}
                href={`/mahalleler/${mahalle.slug}/adalar/${item.no}`}
                className="group flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">{item.no} Ada</p>
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
