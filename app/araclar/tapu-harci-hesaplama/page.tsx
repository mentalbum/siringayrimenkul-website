import type { Metadata } from "next";
import Link from "next/link";
import { TapuHarciAraci } from "@/components/tools/hesap-araclari";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { CtaButton } from "@/components/ui/button";
import { FaqSection } from "@/components/ui/faq-section";
import type { FaqItem } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tapu Harcı Hesaplama — Alıcı ve Satıcı Payı (%4) Hesaplayıcı",
  description:
    "Tapu harcı ne kadar, kim öder? Satış bedelini girin; toplam %4 harcın alıcı ve satıcı paylarını (%2+%2) anında görün. Ev satan ve alanlar için ücretsiz tapu masrafı hesaplayıcı.",
  alternates: { canonical: "/araclar/tapu-harci-hesaplama" },
};

const faqItems: FaqItem[] = [
  {
    soru: "Tapu harcı ne kadar?",
    cevap:
      "Harçlar Kanunu uyarınca tapu harcı, gerçek satış bedelinin toplam %4'üdür. Yasal paylaşım alıcı %2 + satıcı %2 şeklindedir; taraflar aralarında farklı bir paylaşım da kararlaştırabilir.",
  },
  {
    soru: "Tapu harcı hangi bedel üzerinden ödenir?",
    cevap:
      "Gerçek satış bedeli üzerinden ödenmesi zorunludur. Harcı düşürmek için bedeli düşük göstermek, hem vergi cezası riski doğurur hem de ileride satıcı için değer artışı kazancı vergisinde aleyhe sonuç yaratabilir.",
  },
  {
    soru: "Tapuda harç dışında hangi masraflar var?",
    cevap:
      "Tapu harcına ek olarak her işlemde yıllık tarifeyle belirlenen döner sermaye ücreti alınır. Krediyle alımlarda bankanın ekspertiz ve ipotek tesis masrafları, ayrıca taşınma ve abonelik giderleri de hesaba katılmalıdır.",
  },
  {
    soru: "Tapu harcını kim öder — alıcı mı, satıcı mı?",
    cevap:
      "Yasal olarak her iki taraf da %2'şer öder. Uygulamada 'tüm harç alıcıya ait' gibi pazarlıklar görülür; bu tamamen tarafların anlaşmasına bağlıdır ve sözleşmede netleştirilmesi sonradan tartışmayı önler.",
  },
  {
    soru: "Eryaman'da evimi satarken tapu sürecini kim yönetir?",
    cevap:
      "Satışı bizimle yürüttüğünüzde randevu, harç yatırma ve devir dahil tapu sürecini sizin adınıza biz koordine ediyoruz. Satış öncesi doğru fiyat için değerleme görüşmesiyle başlayabiliriz.",
  },
];

export default function TapuHarciPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tapu Harcı Hesaplayıcı",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    description: "Satış bedeli üzerinden %4 tapu harcını ve alıcı-satıcı paylarını hesaplayan ücretsiz araç.",
    url: `${siteConfig.url}/araclar/tapu-harci-hesaplama`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Araçlar", href: "/araclar" },
          { label: "Tapu Harcı Hesaplama", href: "/araclar/tapu-harci-hesaplama" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahibi Araçları
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Tapu Harcı Hesaplama</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Tapu harcı, gerçek satış bedelinin toplam <strong>%4</strong>&apos;üdür ve yasal
          olarak alıcı ile satıcı <strong>%2 + %2</strong> öder. Satış bedelini girin; toplam
          harcı ve tarafların paylarını anında görün.
        </p>
      </header>

      <div className="mt-8">
        <TapuHarciAraci />
      </div>

      <section className="mt-12 max-w-3xl text-body">
        <h2 className="text-xl text-navy">Örnek: 5.000.000 TL'lik satışta tapu masrafı</h2>
        <p className="mt-3 text-base leading-relaxed">
          Toplam harç 200.000 TL'dir; yasal paylaşımla satıcı 100.000 TL, alıcı 100.000 TL
          öder. Buna tapu müdürlüğünün döner sermaye ücreti eklenir. Satıcıysanız eve koyacağınız
          fiyatı belirlerken bu maliyeti ve varsa{" "}
          <Link href="/araclar/emlak-komisyonu-hesaplama" className="font-semibold text-gold-dark hover:underline">
            emlak hizmet bedelini
          </Link>{" "}
          birlikte düşünmek gerekir. Tapudaki kavramlar için{" "}
          <Link href="/sozluk" className="font-semibold text-gold-dark hover:underline">
            emlak sözlüğümüze
          </Link>
          , satış sürecinin tamamı için{" "}
          <Link href="/blog/eryamanda-ev-satis-sureci" className="font-semibold text-gold-dark hover:underline">
            Eryaman&apos;da ev satış süreci rehberimize
          </Link>{" "}
          bakabilirsiniz.
        </p>
      </section>

      <FaqSection title="Tapu Harcı Hakkında Sık Sorulan Sorular" items={faqItems} />

      <CtaBanner
        className="mt-12"
        baslik="Eryaman'da Evinizi Satmayı mı Düşünüyorsunuz?"
        aciklama="Harç ve masraflar netken asıl soru fiyat: dairenizin güncel değerini sitenizdeki gerçek satışlara göre birlikte belirleyelim; tapu sürecini biz yönetelim."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
        <CtaButton href="/araclar" variant="outline-light">
          Tüm Hesap Araçları
        </CtaButton>
      </CtaBanner>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
