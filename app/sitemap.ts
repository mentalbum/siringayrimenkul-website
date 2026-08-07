import type { MetadataRoute } from "next";
import {
  getAllBlogPosts,
  getAllAdalar,
  adaRouteKey,
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
    // Anasayfa künyesi (title/description) 2026-08-06'da ev sahibi diline
    // çevrildi; Google hâlâ eski künyeyi gösteriyor. Tarih, yeniden taramayı
    // tetiklemek için; künye bir daha değişirse güncellenmeli.
    { url: `${baseUrl}/`, lastModified: new Date("2026-08-06"), changeFrequency: "weekly", priority: 1 },
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

  // Site sayfalarının ŞABLONU bu tarihte değişti: başlıklar/SSS/bağ metinleri
  // alıcı dilinden ev sahibi diline çevrildi ve marka eki başlıktan kalktı.
  // lastModified içerik dosyasının değişim tarihinden geliyor; şablon değişince
  // içerik dosyası değişmiyor ama SAYFA değişiyor — Google eski taramada kalıp
  // SERP'te bayat "Satılık Daire ve Kiralık Daire" başlıklarını göstermeye devam
  // ediyordu. Taban tarihi, tüm site sayfalarının yeniden taranmasını tetikler.
  // Şablon bir daha topluca değişirse bu tarih güncellenmeli.
  const SABLON_DEGISIMI = new Date("2026-08-07");
  const siteSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/${site.slug}`,
      lastModified: (() => {
        const icerik = getSiteLastModified(mahalle.slug, site.slug);
        return icerik > SABLON_DEGISIMI ? icerik : SABLON_DEGISIMI;
      })(),
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

  // TEK SİTELİ ada sayfaları sitemap'e GEÇİCİ olarak alındı (2026-08-02).
  //
  // Arka plan: 2026-07-28'de bu sayfalar sitemap dışına çıkarılmıştı (777 ada
  // sayfası 3 ayda 0 tıklama / 0 gösterim almıştı; tarama bütçesi getirisi
  // olmayan sayfalara gidiyordu). Ama bu, ters bir sonuç doğurdu: sayfalar
  // noindex etiketi taşımasına rağmen dizinde KALDI, çünkü Google onları
  // yeniden tarayıp etiketi görmedi. 298 sitelik canlı SERP taramasında 51
  // sitede, site adı arandığında site sayfası yerine ada sayfası çıkıyordu.
  //
  // Yeni çözüm: ada sayfasının canonical'ı artık site sayfasını gösteriyor
  // (app/mahalleler/[mahalle]/adalar/[ada]/page.tsx). Ama canonical'ın işe
  // yaraması için Google'ın sayfayı BİR KEZ taraması şart — sitemap dışında
  // kaldığı sürece o tarama hiç gelmiyor. Bu yüzden tek siteli ada sayfaları
  // düşük öncelikle sitemap'e alındı: Google tarayıp canonical'ı görsün,
  // sayfayı site sayfasına katlasın.
  //
  // Paylaşımlı parseller (bir adada birden çok site) HARİÇ: onların kanonik
  // sürümü kendileri ve noindex sürüyor, sitemap'e girmezler.
  //
  // BU GEÇİCİDİR: canonical'lar işlendikten sonra (Search Console'da ada
  // sayfaları "alternatif sayfa, uygun kanonik etiketi var" durumuna geçince)
  // burası tekrar kapatılmalı ki tarama bütçesi site sayfalarına kalsın.
  const adaSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) => {
    const gruplar = new Map<string, number>();
    for (const ada of getAllAdalar(mahalle.slug)) {
      const key = adaRouteKey(ada);
      gruplar.set(key, (gruplar.get(key) ?? 0) + 1);
    }
    return [...gruplar]
      .filter(([, adet]) => adet === 1)
      .map(([key]) => ({
        url: `${baseUrl}/mahalleler/${mahalle.slug}/adalar/${key}`,
        lastModified: getMahalleLastModified(mahalle.slug),
        changeFrequency: "yearly" as const,
        priority: 0.2,
      }));
  });

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
    ...adaSayfalari,
    ...blogSayfalari,
  ];
}
