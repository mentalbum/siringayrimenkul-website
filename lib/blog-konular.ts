/** Blog yazılarının konu haritası — dizindeki filtre çipleri ve yazı
 * altındaki "İlgili Yazılar" seçimi buradan beslenir. Yeni yazı eklenince
 * buraya bir satır eklemek yeterli; haritada olmayan slug "mahalle" dışındaki
 * listelerde görünmez ama dizinde her zaman listelenir. */

export type BlogKonu = "satis" | "kira" | "miras-tapu" | "mahalle";

export const KONU_ETIKETLERI: Record<BlogKonu, string> = {
  satis: "Ev Satmak",
  kira: "Kiraya Vermek",
  "miras-tapu": "Miras & Tapu",
  mahalle: "Mahalleler",
};

const KONULAR: Record<string, BlogKonu> = {
  // Ev satmak
  "eryamanda-ev-satis-sureci": "satis",
  "ev-satarken-gerekli-evraklar": "satis",
  "ev-satarken-odenecek-vergiler": "satis",
  "evinizi-satarken-dogru-emlakci-secimi": "satis",
  "evinizi-satisa-hazirlamak": "satis",
  "emlakcisiz-ev-satilir-mi": "satis",
  "emlakci-komisyonu-nasil-isler": "satis",
  "eviniz-satilmiyor-mu": "satis",
  "hisseli-ipotekli-ev-satisi": "satis",
  "kiracili-ev-satilir-mi": "satis",
  "eryaman-disinda-yasayanlar-icin-ev-satisi-kiralama": "satis",
  "emlakciya-vekalet-verme-rehberi": "satis",
  "emlakci-yetki-sozlesmesi-rehberi": "satis",
  "emlakci-yetki-belgesi-sorgulama": "satis",
  "evinizin-degerini-nasil-ogrenebilirsiniz": "satis",
  "eryamanda-ev-fiyatlarini-ne-belirler": "satis",
  // İki yolun ortasındaki karar yazısı — satış grubunda listeleniyor.
  "evimi-satmak-mi-kiraya-vermek-mi": "satis",
  // Kiraya vermek
  "dairenizi-kiraya-verirken-dikkat-edilmesi-gerekenler": "kira",
  "kira-artisi-nasil-hesaplanir": "kira",
  "kira-sozlesmesinde-dikkat-edilmesi-gerekenler": "kira",
  "kiraci-tahliye-sureci": "kira",
  "kiraci-tahliye-taahhutnamesi-rehberi": "kira",
  "kira-tespit-davasi-rehberi": "kira",
  "eryamanda-kira-tespiti-dogru-kira-belirleme": "kira",
  "evinizi-kiraya-verdikten-sonra": "kira",
  // Miras & tapu
  "miras-kalan-ev-nasil-satilir": "miras-tapu",
  "kat-irtifakindan-kat-mulkiyetine-gecis": "miras-tapu",
  "tapu-ada-parsel-nasil-okunur": "miras-tapu",
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
