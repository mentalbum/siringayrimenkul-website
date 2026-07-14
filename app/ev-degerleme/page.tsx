import type { Metadata } from "next";
import Link from "next/link";
import { getAllMahalleler, getYayindaMahalleler, getSitelerByMahalle } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqSection } from "@/components/ui/faq-section";
import { ReviewBadge } from "@/components/ui/review-badge";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { BuildingIcon, CheckBadgeIcon, MapPinIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Eryaman Ev Değerleme — Evinizi Doğru Fiyatla Satın veya Kiraya Verin",
  description:
    "Evinizi satmayı veya kiraya vermeyi düşünüyorsanız fiyatı birlikte belirleyelim. Mahallenizi ve sitenizi yakından tanıyan Şirin Gayrimenkul'den gerçekçi fiyat analizi ve satış yol haritası.",
  alternates: { canonical: "/ev-degerleme" },
};

const adimlar = [
  {
    baslik: "Bize Ulaşın",
    aciklama:
      "Aşağıdaki formu doldurun ya da doğrudan arayın. Evinizin mahallesini, sitesini ve temel bilgilerini paylaşmanız yeterli.",
  },
  {
    baslik: "Yerinde veya Uzaktan Analiz",
    aciklama:
      "Evinizi, bulunduğu siteyi ve mahalledeki güncel emsalleri birlikte değerlendiriyoruz. Dilerseniz yerinde inceleme için randevu oluşturuyoruz.",
  },
  {
    baslik: "Gerçekçi Fiyat ve Yol Haritası",
    aciklama:
      "Satış veya kiralama için gerçekçi bir fiyat aralığı ve süreç önerisi sunuyoruz. Fiyatta birlikte karar verdiğimizde ilan, gösterim ve tapu dahil süreci uçtan uca biz yönetiyoruz.",
  },
];

export default function EvDegerlemePage() {
  const mahalleler = getAllMahalleler().map((mahalle) => ({
    slug: mahalle.slug,
    isim: mahalle.isim,
  }));

  // Site-farkında değerleme: tüm sitelerin ince listesi (isim+slug) forma
  // gider; site sayfalarından gelen ?mahalle=&site= parametreleri formu
  // önceden doldurur.
  const siteler = getAllMahalleler().flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      slug: site.slug,
      isim: site.isim,
      mahalleSlug: mahalle.slug,
    }))
  );

  const toplamSite = getYayindaMahalleler().reduce(
    (sum, mahalle) => sum + getSitelerByMahalle(mahalle.slug).length,
    0
  );

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ev Değerleme ve Satış Danışmanlığı",
    serviceType: "Gayrimenkul değerleme ve satış/kiralama danışmanlığı",
    description:
      "Eryaman bölgesinde satış veya kiralama öncesi fiyat analizi — mahalle ve site bazlı emsal karşılaştırması ve uçtan uca süreç yönetimiyle.",
    url: `${siteConfig.url}/ev-degerleme`,
    provider: organizationRef,
    areaServed: { "@type": "Place", name: "Eryaman, Etimesgut, Ankara" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Ev Değerleme", href: "/ev-degerleme" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Satışın ve Kiralamanın İlk Adımı
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman&apos;da Ev Değerleme</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          &quot;Evim ne kadar eder?&quot; sorusunun cevabı, ilan sitelerindeki fiyatlardan değil;
          mahallenizi, sitenizi ve güncel emsalleri yakından takip eden yerel bir gözden geçer.
          Eryaman&apos;ın 11 mahallesini ve içlerindeki {toplamSite}+ site/rezidansı tek tek
          tanıyoruz. Değerlemeyi, evini satmayı veya kiraya vermeyi düşünen ev sahipleri için
          yapıyoruz: görüşmenin sonunda elinizde gerçekçi bir fiyat aralığıyla birlikte satış ya
          da kiralama yol haritanız da olur.
        </p>
        <ReviewBadge className="mt-4" />
        <p className="mt-4 text-sm leading-relaxed text-body">
          Karar aşamasındaysanız{" "}
          <Link
            href="/araclar"
            className="font-semibold text-gold-dark underline-offset-2 hover:underline"
          >
            ev sahibi hesap araçlarımıza
          </Link>{" "}
          da göz atın: kira artışı, tapu harcı, yasal komisyon ve boş kalma maliyeti.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl">Nasıl Çalışıyor?</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {adimlar.map((adim, index) => (
            <div key={adim.baslik} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 font-heading text-lg font-semibold text-gold-dark">
                {index + 1}
              </div>
              <h3 className="mt-4 text-base">{adim.baslik}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <h2 className="text-xl">Neden Şirin Gayrimenkul?</h2>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <MapPinIcon className="h-5 w-5 shrink-0 text-gold-dark" />
            <p className="text-sm leading-relaxed text-body">
              <strong className="text-navy">Mahalle mahalle, site site tanıyoruz.</strong>{" "}
              Değerleme genel bir hesap değil; evinizin bulunduğu sitenin ve mahallenin kendi
              dinamiğine göre yapılır.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <BuildingIcon className="h-5 w-5 shrink-0 text-gold-dark" />
            <p className="text-sm leading-relaxed text-body">
              <strong className="text-navy">Güncel emsallerle çalışıyoruz.</strong> Bölgedeki
              satılık ve kiralık hareketliliği günlük takip ettiğimiz için fiyat önerimiz piyasanın
              gerçeğini yansıtır.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <CheckBadgeIcon className="h-5 w-5 shrink-0 text-gold-dark" />
            <p className="text-sm leading-relaxed text-body">
              <strong className="text-navy">Değerlemeden tapuya tek muhatap.</strong> Fiyat
              analiziyle yetinmiyoruz; evinizi bize emanet ettiğinizde ilan, gösterim, pazarlık ve
              tapu dahil tüm süreci sizin adınıza biz yönetiyoruz.
            </p>
          </div>
          <p className="text-sm text-muted">
            Formu doldurmak yerine doğrudan görüşmek isterseniz:{" "}
            <TrackedCtaLink
              href={`tel:${siteConfig.phoneTel}`}
              gaEvent="phone_click"
              variant="ghost"
              className="px-0 text-gold-dark"
            >
              {siteConfig.phoneDisplay}
            </TrackedCtaLink>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl">Değerleme Talebi Oluşturun</h2>
          <p className="mt-1.5 text-sm text-muted">
            Bilgileriniz WhatsApp üzerinden bize iletilir; en kısa sürede dönüş yaparız.
          </p>
          <div className="mt-6">
            <ContactForm mahalleler={mahalleler} siteler={siteler} />
          </div>
        </div>
      </section>

      <FaqSection
        title="Ev Değerleme Hakkında Sık Sorulan Sorular"
        items={[
          {
            soru: "Ev değerleme için ücret ödüyor muyum?",
            cevap:
              "Değerleme için ücret almıyoruz. Bu analizi, evini satmayı veya kiraya vermeyi düşünen ev sahipleri için satış sürecinin ilk adımı olarak yapıyoruz — fiyatla birlikte yol haritasını da aynı görüşmede netleştiriyoruz.",
          },
          {
            soru: "Değerleme nasıl yapılıyor?",
            cevap:
              "Evinizin metrekaresi, oda sayısı, katı ve durumu ile birlikte; bulunduğu sitenin ve mahallenin güncel satılık/kiralık emsalleri karşılaştırılır. Dilerseniz yerinde inceleme ile değerlendirme netleştirilir.",
          },
          {
            soru: "Sonucu ne kadar sürede öğrenirim?",
            cevap:
              "Temel bilgileri paylaştıktan sonra genellikle aynı gün içinde ön değerlendirme yapıyoruz. Yerinde inceleme gerekiyorsa randevuya göre birkaç gün içinde net fiyat aralığını iletiyoruz.",
          },
          {
            soru: "Eryaman dışındaki evler için de değerleme yapıyor musunuz?",
            cevap:
              "Odak bölgemiz Eryaman'ın 11 mahallesidir. Bölge dışındaki talepler için yine de bize ulaşabilirsiniz; yardımcı olamayacaksak doğru yönlendirmeyi yaparız.",
          },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </div>
  );
}
