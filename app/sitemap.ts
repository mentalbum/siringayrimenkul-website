import type { MetadataRoute } from "next";
import {
  getAllBlogPosts,
  getAllEtaplar,
  getBlogPostLastModified,
  getMahalleLastModified,
  getSiteLastModified,
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
    { url: `${baseUrl}/siteler/yenimahalle`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/ev-degerleme`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/eryamanda-ev-satmak`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/eryamanda-ev-kiraya-vermek`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/araclar`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/araclar/kira-artisi-hesaplama`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/araclar/tapu-harci-hesaplama`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/araclar/emlak-komisyonu-hesaplama`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/araclar/site-karsilastirma`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/eryaman-site-dokusu`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sozluk`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/gizlilik`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/hakkimizda`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/iletisim`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const mahalleSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.map((mahalle) => ({
    url: `${baseUrl}/mahalleler/${mahalle.slug}`,
    lastModified: getMahalleLastModified(mahalle.slug),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const siteSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/${site.slug}`,
      lastModified: getSiteLastModified(mahalle.slug, site.slug),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // Sayfada görsel /_next/image?url=... proxy'si üzerinden servis ediliyor
      // ve Google bu adresleri indekslemiyor; orijinal yolu sitemap'ten veriyoruz.
      ...(site.gorsel && { images: [`${baseUrl}${site.gorsel}`] }),
    }))
  );

  const etapSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getAllEtaplar(mahalle.slug).map((etap) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/etaplar/${etap.no}`,
      lastModified: etap.siteler
        .map((site) => getSiteLastModified(mahalle.slug, site.slug))
        .sort((a, b) => b.getTime() - a.getTime())[0],
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  // Ada sayfaları bilinçli olarak sitemap DIŞINDA (2026-07-28). Search Console
  // ölçümü: 777 ada sayfası 3 ayda 0 tıklama / 0 gösterim aldı — "17312 ada"
  // diye arama yapılmıyor. Buna karşılık 727 site sayfasının 329'u "keşfedildi,
  // şu anda dizine eklenmiş değil" durumundaydı; tarama bütçesi getirisi olmayan
  // ada sayfalarına gidiyordu. Sayfalar duruyor (site sayfasından tıklayan
  // kullanıcı tapu bilgisini görsün) ama noindex + sitemap dışı: bütçe site
  // sayfalarına aksın. Geri almak için burayı ve ada sayfasındaki robots'u aç.

  // dizinDisi yazılar sitemap'e girmez (noindex ile tutarlı — bkz. lib/types.ts).
  const blogSayfalari: MetadataRoute.Sitemap = getAllBlogPosts()
    .filter((post) => !post.dizinDisi)
    .map((post) => {
    // Edited posts should signal their real modification time so crawlers
    // refetch them — but never a date before publication.
    const mtime = getBlogPostLastModified(post.slug);
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: mtime > new Date(post.tarih) ? mtime : post.tarih,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [
    ...statikSayfalar,
    ...mahalleSayfalari,
    ...siteSayfalari,
    ...etapSayfalari,
    ...blogSayfalari,
  ];
}
