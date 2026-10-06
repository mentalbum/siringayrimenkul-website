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
    /* ESKİ ADRES SİTE HARİTASI KALDIRILDI (2026-10-07). 16.08'de 26.07 slug
     * taşımasının eski adreslerini (908) geçici bir site haritasıyla bildirmiştik
     * ki Google yeniden tarayıp 308'leri görsün; kaldırma koşulu "en geç 15.10"
     * idi. 04.10 taramasında ilk 3'teki 74 yanlış URL'nin 41'i hâlâ eski adres:
     * eski adresleri site haritasında tutmak onları Google'ın gözünde canlı da
     * tutuyor (ChatGPT istişaresi 07.10; Google'ın taşıma rehberi de taşıma
     * sonrası eski haritanın kaldırılmasını söyler). Tek adımlı 308'ler ve
     * next.config.ts'teki tüm yönlendirmeler DURUYOR (en az 1 yıl). Ölçüt:
     * haftalık SERP taramasında "eski" sayısı 41 → <10 → ~0. */
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
