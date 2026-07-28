import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsAppButton } from "@/components/ui/floating-whatsapp-button";
import { CerezOnayi } from "@/components/analytics/cerez-onayi";
import { siteConfig } from "@/lib/site-config";
import { getAllMahalleler } from "@/lib/content";
import { getGoogleReviewSummary } from "@/lib/google-reviews";
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
    // Keyword-first for the homepage: the head query is "eryaman emlakçı".
    default: `Eryaman Emlakçısı | ${siteConfig.name}`,
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
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/ofis-ic-mekan.jpg",
        width: 1284,
        height: 936,
        alt: "Şirin Gayrimenkul ofisi — Eryaman Etimesgut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // images bilerek yok: burada tanımlanırsa 727 site sayfasının tamamı bu tek
    // görseli miras alıyor ve sayfaya özel opengraph-image kartını gölgeliyordu.
    // twitter:image yokken X/Twitter og:image'a düşer — o da doğru karttır.
  },
  verification: {
    google: "k1TcGp1CMeFpPUlbp91mnEqvCaHu1y1-si6t0F6xjOA",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reviewSummary = await getGoogleReviewSummary();

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: siteConfig.name,
    // İnsanlar bizi "Eryaman Şirin Gayrimenkul" diye de arıyor (Yandex kaydımız
    // da bu adla); ayrıca başka illerde aynı adlı firmalar var — alternateName
    // marka aramasında doğru işletmeyi ayırt etmeye yardım eder.
    alternateName: ["Eryaman Şirin Gayrimenkul", "Şirin Gayrimenkul Eryaman"],
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
    ...(reviewSummary && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewSummary.rating,
        reviewCount: reviewSummary.userRatingCount,
      },
    }),
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
            kuyruklanır, kayıp yok). Ağır gtag.js ise ÇEREZ RIZASINA bağlı:
            KVKK Kurulu Çerez Rehberi analitik çerez için açık rıza istiyor —
            CerezOnayi "Kabul" gelmeden script'i hiç yüklemez (bkz. /gizlilik).
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
            <CerezOnayi gaId={siteConfig.gaMeasurementId} />
          </>
        )}
      </body>
    </html>
  );
}
