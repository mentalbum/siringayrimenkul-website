import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllBlogPosts,
  getAllMahalleler,
  getSitelerByMahalle,
  getYayindaMahalleler,
} from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { ReviewBadge } from "@/components/ui/review-badge";
import { ReviewQuotes } from "@/components/home/review-quotes";
import { HeroSearch } from "@/components/home/hero-search";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { BlogCard } from "@/components/blog/blog-card";
import { FaqSection } from "@/components/ui/faq-section";
import {
  BuildingIcon,
  CheckBadgeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const ozellikler = [
  {
    icon: MapPinIcon,
    baslik: "Mahalle Mahalle Keşfedin",
    aciklama: "Eryaman'daki mahalleleri ve içlerindeki siteleri tek tek inceleyin, size en uygun bölgeyi kendiniz görün.",
  },
  {
    icon: BuildingIcon,
    baslik: "Evinizi Değerlendirin",
    aciklama: "Satmak ya da kiraya vermek istediğiniz mülkünüz için doğrudan bizimle iletişime geçin.",
  },
  {
    icon: PhoneIcon,
    baslik: "Doğrudan İletişim",
    aciklama: "Aracısız, doğrudan bizimle görüşün; telefon veya WhatsApp ile hızlı dönüş alın.",
  },
  {
    icon: CheckBadgeIcon,
    baslik: "Güncel İlanlar",
    aciklama: "Güncel ilanlarımıza sahibinden.com üzerindeki mağazamızdan anında ulaşın.",
  },
];

export default function HomePage() {
  const mahalleler = getAllMahalleler();
  const oneCikanMahalleler = [
    ...mahalleler.filter((mahalle) => mahalle.durum === "yayinda"),
    ...mahalleler.filter((mahalle) => mahalle.durum === "yakinda"),
  ].slice(0, 3);
  const sonYazilar = getAllBlogPosts().slice(0, 3);

  const siteGruplari = getYayindaMahalleler()
    .map((mahalle) => ({ mahalle, siteler: getSitelerByMahalle(mahalle.slug) }))
    .filter((grup) => grup.siteler.length > 0);
  const toplamSite = siteGruplari.reduce((sum, grup) => sum + grup.siteler.length, 0);
  const mahalleSayisi = siteGruplari.length;

  return (
    <div>
      <section className="relative overflow-hidden bg-navy">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <g transform="rotate(-18 600 250)">
            {Array.from({ length: 7 }).map((_, i) => {
              const r = 70 + i * 48;
              return (
                <ellipse
                  key={i}
                  cx={600}
                  cy={250}
                  rx={r}
                  ry={r * 0.82}
                  fill="none"
                  stroke="#FBCA12"
                  strokeWidth={1}
                  strokeOpacity={0.46 - i * 0.055}
                />
              );
            })}
          </g>
          <circle cx={600} cy={250} r={16} fill="#FBCA12" fillOpacity={0.22} />
          <circle cx={600} cy={250} r={5} fill="#FBCA12" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/55" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">
              Eryaman · Etimesgut
            </p>
            <h1 className="mt-3 text-4xl leading-tight text-white sm:text-5xl">
              Eryaman&apos;da Emlağın Adresi
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
              Eryaman&apos;ı mahalle mahalle, site site biliyoruz. Sitenizi arayın; satmak veya
              kiraya vermek istediğiniz evinizi ücretsiz değerlendirelim.
            </p>

            <div className="mt-8 max-w-xl">
              <HeroSearch />
              <p className="mt-3 text-xs text-white/55">
                {toplamSite}+ site/rezidans · {mahalleSayisi} mahalle arasından bulun · veya{" "}
                <Link href="/mahalleler" className="font-semibold text-gold hover:underline">
                  tüm mahalleleri keşfedin →
                </Link>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <CtaButton href="/ev-degerleme" variant="primary">
                Evinizi Ücretsiz Değerletin
              </CtaButton>
              <ReviewBadge variant="dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="sr-only">Neden Şirin Gayrimenkul?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ozellikler.map((ozellik) => (
              <div
                key={ozellik.baslik}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
                  <ozellik.icon className="h-6 w-6 text-gold-dark" />
                </div>
                <h3 className="mt-4 text-base">{ozellik.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{ozellik.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Bölge Rehberi
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Öne Çıkan Mahalleler</h2>
          </div>
          <CtaButton href="/mahalleler" variant="ghost" className="px-0">
            Tüm Mahalleler →
          </CtaButton>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {oneCikanMahalleler.map((mahalle) => (
            <MahalleCard key={mahalle.slug} mahalle={mahalle} />
          ))}
        </div>
      </section>

      <ReviewQuotes />

      {sonYazilar.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                  Blog
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl">Son Yazılar</h2>
              </div>
              <CtaButton href="/blog" variant="ghost" className="px-0">
                Tüm Yazılar →
              </CtaButton>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sonYazilar.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pb-4 pt-8 sm:px-6">
        <FaqSection
          title="Sık Sorulan Sorular"
          className="mt-0"
          items={[
            {
              soru: "Şirin Gayrimenkul hangi bölgelerde hizmet veriyor?",
              cevap: `Eryaman bölgesindeki 11 mahallenin tamamında hizmet veriyoruz: Altay, Tunahan, Göksu, Şehit Osman Avcı, Güzelkent ve diğer Eryaman mahallelerindeki site ve rezidansları yakından tanıyoruz.`,
            },
            {
              soru: "Evimi satmak veya kiraya vermek için ne yapmalıyım?",
              cevap: `${siteConfig.phoneDisplay} numaralı telefonumuzdan ya da WhatsApp üzerinden bize ulaşmanız yeterli. Değerlendirme görüşmesi için ek bir ücret almıyoruz; evinizin bulunduğu mahalle ve site hakkında size doğrudan bilgi veriyoruz.`,
            },
            {
              soru: "Bu sitede ilan var mı?",
              cevap: `Güncel satılık ve kiralık ilanlarımız sahibinden.com üzerindeki mağazamızda yer alıyor. Bu web sitesi ilan platformu değil; mahalle rehberi ve iletişim kanalı olarak tasarlandı. Mahallenizi veya sitenizi seçerek bize ulaşabilirsiniz.`,
            },
            {
              soru: "Eryaman'da hangi siteleri tanıyorsunuz?",
              cevap: `Eryaman genelinde 500'den fazla site ve rezidansı kayıt altında tutuyoruz. Web sitemizdeki "Siteler" bölümünden tüm listeyi mahalle mahalle görebilir, arama kutusunu kullanarak aradığınız siteye kolayca ulaşabilirsiniz.`,
            },
          ]}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CtaBanner
          size="large"
          baslik="Eryaman'da Bir Sonraki Adımınızı Birlikte Atalım"
          aciklama="Ev arıyor olun ya da evinizi değerlendirmek isteyin, doğrudan bize ulaşın."
        >
          <CtaButton href="/iletisim" variant="primary">
            Bize Ulaşın
          </CtaButton>
          <CtaButton href={siteConfig.sahibindenUrl} external variant="outline-light">
            İlanlarımı Gör
          </CtaButton>
        </CtaBanner>
      </section>
    </div>
  );
}
