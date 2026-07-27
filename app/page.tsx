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
import { HeroSearch } from "@/components/home/hero-search";
import { MahalleCard } from "@/components/mahalle/mahalle-card";
import { BlogCard } from "@/components/blog/blog-card";
import { FaqSection } from "@/components/ui/faq-section";
import { Reveal } from "@/components/ui/reveal";
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
    aciklama:
      "Eryaman'ın her mahallesi ve 700'den fazla sitesi için tek tek hazırlanmış rehberler: bloklar, adalar, ulaşım ve yaşam. Bölgenizi tapu kayıtlarına dayanan haritalarla inceleyin.",
    href: "/mahalleler",
    linkYazisi: "Mahalle rehberlerine git",
  },
  {
    icon: BuildingIcon,
    baslik: "Evinizi Değerlendirin",
    aciklama:
      "Satmadan ya da kiraya vermeden önce evinizin gerçek değerini öğrenin: sitenizdeki emsallere dayanan değerlendirme ve net bir yol haritası — aynı gün dönüş.",
    href: "/ev-degerleme",
    linkYazisi: "Değerleme talebi bırakın",
  },
  {
    icon: PhoneIcon,
    baslik: "Doğrudan İletişim",
    aciklama:
      "Çağrı merkezi yok, aracı yok: telefonda ya da WhatsApp'ta doğrudan danışmanınızla konuşursunuz. Sorunuzu yazın, aynı gün dönüş alın.",
    href: "/iletisim",
    linkYazisi: "Bize ulaşın",
  },
  {
    icon: CheckBadgeIcon,
    baslik: "Güncel İlanlar",
    aciklama:
      "Satılık ve kiralık portföyümüzün tamamı sahibinden.com mağazamızda — her ilanın arkasında, o siteyi blok blok tanıyan bir ekip var.",
    href: siteConfig.sahibindenUrl,
    linkYazisi: "İlanları görüntüleyin",
    dis: true,
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
  // Tapu (TKGM) sınırıyla haritalanmış site sayısı — ofisin somut farkı.
  const haritaliSite = siteGruplari.reduce(
    (sum, grup) => sum + grup.siteler.filter((site) => site.sinirGeoJSON).length,
    0
  );

  return (
    <div>
      <section className="relative overflow-hidden bg-navy">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid slice"
          className="animate-drift absolute inset-0 h-full w-full"
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
          <circle
            cx={600}
            cy={250}
            r={16}
            fill="#FBCA12"
            fillOpacity={0.22}
            className="animate-pulse-soft"
          />
          <circle cx={600} cy={250} r={5} fill="#FBCA12" />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/55" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-6 sm:pb-14 sm:pt-28">
          <div className="max-w-2xl">
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-wide text-gold">
              Şirin Gayrimenkul · Etimesgut
            </p>
            <h1 className="animate-fade-up mt-3 text-4xl leading-tight text-white [animation-delay:0.07s] sm:text-5xl">
              Eryaman&apos;ın Emlakçısı
            </h1>
            <p className="animate-fade-up mt-5 max-w-lg text-base leading-relaxed text-white/75 [animation-delay:0.14s]">
              Satmak veya kiraya vermek istediğiniz eviniz mi var? Fiyatı, {mahalleSayisi}{" "}
              mahalleyi site site tanıyan yerel emlakçınızla birlikte belirleyin — fiyatla
              birlikte satış yol haritanız da hazır olsun.
            </p>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-5 gap-y-4 [animation-delay:0.21s]">
              <CtaButton href="/ev-degerleme" variant="primary" className="px-8 text-base">
                Evinizi Değerlendirelim
              </CtaButton>
              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-200 hover:text-gold"
              >
                <PhoneIcon className="h-4 w-4" />
                {siteConfig.phoneDisplay}
              </a>
            </div>
            <div className="animate-fade-up mt-5 [animation-delay:0.28s]">
              <ReviewBadge variant="dark" />
            </div>

            <div className="animate-fade-up mt-10 max-w-xl [animation-delay:0.35s]">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/55">
                Sitenizi mi merak ediyorsunuz?
              </p>
              <HeroSearch />
              <p className="mt-3 text-xs text-white/55">
                {toplamSite}+ site/rezidans · {mahalleSayisi} mahalle arasından bulun · veya{" "}
                <Link href="/mahalleler" className="font-semibold text-gold hover:underline">
                  tüm mahalleleri keşfedin →
                </Link>
              </p>
            </div>
          </div>

          <dl className="animate-fade-up mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-7 [animation-delay:0.42s]">
            <div>
              <dd className="text-2xl font-semibold tabular-nums text-gold">{toplamSite}+</dd>
              <dt className="mt-0.5 text-xs font-medium text-white/60">Site &amp; Rezidans</dt>
            </div>
            <div>
              <dd className="text-2xl font-semibold tabular-nums text-gold">{mahalleSayisi}</dd>
              <dt className="mt-0.5 text-xs font-medium text-white/60">Mahalle Rehberi</dt>
            </div>
            <div>
              <dd className="text-2xl font-semibold tabular-nums text-gold">{haritaliSite}+</dd>
              <dt className="mt-0.5 text-xs font-medium text-white/60">
                Tapu Sınırıyla Haritalı Site
              </dt>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
            Ofisimiz
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl">Eryaman&apos;da Yerel Emlak Ofisiniz</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Ofisimiz Tunahan Mahallesi&apos;nde, 4. Etap Çarşı&apos;da. Eryaman&apos;da{" "}
            <Link href="/eryamanda-ev-satmak" className="font-semibold text-gold-dark hover:underline">
              ev satış
            </Link>{" "}
            ve{" "}
            <Link href="/eryamanda-ev-kiraya-vermek" className="font-semibold text-gold-dark hover:underline">
              kiralama danışmanlığı
            </Link>{" "}
            yapıyor,{" "}
            <Link href="/ev-degerleme" className="font-semibold text-gold-dark hover:underline">
              satış öncesi ev değerleme
            </Link>{" "}
            hizmeti sunuyoruz; talep eden müşterilerimiz için 3D sanal tur da çekiyoruz. Güncel
            ilanlarımız{" "}
            <a
              href={siteConfig.sahibindenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold-dark hover:underline"
            >
              sahibinden.com mağazamızda
            </a>
            . (Taşınmaz Ticareti Yetki Belgesi No: 0603771)
          </p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Hizmet bölgemiz Eryaman&apos;ın tamamı:{" "}
            {mahalleler.map((mahalle, index) => (
              <span key={mahalle.slug}>
                <Link
                  href={`/mahalleler/${mahalle.slug}`}
                  className="font-medium text-navy hover:text-gold-dark hover:underline"
                >
                  {mahalle.isim.replace(/\s*Mahallesi$/, "")}
                </Link>
                {index < mahalleler.length - 2 ? ", " : index === mahalleler.length - 2 ? " ve " : ""}
              </span>
            ))}{" "}
            mahallelerindeki {toplamSite}&apos;den fazla site ve rezidansı tek tek tanıyoruz.
          </p>
        </Reveal>
      </section>

      <section className="bg-surface-muted py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Neden Biz
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Neden Şirin Gayrimenkul?</h2>
          </Reveal>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ozellikler.map((ozellik, i) => {
              const kartIcerik = (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
                    <ozellik.icon className="h-6 w-6 text-gold-dark" />
                  </div>
                  <h3 className="mt-4 text-base">{ozellik.baslik}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">{ozellik.aciklama}</p>
                  <p className="mt-auto pt-4 text-sm font-semibold text-gold-dark">
                    {ozellik.linkYazisi} →
                  </p>
                </>
              );
              const kartSinif =
                "flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-navy/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
              return (
                <Reveal key={ozellik.baslik} delay={i * 70} className="h-full">
                  {ozellik.dis ? (
                    <a
                      href={ozellik.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={kartSinif}
                    >
                      {kartIcerik}
                    </a>
                  ) : (
                    <Link href={ozellik.href} className={kartSinif}>
                      {kartIcerik}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
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
        </Reveal>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {oneCikanMahalleler.map((mahalle, i) => (
            <Reveal key={mahalle.slug} delay={i * 70} className="h-full">
              <MahalleCard mahalle={mahalle} />
            </Reveal>
          ))}
        </div>
      </section>

      {sonYazilar.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
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
            </Reveal>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sonYazilar.map((post, i) => (
                <Reveal key={post.slug} delay={i * 70} className="h-full">
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pb-4 pt-8 sm:px-6">
        <Reveal>
          <FaqSection
          title="Sık Sorulan Sorular"
          className="mt-0"
          items={[
            {
              soru: "Eryaman'da hangi emlak hizmetlerini veriyorsunuz?",
              cevap:
                "Satılık ve kiralık konut danışmanlığı, satış öncesi ev değerleme ve talep eden müşterilerimiz için 3D sanal tur çekimi sunuyoruz. Güncel ilanlarımız sahibinden.com üzerindeki mağazamızda yayınlanır; süreç boyunca doğrudan bizimle çalışırsınız.",
            },
            {
              soru: "Şirin Gayrimenkul hangi bölgelerde hizmet veriyor?",
              cevap: `Eryaman bölgesindeki 11 mahallenin tamamında hizmet veriyoruz: Altay, Tunahan, Göksu, Şehit Osman Avcı, Güzelkent ve diğer Eryaman mahallelerindeki site ve rezidansları yakından tanıyoruz. Ayrıca bölgeyle iç içe yaşayan komşu Yenimahalle mahallelerinde — Ata, Susuz ve Cumhuriyet — de hizmet veriyoruz.`,
            },
            {
              soru: "Evimi satmak veya kiraya vermek için ne yapmalıyım?",
              cevap: `${siteConfig.phoneDisplay} numaralı telefonumuzdan ya da WhatsApp üzerinden bize ulaşmanız yeterli. Değerlendirme görüşmesi için ek bir ücret almıyoruz; evinizin bulunduğu mahalle ve site hakkında size doğrudan bilgi veriyoruz.`,
            },
            {
              soru: "Evimi satsam mı, kiraya mı versem?",
              cevap:
                "Bu sorunun cevabı evin değil, sizin durumunuzun içindedir: paraya ne zaman ihtiyacınız olduğu, evi ileride kullanma ihtimaliniz, verginin durumu (konutu edinmenizden bu yana beş yıl geçti mi) ve bakım yükünü taşıyıp taşıyamayacağınız. İki işi de yaptığımız için sizi bir yöne itmek gibi bir çıkarımız yok; en pratik yol iki rakamı da öğrenmektir — dairenizin bugünkü satış değeri ve bugünkü kira değeri yan yana geldiğinde karar çoğu zaman kendiliğinden netleşir.",
            },
            {
              soru: "Bu sitede ilan var mı?",
              cevap: `Güncel satılık ve kiralık ilanlarımız sahibinden.com üzerindeki mağazamızda yer alıyor. Bu web sitesi ilan platformu değil; mahalle rehberi ve iletişim kanalı olarak tasarlandı. Mahallenizi veya sitenizi seçerek bize ulaşabilirsiniz.`,
            },
            {
              soru: "Eryaman'da hangi siteleri tanıyorsunuz?",
              cevap: `Eryaman genelinde 700'den fazla site ve rezidansı kayıt altında tutuyoruz. Web sitemizdeki "Siteler" bölümünden tüm listeyi mahalle mahalle görebilir, arama kutusunu kullanarak aradığınız siteye kolayca ulaşabilirsiniz.`,
            },
          ]}
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <CtaBanner
            size="large"
            baslik="Eryaman'da Bir Sonraki Adımınızı Birlikte Atalım"
            aciklama="Ev arıyor olun ya da evinizi değerlendirmek isteyin, doğrudan bize ulaşın."
          >
            <CtaButton href="/iletisim" variant="primary">
              Bize Ulaşın
            </CtaButton>
            <CtaButton href={siteConfig.sahibindenUrl} external variant="outline-light">
              İlanlarımız
            </CtaButton>
          </CtaBanner>
        </Reveal>
      </section>
    </div>
  );
}
