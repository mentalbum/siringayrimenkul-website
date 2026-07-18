import type { Metadata } from "next";
import Link from "next/link";
import { KomisyonAraci } from "@/components/tools/hesap-araclari";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { CtaButton } from "@/components/ui/button";
import { FaqSection } from "@/components/ui/faq-section";
import type { FaqItem } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Emlakçı Komisyonu Hesaplama — Satış ve Kiralamada Yasal Hizmet Bedeli",
  description:
    "Emlakçı komisyonu ne kadar, kim öder? Satışta azami %4 + KDV (alıcı-satıcı %2+%2), kiralamada bir aylık kira + KDV. Bedeli girin, yasal üst sınırı anında görün — ücretsiz hesaplayıcı.",
  alternates: { canonical: "/araclar/emlak-komisyonu-hesaplama" },
};

const faqItems: FaqItem[] = [
  {
    soru: "Emlakçı komisyonu yasal olarak ne kadar?",
    cevap:
      "Taşınmaz Ticareti Hakkında Yönetmelik uyarınca satış işlemlerinde hizmet bedeli, satış bedelinin en fazla %4'ü + KDV'dir; uygulamada alıcı ve satıcıdan %2 + %2 alınır. Kiralamada bedel, bir aylık kira + KDV'yi aşamaz ve tek seferliktir.",
  },
  {
    soru: "Emlak komisyonunu kim öder — alıcı mı, satıcı mı?",
    cevap:
      "Satışta yaygın ve yönetmeliğe uygun uygulama, alıcı ve satıcının %2'şer + KDV ödemesidir. Kiralamada hizmet bedeli kural olarak kiracıdan alınır. Her durumda bedelin yazılı hizmet sözleşmesinde netleştirilmesi gerekir.",
  },
  {
    soru: "Komisyon hangi bedel üzerinden hesaplanır?",
    cevap:
      "Satışta gerçekleşen satış bedeli, kiralamada sözleşmedeki aylık kira esas alınır. Örnek: 5.000.000 TL'lik satışta her taraftan azami 100.000 TL + KDV; 20.000 TL kiralık dairede kiracıdan azami 20.000 TL + KDV.",
  },
  {
    soru: "Yetki belgesiz kişiye komisyon ödemek zorunda mıyım?",
    cevap:
      "Emlak aracılığı yapan işletmelerin Taşınmaz Ticareti Yetki Belgesi taşıması zorunludur. Belgesiz kişilerle çalışmak hem hizmet kalitesi hem hukuki güvence açısından risklidir; belge numarasını sormaktan çekinmeyin. (Şirin Gayrimenkul yetki belge no: 0603771.)",
  },
  {
    soru: "Komisyona hangi hizmetler dahil?",
    cevap:
      "Doğru fiyatlama, tanıtım ve ilan yönetimi, alıcı/kiracı görüşmeleri ve elemesi, pazarlık, sözleşme ve tapu-teslim sürecinin koordinasyonu. Eryaman'da bu sürecin tamamını ev sahibi adına biz yürütüyoruz.",
  },
];

export default function KomisyonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Emlak Komisyonu Hesaplayıcı",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    description:
      "Satış ve kiralamada yasal azami emlak hizmet bedelini (komisyon) hesaplayan ücretsiz araç.",
    url: `${siteConfig.url}/araclar/emlak-komisyonu-hesaplama`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Araçlar", href: "/araclar" },
          { label: "Emlak Komisyonu Hesaplama", href: "/araclar/emlak-komisyonu-hesaplama" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahibi Araçları
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Emlakçı Komisyonu Hesaplama</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Satışta hizmet bedelinin yasal üst sınırı <strong>%4 + KDV</strong> (alıcı ve
          satıcıdan %2 + %2), kiralamada <strong>bir aylık kira + KDV</strong>&apos;dir. Bedeli
          girin, yasal azami tutarları anında görün.
        </p>
      </header>

      <div className="mt-8">
        <KomisyonAraci />
      </div>

      <section className="mt-12 max-w-3xl text-body">
        <h2 className="text-xl text-navy">Komisyon bir masraf mı, yatırım mı?</h2>
        <p className="mt-3 text-base leading-relaxed">
          Doğru soru komisyonun tutarı değil, karşılığıdır: yanlış fiyatlanan bir ev aylarca
          satılmadan bekler ya da değerinin altında gider — iki durumda da kayıp, komisyonun
          katbekat üzerindedir. Sitenizi blok blok tanıyan bir emlakçı; gerçekçi fiyatı,
          nitelikli alıcıyı ve güvenli tapu sürecini birlikte getirir. Sürecin tamamı için{" "}
          <Link
            href="/blog/emlakci-komisyonu-nasil-isler"
            className="font-semibold text-gold-dark hover:underline"
          >
            komisyon rehberimize
          </Link>
          , satışa hazırlıksa{" "}
          <Link
            href="/blog/evinizi-satisa-hazirlamak"
            className="font-semibold text-gold-dark hover:underline"
          >
            satışa hazırlık rehberimize
          </Link>{" "}
          bakın; tapu tarafı için{" "}
          <Link
            href="/araclar/tapu-harci-hesaplama"
            className="font-semibold text-gold-dark hover:underline"
          >
            tapu harcı hesaplayıcı
          </Link>{" "}
          yanınızda.
        </p>
      </section>

      <FaqSection title="Emlak Komisyonu Hakkında Sık Sorulan Sorular" items={faqItems} />

      <CtaBanner
        className="mt-12"
        baslik="Eryaman'da Satılık veya Kiralık Eviniz mi Var?"
        aciklama="Hizmet bedelinin karşılığını tam alın: doğru fiyat, doğru alıcı/kiracı ve uçtan uca süreç yönetimi. Satış ya da kiralama kararınızın ilk adımı değerleme görüşmesidir."
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
