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
}

export interface Site {
  isim: string;
  slug: string;
  mahalleSlug: string;
  adres?: string;
  koordinat?: Koordinat;
  sinirGeoJSON?: string;
  aciklama: string;
  ozellikler?: string[];
}

export interface BlogFrontmatter {
  baslik: string;
  tarih: string;
  ozet: string;
  kapakGorseli?: string;
  ilgiliMahalle?: string;
  ilgiliSite?: string;
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
}
