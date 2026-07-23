import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { CtaButton } from "@/components/ui/button";
import { FaqSection } from "@/components/ui/faq-section";
import { Reveal } from "@/components/ui/reveal";
import type { FaqItem } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Eryaman'da Ev Satmak — Satış Sürecini Sizin Adınıza Yönetiyoruz",
  description:
    "Eryaman'da evinizi satmayı mı düşünüyorsunuz? Değerlemeden tapuya satışın her adımını yürüten yerel emlakçınız. 750'den fazla siteyi blok blok tanıyoruz. Aynı gün dönüş: 0532 363 96 60.",
  alternates: { canonical: "/eryamanda-ev-satmak" },
};

const adimlar = [
  {
    baslik: "1. Değerleme görüşmesi",
    aciklama:
      "Satışın kaderi ilk gün konulan fiyatta belli olur. Dairenizi ilan sitelerindeki 'istenen' rakamlardan değil, sitenizdeki ve mahallenizdeki gerçekleşen satışlardan yola çıkarak birlikte değerliyoruz — elinizde gerçekçi bir fiyat aralığı ve yol haritası oluyor.",
  },
  {
    baslik: "2. Hazırlık ve tanıtım",
    aciklama:
      "Evinizi doğru fotoğraflarla, doğru anlatımla vitrine çıkarıyoruz; ilanınız sahibinden.com mağazamızda yayınlanıyor. Gerektiğinde 3D sanal turla, evinizi gelmeden gezmek isteyen alıcılara da ulaşıyoruz.",
  },
  {
    baslik: "3. Alıcı eleme ve gösterim",
    aciklama:
      "Telefonlara biz bakıyoruz. Meraklıyı, 'fiyat düşer mi' diye gezeni ve portföy toplayan aracıyı eliyoruz; evinize yalnızca ön değerlendirmeden geçmiş gerçek alıcılar geliyor. Gösterimleri sizin uygun olduğunuz saatlere göre planlıyoruz.",
  },
  {
    baslik: "4. Pazarlık",
    aciklama:
      "Alıcıyla aranızdaki tampon biziz. Duygusal bağınız olan evde pazarlığı üçüncü tarafın yürütmesi, hem gerilimi hem fiyat kaybını azaltır; son karar her zaman sizde.",
  },
  {
    baslik: "5. Tapu ve teslim",
    aciklama:
      "Kapora ve sözleşmeden randevu, harç ve devir gününe kadar tapu sürecini sizin adınıza koordine ediyoruz. Bedelin güvenli el değiştirmesi için ödeme ile devrin eşzamanlı kurgulanması dahil.",
  },
];

const faqItems: FaqItem[] = [
  {
    soru: "Eryaman'da ev satmak ne kadar sürer?",
    cevap:
      "Dürüst cevap: fiyata bağlıdır. Emsallere göre doğru fiyatlanan daireler makul sürede alıcı bulur; piyasanın üzerinde fiyatlanan daireler aylarca ilanda bekler ve 'bu ev neden satılmıyor?' algısı oluşur. Bu yüzden süreci fiyat konuşarak değil, değerleme yaparak başlatıyoruz.",
  },
  {
    soru: "Satış için hangi belgeler gerekir?",
    cevap:
      "Kimlik, DASK poliçesi, belediyeden rayiç bedel yazısı ve emlak vergisi borcunun kapatılmış olması temel gereksinimlerdir; miras, ipotek ve vekâlet durumlarında ek belgeler devreye girer. Tam listeyi 'Ev satarken gerekli evraklar' rehberimizde bulabilirsiniz — süreci bizimle yürütürseniz takibini biz yaparız.",
  },
  {
    soru: "Satışta hangi masraflar çıkar?",
    cevap:
      "Tapu harcında yasal satıcı payı satış bedelinin %2'sidir; buna döner sermaye ücreti ve anlaşılan emlak hizmet bedeli eklenir. Alış tarihinizin üzerinden 5 yıl geçmediyse değer artışı kazancı vergisi de gündeme gelebilir. Hesaplayıcılarımızla kendi rakamlarınızı görebilirsiniz.",
  },
  {
    soru: "İçinde kiracı olan evimi satabilir miyim?",
    cevap:
      "Evet — satış kira sözleşmesini sona erdirmez, yeni malik sözleşmenin tarafı olur. Kiracılı satışın gösterim düzeni ve alıcı profili farklı işler; ayrıntılar 'Kiracılı ev satılır mı?' rehberimizde. Bu süreci sık yönetiyoruz.",
  },
  {
    soru: "Neden bir emlakçıyla çalışayım? Kendim satamaz mıyım?",
    cevap:
      "Satabilirsiniz — yasal engel yok, bunu açıkça yazdığımız bir rehberimiz bile var. Emlakçının karşılığı somuttur: gerçekleşen satışlara dayalı fiyat, alıcı eleme, pazarlık tamponu ve güvenli tapu süreci. Yanlış fiyatın maliyeti çoğu zaman komisyonun birkaç katıdır.",
  },
];

export default function EvSatmakPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Eryaman'da Ev Satış Danışmanlığı",
    serviceType: "Konut satış aracılık ve danışmanlık hizmeti",
    description:
      "Değerlemeden tapuya, Eryaman'da ev satış sürecinin tamamını ev sahibi adına yürüten yerel emlak danışmanlığı hizmeti.",
    url: `${siteConfig.url}/eryamanda-ev-satmak`,
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
          { label: "Eryaman'da Ev Satmak", href: "/eryamanda-ev-satmak" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahipleri İçin
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman&apos;da Evinizi Satmak</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Ev satmak bir ilan verme işi değil, bir süreç yönetimi işidir: doğru fiyat, doğru
          alıcı, güvenli tapu. Eryaman&apos;ın {""}
          <Link href="/siteler" className="font-semibold text-gold-dark hover:underline">
            750&apos;den fazla sitesini
          </Link>{" "}
          blok blok tanıyan yerel ofis olarak bu sürecin tamamını sizin adınıza yürütüyoruz —
          siz kararları verirsiniz, koşturmayı biz üstleniriz. (Taşınmaz Ticareti Yetki Belgesi
          No: 0603771)
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl">Satış Süreci Adım Adım</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {adimlar.map((adim, i) => (
            <Reveal key={adim.baslik} delay={(i % 3) * 70} className="h-full">
              <div className="h-full rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-base">{adim.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={140} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-navy p-5 text-white">
              <p className="text-sm leading-relaxed text-white/85">
                Rakamlarınızı önceden görmek isterseniz:{" "}
                <Link href="/araclar/tapu-harci-hesaplama" className="font-semibold text-gold hover:underline">
                  tapu harcı
                </Link>{" "}
                ve{" "}
                <Link href="/araclar/emlak-komisyonu-hesaplama" className="font-semibold text-gold hover:underline">
                  komisyon hesaplayıcı
                </Link>{" "}
                elinizin altında; vergilerin tamamı{" "}
                <Link href="/blog/ev-satarken-odenecek-vergiler" className="font-semibold text-gold hover:underline">
                  vergi rehberimizde
                </Link>
                .
              </p>
              <CtaButton href="/ev-degerleme" variant="primary" className="mt-4">
                Değerlemeyle Başlayın
              </CtaButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Evinizi Hızlı Satmanın Yolu</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Hızlı ev satmanın sırrı ilan çokluğu değil, <strong>doğru fiyatla çıkmaktır</strong>:
            piyasanın üzerinde başlayan ilan aylarca bekler, sonra art arda indirimlerle
            &quot;pazarlıklı ev&quot; izlenimi verir. Emsal satışlara dayanan gerçekçi bir fiyat,
            derli toplu bir sunum ve ciddi alıcının hızla ayrıştırılması — Eryaman&apos;da
            satışları hızlandıran üç şey budur. Eviniz bir süredir satılmıyorsa da başlangıç
            noktası aynıdır: fiyatı ve sunumu birlikte gözden geçirmek —{" "}
            <Link href="/blog/eviniz-satilmiyor-mu" className="font-semibold text-gold-dark hover:underline">
              en sık 7 nedeni bu rehberde
            </Link>{" "}
            topladık.
          </p>
        </Reveal>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Neden Şirin Gayrimenkul?</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Genel bir portal değil, Eryaman&apos;a gömülü bir ofisiz: 11 mahallenin her sitesinin
            envanterini tapu kayıtlarına dayanarak tek tek tutuyoruz. Bu, dairenize fiyat
            konuşurken &quot;mahalle ortalaması&quot;yla değil, kendi sitenizin gerçek
            hareketliliğiyle konuşmamız demek. Satış rehberlerimizi de aynı dürüstlükle yazdık:{" "}
            <Link href="/blog/emlakcisiz-ev-satilir-mi" className="font-semibold text-gold-dark hover:underline">
              emlakçısız satış mümkün mü
            </Link>
            ,{" "}
            <Link href="/blog/kiracili-ev-satilir-mi" className="font-semibold text-gold-dark hover:underline">
              kiracılı ev nasıl satılır
            </Link>
            ,{" "}
            <Link href="/blog/ev-satarken-gerekli-evraklar" className="font-semibold text-gold-dark hover:underline">
              hangi evraklar gerekir
            </Link>{" "}
            — hepsi açık. Bilgi bizde saklı değil; farkımız, bu bilgiyi sizin eviniz için
            uygulamak.
          </p>
        </Reveal>
      </section>

      <FaqSection title="Eryaman'da Ev Satmak Hakkında Sık Sorulanlar" items={faqItems} />

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="Satış Kararının İlk Adımı: Değerleme"
        aciklama="Dairenizin güncel satış değerini sitenizdeki gerçek emsallerle birlikte netleştirelim; satış yol haritanızı aynı görüşmede çıkaralım."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
        <CtaButton href={`tel:${siteConfig.phoneTel}`} variant="outline-light">
          {siteConfig.phoneDisplay}
        </CtaButton>
      </CtaBanner>
    </div>
  );
}
