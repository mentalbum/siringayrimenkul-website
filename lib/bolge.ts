import type { Mahalle } from "./types";

/**
 * Eryaman, Etimesgut'un 11 mahallesinden oluşan bir BÖLGEDİR — idari bir
 * birim değil. Ata, Susuz ve Cumhuriyet Yenimahalle ilçesindedir; bölgeyle
 * iç içe yaşarlar ama Eryaman'da DEĞİLLERDİR.
 *
 * Kural (Özgün, 2026-07-28): "Eryaman'daki mahalleler haricindekilere Eryaman
 * deme." Yani bu üç mahalledeki bir site için başlıkta, gövde metninde,
 * görsel açıklamasında veya yapısal veride "Eryaman <site adı>" / "Eryaman'da
 * yer alan" denmez. Komşuluk belirtmek serbesttir ("Eryaman'ın doğu komşusu"),
 * konum iddiası yasaktır.
 */
export function eryamandaMi(mahalle: Pick<Mahalle, "ilce">): boolean {
  return mahalle.ilce === "Etimesgut";
}

/**
 * Sayfa üstündeki künye ve görsel açıklamaları için yer etiketi:
 * Etimesgut tarafında "Eryaman", Yenimahalle tarafında mahallenin kendi adı.
 */
export function yerEtiketi(mahalle: Pick<Mahalle, "ilce" | "isim">): string {
  return eryamandaMi(mahalle) ? "Eryaman" : mahalle.isim;
}

/**
 * Mahalle ve ada sayfası başlıkları için ÜST yer adı. Oralarda mahallenin adı
 * zaten başlığın içinde geçtiğinden `yerEtiketi` "Ata Mahallesi ... — Ata
 * Mahallesi Emlakçısı" gibi tekrar üretirdi; bu yüzden Yenimahalle tarafında
 * mahalle adına değil ilçeye düşer.
 */
export function ustBolgeEtiketi(mahalle: Pick<Mahalle, "ilce">): string {
  return eryamandaMi(mahalle) ? "Eryaman" : mahalle.ilce;
}
