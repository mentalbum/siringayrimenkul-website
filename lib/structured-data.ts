import { siteConfig } from "./site-config";

/**
 * Stable @id anchors for the site's core entities. Referencing these from every
 * page (instead of repeating full objects) lets Google merge the structured
 * data into a single knowledge graph: one Organization, one WebSite, with
 * Articles/pages pointing back at them.
 */
export const ORG_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/** Lightweight reference to the Organization node defined in the root layout. */
export const organizationRef = { "@id": ORG_ID } as const;

/** Publisher logo per Google's Article structured-data guidelines. */
export const organizationLogo = {
  "@type": "ImageObject",
  url: `${siteConfig.url}/brand/sirin-logo-on-light.png`,
  width: 673,
  height: 327,
} as const;

/** E-E-A-T: sitedeki içeriğin arkasındaki kişi — blog yazarı ve danışman.
 * Tek Person düğümü; blog Article'ları ve Hakkımızda buna @id ile bağlanır. */
export const OZGUN_ID = `${siteConfig.url}/hakkimizda#ozgun-sirin`;

export const ozgunRef = { "@id": OZGUN_ID } as const;

export const ozgunPersonJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": OZGUN_ID,
  name: "Özgün Şirin",
  jobTitle: "Emlak Danışmanı",
  worksFor: organizationRef,
  telephone: siteConfig.phoneTel,
  url: `${siteConfig.url}/hakkimizda`,
  knowsAbout: [
    "Eryaman emlak piyasası",
    "Eryaman satılık ve kiralık konut",
    "Ev değerleme",
    "Etimesgut ve Yenimahalle site/rezidans yerleşimleri",
  ],
} as const;

/** WebSite entity — establishes the site name + language for Google. */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: siteConfig.url,
  name: siteConfig.name,
  inLanguage: "tr-TR",
  publisher: organizationRef,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/siteler?ara={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;
