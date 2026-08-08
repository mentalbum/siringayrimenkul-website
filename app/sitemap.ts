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

  /* STATİK SAYFA TARİHLERİ — elle bakımlı, kaynağı git geçmişi (2026-08-08).
   *
   * Neden elle: bu sayfalar JSX'te yaşıyor, içerik dosyasından türemiyor.
   * mtime KULLANILAMAZ — her yayında sıfırlanıyor ve sitemap'teki 1500+ adresin
   * neredeyse tamamına aynı build damgasını basıyor; Google bu gürültüyü
   * yok sayıyor. Tarihi olmayan sayfa da "değişmedi" gibi okunuyordu: bu blok
   * 08.08'e kadar `/` dışında hiçbir tarih taşımıyordu, dolayısıyla bir gün önce
   * baştan yazılan /eryamanda-ev-satmak ve /eryamanda-ev-kiraya-vermek için bile
   * Google'a hiçbir tazelik sinyali gitmiyordu.
   *
   * GÜNCELLEME: bir sayfayı elden geçirince buradaki tarihi de elle güncelle.
   * Toplu tazeleme için:
   *   git log -1 --format=%ad --date=short -- app/<yol>/page.tsx
   *
   * ANASAYFA ayrıca app/page.tsx VE app/layout.tsx'e bağlı — künye ya da gövde
   * değişince tarihi mutlaka güncellenmeli (07.08'de unutuldu, sonuç: canlı
   * ölçümde 08.08'de Google hâlâ 02.08 öncesi başlığı gösteriyordu ve
   * `"Evinizi Satalım, Kiraya Verelim" site:siringayrimenkul.com` sorgusunda
   * anasayfa hiç çıkmıyordu). */
  const g = (tarih: string) => new Date(tarih);
  const statikSayfalar: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: g("2026-08-08"), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/mahalleler`, lastModified: g("2026-07-24"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/siteler`, lastModified: g("2026-08-02"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/siteler/yenimahalle`, lastModified: g("2026-07-24"), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/ev-degerleme`, lastModified: g("2026-08-07"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/eryamanda-ev-satmak`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/eryamanda-ev-kiraya-vermek`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/araclar`, lastModified: g("2026-07-30"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/araclar/kira-artisi-hesaplama`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/araclar/tapu-harci-hesaplama`, lastModified: g("2026-07-23"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/araclar/emlak-komisyonu-hesaplama`, lastModified: g("2026-08-07"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/araclar/site-karsilastirma`, lastModified: g("2026-07-30"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/eryaman-site-dokusu`, lastModified: g("2026-07-30"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sozluk`, lastModified: g("2026-08-07"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/gizlilik`, lastModified: g("2026-07-30"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/blog`, lastModified: g("2026-07-24"), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/hakkimizda`, lastModified: g("2026-07-29"), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/iletisim`, lastModified: g("2026-07-25"), changeFrequency: "yearly", priority: 0.4 },
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
