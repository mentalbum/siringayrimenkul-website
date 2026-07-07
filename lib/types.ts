export type Ilce = "Etimesgut" | "Yenimahalle";

export type MahalleDurum = "yayinda" | "yakinda";

export interface Koordinat {
  lat: number;
  lng: number;
}

export interface Mahalle {
  isim: string;
  slug: string;
  ilce: Ilce;
  durum: MahalleDurum;
  kisaAciklama: string;
  uzunAciklama?: string[];
  merkezKoordinat: Koordinat;
  sinirGeoJSON?: string;
  /** Halk arasında/eskiden kullanılan diğer adlar — yerel aramaların bu
   * biçimlerini de hedeflemek için (örn. Cumhuriyet = eski adıyla "Yeni Batı",
   * 2024 sonunda Yeni Batı'dan ayrılarak kuruldu). */
  alternatifAdlar?: string[];
}

export interface AdaBilgi {
  no: string;
  parsel?: string;
  etap?: string;
  blok?: string;
}

export interface Site {
  isim: string;
  slug: string;
  mahalleSlug: string;
  adres?: string;
  koordinat?: Koordinat;
  sinirGeoJSON?: string;
  /** public/ altına göre görsel yolu, örn. "/images/siteler/address-eryaman.jpg" */
  gorsel?: string;
  aciklama: string;
  ozellikler?: string[];
  adalar?: AdaBilgi[];
}

export interface BlogFrontmatter {
  baslik: string;
  tarih: string;
  ozet: string;
  kapakGorseli?: string;
  ilgiliMahalle?: string;
  ilgiliSite?: string;
  faq?: { soru: string; cevap: string }[];
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
}
