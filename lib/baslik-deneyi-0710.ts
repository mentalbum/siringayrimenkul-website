import type { Site } from "./types";

/**
 * BAŞLIK DENEYİ 2 — bilgi odaklı başlık (kurulum 2026-10-07, okuma 2026-11-04).
 *
 * Soru: yalın site adı sorgularında (talebin ~%65'i, ort. konum ~9,5, TO %0,8)
 * ticari "<Site> Emlakçı | <Mahalle> Eryaman | Evinizi Satalım, Kiraya Verelim"
 * başlığı yerine arayanın ilk sorusunu ("bu sonuç gerçekten X hakkında mı?")
 * cevaplayan kısa bilgi başlığı tıklanma oranını artırır mı? ChatGPT
 * istişaresi (07.10, Özgün talimatı); Google'ın başlık rehberi de kısa,
 * açıklayıcı, boilerplate'i düşük başlık öneriyor.
 *
 * Tasarım: 50 tedavi + 50 kontrol; aday = 28g GSC gösterimi ≥80 olan site
 * sayfaları, 04.10'da başlığı değişen 45 kontrol sayfası (4 hafta dokunma
 * kuralı), kaldırılan mahalleler ve ADAŞ adlı siteler (mahallesiz başlık
 * onlarda çakışır) hariç; gösterim sırasına göre dönüşümlü eşleştirme
 * (tedavi 15.440 / kontrol 14.293 gösterim, ort. konum 7,65 / 7,60).
 * Kontrol listesi ve ölçüm tanımı: scratchpad-karne/pws0/baslik-deneyi-0710.json.
 *
 * Ölçüt (28 gün): GSC sayfa×sorgu, yalnız yalın ad / ad+Eryaman sorgularında,
 * aynı konum bandında tedavi CTR ↔ kontrol CTR; ikincil: Google'ın başlığı
 * aynen gösterme oranı (SERP tarayıcı 'bas' alanı) ve doğru-sayfa oranı.
 * Başarıysa kural herkese yayılır; değilse bu dosya silinir, başlık eski
 * kalıba döner. H1 ve gövde DEĞİŞMEZ — yalnız <title> ve description.
 */
export const BASLIK_DENEYI_TEDAVI = new Set<string>([
  "eryaman-mahallesi/oyak-555-konut-sitesi",
  "sehit-osman-avci-mahallesi/mia-concept-konutlari",
  "tunahan-mahallesi/mavicam-sitesi",
  "tunahan-mahallesi/canberk-sitesi",
  "goksu-mahallesi/havuzlu-bahce-konutlari",
  "sehit-osman-avci-mahallesi/arkadya-goksu-evleri",
  "tunahan-mahallesi/age-sitesi",
  "seyh-samil-mahallesi/atayildiz-yasam-konutlari",
  "sehit-osman-avci-mahallesi/bordo-life-residence",
  "yavuz-selim-mahallesi/dogapark-sitesi",
  "sehit-osman-avci-mahallesi/kiratli-residence",
  "yavuz-selim-mahallesi/serhatkent-sitesi",
  "goksu-mahallesi/goksu-metrokent-sitesi",
  "yavuz-selim-mahallesi/terasevler-eryaman",
  "tunahan-mahallesi/sutek-sitesi",
  "eryaman-mahallesi/basak-sitesi",
  "sehit-osman-avci-mahallesi/bp-residence-eryaman",
  "yavuz-selim-mahallesi/yurt-prestij-konutlari",
  "eryaman-mahallesi/ankapark-konutlari",
  "seyh-samil-mahallesi/demirel-park-evleri",
  "yesilova-mahallesi/pozitif-life",
  "seker-mahallesi/meydan-ada-sitesi",
  "seyh-samil-mahallesi/ilona-konutlari",
  "yesilova-mahallesi/penta-5",
  "goksu-mahallesi/irem-konutlari",
  "sehit-osman-avci-mahallesi/bulvar-1071-sitesi",
  "tunahan-mahallesi/neopolitan-eryaman",
  "eryaman-mahallesi/atakent-2-cumhuriyet-sitesi",
  "seker-mahallesi/altas-rezidans",
  "yavuz-selim-mahallesi/elit-nar-cicegi",
  "devlet-mahallesi/bayrak-sitesi",
  "altay-mahallesi/arya-nuans-residence",
  "yavuz-selim-mahallesi/yeni-kaynak-sitesi",
  "yavuz-selim-mahallesi/serpil-sitesi",
  "sehit-osman-avci-mahallesi/cizgi-otesi-residence",
  "seker-mahallesi/akdal-residence",
  "sehit-osman-avci-mahallesi/gokdemirler-suit",
  "eryaman-mahallesi/atakent-1-asiyan-sitesi",
  "eryaman-mahallesi/yeni-portakal-cicegi-sitesi",
  "seyh-samil-mahallesi/umar-sitesi",
  "devlet-mahallesi/bilgi-sevgi-hosgoru-sitesi",
  "yavuz-selim-mahallesi/atadostlar-sitesi",
  "devlet-mahallesi/asiyan-sitesi",
  "sehit-osman-avci-mahallesi/address-goksu",
  "goksu-mahallesi/polsan1-ayisigi-sitesi",
  "sehit-osman-avci-mahallesi/bordo-platinum-residence",
  "guzelkent-mahallesi/boyut-sitesi",
  "goksu-mahallesi/yeniceri-kule",
  "yavuz-selim-mahallesi/endora-eryaman",
  "eryaman-mahallesi/platin-2-konutlari",
]);

export function baslikDeneyinde(site: Pick<Site, "mahalleSlug" | "slug">): boolean {
  return BASLIK_DENEYI_TEDAVI.has(`${site.mahalleSlug}/${site.slug}`);
}

/** "<Site> Eryaman | Tapu ve Site Bilgileri"; adında Eryaman geçen sitede
 * kelime tekrarlanmaz. Mahalle bilerek yok: sorgular "eryaman <site>"
 * biçiminde, mahalle karakter yiyor (ChatGPT şablonu, 07.10). */
export function bilgiBasligi(isim: string): string {
  return /eryaman/i.test(isim)
    ? `${isim} | Tapu ve Site Bilgileri`
    : `${isim} Eryaman | Tapu ve Site Bilgileri`;
}

/** Açıklama: önce sorgunun bilgi ihtiyacı, sonra ev sahibi çağrısı. 155
 * karakteri aşarsa kanal sayımı düşer (uzun adlar). */
export function bilgiAciklamasi(isim: string): string {
  const bas = /eryaman/i.test(isim) ? `${isim}: tapu ve site bilgileri.` : `${isim}, Eryaman: tapu ve site bilgileri.`;
  const uzun = `${bas} Bu sitede daireniz varsa satış veya kiralama için WhatsApp ya da telefonla Şirin Gayrimenkul'e ulaşın.`;
  const kisa = `${bas} Bu sitede daireniz varsa satış veya kiralama için Şirin Gayrimenkul'e ulaşın.`;
  return uzun.length <= 155 ? uzun : kisa;
}
