import type { Metadata } from "next";
import Link from "next/link";
import { KiraArtisiAraci } from "@/components/tools/hesap-araclari";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { CtaButton } from "@/components/ui/button";
import { FaqSection } from "@/components/ui/faq-section";
import { Reveal } from "@/components/ui/reveal";
import type { FaqItem } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Kira Artışı Hesaplama — TÜFE'ye Göre Yasal Kira Zammı Hesaplayıcı",
  description:
    "Kira artışı nasıl hesaplanır? Mevcut kiranızı ve TÜİK'in açıkladığı 12 aylık TÜFE ortalamasını girin, yasal tavana göre yeni kirayı anında görün. Ev sahipleri için ücretsiz kira zammı hesaplayıcı.",
  alternates: { canonical: "/araclar/kira-artisi-hesaplama" },
};

const faqItems: FaqItem[] = [
  {
    soru: "Kira artışı nasıl hesaplanır?",
    cevap:
      "Yeni kira = mevcut kira × (1 + artış oranı / 100). Konutlarda uygulanabilecek azami oran, Türk Borçlar Kanunu m.344 uyarınca bir önceki kira yılının son 12 aylık TÜFE ortalamasıdır. Örnek: 20.000 TL kira ve %40 oran için yeni kira 28.000 TL olur.",
  },
  {
    soru: "Güncel kira artış oranını nereden öğrenirim?",
    cevap:
      "TÜİK her ayın başında enflasyon bültenini yayımlar; kira artışında esas alınan '12 aylık ortalamalara göre TÜFE değişim oranı' bu bültende yer alır. Sözleşme yenileme ayınızdaki güncel oranı TÜİK'in sitesinden kontrol edip yukarıdaki hesaplayıcıya girmeniz yeterli.",
  },
  {
    soru: "Ev sahibi TÜFE'nin üzerinde zam isteyebilir mi?",
    cevap:
      "Yenilenen kira dönemlerinde yasal tavan TÜFE 12 aylık ortalamasıdır; üzerindeki artış kiracıyı bağlamaz. 5 yılı dolduran kiralarda ise taraflardan biri kira tespit davası açarak kiranın emsal piyasa düzeyine göre yeniden belirlenmesini isteyebilir.",
  },
  {
    soru: "Sözleşmede daha düşük bir artış oranı yazıyorsa hangisi geçerli?",
    cevap:
      "Sözleşmede TÜFE'den düşük bir oran kararlaştırılmışsa yazılı oran geçerlidir. Sözleşmede oran yoksa veya TÜFE'den yüksek bir oran yazıyorsa, yasal tavan olan 12 aylık TÜFE ortalaması uygulanır.",
  },
  {
    soru: "Kiracım artışı kabul etmezse ne yapabilirim?",
    cevap:
      "Önce yazılı bildirimle yasal orana dayalı yeni kirayı iletmek gerekir; anlaşmazlık sürerse arabuluculuk ve dava yolu açıktır. Eryaman'da kiraya verdiğiniz eviniz için süreci birlikte yönetebiliriz — kira tespiti, sözleşme yenileme ve gerektiğinde yeni kiracı bulma dahil.",
  },
];

export default function KiraArtisiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kira Artışı Hesaplayıcı",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    description:
      "TÜFE 12 aylık ortalamasına göre yasal kira artışını hesaplayan ücretsiz araç.",
    url: `${siteConfig.url}/araclar/kira-artisi-hesaplama`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Araçlar", href: "/araclar" },
          { label: "Kira Artışı Hesaplama", href: "/araclar/kira-artisi-hesaplama" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahibi Araçları
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Kira Artışı Hesaplama</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Konut kiralarında yıllık artışın yasal tavanı, Türk Borçlar Kanunu m.344 uyarınca{" "}
          <strong>son 12 aylık TÜFE ortalamasıdır</strong>. Mevcut kiranızı ve TÜİK&apos;in
          açıkladığı güncel oranı girin; yeni kirayı, aylık ve yıllık farkı anında görün.
        </p>
      </header>

      <div className="mt-8">
        <KiraArtisiAraci />
      </div>

      <section className="prose-sm mt-12 max-w-3xl text-body">
      <Reveal>
        <h2 className="text-xl text-navy">Kira artışı adım adım nasıl hesaplanır?</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-relaxed">
          <li>
            Sözleşme yenileme ayınızı belirleyin — artış, yeni kira döneminin başında uygulanır.
          </li>
          <li>
            TÜİK&apos;in o ay açıkladığı <strong>12 aylık ortalamalara göre TÜFE değişim
            oranını</strong> not edin (aylık veya yıllık enflasyonla karıştırmayın).
          </li>
          <li>Mevcut kirayı bu oranla artırın: yeni kira = kira × (1 + oran/100).</li>
          <li>
            Sözleşmenizde daha düşük bir oran yazıyorsa onu uygulayın; yüksek oran yazsa bile
            yasal tavan aşılamaz.
          </li>
        </ol>
        <p className="mt-4 text-base leading-relaxed">
          Örnek: 20.000 TL kira, %45 oran → yeni kira 29.000 TL; aylık fark 9.000 TL, yıllık
          fark 108.000 TL. Tavan oran uygulansa bile kiranız emsallerin altında kalmış
          olabilir — 5 yılı dolan sözleşmelerde{" "}
          <Link href="/sozluk#kira-tespit-davasi" className="font-semibold text-gold-dark hover:underline">
            kira tespit davası
          </Link>{" "}
          ile piyasa düzeyine çıkma hakkınız vardır. Doğru kira bedelinin emsallerden nasıl
          okunduğunu{" "}
          <Link
            href="/blog/eryamanda-kira-tespiti-dogru-kira-belirleme"
            className="font-semibold text-gold-dark hover:underline"
          >
            kira tespiti rehberimizde
          </Link>{" "}
          anlattık.
        </p>
      </Reveal>
      </section>

      <FaqSection title="Kira Artışı Hakkında Sık Sorulan Sorular" items={faqItems} />

      <CtaBanner
        className="mt-12"
        baslik="Eryaman'da Kiraya Verdiğiniz Eviniz mi Var?"
        aciklama="Doğru kira, ilan sitelerindeki 'istenen' fiyatlardan değil sitenizdeki gerçekleşen kiralardan okunur. Kira tespitini ve tüm kiralama sürecini birlikte yönetelim."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Kira Değerlendirmesi İsteyin
        </CtaButton>
        <CtaButton href="/araclar" variant="outline-light">
          Tüm Hesap Araçları
        </CtaButton>
      </CtaBanner>

      <div className="mt-8 max-w-3xl text-xs leading-relaxed text-body">
        <p>
          Kaynak: Hesaplama, TÜİK&apos;in her ay yayımladığı{" "}
          <strong>12 aylık ortalamalara göre TÜFE değişim oranını</strong> esas alır. Güncel
          orana{" "}
          <a
            href="https://data.tuik.gov.tr/Kategori/GetKategori?p=enflasyon-ve-fiyat-106"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold-dark underline-offset-2 hover:underline"
          >
            TÜİK&apos;in resmî TÜFE istatistik sayfasından (data.tuik.gov.tr)
          </a>{" "}
          ulaşabilirsiniz.
        </p>
        <p className="mt-2">
          Not: Bu araç bilgilendirme amaçlıdır; bağlayıcı hukuki veya mali danışmanlık yerine
          geçmez. Sözleşmenize uygulayacağınız oranı, yenileme ayınızdaki TÜİK duyurusundan
          teyit etmenizi öneririz.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
