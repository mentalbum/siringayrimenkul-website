import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { BuildingIcon, CheckBadgeIcon, CubeIcon, MapPinIcon, UserIcon } from "@/components/ui/icons";
import { ReviewBadge } from "@/components/ui/review-badge";

const ekip = [
  { isim: "Hamza Şirin", unvan: "Kurucu" },
  { isim: "Özgün Şirin", unvan: "Emlak Danışmanı" },
];

const YETKI_BELGESI_NO = "0603771";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${siteConfig.name}, Eryaman bölgesinde yerel emlak rehberliği yapan bir gayrimenkul ofisidir.`,
  alternates: { canonical: "/hakkimizda" },
};

const adimlar = [
  {
    icon: MapPinIcon,
    baslik: "Mahalle Mahalle Tanıyoruz",
    aciklama:
      "Eryaman bölgesindeki her mahalleyi; ulaşımı, yaşam koşulları ve site/rezidans çeşitliliğiyle birlikte detaylı şekilde rehberleştiriyoruz.",
  },
  {
    icon: CheckBadgeIcon,
    baslik: "Doğrudan ve Şeffaf İletişim",
    aciklama:
      "Sorularınızı aracısız, doğrudan bizimle paylaşın; telefon veya WhatsApp üzerinden hızlı dönüş alın.",
  },
  {
    icon: BuildingIcon,
    baslik: "Güncel İlanlar sahibinden.com'da",
    aciklama:
      "Sitemiz bir ilan panosu değil, bölge rehberidir. Güncel satılık/kiralık ilanlarımızı sahibinden.com üzerindeki mağazamızdan takip edebilirsiniz.",
  },
  {
    icon: CubeIcon,
    baslik: "Profesyonel Sanal Tur Hizmeti",
    aciklama:
      "Talep eden müşterilerimiz için 3D sanal tur çekimi de sunuyoruz; bir örneğini aşağıdan inceleyebilirsiniz.",
    link: { href: "https://my.matterport.com/models/uUjuZULQtzJ", label: "Örnek Turu İncele" },
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `Hakkımızda | ${siteConfig.name}`,
  url: `${siteConfig.url}/hakkimizda`,
  inLanguage: "tr-TR",
  mainEntity: organizationRef,
};

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Hakkımızda", href: "/hakkimizda" }]} />

      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Hakkımızda
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{siteConfig.name}</h1>
        <ReviewBadge className="mt-3" />
        <p className="mt-5 text-base leading-relaxed text-body">
          {siteConfig.name}, Ankara&apos;nın Eryaman bölgesinde (Etimesgut ilçe sınırları
          içinde) faaliyet gösteren yerel bir gayrimenkul ofisidir. Ofisimiz Tunahan
          Mahallesi&apos;nde, 4. Etap Çarşı&apos;da yer alıyor — bölgeyi uzaktan değil, içinden
          takip ediyoruz.
        </p>
        <p className="mt-4 text-base leading-relaxed text-body">
          Bu sitede ilan yayınlamıyoruz — güncel satılık ve kiralık ilanlarımıza sahibinden.com
          üzerindeki mağazamızdan ulaşabilirsiniz. Burada bulacağınız şey, mahalle ve site bazlı
          rehber içerikler; evinizi satmak ya da kiraya vermek istiyorsanız da doğrudan bize
          ulaşabilirsiniz.
        </p>
        <p className="mt-4 text-xs text-muted">
          Taşınmaz Ticareti Yetki Belgesi No: {YETKI_BELGESI_NO}
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-xl">Ekibimiz</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {ekip.map((kisi) => (
            <div
              key={kisi.isim}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15">
                <UserIcon className="h-6 w-6 text-gold-dark" />
              </div>
              <div>
                <p className="text-base font-semibold text-navy">{kisi.isim}</p>
                <p className="text-sm text-muted">{kisi.unvan}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {adimlar.map((adim) => (
          <div key={adim.baslik} className="rounded-2xl border border-border bg-surface p-5">
            <adim.icon className="h-7 w-7 text-gold-dark" />
            <h2 className="mt-3 text-base">{adim.baslik}</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
            {adim.link && (
              <a
                href={adim.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block cursor-pointer text-sm font-semibold text-gold-dark hover:underline"
              >
                {adim.link.label} →
              </a>
            )}
          </div>
        ))}
      </div>

      <CtaBanner
        size="large"
        className="mt-12"
        baslik="Eryaman'ı Birlikte Keşfedelim"
        aciklama="Hizmet bölgemizdeki mahalleleri inceleyin veya doğrudan bizimle iletişime geçin."
      >
        <CtaButton href="/mahalleler" variant="primary">
          Mahalleleri İncele
        </CtaButton>
        <CtaButton href="/iletisim" variant="outline-light">
          İletişime Geçin
        </CtaButton>
      </CtaBanner>
    </div>
  );
}
