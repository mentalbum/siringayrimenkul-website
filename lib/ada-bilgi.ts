import type { Site } from "@/lib/types";

/** Site açıklamasındaki tapu/kayıt cümlesini ayıklar.
 *
 * Ada sayfaları bugüne kadar tek satırlık bir yönlendirmeden ibaretti; oysa o
 * parselin tapu niteliği ve ölçeği zaten site metnine işlenmiş durumda. Burada
 * o cümleyi çıkarıp ada sayfasında da gösteriyoruz — ziyaretçi kendi adasını
 * arayıp geldiğinde aradığı bilgiyi ilk ekranda buluyor. */
const TAPU_BASLANGICLARI = [
  "Tapu kaydı",
  "Tapu kaydına göre",
  "TKGM kayıtlarına göre",
  "TKGM'de",
  "TKGM'ye göre",
  "Tapu kayıtları",
  "Belediye kent rehberi kayıtlarına göre",
  "Yenimahalle Belediyesi kent rehberi kayıtlarına göre",
  "Ana parselinde tapu",
];

export function tapuCumlesi(site: Site): string | null {
  const metin = site.aciklama;
  for (const bas of TAPU_BASLANGICLARI) {
    const i = metin.indexOf(bas);
    if (i === -1) continue;
    // Cümle sonunu bul: nokta + boşluk + büyük harf (ondalık/kısaltma atlanır).
    const kalan = metin.slice(i);
    const eslesme = kalan.match(/^[^]*?[.](?=\s+[A-ZÇĞİÖŞÜ]|\s*$)/);
    const cumle = (eslesme ? eslesme[0] : kalan.split(". ")[0] + ".").trim();
    // Kapanış/CTA cümlesine taşmışsa alma.
    if (cumle.includes("satılık veya kiralık")) return null;
    return cumle.length > 40 ? cumle : null;
  }
  return null;
}

/** Kayıttaki blok/kapı numarası bilgisini taşıyan özellik maddeleri —
 * "kendi bloğumu görüyor muyum" sorusunun cevabı. */
export function blokOzellikleri(site: Site): string[] {
  return (site.ozellikler ?? []).filter((o) => {
    const k = o.toLocaleLowerCase("tr");
    return (
      (k.includes("blok") || k.includes("kapı no") || k.includes("apartman")) &&
      !k.includes("tkgm") &&
      !k.includes("dönüm") &&
      !k.includes("parsel")
    );
  });
}
