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

/** WebSite entity — establishes the site name + language for Google. */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: siteConfig.url,
  name: siteConfig.name,
  inLanguage: "tr-TR",
  publisher: organizationRef,
} as const;
