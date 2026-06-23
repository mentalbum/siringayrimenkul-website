import { getAllBlogPosts, getAllMahalleler } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { CtaButton } from "@/components/ui/button";
import { HeroIllustration } from "@/components/home/hero-illustration";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { BlogCard } from "@/components/blog/blog-card";
import {
  BuildingIcon,
  CheckBadgeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";

const ozellikler = [
  {
    icon: MapPinIcon,
    baslik: "Yerel Uzmanlık",
    aciklama: "Eryaman'daki her mahalleyi, her site ve rezidansı yakından tanıyoruz.",
  },
  {
    icon: BuildingIcon,
    baslik: "Mahalle Mahalle Rehber",
    aciklama: "Genel bir ilan listesi değil; her mahalle ve sitenin kendi detaylı sayfası.",
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

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Eryaman · Etimesgut &amp; Yenimahalle
            </p>
            <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
              Eryaman&apos;da Mahallenizi, Sitenizi Tanıyın
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-body">
              Şirin Gayrimenkul, Eryaman bölgesindeki mahalleleri ve içindeki site/rezidansları
              tek tek tanıtan yerel bir emlak rehberi sunuyor. Güncel ilanlarımıza ise doğrudan
              sahibinden.com üzerinden ulaşabilirsiniz.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaButton href="/mahalleler" variant="primary">
                Mahalleleri İncele
              </CtaButton>
              <CtaButton href={siteConfig.sahibindenUrl} external variant="outline">
                İlanlarımı Gör
              </CtaButton>
            </div>
          </div>
          <div className="mx-auto h-72 w-72 sm:h-96 sm:w-96">
            <HeroIllustration />
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ozellikler.map((ozellik) => (
              <div key={ozellik.baslik} className="rounded-2xl bg-surface p-5">
                <ozellik.icon className="h-7 w-7 text-gold-dark" />
                <h3 className="mt-3 text-base">{ozellik.baslik}</h3>
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

      {sonYazilar.length > 0 && (
        <section className="bg-surface-muted py-16">
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

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-navy px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl text-white sm:text-3xl">
            Eryaman&apos;da Doğru Mahalleyi Bulmaya Hazır mısınız?
          </h2>
          <p className="max-w-xl text-sm text-white/75">
            Sorularınız için bize doğrudan ulaşın veya güncel ilanlarımızı sahibinden.com
            üzerinden inceleyin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CtaButton href="/iletisim" variant="primary">
              Bize Ulaşın
            </CtaButton>
            <CtaButton
              href={siteConfig.sahibindenUrl}
              external
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-navy"
            >
              İlanlarımı Gör
            </CtaButton>
          </div>
        </div>
      </section>
    </div>
  );
}
