/**
 * Google dizinine HENÜZ GİRMEMİŞ site sayfaları — tarama önceliği listesi.
 *
 * Ölçüm (2026-08-01, canlı `site:` sorgusu, 36 aday sayfa tek tek soruldu):
 * 31 Temmuz'da dizin dışı olan 36 sayfanın 15'i bu süre içinde dizine girdi,
 * 21'i hâlâ dışarıda. Teşhis daha önce üç kez doğrulandı: sorun keşif değil
 * (sayfalar sitemap'te ve iç bağlantı grafında mevcut), TARAMA BÜTÇESİ.
 * Google bu sayfaların varlığını biliyor ama sıraya alıp taramıyor.
 *
 * Search Console'un "dizine eklenmesini iste" düğmesi bu darboğazı 24 saatte
 * açıyordu (10/10 sayfa dizine girdi, 4'ü doğrudan 1. sıraya) ama Search
 * Console mülküne erişimimiz şu an yok — elde kalan kotasız kaldıraç iç
 * bağlantı yoğunluğu.
 *
 * KULLANIM: site sayfasındaki "Komşu Siteler" bölümü 6 kart gösterir; bu
 * listedeki bir sayfa aynı mahalledeyse kartlardan biri ona ayrılır. Böylece
 * mahalledeki her site sayfası dizinsiz komşusuna bağ verir — Şehit Osman
 * Avcı'da 68 sayfa 6 dizinsiz sayfaya, Cumhuriyet'te 70 sayfa 1 sayfaya.
 *
 * BAKIM: sayfa dizine girdiğinde listeden ÇIKARILMALI, yoksa bağ bütçesi
 * gereksiz yere orada kalır. Kontrol yolu:
 *   site:siringayrimenkul.com/mahalleler/<mahalle>/<slug>
 */
const DIZINSIZ: Record<string, readonly string[]> = {
  "sehit-osman-avci-mahallesi": [
    "gungorler-tower",
    "mia-concept-konutlari",
    "goldekent-sitesi",
    "ahikent-sitesi",
    "safir-rezidans",
    "soyak-sitesi",
  ],
  "susuz-mahallesi": ["basak-life", "starlife", "baskent-goksu"],
  "ata-mahallesi": [
    "arikovani-sitesi",
    "gozde-evler-sitesi",
    "mizan-sitesi",
    "sarmasiklikosk-sitesi",
  ],
  "goksu-mahallesi": ["hava-destek-sitesi", "meydan-eryaman"],
  "eryaman-mahallesi": ["toki-konutlari"],
  "cumhuriyet-mahallesi": ["akasya-sitesi"],
  "seyh-samil-mahallesi": ["borankent"],
  "yavuz-selim-mahallesi": ["dogapark-sitesi", "goksu-sitesi"],
  "guzelkent-mahallesi": ["eczacilar-sitesi", "kucuk-ankara-villalari"],
};

/** Bu mahalledeki dizinsiz site slug'ları (ölçüm tarihi: 2026-08-01). */
export function taramaOncelikliSlugs(mahalleSlug: string): readonly string[] {
  return DIZINSIZ[mahalleSlug] ?? [];
}

/** Sayfanın kendisi tarama önceliğinde mi — kendine bağ vermeyi engellemek için. */
export function taramaOncelikliMi(mahalleSlug: string, siteSlug: string): boolean {
  return (DIZINSIZ[mahalleSlug] ?? []).includes(siteSlug);
}
