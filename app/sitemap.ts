import type { MetadataRoute } from "next";
import {
  getAllAdalar,
  getAllBlogPosts,
  getAllEtaplar,
  getYayindaMahalleler,
  getSitelerByMahalle,
} from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const yayindaMahalleler = getYayindaMahalleler();

  const statikSayfalar: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/mahalleler`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/siteler`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/hakkimizda`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/iletisim`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const mahalleSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.map((mahalle) => ({
    url: `${baseUrl}/mahalleler/${mahalle.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const siteSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/${site.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  const etapSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getAllEtaplar(mahalle.slug).map((etap) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/etaplar/${etap.no}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  const adaSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getAllAdalar(mahalle.slug).map((ada) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/adalar/${ada.no}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const blogSayfalari: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.tarih,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...statikSayfalar,
    ...mahalleSayfalari,
    ...siteSayfalari,
    ...etapSayfalari,
    ...adaSayfalari,
    ...blogSayfalari,
  ];
}
