import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAllEtaplar,
  getAllEtapOzetleri,
  getAllMahalleler,
  getEtapByNo,
  getMahalleBySlug,
  getSiteBySlug,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { FaqSection } from "@/components/ui/faq-section";
import { SiteCard } from "@/components/site/site-card";
import { getEtapFaq } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";

type Props = {
  params: Promise<{ mahalle: string; etap: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getAllEtaplar(mahalle.slug).map((etap) => ({
      mahalle: mahalle.slug,
      etap: etap.no,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, etap: etapNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const etap = getEtapByNo(mahalleSlug, etapNo);
  if (!mahalle || !etap) return {};

  return {
    // Ticari mesaj ev sahibine seslenir — gerekçe site sayfası şablonunda.
    // ABSOLUTE + LOKASYON İKİNCİ BÖLÜMDE (2026-08-09). Site sayfalarında
    // 07.08'de kaldırılan "| Şirin Gayrimenkul" eki burada duruyordu ve başlık
    // 96 karaktere çıkıyordu; Google ~60'ta kesiyor, yani hem marka eki hem
    // mahalle adı hiçbir SERP'te görünmüyordu. Sıra site şablonuyla aynı
    // düzene alındı: kesilen kısım artık lokasyon değil boilerplate.
    title: {
      absolute: `Eryaman ${etap.no}. Etap Emlakçı | ${mahalle.isim} | Evinizi Satalım, Kiraya Verelim`,
    },
    description: `Eryaman ${etap.no}. Etap'ta eviniz mi var? ${etap.siteler.length} site ve ${etap.adalar.length} adayı tek tek tanıyoruz; satış ve kira değerini yerel emlakçınızla netleştirin: ${siteConfig.phoneDisplay}.`,
    alternates: { canonical: `/mahalleler/${mahalle.slug}/etaplar/${etap.no}` },
  };
}

export default async function EtapPage({ params }: Props) {
  const { mahalle: mahalleSlug, etap: etapNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const etap = getEtapByNo(mahalleSlug, etapNo);
  if (!mahalle || !etap) notFound();

  // Etaplar arası bağ MAHALLE sınırında kesilmemeli: her onaylı etap tek bir
  // mahalleye düştüğü için mahalle içi liste 1., 2. ve 3. Etap sayfalarında
  // tamamen boş kalıyordu (yalnız 4. ve 5. Etap aynı mahallede). Beş etabın
  // tamamını listelemek hem kullanıcının aradığı şey ("eryaman etapları")
  // hem de bu sayfaların taranmasına yardım eden iç bağ.
  const digerEtaplar = getAllEtapOzetleri().filter((item) => item.no !== etap.no);
  // Resmî ada listesi kayıtlarımızdan genişse bunu açıkça söylüyoruz; "22 ada
  // bulunuyor" demek 45 adalık etapta yanlış sayı iddiası olurdu.
  const tamKapsama = etap.adalar.length === etap.resmiAdaSayisi;

  // 2. Etap'ın güneyindeki Eston/İçtaş/Cumhuriyet şeridi resmî listede YOK
  // (tapudaki toplu yapı bağı Eryaman/1. Etap planına) ama ilan dilinde ve
  // gündelik kullanımda 2. Etap'la anılıyor (2026-08-07 üç-kollu araştırma,
  // ayrıntı sorunlu-siteler.md). Etap İDDİASI değil "birlikte anılır" tespiti.
  const komsuSeritSiteleri =
    etap.no === "2"
      ? ["eston-sitesi", "ictas", "cumhuriyet-sitesi"].flatMap(
          (slug) => getSiteBySlug(mahalle.slug, slug) ?? []
        )
      : [];

  const etapJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `Eryaman ${etap.no}. Etap`,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/etaplar/${etap.no}`,
    containedInPlace: {
      "@type": "Place",
      name: mahalle.isim,
      url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
    },
  };

  /* Etap sayfaları bugüne dek YALNIZ Place basıyordu; mahalle sayfasında olan
   * iki düğüm burada yoktu (app/mahalleler/[mahalle]/page.tsx:192 ve :213).
   * Aşağıdaki ikisi o farkı kapatıyor.
   *
   * "Bu etaba hizmet veren emlakçı" ilişkisinin makine-okunur hâli. provider
   * organizationRef ile kök layout'taki RealEstateAgent düğümüne (@id) bağlanır.
   * UYARI — geo: etabın KENDİ koordinatı elimizde yok ve uydurulmaz; konum
   * bilgisi yalnız kapsayan mahallenin doğrulanmış merkezinden veriliyor. */
  const hizmetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Emlak danışmanlığı — satış ve kiralama",
    name: `Eryaman ${etap.no}. Etap Emlakçı — ${siteConfig.name}`,
    provider: organizationRef,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/etaplar/${etap.no}`,
    areaServed: {
      "@type": "Place",
      name: `Eryaman ${etap.no}. Etap, ${mahalle.isim}, ${mahalle.ilce}, Ankara`,
      containedInPlace: {
        "@type": "Place",
        name: `${mahalle.isim}, ${mahalle.ilce}, Ankara`,
        geo: {
          "@type": "GeoCoordinates",
          latitude: mahalle.merkezKoordinat.lat,
          longitude: mahalle.merkezKoordinat.lng,
        },
      },
    },
  };

  /* Sayfada görünen site kartlarının makine-okur karşılığı — mahalle
   * sayfasındaki siteListJsonLd'nin etap karşılığı. Görünen listeyle birebir:
   * yalnız resmî ada listesindeki siteler, komşu şerit BURAYA GİRMEZ. */
  const siteListJsonLd =
    etap.siteler.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Eryaman ${etap.no}. Etap'taki Siteler ve Rezidanslar`,
          numberOfItems: etap.siteler.length,
          itemListElement: etap.siteler.map((site, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: site.isim,
            url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
          { label: `${etap.no}. Etap`, href: `/mahalleler/${mahalle.slug}/etaplar/${etap.no}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.isim} · {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman {etap.no}. Etap</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          {tamKapsama
            ? `Eryaman ${etap.no}. Etap bölgesi ${mahalle.isim} içinde yer alıyor; bu bölgede ${etap.siteler.length} site/rezidans ve ${etap.adalar.length} ada bulunuyor.`
            : `Eryaman ${etap.no}. Etap bölgesi ${mahalle.isim} içinde yer alıyor; etabın resmî ada listesi ${etap.resmiAdaSayisi} adayı kapsıyor, bu adalardan ${etap.adalar.length} tanesi ve üzerlerindeki ${etap.siteler.length} site/rezidans arşivimizde kayıtlı.`}
          {/* 1. Etap cümlesinin kaynağı eryaman1.com/hakkimizda (yönetimin kendi tanıtımı). */}
          {etap.no === "1" &&
            " Toplu Konut İdaresi'nin Türkiye'deki ilk sosyal konut uygulaması olan bu etap 1990'da yerleşime açıldı; 457 apartmandaki 6.371 konut tek merkezden ısıtılıyor."}
          {/* 2. Etap cümlesinin kaynağı yönetimin kendi sitesi eryaman2.com.tr
              (2026-08-10). Isıtma düzeni 1. Etap'tan AYRIŞIYOR: 1. Etap tek
              merkezden ısınırken burada her adanın kendi tesisi var — ev sahibi
              için aidat/işletme farkı demek, o yüzden sayfada duruyor. */}
          {etap.no === "2" &&
            " Etapta ısıtma tek merkezden değil, her adanın kendi merkezi ısıtma tesisinden sağlanıyor; ortak kullanım alanları ve sosyal tesisler de ada yönetimleri üzerinden işletiliyor."}
          {etap.no === "3" &&
            " Etabın toplu yapı yönetimi, etap içindeki Özar İş Merkezi'nde hizmet veriyor."}
          {/* 4. Etap cümlesinin kaynağı yönetimin kendi sitesi eryaman4.com
              (2026-08-11 doğrulandı): 50 adalık etabın tamamı; yönetim,
              temsilciler ve denetim kurullarından oluşan TEK toplu yapı
              yönetimince yönetiliyor. 2. Etap'taki ada bazlı düzenden ayrışır —
              ev sahibi için ortak karar/aidat muhatabının tek olması demek.
              4, bu satıra kadar özgün tanıtım cümlesi olmayan tek etaptı. */}
          {etap.no === "4" &&
            " Etabın tamamı; yönetim, temsilciler ve denetim kurullarından oluşan tek bir toplu yapı yönetimi çatısı altında yönetiliyor — ortak alan ve etap geneli kararlarda muhatap ada ada değil, tek merkez."}
          {etap.no === "5" &&
            " Bölge, adını verdiği Eryaman 5 metro istasyonuna ev sahipliği yapıyor; Ankaray ve metro hattına yürüme mesafesinde ulaşım sağlıyor."}
        </p>
        {/* "emlakçı" kelimesi bilinçli ve birebir: "eryaman N. etap emlakçı"
            sorgu ailesi başlıkta vardı ama gövde metninde hiç geçmiyordu. */}
        <p className="mt-3 text-base leading-relaxed text-body">
          Eryaman {etap.no}. Etap&apos;ta emlakçı arayan ev sahipleri için bu sayfa bir ilan
          panosu değil etap arşivi: adaların tapu kimliğini ve sitelerin blok-konut yapısını
          tek tek tutuyor, satışta ve kiralamada fiyatı bu kayıtlarla belirliyoruz.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl">{etap.no}. Etap&apos;taki Siteler</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etap.siteler.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">{etap.no}. Etap&apos;taki Adalar</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {etap.adalar.map((ada) => (
            <Link
              key={adaRouteKey(ada)}
              href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(ada)}`}
              title={ada.site.isim}
              className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
            >
              {adaDisplayLabel(ada)}
            </Link>
          ))}
        </div>
      </section>

      {komsuSeritSiteleri.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl">2. Etap&apos;la Birlikte Anılan Komşu Şerit</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
            Resmî 2. Etap ada listesi yukarıdaki adalarla sınırlı; etabın hemen
            güneyindeki bu şerit ise ilan dilinde ve gündelik kullanımda 2.
            Etap&apos;la birlikte anılıyor. Tapu kaydında şeridin toplu yapı bağı
            Eryaman (1. Etap) yönetim planına işli — dairenizi satarken veya
            kiraya verirken bu ayrımın doğru anlatılmasını biz üstleniyoruz.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {komsuSeritSiteleri.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
        </section>
      )}

      <FaqSection
        title={`Eryaman ${etap.no}. Etap Hakkında Sık Sorulan Sorular`}
        items={getEtapFaq(etap, mahalle)}
      />

      <CtaBanner
        className="mt-14"
        baslik={`Eryaman ${etap.no}. Etap'ta Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton href="/ev-degerleme" variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
      </CtaBanner>

      {digerEtaplar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">Eryaman&apos;ın Diğer Etapları</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {digerEtaplar.map((item) => (
              <Link
                key={item.no}
                href={`/mahalleler/${item.mahalle.slug}/etaplar/${item.no}`}
                title={item.mahalle.isim}
                className="cursor-pointer rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
              >
                {item.no}. Etap
              </Link>
            ))}
            <Link
              href="/etaplar"
              className="cursor-pointer rounded-2xl border border-gold bg-surface px-5 py-3 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold/10"
            >
              Etap haritası →
            </Link>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(etapJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hizmetJsonLd) }}
      />
      {siteListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteListJsonLd) }}
        />
      )}
    </div>
  );
}
