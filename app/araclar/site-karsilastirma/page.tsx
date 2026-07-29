import type { Metadata } from "next";
import Link from "next/link";
import { SiteKarsilastirma } from "@/components/tools/site-karsilastirma";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { FaqSection } from "@/components/ui/faq-section";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { getAllMahalleler, getSitelerByMahalle } from "@/lib/content";
import type { FaqItem } from "@/lib/faq";
import { kunyeSatiri } from "@/lib/kunye";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";

/** Eryaman Site Karşılaştırma Aracı — "linkable asset". Fiyat/aidat bilinçli
 * yok (bayatlayan rakam yayınlanmaz); karşılaştırılan her alan TKGM tabanlı
 * kayıt metinlerinden deterministik çıkarılır (lib/kunye.ts). */

export const metadata: Metadata = {
  title: "Eryaman Site Karşılaştırma Aracı — Tapu Verisiyle Yan Yana",
  description:
    "Eryaman ve çevresindeki 700'den fazla siteyi tapu verisiyle karşılaştırın: tapu niteliği, parsel alanı, blok ve kat yapısı. Fiyat değil, bayatlamayan yapısal veriler — TKGM kayıtlarına dayalı.",
  alternates: { canonical: "/araclar/site-karsilastirma" },
};

const faqItems: FaqItem[] = [
  {
    soru: "Bu araçtaki bilgiler nereden geliyor?",
    cevap:
      "Her sitenin kayıt sayfasındaki bilgilerden — onlar da büyük ölçüde TKGM tapu kayıtlarına dayanır: tapu niteliği, parsel alanı ve tapu kaydının yapı tanımı (blok/kat). Kayıt metninde belirtilmeyen alan tabloda \"—\" görünür; tahmin yazmayız.",
  },
  {
    soru: "Neden fiyat karşılaştırması yok?",
    cevap:
      "Yayınlanan her fiyat rakamı kısa sürede bayatlar ve yanıltır. Fiyat; blok, kat, cephe ve dairenin iç durumuyla belirlenir — iki site arasındaki gerçek fiyat farkını ancak güncel emsallerle konuşabiliriz. Bu araç fiyat dışındaki kalıcı yapısal farkları gösterir; fiyat için değerleme görüşmesi yapıyoruz.",
  },
  {
    soru: "Donatı satırı boşsa sitede o imkân yok mu demek?",
    cevap:
      "Hayır. Donatı satırı yalnızca kayıt metnimizde adı geçen imkânları listeler; kayıtta geçmiyorsa \"—\" görünür. Sitede bulunup kayda girmemiş donatılar olabilir — bu yüzden yokluğu kanıt saymayız.",
  },
  {
    soru: "Karşılaştırdığım sitede dairem var; değeri nasıl öğrenirim?",
    cevap:
      "Yapısal veriler çerçeveyi çizer; kesin değer, sitenizdeki ve komşu sitelerdeki gerçekleşen satış ve kiralama emsalleriyle netleşir. Değerleme görüşmesinde dairenizin blok, kat ve cephesine göre gerçekçi bir aralık çıkarırız.",
    semaDisi: true,
  },
];

export default function SiteKarsilastirmaPage() {
  // Build sırasında bir kez hesaplanır; istemciye kompakt satırlar gider.
  const veri = getAllMahalleler().flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => kunyeSatiri(site, mahalle.isim))
  );

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Eryaman Site Karşılaştırma Aracı",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description:
      "Eryaman ve çevresindeki konut sitelerini tapu verisiyle karşılaştırma aracı: tapu niteliği, parsel alanı, blok ve kat yapısı.",
    url: `${siteConfig.url}/araclar/site-karsilastirma`,
    provider: organizationRef,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Ev Sahibi Araçları", href: "/araclar" },
          { label: "Site Karşılaştırma", href: "/araclar/site-karsilastirma" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Türkiye&apos;de Benzeri Olmayan Veri
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman Site Karşılaştırma Aracı</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman ve çevresindeki 700&apos;den fazla siteyi tek tek dolaşıp tapu kayıtlarıyla
          eşleştirdik. Bu araç o birikimi yan yana koyar: tapu niteliği, parsel alanı, blok ve kat
          yapısı — yani zamanla bayatlamayan, karar değiştiren veriler. İlan sitelerinde
          bulamayacağınız bir karşılaştırma.
        </p>
      </header>

      <section className="mt-8">
        <SiteKarsilastirma veri={veri} />
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl">Bu karşılaştırma neden tapu verisiyle yapılır?</h2>
        <p className="mt-3 text-sm leading-relaxed text-body">
          İlan başlıkları pazarlama diliyle yazılır; tapu kaydı ise yapının resmî tanımıdır. Kat
          mülkiyetine geçmiş bir site ile kat irtifakında kalmış bir site arasındaki fark, satış
          sürecinde somut sonuçlar doğurur. Parsel alanı ve blok yoğunluğu da sitenin yaşam
          dokusunu fiyat etiketi olmadan anlatır. Kayıtların nasıl derlendiğini{" "}
          <Link href="/hakkimizda#yontem" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
            içerik yöntemimiz
          </Link>{" "}
          sayfasında açıkladık; toplu tabloyu{" "}
          <Link href="/eryaman-site-dokusu" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
            Eryaman Site Dokusu raporunda
          </Link>{" "}
          bulabilirsiniz.
        </p>
      </section>

      <FaqSection title="Araç Hakkında Sık Sorulanlar" items={faqItems} />

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="Karşılaştırdığınız sitelerden birinde daireniz mi var?"
        aciklama="Yapısal veriler çerçeveyi çizer; kesin değeri sitenizdeki gerçek emsallerle birlikte netleştirelim. Satış ya da kiralama kararı aşamasındaysanız ilk adım değerleme görüşmesidir."
      >
        <TrackedCtaLink
          href="/ev-degerleme"
          gaEvent="karsilastirma_degerleme_cta"
          variant="primary"
        >
          Evinizi Değerlendirelim
        </TrackedCtaLink>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="karsilastirma_tel_cta"
          variant="outline-light"
        >
          {siteConfig.phoneDisplay}
        </TrackedCtaLink>
      </CtaBanner>
    </div>
  );
}
