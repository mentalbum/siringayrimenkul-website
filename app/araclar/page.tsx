import type { Metadata } from "next";
import Link from "next/link";
import { HesapAraclari } from "@/components/tools/hesap-araclari";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { FaqSection } from "@/components/ui/faq-section";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import type { FaqItem } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Ev Sahibi Hesap Araçları — Kira Artışı, Tapu Harcı, Komisyon",
  description:
    "Evini kiraya verecek veya satacak ev sahipleri için hesap araçları: TÜFE'ye göre kira artışı, tapu harcı, yasal emlak komisyonu ve boş kalma maliyeti hesaplayıcı. Eryaman'da fiyatı birlikte netleştirelim.",
  alternates: { canonical: "/araclar" },
};

const faqItems: FaqItem[] = [
  {
    soru: "Kira artışı en fazla ne kadar yapılabilir?",
    cevap:
      "Konut kiralarında yasal tavan, Türk Borçlar Kanunu m.344 uyarınca bir önceki kira yılının son 12 aylık TÜFE ortalamasıdır. Güncel oran her ay TÜİK tarafından açıklanır. Sözleşmenizde daha düşük bir artış oranı yazıyorsa, yazılı oran geçerlidir.",
  },
  {
    soru: "Tapu harcını alıcı mı, satıcı mı öder?",
    cevap:
      "Harçlar Kanunu'na göre tapu harcı satış bedelinin toplam %4'üdür ve yasal olarak alıcı ile satıcı %2 + %2 şeklinde öder. Uygulamada tarafların anlaşmasına göre farklı paylaşımlar da görülür. Harcın gerçek satış bedeli üzerinden yatırılması gerekir; tapuda ayrıca döner sermaye ücreti alınır.",
  },
  {
    soru: "Emlakçı komisyonu yasal olarak ne kadar?",
    cevap:
      "Taşınmaz Ticareti Hakkında Yönetmelik uyarınca satış işlemlerinde hizmet bedeli, satış bedelinin en fazla %4'ü + KDV'dir; uygulamada bu bedel alıcı ve satıcıdan %2 + %2 olarak alınır. Kiralama işlemlerinde hizmet bedeli bir aylık kira bedeli + KDV'yi aşamaz ve tek seferliktir.",
  },
  {
    soru: "Evim boş kaldıkça ne kaybederim?",
    cevap:
      "Boş geçen her ay, bir aylık kira gelirinin tamamen kaybolması demektir; aidat, DASK ve bakım giderleri ise ödenmeye devam eder. Piyasanın üzerinde bir kirayla aylarca beklemek, çoğu senaryoda gerçekçi fiyatla hemen kiraya vermekten daha pahalıya gelir — yukarıdaki boş kalma hesaplayıcısıyla kendi rakamlarınızı deneyebilirsiniz.",
  },
  {
    soru: "Doğru kira veya satış fiyatını nasıl belirlerim?",
    cevap:
      "İlan sitelerindeki istenen fiyatlar tek başına yanıltıcıdır; doğru fiyat, sitenizdeki ve mahallenizdeki gerçekleşen emsallerle belirlenir. Eryaman'ın mahallelerini ve 700'den fazla sitesini tek tek takip ediyoruz. Satış ya da kiralama kararı aşamasındaysanız değerleme görüşmesiyle başlayalım: sonunda elinizde gerçekçi bir fiyat aralığı ve yol haritası olur.",
  },
  {
    soru: "Bu hesaplayıcıların sonuçları bağlayıcı mı?",
    cevap:
      "Hayır; araçlar bilgilendirme amaçlıdır ve girdiğiniz rakamlara göre yasal oranları uygular. Resmî ve güncel tutarlar için TÜİK, tapu müdürlüğü ve ilgili mevzuat esastır; işleme özel durumlar için görüşme sırasında birlikte netleştiririz.",
  },
];

export default function AraclarPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ev Sahibi Hesap Araçları",
    serviceType: "Gayrimenkul hesaplama araçları ve fiyatlandırma danışmanlığı",
    description:
      "Kira artışı (TÜFE), tapu harcı, yasal emlak komisyonu ve boş kalma maliyeti hesaplayıcıları — evini kiraya verecek veya satacak ev sahipleri için.",
    url: `${siteConfig.url}/araclar`,
    provider: organizationRef,
    areaServed: { "@type": "Place", name: "Eryaman, Etimesgut, Ankara" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Ev Sahibi Araçları", href: "/araclar" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahipleri İçin
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Ev Sahibi Hesap Araçları</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Evinizi kiraya vermeden ya da satmadan önce masada net rakamlar olsun: yasal kira artışı
          tavanı, tapu harcı, emlak hizmet bedelinin yasal üst sınırı ve çoğu ev sahibinin gözden
          kaçırdığı kalem — evin boş beklediği ayların maliyeti. Dört araç da güncel mevzuattaki
          oranları uygular; rakamlarınız tarayıcınızda kalır, hiçbir yere gönderilmez.
        </p>
      </header>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap gap-2 text-sm">
          {[
            ["Kira Artışı Hesaplama", "/araclar/kira-artisi-hesaplama"],
            ["Tapu Harcı Hesaplama", "/araclar/tapu-harci-hesaplama"],
            ["Emlak Komisyonu Hesaplama", "/araclar/emlak-komisyonu-hesaplama"],
            ["Site Karşılaştırma Aracı", "/araclar/site-karsilastirma"],
          ].map(([etiket, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-border bg-surface px-4 py-2 font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
            >
              {etiket} →
            </Link>
          ))}
        </div>
        <HesapAraclari />
      </section>

      <FaqSection title="Ev Sahiplerinin Sık Sordukları" items={faqItems} />

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="Rakamlar hazır — sıra doğru fiyatta"
        aciklama="Hesaplayıcılar çerçeveyi çizer; kesin fiyatı siteniz ve mahallenizdeki gerçek emsaller belirler. Satış ya da kiralama kararı aşamasındaysanız değerleme görüşmesiyle başlayalım."
      >
        <TrackedCtaLink href="/ev-degerleme" gaEvent="araclar_degerleme_cta" variant="primary">
          Değerleme Görüşmesi Planla
        </TrackedCtaLink>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="araclar_tel_cta"
          variant="outline-light"
        >
          {siteConfig.phoneDisplay}
        </TrackedCtaLink>
      </CtaBanner>

      <p className="mt-8 text-xs leading-relaxed text-body">
        Not: Bu sayfadaki araçlar bilgilendirme amaçlıdır; TÜFE oranı için{" "}
        <a
          href="https://www.tuik.gov.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gold-dark underline-offset-2 hover:underline"
        >
          TÜİK
        </a>
        , harç ve tarifeler için ilgili resmî kurumlar esastır. Terimler yabancı geldiyse{" "}
        <Link href="/sozluk" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
          emlak terimleri sözlüğümüze
        </Link>
        , mahalle ve site rehberlerimiz için{" "}
        <Link href="/mahalleler" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
          Mahalleler
        </Link>{" "}
        sayfasına göz atın.
      </p>
    </div>
  );
}
