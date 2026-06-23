import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/site-config";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Eryaman Emlak Rehberi`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Eryaman Emlak Rehberi`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Eryaman Emlak Rehberi`,
    description: siteConfig.description,
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: siteConfig.name,
  image: `${siteConfig.url}/brand/sirin-logo-on-dark.png`,
  url: siteConfig.url,
  telephone: siteConfig.phoneTel,
  areaServed: [
    { "@type": "Place", name: "Eryaman, Etimesgut, Ankara" },
    { "@type": "Place", name: "Eryaman, Yenimahalle, Ankara" },
  ],
  address: {
    "@type": "PostalAddress",
    ...siteConfig.officeAddressParts,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.officeKoordinat.lat,
    longitude: siteConfig.officeKoordinat.lng,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${poppins.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </body>
    </html>
  );
}
