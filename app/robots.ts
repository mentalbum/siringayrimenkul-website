import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/* OG GÖRSEL UÇLARI GOOGLEBOT'A KAPALI (2026-08-08).
 *
 * Next.js her opengraph-image.tsx için ayrı bir URL yayınlıyor
 * (<sayfa>/opengraph-image?<hash>). 15 şablonun beşi dinamik ([site], [ada],
 * [etap], [mahalle], [slug]) olduğundan bu, 1500'ü aşkın taranabilir adres
 * demek. Googlebot bunları SAYFA sanıp tarıyor: 08.08 Search Console
 * ölçümünde "Tarandı - dizine eklenmedi" grubunun 63 kaydının 57'si bu
 * uçlardı. Hiçbiri dizine girmiyor, girmesi de istenmiyor — tek yaptıkları
 * tarama bütçesini yemek. Aynı gün 212 GERÇEK site sayfası hâlâ
 * "keşfedildi ama taranmadı" sırasında bekliyordu; bütçe oraya gitmeli.
 *
 * Kural neden yalnız Googlebot'a: og:image'in asıl tüketicisi sosyal
 * paylaşım robotları (facebookexternalhit, Twitterbot, WhatsApp) ve onlar
 * robots.txt'e uyuyor. Genel bir Disallow, WhatsApp/Facebook önizleme
 * görsellerini öldürürdü. Googlebot'un bu görsellere ihtiyacı yok: SERP
 * küçük görselini sayfa içeriğindeki fotoğraftan seçiyor ve o fotoğrafın
 * özgün yolu sitemap'te ayrıca bildiriliyor (bkz. app/sitemap.ts, images).
 *
 * Googlebot-Image'ın kendi grubu yok; Google dokümantasyonuna göre kendi
 * jetonu tanımlı değilse "Googlebot" grubunu uygular — yani görsel taraması
 * da bu kuralın kapsamında. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: "/*opengraph-image",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    /* GEÇİCİ İKİNCİ SİTE HARİTASI (2026-08-16): sitemap-eski-adresler.xml.
     * 26.07 mahalle slug taşımasından kalan 242 eski adres 308 ile yeni
     * adreslerine yönleniyor, ama Google eski adresi YENİDEN TARAMADAN
     * yönlendirmeyi göremiyor — ölçümde (16.08, GSC API) 967 sorguda kendi
     * sayfalarımız yarışıyor ve bu yarışın %26'sı (7.527 gösterim) eski
     * adreslerde sıkışmış. Google'ın adres değişikliği rehberi bu durumda
     * eski adresleri geçici bir site haritasıyla bildirmeyi öneriyor.
     * KALDIRMA KOŞULU: adresler GSC'de "Yönlendirmeli sayfa" kovasına
     * geçince ya da en geç 2026-10-15'te bu satır ve dosya SİLİNECEK. */
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-eski-adresler.xml`,
    ],
  };
}
