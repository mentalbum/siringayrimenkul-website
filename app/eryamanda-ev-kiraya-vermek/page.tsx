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
  title: "Eryaman'da Evinizi Kiraya Vermek — Doğru Kiracı, Doğru Kira",
  description:
    "Eryaman'da evinizi kiraya mı vereceksiniz? Kira tespiti, kiracı eleme, sözleşme ve teslim — süreci sizin adınıza yürüten yerel emlakçınız. Aynı gün dönüş: 0532 363 96 60.",
  alternates: { canonical: "/eryamanda-ev-kiraya-vermek" },
};

const adimlar = [
  {
    baslik: "1. Doğru kira tespiti",
    aciklama:
      "İlan sitelerindeki 'istenen' kiralar yanıltır; doğru kira, sitenizdeki gerçekleşen kiralamalardan okunur. Yüksek kira koyup aylarca boş bekletmek, çoğu senaryoda gerçekçi kirayla hemen kiraya vermekten pahalıdır — bunu hesaplayıcımızla kendiniz de görebilirsiniz.",
  },
  {
    baslik: "2. Tanıtım ve ilan",
    aciklama:
      "Eviniz doğru fotoğraflarla sahibinden.com mağazamızda yayınlanır. Aramaları biz karşılar, evinizi gerçekten kiralayacak profili öne alırız; kapınıza gösterim trafiği yığılmaz.",
  },
  {
    baslik: "3. Kiracı eleme",
    aciklama:
      "Kiraya vermenin en kritik adımı budur: adayın ödeme gücünü ve düzenini görüşme aşamasında sorgular, referansları kontrol eder, size elenmiş adayları sunarız. Karar her zaman sizindir.",
  },
  {
    baslik: "4. Sözleşme ve teslim",
    aciklama:
      "Kira sözleşmesinin doğru kurulması — depozito, demirbaş listesi, teslim tutanağı — ileride yaşanacak tartışmaların sigortasıdır. Evrak düzenini birlikte kurar, teslimi kayıt altına alırız.",
  },
];

const faqItems: FaqItem[] = [
  {
    soru: "Eryaman'da evimin kirası ne olmalı?",
    cevap:
      "Rakam, sitenize ve dairenizin durumuna göre değişir; ilanlardaki eski rakamlar bu dönemde hızla güncelliğini yitiriyor. Kirayı sitenizdeki gerçekleşen kiralamalara göre birlikte belirliyoruz — görüşme sonunda elinizde gerçekçi bir kira aralığı olur.",
  },
  {
    soru: "Kiracıyı nasıl buluyor ve eliyorsunuz?",
    cevap:
      "İlan trafiğini biz karşılıyoruz; adaylarla ödeme gücü, iş ve referans düzeyinde ön görüşme yapıyor, evinize yalnızca elenmiş adayları getiriyoruz. Nihai kiracı seçimi her zaman ev sahibinindir.",
  },
  {
    soru: "Kiralamada emlakçı ücretini kim öder?",
    cevap:
      "Yönetmelik gereği kiralamada hizmet bedeli bir aylık kira + KDV'yi aşamaz ve kural olarak kiracıdan alınır; yani ev sahibi için kiracı bulma hizmetinin doğrudan bir komisyon maliyeti yoktur. Ayrıntıyı komisyon hesaplayıcımızda görebilirsiniz.",
  },
  {
    soru: "Evim boş kaldıkça ne kaybederim?",
    cevap:
      "Boş geçen her ay bir aylık kira gelirinin tamamen kaybıdır; aidat ve DASK ödenmeye devam eder. Piyasanın üzerinde kira isteyip beklemek çoğu zaman en pahalı senaryodur — boş kalma hesaplayıcımızla kendi rakamlarınızı deneyin.",
  },
  {
    soru: "Sonraki yıllarda kira artışını nasıl yapacağım?",
    cevap:
      "Konutta yasal tavan, son 12 aylık TÜFE ortalamasıdır; kira artışı hesaplayıcımızla yeni kirayı saniyeler içinde görebilirsiniz. 5 yılı dolduran sözleşmelerde kira tespit davasıyla emsal düzeye çıkma hakkınız da vardır — kritik kararlarda yön gösteririz.",
  },
];

export default function KirayaVermekPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Eryaman'da Kiralama Danışmanlığı",
    serviceType: "Konut kiralama aracılık ve danışmanlık hizmeti",
    description:
      "Kira tespiti, kiracı bulma ve eleme, sözleşme ve teslim — Eryaman'da evini kiraya verecek ev sahipleri için uçtan uca kiralama hizmeti.",
    url: `${siteConfig.url}/eryamanda-ev-kiraya-vermek`,
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
          { label: "Eryaman'da Ev Kiraya Vermek", href: "/eryamanda-ev-kiraya-vermek" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Ev Sahipleri İçin
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman&apos;da Evinizi Kiraya Vermek</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Kiraya vermenin iki büyük riski vardır: yanlış kira ve yanlış kiracı. İlki evinizi
          aylarca boş bekletir, ikincisi yıllarca uğraştırır. Eryaman&apos;ın{" "}
          <Link href="/siteler" className="font-semibold text-gold-dark hover:underline">
            700&apos;den fazla sitesini
          </Link>{" "}
          tek tek tanıyan yerel ofis olarak ikisini de sizin adınıza yönetiyoruz. (Taşınmaz
          Ticareti Yetki Belgesi No: 0603771)
        </p>
      </header>

      <section className="mt-10 max-w-3xl rounded-2xl border border-gold/40 bg-gold/10 p-6">
        <h2 className="text-xl">Ev Sahibi Olarak Bize Komisyon Ödemezsiniz</h2>
        <p className="mt-3 text-base leading-relaxed text-body">
          En sık sorulan soru bu: <strong className="font-semibold text-navy">kiralamada hizmet
          bedeli kural olarak kiracıdan alınır</strong> ve yönetmelik gereği bir aylık kira
          bedelini (artı KDV) aşamaz. Yani kiracı bulma, eleme, sözleşme ve teslim sürecini bize
          bırakmanın size doğrudan bir komisyon maliyeti olmaz. Kendi hesabınızı{" "}
          <Link
            href="/araclar/emlak-komisyonu-hesaplama"
            className="font-semibold text-gold-dark hover:underline"
          >
            komisyon hesaplayıcımızda
          </Link>{" "}
          görebilirsiniz.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Kiralama Süreci Adım Adım</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {adimlar.map((adim, i) => (
            <Reveal key={adim.baslik} delay={(i % 2) * 70} className="h-full">
              <div className="h-full rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-base">{adim.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{adim.aciklama}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Eryaman&apos;da Değilseniz: Uzaktan Kiraya Verme</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Tayin, iş ya da yurt dışı — Eryaman&apos;daki evinizi burada olmadan da kiraya
            verebilirsiniz. Anahtar bizde durur, gösterimleri biz yaparız; kiracı adayını
            çalışma ve ödeme düzeni üzerinden ön elemeden geçirir, size yalnızca uygun bulduğumuz
            adayları iletiriz. Sözleşme ve teslim aşamasında evin durumunu fotoğraflı tutanakla
            kayda alır, demirbaş listesini ve sayaç değerlerini yazılı hâle getiririz; süreç
            boyunca muhatabınız tek kişi olur. Ayrıntılar için{" "}
            <Link
              href="/blog/eryaman-disinda-yasayanlar-icin-ev-satisi-kiralama"
              className="font-semibold text-gold-dark hover:underline"
            >
              şehir dışından ev satışı ve kiralama rehberimize
            </Link>{" "}
            bakabilirsiniz.
          </p>
        </Reveal>
      </section>

      <section className="mt-12 max-w-3xl">
        <Reveal>
          <h2 className="text-2xl">Araçlarınız Hazır</h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Karar aşamasında rakamları kendiniz görmek isterseniz:{" "}
            <Link href="/araclar/kira-artisi-hesaplama" className="font-semibold text-gold-dark hover:underline">
              kira artışı hesaplayıcı
            </Link>{" "}
            yasal tavanı,{" "}
            <Link href="/araclar" className="font-semibold text-gold-dark hover:underline">
              boş kalma hesaplayıcı
            </Link>{" "}
            bekletmenin maliyetini,{" "}
            <Link href="/araclar/emlak-komisyonu-hesaplama" className="font-semibold text-gold-dark hover:underline">
              komisyon hesaplayıcı
            </Link>{" "}
            yasal hizmet bedelini gösterir. Süreç bilgisi için{" "}
            <Link href="/blog/dairenizi-kiraya-verirken-dikkat-edilmesi-gerekenler" className="font-semibold text-gold-dark hover:underline">
              kiraya verme rehberimiz
            </Link>{" "}
            ve{" "}
            <Link href="/blog/eryamanda-kira-tespiti-dogru-kira-belirleme" className="font-semibold text-gold-dark hover:underline">
              kira tespiti rehberimiz
            </Link>{" "}
            açık; anahtar tesliminden sonrası —{" "}
            <Link href="/blog/evinizi-kiraya-verdikten-sonra" className="font-semibold text-gold-dark hover:underline">
              beyan, vergi ve bildirimler
            </Link>{" "}
            — da düşünülmüş durumda. İleride yollar ayrılırsa{" "}
            <Link href="/blog/kiraci-tahliye-sureci" className="font-semibold text-gold-dark hover:underline">
              tahliye rehberimiz
            </Link>{" "}
            de dürüst bir çerçeve sunar.
          </p>
        </Reveal>
      </section>

      <FaqSection title="Evini Kiraya Verecekler İçin Sık Sorulanlar" items={faqItems} />

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="İlk Adım: Kira Değerlendirmesi"
        aciklama="Dairenizin güncel kira değerini sitenizdeki gerçek kiralamalara göre birlikte belirleyelim; kiracı arama sürecini aynı gün başlatalım."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Kira Değerlendirmesi İsteyin
        </CtaButton>
        <CtaButton href={`tel:${siteConfig.phoneTel}`} variant="outline-light">
          {siteConfig.phoneDisplay}
        </CtaButton>
      </CtaBanner>
    </div>
  );
}
