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
  /** TKGM parsel sorgusundan okunan yüzölçümü (m²) — properties.alan.
   * scripts/tkgm-kunye-uygula.py yazar; birden çok siteye atanmış parselde
   * bilinçli olarak BOŞ kalır (ortak parselin alanı tek siteye mal edilemez). */
  alanM2?: number;
  /** TKGM tapu niteliğinin ham metni — properties.nitelik ("A Blok 16 Katlı
   * Betonarme Mesken …"). Görünür metne olduğu gibi basılmaz; künye çıkarımı
   * metinden kat bilgisi bulamazsa yedek kaynak olarak buradan okur. */
  nitelik?: string;
  /** Adadaki apartmanların ADLARI — Eryaman 1. Etap'ta bloklar kodla değil
   * isimle anılıyor ("Bayındır", "Gebze"), adres ve ilan dilinde karşılığı olan
   * bir arşiv. Kaynak: etap yönetiminin blok listesi (Wayback: eryaman1.com/
   * blok_yonetimi.php). Şu an yalnız veri katmanı — henüz sayfada basılmıyor. */
  bloklar?: string[];
  /** BU ADANIN İÇİNDEN çekilmiş saha fotoğrafları, public/ altına göre yol.
   *
   * Neden site değil ADA düzeyinde: bir site birden çok adaya yayılabiliyor
   * (Aktürk Sitesi = 46499/2 + 46501/2) ve fotoğraf hangi adanın içinden
   * çekildiyse oraya aittir — 46499'un bahçesini 46501 sayfasında göstermek
   * yanlış olur. Özgün kararı (2026-08-17): "fotoğrafların hepsini 46499
   * adanın içine yükleyelim, 46499'u açınca uyumlu olsun."
   *
   * İlk görsel Site.gorsel ile AYNI dosya olmalı: o, kartlarda ve og:image'de
   * kullanılan ana görsel. Filigran ve telif işleme akışı:
   * scripts/filigran.mjs (--sira ile numaralı galeri üretir). */
  gorseller?: string[];
}

export interface Site {
  isim: string;
  /** Halk arasında/yerel kayıtlarda geçen diğer adlar (örn. Çağdaş 95 = "Çağdaş 91",
   * Ankolular = "Ankollar") — site içi arama, meta keywords ve schema.org
   * alternateName bu alandan beslenir. Yalnızca doğrulanmış adlar yazılır. */
  alternatifAdlar?: string[];
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
  /** İçerik zenginleştirme süpürmesi damgası (YYYY-AA-GG) — "kaç yaptık/kaç
   * kaldı" sayacı bu alanla ölçülür. Yalnızca doğrulanabilir kaynaklardan
   * (TKGM, proje sitesi, bilgiemlak, Google Maps) beslenen kayıtlara eklenir. */
  zenginlestirildi?: string;
}

export interface BlogFrontmatter {
  baslik: string;
  tarih: string;
  /** Elle beyan edilen son içerik güncellemesi (YYYY-AA-GG). dateModified BU
   * alandan üretilir, dosya mtime'ından DEĞİL: taze git checkout'ta (Vercel)
   * tüm dosyaların mtime'ı build gününe eşitlenir ve her deploy "bugün
   * güncellendi" yalanı üretirdi — Google'ın "yapay tazeleme yapma" uyarısının
   * tam kendisi. İçeriği gerçekten değiştirince bu alanı elle güncelle. */
  guncelleme?: string;
  ozet: string;
  kapakGorseli?: string;
  ilgiliMahalle?: string;
  ilgiliSite?: string;
  faq?: { soru: string; cevap: string }[];
  /** true → sayfa yayında kalır ama noindex olur ve sitemap'e girmez.
   * Türkiye genelinden alakasız trafik çeken bilgi sayfaları için genel
   * mekanizma. Şu an hiçbir yazıda etkin değil — ilk kullanıcısı olan TTBS
   * yazısı 2026-07-31'de tamamen silindi (301 → doğru emlakçı seçimi). */
  dizinDisi?: boolean;
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
}
