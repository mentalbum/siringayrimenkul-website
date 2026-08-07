/** Blog yazılarının konu haritası — dizindeki filtre çipleri ve yazı
 * altındaki "İlgili Yazılar" seçimi buradan beslenir. Yeni yazı eklenince
 * buraya bir satır eklemek yeterli; haritada olmayan slug "mahalle" dışındaki
 * listelerde görünmez ama dizinde her zaman listelenir.
 *
 * 2026-08-07: Türkiye geneli 24 genel bilgi yazısı siteden kaldırıldı (Özgün
 * kararı — blog SADECE Eryaman'la ilgili). "miras-tapu" kategorisi bu
 * temizlikle boşaldı ve tipten de çıkarıldı; yeniden Eryaman-dışı genel
 * rehber ekleme. */

export type BlogKonu = "satis" | "kira" | "mahalle";

export const KONU_ETIKETLERI: Record<BlogKonu, string> = {
  satis: "Ev Satmak",
  kira: "Kiraya Vermek",
  mahalle: "Mahalleler",
};

const KONULAR: Record<string, BlogKonu> = {
  // Ev satmak
  "eryamanda-ev-satis-sureci": "satis",
  "eryaman-disinda-yasayanlar-icin-ev-satisi-kiralama": "satis",
  "eryamanda-ev-fiyatlarini-ne-belirler": "satis",
  // Kiraya vermek
  "eryamanda-kira-tespiti-dogru-kira-belirleme": "kira",
  // Mahalle ve bölge
  "eryamanda-hangi-mahalle": "mahalle",
  "eryamanda-etap-sistemi-nedir": "mahalle",
  "eryamanda-konut-turleri": "mahalle",
  "eryamanda-ev-alirken-dikkat-edilmesi-gerekenler": "mahalle",
};

export function getBlogKonu(slug: string): BlogKonu {
  if (KONULAR[slug]) return KONULAR[slug];
  // "-mahallesinde-yasam" deseni ve bilinmeyenler mahalle grubuna düşer.
  return "mahalle";
}
