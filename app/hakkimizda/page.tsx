import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { BuildingIcon, CheckBadgeIcon, MapPinIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${siteConfig.name}, Eryaman bölgesinde yerel emlak rehberliği yapan bir gayrimenkul ofisidir.`,
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
];

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Hakkımızda", href: "/hakkimizda" }]} />

      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Hakkımızda
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{siteConfig.name}</h1>
        <p className="mt-5 text-base leading-relaxed text-body">
          {siteConfig.name}, Ankara&apos;nın Eryaman bölgesinde (Etimesgut ve Yenimahalle ilçe
          sınırları içinde) faaliyet gösteren yerel bir gayrimenkul ofisidir. Ofisimiz Tunahan
          Mahallesi&apos;nde, 4. Etap Çarşı&apos;da yer alıyor — bölgeyi uzaktan değil, içinden
          takip ediyoruz.
        </p>
        <p className="mt-4 text-base leading-relaxed text-body">
          Bu sitede ilan yayınlamıyoruz — güncel satılık ve kiralık ilanlarımıza sahibinden.com
          üzerindeki mağazamızdan ulaşabilirsiniz. Burada bulacağınız şey, mahalle ve site bazlı
          rehber içerikler; evinizi satmak ya da kiraya vermek istiyorsanız da doğrudan bize
          ulaşabilirsiniz.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {adimlar.map((adim) => (
          <div key={adim.baslik} className="rounded-2xl border border-border bg-surface p-5">
            <adim.icon className="h-7 w-7 text-gold-dark" />
            <h2 className="mt-3 text-base">{adim.baslik}</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl bg-navy px-6 py-10 text-center text-white sm:px-12">
        <h2 className="text-2xl text-white">Eryaman&apos;ı Birlikte Keşfedelim</h2>
        <p className="max-w-xl text-sm text-white/75">
          Hizmet bölgemizdeki mahalleleri inceleyin veya doğrudan bizimle iletişime geçin.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <CtaButton href="/mahalleler" variant="primary">
            Mahalleleri İncele
          </CtaButton>
          <CtaButton
            href="/iletisim"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-navy"
          >
            İletişime Geçin
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
