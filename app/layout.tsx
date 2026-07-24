import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsAppButton } from "@/components/ui/floating-whatsapp-button";
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
    images: ["/images/ofis-ic-mekan.jpg"],
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
    description: siteConfig.description,
    image: `${siteConfig.url}/brand/sirin-logo-on-dark.png`,
    logo: organizationLogo,
    url: siteConfig.url,
    telephone: siteConfig.phoneTel,
    knowsLanguage: "tr-TR",
    sameAs: [
      siteConfig.officeMapsUrl,
      siteConfig.yandexMapsUrl,
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
      <body className="flex min-h-full flex-col antialiased">
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
      </body>
      {siteConfig.gaMeasurementId && <GoogleAnalytics gaId={siteConfig.gaMeasurementId} />}
    </html>
  );
}
