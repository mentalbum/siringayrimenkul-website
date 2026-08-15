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
  icerikKlasoruTarihi,
} from "@/lib/content";
import { eryamandaMi } from "@/lib/bolge";
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
    // 15.08: ana sayfa "kim" bloğuyla yeniden düzenlendi (güvenilir emlakçı
    //        pasajı SSS'ten görünür metne çıktı, blog SSS altına indi, meta
    //        description 229→119 karakter, alıcı hitabı kalktı).
    { url: `${baseUrl}/`, lastModified: g("2026-08-15"), changeFrequency: "weekly", priority: 1 },
    // 08.08: etap hub'ına giden bölüm eklendi.
    // 15.08(b): 'nereye bağlı' cevabı Özgün kararıyla geri söküldü (bilgi trafiği istenmiyor).
    { url: `${baseUrl}/mahalleler`, lastModified: [icerikKlasoruTarihi("mahalleler"), g("2026-08-15")].reduce((a, b) => (a && b ? (a > b ? a : b) : a || b)), changeFrequency: "weekly", priority: 0.9 },
    // Etap hub'ı: mahalleden bağımsız etap aramalarının adresi ve beş etap
    // sayfasına giden tek toplayıcı bağ (08.08 ölçümü: 5 etap sayfasının 4'ü
    // "Keşfedildi – dizine eklenmedi" kuyruğunda).
    { url: `${baseUrl}/etaplar`, lastModified: g("2026-08-08"), changeFrequency: "weekly", priority: 0.9 },
    /* HUB'LAR ELLE TARİHLENMEZ — aşağıdaki dördü içerik klasöründen beslenir.
     * Elle yazılan tarih bir sonraki içerik değişikliğinde sessizce bayatlıyor:
     * 08.08 ölçümünde /blog 2026-07-24 diyordu ama 07.08'de 24 yazı silinmişti,
     * /siteler 2026-08-02 diyordu ama o gün 14 kayıt yeniden yazılmıştı. */
    { url: `${baseUrl}/siteler`, lastModified: icerikKlasoruTarihi("siteler"), changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${baseUrl}/siteler/yenimahalle`,
      // Grup `ilce` alanından türer (lib/bolge.ts) — sabit mahalle listesi
      // yazılmaz, yeni mahalle eklenince sessizce yanlış olur.
      lastModified: icerikKlasoruTarihi(
        ...yayindaMahalleler.filter((m) => !eryamandaMi(m)).map((m) => `siteler/${m.slug}`)
      ),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    /* 08.08 (2. kez): footer'a "Eryaman Etapları" bloğu eklendi (5996267,
     * 288167c) — footer KÜRESEL şablon, aşağıdaki sabit tarihli sayfaların
     * tamamı değişti. AGENTS.md kuralı gereği elle güncellendi. */
    { url: `${baseUrl}/ev-degerleme`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/eryamanda-ev-satmak`, lastModified: g("2026-08-15"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/eryamanda-ev-kiraya-vermek`, lastModified: g("2026-08-15"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/araclar`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/araclar/kira-artisi-hesaplama`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/araclar/tapu-harci-hesaplama`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/araclar/emlak-komisyonu-hesaplama`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/araclar/site-karsilastirma`, lastModified: g("2026-08-08"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/eryaman-site-dokusu`, lastModified: icerikKlasoruTarihi("siteler"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sozluk`, lastModified: g("2026-08-10"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/gizlilik`, lastModified: g("2026-08-08"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/blog`, lastModified: icerikKlasoruTarihi("blog"), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/hakkimizda`, lastModified: g("2026-08-08"), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/iletisim`, lastModified: g("2026-08-08"), changeFrequency: "yearly", priority: 0.4 },
  ];

  /* ŞABLON TABANLARI — bir sayfa ailesinin lastModified'ı, içerik dosyasının
   * tarihi ile ŞABLONUN son değişim tarihinin büyüğüdür.
   *
   * Neden taban gerekiyor: künye/SSS/bağ metinleri JSX şablonunda yaşıyor.
   * Şablon değişince 723 site sayfasının tamamı değişiyor ama içerik JSON'ları
   * değişmiyor — taban olmadan Google'a "bu sayfalar değişmedi" denmiş oluyor.
   * 02.08'de başlıklar ev sahibi diline çevrildiğinde tam bu oldu: 08.08'de
   * canlı SERP hâlâ eski başlığı gösteriyordu.
   *
   * GÜNCELLEME: ilgili şablon topluca değişince buradaki tarihi de güncelle.
   *   git log -1 --format=%ad --date=short -- "app/mahalleler/[mahalle]/[site]/page.tsx" */
  const SABLON = {
    // 15.08: harita sütunu sabit boy + yapışkan oldu (fotoğraflı sayfalarda
    //        sol sütunla birlikte 1000px+ uzuyordu).
    // 12.08(b): benzer adlı yerleşim çapraz bağı (lib/benzer-adlar.json, 23 sayfa).
    // 12.08: description'a site-özel olgu cümlesi girdi (lib/site-olgulari.json;
    //        çıkarma+denetim ajan turu, kayıt metinlerinden — TO açığı işi) ve
    //        satış+kiralama niyeti birlikte anılır oldu.
    // 09.08: benzer adlı site çiftlerinde başlık soneki mahalleyle açılır oldu
    //        (54 sayfa; ölçümde Google "Aktürk Sitesi" aramasında Altay'daki
    //        Aktürk Blokları sayfasını gösteriyordu).
    // 08.08: iç bağ çapaları rotasyonlu hâle geldi (15ad273).
    // 07.08: alıcı dili tamamen söküldü, marka eki başlıktan kalktı (77153e2).
    site: new Date("2026-08-15"),
    // 11.08: Place JSON-LD'ye alternateName (alias'lı mahalleler) + PostalAddress
    //        eklendi — yaygın adlı mahallelerde il/ilçe ayrıştırması.
    // 10.08: başlıktan alternatif ad ve bölge eki çıkarıldı — 14 mahallenin
    //        14'ünde de ticari mesaj Google'ın kesme sınırının ötesindeydi
    //        (67-95 karakter). Yeni biçim 55-68, hepsi görünür.
    // 09.08: site kartları tam açıklama yerine 220 karakterlik özet basıyor.
    // 15.08: Eryaman kolunda ana sayfaya "Eryaman emlakçı" çıpalı bağ eklendi.
    mahalle: new Date("2026-08-15"),
    // 11.08: 4. Etap'a yönetimin sitesinden (eryaman4.com) doğrulanmış tek-yönetim
    //        cümlesi girdi — özgün tanıtım cümlesi olmayan tek etaptı.
    // 09.08: başlık düzeni site şablonuyla hizalandı, marka eki kalktı (96→80);
    //        site kartları tam açıklama yerine 220 karakterlik özet basıyor.
    // 10.08: Service+provider ve ItemList işaretlemesi eklendi (mahalle şablonuyla
    //        eşitlendi); 2. Etap'a yönetimin kendi sitesinden doğrulanmış ısıtma
    //        cümlesi girdi; mükerrer ada rozetleri tekillendi (ada sayısı düzeldi).
    // 08.08: etaplar arası bağ mahalle sınırından çıkarıldı, /etaplar hub bağı eklendi.
    // 07.08: 1./2./3. Etap sayfaları resmî ada listeleriyle açıldı (81cda7d, 18a5cec).
    // 15.08: ana sayfaya "Eryaman emlakçı" çıpalı bağ eklendi.
    etap: new Date("2026-08-15"),
    // 08.08: footer'a etap bloğu eklendi — küresel şablon, 767 ada sayfası da
    //        değişti (5996267, 288167c).
    // 09.08: başlıktan ticari kalıp ("… Ada Emlakçı | Evinizi Satalım…")
    //        kaldırıldı; ada sayfası 32 vakada site sayfasının yerine
    //        sıralanıyordu (pws=0 ölçümü, 187 site).
    // 03.08: ada sayfalarının canonical'ı site sayfasına çevrildi (ce068bd).
    // Bu sayfaların sitemap'te olmasının TEK amacı Google'ın o canonical'ı
    // bir kez görmesi — bkz. aşağıdaki uzun not. Tazelik damgası burada tam da
    // bunun için değerli: sayfa yeniden taranmazsa canonical hiç görülmüyor.
    ada: new Date("2026-08-09"),
  };
  const enYeni = (icerik: Date | undefined, taban: Date) =>
    icerik && icerik > taban ? icerik : taban;

  const mahalleSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.map((mahalle) => ({
    url: `${baseUrl}/mahalleler/${mahalle.slug}`,
    lastModified: enYeni(getMahalleLastModified(mahalle.slug), SABLON.mahalle),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const siteSayfalari: MetadataRoute.Sitemap = yayindaMahalleler.flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      url: `${baseUrl}/mahalleler/${mahalle.slug}/${site.slug}`,
      lastModified: enYeni(getSiteLastModified(mahalle.slug, site.slug), SABLON.site),
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
      lastModified: enYeni(
        etap.siteler
          .map((site) => getSiteLastModified(mahalle.slug, site.slug))
          .sort((a, b) => b.getTime() - a.getTime())[0],
        SABLON.etap
      ),
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
        lastModified: enYeni(getMahalleLastModified(mahalle.slug), SABLON.ada),
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
