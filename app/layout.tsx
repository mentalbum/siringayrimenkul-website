import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsAppButton } from "@/components/ui/floating-whatsapp-button";
import { Analytics } from "@vercel/analytics/next";
import { GaYukleyici } from "@/components/analytics/ga-yukleyici";
import { siteConfig } from "@/lib/site-config";
import { getAllMahalleler } from "@/lib/content";
import { ORG_ID, OZGUN_ID, organizationLogo, websiteJsonLd } from "@/lib/structured-data";

// Only weight 600 is ever used (globals.css sets all headings to 600; the map
// label and step-number chips are 600 too) — extra weights just add preloaded
// font files that compete with the LCP on slow connections.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    // TAM EŞLEŞME önde: baş sorgu "eryaman emlakçı" (yalın, iyeliksiz).
    // Kişiselleştirmesiz ölçüm (2026-08-02, pws=0): organikte 8. sıradayız ve
    // önümüzdeki üç yerel sitenin üçü de başlığına yalın "Eryaman Emlakçı"
    // dizisini koymuş (eryamanemlakci.com 3., premiumeryamanemlak.com 4.).
    // Eski başlık iyelik ekliydi ("Emlakçısı") — insanların yazdığı biçim değil.
    // Harita kutusunda zaten 1.'yiz (5,0 / 380 yorum); bu değişiklik organik
    // listedeki açığı hedefliyor. Site geneli sayfa başlıkları da aynı yalın
    // biçimi kullanıyor (Özgün'ün hedef biçimi, 2026-07-31).
    //
    // MARKA ADI ÇIKARILDI (2026-08-08, Özgün'ün talebi). Üç gerekçe:
    // (1) 07.08 sürümü ("Eryaman Emlakçı | Şirin Gayrimenkul — Evinizi Satalım,
    //     Kiraya Verelim", 69 karakter) Google'a HİÇ girmedi — canlı ölçümde
    //     SERP hâlâ 02.08 öncesi başlığı gösteriyor ve `"Evinizi Satalım,
    //     Kiraya Verelim" site:siringayrimenkul.com` sorgusunda ana sayfa yok.
    //     Yani bu düzenleme üst üste ikinci değişiklik değil, tek geçiş.
    // (2) 69 karakter SERP'te kesiliyordu ve kesilen kısım tam da ticari mesajdı;
    //     marka ortadan çıkınca 48 karaktere iniyor ve tamamı görünüyor
    //     (mahalle sayfalarında ölçülen davranış — bkz. Yavuz Selim SERP'i).
    // (3) Marka kaybı yok: H1 ("Eryaman Emlakçı — Şirin Gayrimenkul"), alan adı,
    //     WebSite/Organization JSON-LD ve og:site_name marka adını taşıyor.
    // Biçim kasıtlı olarak mahalle/site sayfalarıyla birebir aynı:
    // "<varlık> Emlakçı | Evinizi Satalım, Kiraya Verelim".
    default: "Eryaman Emlakçı | Evinizi Satalım, Kiraya Verelim",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // og:title / og:description are deliberately NOT set here: a fixed value in
  // the root layout would be inherited by every page, so shared links (e.g.
  // a site page on WhatsApp) would all preview with the same generic text.
  // Left unset, Next fills them from each page's own resolved title/description.
  // images bilerek yok. Next'in kuralı (resolve-metadata.js, mergeStaticMetadata):
  // dosya-tabanlı opengraph-image YALNIZCA o segmentin metadata'sında
  // openGraph.images YOKSA devreye girer. Yani burada images tanımlıysa kök
  // segmentte O kazanır ve kendi opengraph-image.tsx'i olmayan tüm sayfalara
  // (örn. /hakkimizda, /iletisim) miras kalırdı — ölü ayar değil, aktif ayardı.
  // Kaldırıldığı için artık her sayfa kendi kartını üretiyor (2026-08-08).
  // Kart görselini değiştirmek isteyen app/opengraph-image.tsx'i düzenlemeli.
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    // images bilerek yok: burada tanımlanırsa 727 site sayfasının tamamı bu tek
    // görseli miras alıyor ve sayfaya özel opengraph-image kartını gölgeliyordu.
    // twitter:image yokken X/Twitter og:image'a düşer — o da doğru karttır.
  },
  verification: {
    google: "k1TcGp1CMeFpPUlbp91mnEqvCaHu1y1-si6t0F6xjOA",
    // Yandex Webmaster doğrulaması (2026-08-20, Özgün'ün Yandex hesabıyla).
    // Amaç: site-kayıt bağını resmileştirip bölge ayarını (Ankara/Etimesgut)
    // açmak — Yandex'in resmî yerel sıralama tavsiyesi. SERP'te 7. sıradaki
    // Yandex Maps satırımızı besler (sosyal SERP araştırması, İş 8).
    yandex: "2cc35b6ab01f7026",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: siteConfig.name,
    // İnsanlar bizi "Eryaman Şirin Gayrimenkul" diye de arıyor (Yandex kaydımız
    // da bu adla); ayrıca başka illerde aynı adlı firmalar var — alternateName
    // marka aramasında doğru işletmeyi ayırt etmeye yardım eder.
    // "Eryaman Emlakçı" 20.08'de eklendi: sosyal profillerimizin görünen adı bu
    // biçimde (2026-08 profil metinleri kararı) ve araştırma raporu genç domain'i
    // GBP kimliğiyle birleştirmek için alternateName'i öneriyor. Yıldız/puan YOK.
    alternateName: [
      "Eryaman Şirin Gayrimenkul",
      "Şirin Gayrimenkul Eryaman",
      "Eryaman Emlakçı Şirin Gayrimenkul",
    ],
    description: siteConfig.description,
    image: `${siteConfig.url}/images/ofis-ic-mekan.jpg`,
    logo: organizationLogo,
    url: siteConfig.url,
    telephone: siteConfig.phoneTel,
    // Kanonik harita kaydımız — Google'ın işletme kaydıyla site arasındaki bağı
    // sameAs'e ek olarak açıkça kurar.
    hasMap: siteConfig.officeMapsUrl,
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    knowsLanguage: "tr-TR",
    sameAs: [
      siteConfig.officeMapsUrl,
      siteConfig.yandexMapsUrl,
      siteConfig.sahibindenUrl,
      siteConfig.tiktokUrl,
      siteConfig.instagramUrl,
      siteConfig.facebookUrl,
    ],
    knowsAbout: [
      "Eryaman emlak piyasası",
      "konut satışı",
      "konut kiralama",
      "ev değerleme ve emsal analizi",
      "tapu ve kat mülkiyeti işlemleri",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Emlak Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Eryaman'da Ev Satış Danışmanlığı",
            url: `${siteConfig.url}/eryamanda-ev-satmak`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Eryaman'da Ev Kiraya Verme Danışmanlığı",
            url: `${siteConfig.url}/eryamanda-ev-kiraya-vermek`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Ev Değerleme (Emsal Bazlı Fiyat Analizi)",
            url: `${siteConfig.url}/ev-degerleme`,
          },
        },
      ],
    },
    // Görünmez ama meşru "gömme": hizmet bölgesinin tamamı — Eryaman + 11
    // mahalle — arama motorlarına yapılandırılmış veriyle bildirilir.
    areaServed: [
      { "@type": "Place", name: "Eryaman, Etimesgut, Ankara" },
      ...getAllMahalleler().map((m) => ({
        "@type": "Place",
        name: `${m.isim}, ${m.ilce}, Ankara`,
      })),
    ],
    founder: { "@type": "Person", name: "Hamza Şirin" },
    employee: { "@type": "Person", "@id": OZGUN_ID, name: "Özgün Şirin", jobTitle: "Emlak Danışmanı" },
    identifier: {
      "@type": "PropertyValue",
      name: "Taşınmaz Ticareti Yetki Belgesi No",
      value: "0603771",
    },
    address: {
      "@type": "PostalAddress",
      ...siteConfig.officeAddressParts,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.officeKoordinat.lat,
      longitude: siteConfig.officeKoordinat.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    /* aggregateRating BİLEREK YOK (2026-08-08).
     *
     * Google'ın yorum snippet'i kuralı: "İncelenen kuruluş kendisi hakkındaki
     * yorumları denetliyorsa, LocalBusiness veya herhangi bir Organization
     * yapılandırılmış verisi kullanan sayfaları yıldız özelliği için uygun
     * değildir." RealEstateAgent bir LocalBusiness alt tipi ve puan kendi
     * sitemizde kendi işletmemiz için basılıyordu — yani bu işaretleme
     * hiçbir koşulda yıldız üretemezdi; karşılığında yapılandırılmış veri
     * politikası tarafında gereksiz risk taşıyordu. Kök layout'ta olduğu
     * için 720'yi aşkın sayfanın hepsine basılıyordu.
     *
     * lib/google-reviews.ts aynı kuralı Review düğümü için zaten doğru
     * uyguluyordu; bu, o kuralın AggregateRating'de kalmış açığıydı.
     *
     * GÖRÜNÜR yorum kutusu KALIYOR (components/ui/review-badge.tsx kendi
     * verisini ayrıca çekiyor): kuralın yasakladığı şey işaretleme, ekranda
     * gösterim değil. Harita kutusundaki 5,0 puan da GBP'den gelir,
     * bu değişiklikten etkilenmez. */
  };

  return (
    <html lang="tr" className={`${poppins.variable} ${inter.variable} h-full`}>
      {/* pb-* : mobildeki sabit iletişim çubuğu sayfanın son satırını kapatmasın
          (bkz. components/ui/floating-whatsapp-button.tsx). */}
      <body className="flex min-h-full flex-col pb-[max(4.5rem,calc(3.5rem+env(safe-area-inset-bottom)))] antialiased lg:pb-0">
        {/* Scroll-reveal no-JS güvenliği: JS çalışmazsa .reveal içerik görünür kalır. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsAppButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* GA, @next/third-parties yerine elle: o bileşen gtag.js'i hidrasyonla
            birlikte yüklüyor ve mobil LCP'ye ölçülmüş ~1,6 sn bindiriyordu.
            Satır içi bootstrap dataLayer'ı ilk byte'tan kurar (olaylar
            kuyruklanır, kayıp yok); ağır gtag.js boşta (idle) enjekte edilir.
            Çerez rıza bandı 2026-07-30'da Özgün'ün açık talimatıyla kaldırıldı
            (gerekçe/uyarılar sorunlu-siteler.md defterinde) — GA tüm
            ziyaretçilerde çalışır, /gizlilik metni bu duruma göre günceldir.
            Olay gönderimi lib/ga.ts üzerinden — davranış birebir aynı. */}
        {siteConfig.gaMeasurementId && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html:
                  `window.dataLayer=window.dataLayer||[];` +
                  `function gtag(){dataLayer.push(arguments);}` +
                  `gtag('js',new Date());` +
                  `gtag('config','${siteConfig.gaMeasurementId}');`,
              }}
            />
            <GaYukleyici gaId={siteConfig.gaMeasurementId} />
          </>
        )}
        {/* Vercel Web Analytics: ÇEREZSİZ toplu sayaç — kimlik/çerez yok,
            bu yüzden rıza bandına bağlı değildir ve HERKESİ sayar (GA yalnız
            "Kabul" diyenleri görür; toplam trafik buradan okunur). Panelde
            Web Analytics açık olmalı; kapalıyken bileşen sessizce boşa döner. */}
        <Analytics />
      </body>
    </html>
  );
}
