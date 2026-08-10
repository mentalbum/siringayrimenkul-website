import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { AdaBilgi, BlogPost, Mahalle, Site } from "@/lib/types";
import { haversineDistanceKm } from "@/lib/geo";
import { adaOnayliEtap, onayliEtapToplamAda } from "@/lib/etap-onayli";

export interface AdaEntry extends AdaBilgi {
  site: Site;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const MAHALLELER_DIR = path.join(CONTENT_DIR, "mahalleler");
const SITELER_DIR = path.join(CONTENT_DIR, "siteler");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

/* İÇERİK DEĞİŞİM TARİHLERİ — kaynağı git geçmişi, üreteci scripts/lastmod-uret.mjs.
 *
 * mtime KULLANILMIYOR, çünkü yayında yalan söylüyor: Vercel her build'de repoyu
 * sıfırdan çekiyor, bütün içerik dosyalarının mtime'ı build anına eşitleniyor ve
 * sitemap'teki 1500+ adres aynı damgayı taşıyor. Google, her yayında topluca
 * "bugün değişti" diyen bir lastmod'u güvenilmez sayıp tümden yok sayıyor.
 * Ölçülen sonuç (08.08): 02.08'de ev sahibi diline çevrilen site başlıkları
 * SERP'te hâlâ eski hâliyle duruyordu; arya-evleri sayfasının snippet'i 31.07
 * öncesi açıklamayı gösteriyordu. Bu, sitemap tazelik onarımının (08.08, statik
 * sayfalar) içerikten türeyen 1400+ sayfaya uzatılmış hâli.
 *
 * BAKIM: içerik dosyalarını değiştirdikten sonra, commit'ten ÖNCE `npm run lastmod`
 * çalıştır ve content/lastmod.json'u aynı commit'e ekle. Unutulursa sayfa
 * eski tarihiyle kalır (zararsız ama tazelik sinyali gitmez) — asla build
 * damgasına geri dönmez. */
const LASTMOD_PATH = path.join(CONTENT_DIR, "lastmod.json");
const lastmod: {
  uretildi: string;
  dosyalar: Record<string, string>;
  klasorler?: Record<string, string>;
} = fs.existsSync(LASTMOD_PATH)
  ? readJson(LASTMOD_PATH)
  : { uretildi: "", dosyalar: {} };

/** content/ köküne göreli yolların en yenisi. Manifestte olmayan yol (yeni
 * eklenmiş, `npm run lastmod` henüz koşmamış) mtime'a düşer — yerel geliştirmede
 * doğru, yayında da eskisinden kötü değil. */
function icerikTarihi(...goreliYollar: string[]): Date {
  const bulunanlar = goreliYollar
    .map((yol) => lastmod.dosyalar[yol])
    .filter(Boolean)
    .map((gun) => new Date(`${gun}T00:00:00Z`).getTime());
  if (bulunanlar.length) return new Date(Math.max(...bulunanlar));
  for (const yol of goreliYollar) {
    const tam = path.join(CONTENT_DIR, yol);
    if (fs.existsSync(tam)) return fs.statSync(tam).mtime;
  }
  return new Date(`${lastmod.uretildi || "2026-08-08"}T00:00:00Z`);
}

/** Bir içerik KLASÖRÜNÜN en yeni değişim tarihi — hub/liste sayfaları için.
 *
 * /siteler 723 kaydı, /blog tüm yazıları listeler; bu sayfalar tek bir dosyaya
 * bağlı değil, o yüzden icerikTarihi() onlara cevap veremez. JSX'in git tarihi
 * de yanlış: 08.08 ölçümünde sitemap /blog için 2026-07-24 diyordu, oysa 07.08'de
 * 24 yazı silinmişti (43 → 19) — Google'a açıkça "değişmedi" deniyordu.
 *
 * Kaynak, manifestin `klasorler` bölümü: git geçmişinde o klasörde görülen HER
 * yolun tarihi, artık diskte olmayanlar dahil. Sadece duran dosyalara bakmak
 * yetmez — klasördeki tek değişiklik bir SİLME ise kalan dosyaların tarihi
 * oynamaz ve sinyal kaybolur (bkz. scripts/lastmod-uret.mjs). */
export function icerikKlasoruTarihi(...klasorler: string[]): Date {
  const gunler = klasorler
    .map((klasor) => lastmod.klasorler?.[klasor])
    .filter(Boolean)
    .map((gun) => new Date(`${gun}T00:00:00Z`).getTime());
  return gunler.length
    ? new Date(Math.max(...gunler))
    : new Date(`${lastmod.uretildi || "2026-08-08"}T00:00:00Z`);
}

export function getMahalleLastModified(mahalleSlug: string): Date {
  return icerikTarihi(`mahalleler/${mahalleSlug}.json`);
}

/** Site sayfası hem künye JSON'una hem çizilen sınıra bağlı — sınır yeniden
 * çizilince sayfadaki harita değişiyor, JSON değişmiyor. */
export function getSiteLastModified(mahalleSlug: string, siteSlug: string): Date {
  return icerikTarihi(
    `siteler/${mahalleSlug}/${siteSlug}.json`,
    `siteler/${mahalleSlug}/${siteSlug}-boundary.geojson`
  );
}

export function getBlogPostLastModified(slug: string): Date {
  return icerikTarihi(`blog/${slug}.mdx`);
}

export function getAllMahalleler(): Mahalle[] {
  const files = fs.readdirSync(MAHALLELER_DIR).filter((file) => file.endsWith(".json"));
  return files
    .map((file) => readJson<Mahalle>(path.join(MAHALLELER_DIR, file)))
    .sort((a, b) => a.isim.localeCompare(b.isim, "tr"));
}

export function getYayindaMahalleler(): Mahalle[] {
  return getAllMahalleler().filter((mahalle) => mahalle.durum === "yayinda");
}

export function getMahalleBySlug(slug: string): Mahalle | undefined {
  const filePath = path.join(MAHALLELER_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<Mahalle>(filePath);
}

/** Mahalle adının "Mahallesi" olmadan kısa hâli — "Yavuz Selim Mahallesi" →
 * "Yavuz Selim". Yerel aramaların hem "yavuz selim emlakçı" hem "yavuz selim
 * mahallesi emlakçı" biçimini hedeflemek için kullanılır. */
export function mahalleKisaIsim(mahalle: Mahalle): string {
  return mahalle.isim.replace(/\s*Mahallesi\s*$/, "").trim();
}

export function getMahalleBoundary(mahalle: Mahalle): GeoJSON.Feature | undefined {
  if (!mahalle.sinirGeoJSON) return undefined;
  const filePath = path.join(CONTENT_DIR, mahalle.sinirGeoJSON);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<GeoJSON.Feature>(filePath);
}

export interface NearbyMahalle {
  mahalle: Mahalle;
  uzaklikKm: number;
}

export function getNearbyMahalleler(mahalle: Mahalle, limit = 4): NearbyMahalle[] {
  return getAllMahalleler()
    .filter((other) => other.slug !== mahalle.slug)
    .map((other) => ({
      mahalle: other,
      uzaklikKm: haversineDistanceKm(mahalle.merkezKoordinat, other.merkezKoordinat),
    }))
    .sort((a, b) => a.uzaklikKm - b.uzaklikKm)
    .slice(0, limit);
}

export function getSitelerByMahalle(mahalleSlug: string): Site[] {
  const dir = path.join(SITELER_DIR, mahalleSlug);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
  return files
    .map((file) => readJson<Site>(path.join(dir, file)))
    .sort((a, b) => a.isim.localeCompare(b.isim, "tr"));
}

export function getSiteBySlug(mahalleSlug: string, slug: string): Site | undefined {
  const filePath = path.join(SITELER_DIR, mahalleSlug, `${slug}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<Site>(filePath);
}

// Site adının "çekirdeği": sondaki jenerik yerleşim tipi atılır.
// "Aktürk Sitesi" ve "Aktürk Blokları" aynı çekirdeğe iner ("aktürk").
const YERLESIM_TIPI_EKI =
  /\s+(sitesi|site|blokları|bloklar|evleri|evler|konutları|konakları|villaları|apartmanı|rezidansı|rezidans|residence)$/i;
function cekirdekAd(isim: string): string {
  return isim.toLocaleLowerCase("tr").replace(YERLESIM_TIPI_EKI, "").trim();
}

// Başlık soneki mahalle adıyla açılacak site isimleri.
//
// İlk sürüm (2026-07-31) yalnızca BİREBİR aynı adı sayıyordu: aynı ad özdeş
// <title>/description üretince Google benzer sayfaları tek sonuca katlıyor ve
// diğer kayıt SERP'te hiç görünmüyordu (Kardelen 4 kayıt, Çınar/Bahar/
// Doktorlar… 9 grup / 19 sayfa).
//
// 2026-08-09 ölçümü boşluğu gösterdi: katlama birebir aynı adla sınırlı değil,
// yalnızca YERLEŞİM TİPİ farkıyla ayrılan adlarda da oluyor. 151 sitelik
// pws=0 taramasında 13 vakada Google, aranan sitenin yerine benzer adlı BAŞKA
// kaydımızı gösterdi — "Aktürk Sitesi emlakçı" araması Altay'daki Aktürk
// Blokları sayfasına, "Sutek Sitesi" Altay'daki Sutek Blokları'na düşüyordu.
// Ziyaretçi yanlış siteye varıyor. Karşılaştırma bu yüzden çekirdek ad
// üzerinden yapılır: Age/Aktürk/Akasya/Eser Yapı/Eston/İçtaş/Maybak/Mesa/
// Paşa/Safir/Soyak/Sutek aileleri (13 grup) artık kapsanıyor.
//
// Koşul "birden çok MAHALLE" olarak kalır: aynı mahalledeki iki kayıt (Eylül
// Sitesi / Eylül Evleri, ikisi de Yavuz Selim) mahalle ekiyle ayrışmaz, orada
// ayrım zaten tam adın kendisindedir.
let cokMahalleliIsimler: Set<string> | undefined;
export function isimBirdenCokMahallede(isim: string): boolean {
  if (!cokMahalleliIsimler) {
    const mahalleler = new Map<string, Set<string>>();
    for (const mahalle of getAllMahalleler()) {
      for (const site of getSitelerByMahalle(mahalle.slug)) {
        const anahtar = cekirdekAd(site.isim);
        if (!mahalleler.has(anahtar)) mahalleler.set(anahtar, new Set());
        mahalleler.get(anahtar)!.add(mahalle.slug);
      }
    }
    cokMahalleliIsimler = new Set(
      [...mahalleler].filter(([, m]) => m.size > 1).map(([anahtar]) => anahtar)
    );
  }
  return cokMahalleliIsimler.has(cekirdekAd(isim));
}

export function getSiteBoundary(site: Site): GeoJSON.Feature | undefined {
  if (!site.sinirGeoJSON) return undefined;
  const filePath = path.join(CONTENT_DIR, site.sinirGeoJSON);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<GeoJSON.Feature>(filePath);
}

export function getAllAdalar(mahalleSlug: string): AdaEntry[] {
  const siteler = getSitelerByMahalle(mahalleSlug);
  const adalar: AdaEntry[] = [];
  for (const site of siteler) {
    if (!site.adalar) continue;
    for (const ada of site.adalar) {
      adalar.push({ ...ada, site });
    }
  }
  return adalar.sort((a, b) => a.no.localeCompare(b.no));
}

/** Ada + parsel together identify a real parcel — ada number alone can repeat
 * across different parsels/sites, so this (not `.no`) is the unique route key. */
export function adaRouteKey(ada: AdaBilgi): string {
  return ada.parsel ? `${ada.no}-${ada.parsel}` : ada.no;
}

/** Human-readable "46494/2" style label; falls back to just the ada number. */
export function adaDisplayLabel(ada: AdaBilgi): string {
  return ada.parsel ? `${ada.no}/${ada.parsel}` : ada.no;
}

export function getAdaByRouteKey(mahalleSlug: string, routeKey: string): AdaEntry | undefined {
  return getAllAdalar(mahalleSlug).find((ada) => adaRouteKey(ada) === routeKey);
}

/** All entries sharing a route key — a single cadastral parcel can hold
 * several distinct sites (e.g. Devlet's big cooperative parcels), in which
 * case each owning site contributes an entry for the same ada/parsel. */
export function getAdaEntriesByRouteKey(mahalleSlug: string, routeKey: string): AdaEntry[] {
  return getAllAdalar(mahalleSlug).filter((ada) => adaRouteKey(ada) === routeKey);
}

export interface EtapEntry {
  no: string;
  adalar: AdaEntry[];
  siteler: Site[];
  /** Resmî listedeki toplam ada sayısı — kayıtlı `adalar` bunun alt kümesi olabilir. */
  resmiAdaSayisi: number;
}

export function getAllEtaplar(mahalleSlug: string): EtapEntry[] {
  const adalar = getAllAdalar(mahalleSlug);
  const etapMap = new Map<
    string,
    { adalar: AdaEntry[]; adaKeys: Set<string>; siteMap: Map<string, Site> }
  >();

  for (const ada of adalar) {
    // Etap sayfaları da yalnız DOĞRULANMIŞ etaplardan kurulur (lib/etap-onayli.ts).
    // Kayıttaki ada.etap alanı tek başına yeterli değil: örneğin 5. Etap Toplu Yapı
    // Yönetimi'nin resmî ada listesi 11 ada içerirken kayıtlarda 17 site "5. etap"
    // işaretliydi. Site sayfasında etiket göstermeyip etap sayfasında listelemek
    // çelişki olurdu.
    const etapNo = adaOnayliEtap(ada.no);
    if (!etapNo) continue;
    if (!etapMap.has(etapNo)) {
      etapMap.set(etapNo, { adalar: [], adaKeys: new Set(), siteMap: new Map() });
    }
    const entry = etapMap.get(etapNo)!;
    // Aynı ada/parsel üzerinde birden çok site oturabiliyor (canlı örnek: 2.
    // Etap'ta 17462-1). getAllAdalar her SİTE-ada çifti için ayrı satır
    // döndürdüğü için ada listesi mükerrer doluyordu; sonuç React'te "aynı key"
    // hatası, ekranda çift ada rozeti ve şişmiş "N ada arşivimizde" sayısı.
    // Siteler zaten siteMap ile tekilleniyordu, adalar tekillenmiyordu.
    const adaKey = adaRouteKey(ada);
    if (!entry.adaKeys.has(adaKey)) {
      entry.adaKeys.add(adaKey);
      entry.adalar.push(ada);
    }
    entry.siteMap.set(ada.site.slug, ada.site);
  }

  return Array.from(etapMap.entries())
    .map(([no, { adalar: etapAdalar, siteMap }]) => ({
      no,
      adalar: etapAdalar,
      siteler: Array.from(siteMap.values()).sort((a, b) => a.isim.localeCompare(b.isim, "tr")),
      resmiAdaSayisi: onayliEtapToplamAda(no) ?? etapAdalar.length,
    }))
    .sort((a, b) => Number(a.no) - Number(b.no));
}

export function getEtapByNo(mahalleSlug: string, etapNo: string): EtapEntry | undefined {
  return getAllEtaplar(mahalleSlug).find((etap) => etap.no === etapNo);
}

export interface EtapOzet extends EtapEntry {
  /** Etabın adalarını taşıyan mahalle — etap sayfasının URL'i buradan kurulur. */
  mahalle: Mahalle;
  /** Sınırı kadastro verisinden çizilebilen ada sayısı (≤ adalar.length). */
  sinirliAdaSayisi: number;
}

/** Bütün yayında mahalleleri tarayıp onaylı etapları tek listede toplar.
 *
 * Etap sayfaları mahalle altında yaşıyor (`/mahalleler/<mahalle>/etaplar/<no>`)
 * ama arama tarafında etap mahalleden bağımsız aranıyor ("eryaman 3. etap",
 * "eryaman etapları", "eryaman etap haritası" — 2026-08-08 ölçümü,
 * scratchpad-karne/arama-talebi). /etaplar hub'ı bu listeden kurulur.
 *
 * Ölçüldü (2026-08-08): her onaylı etabın adaları tek bir mahalleye düşüyor,
 * yani bir etap iki URL üretmiyor. Yine de veri değişirse ilk mahalle kazanır
 * ve daha fazla adası olan mahalle tercih edilir — sessiz bölünme olmasın. */
export function getAllEtapOzetleri(): EtapOzet[] {
  const enIyi = new Map<string, EtapOzet>();

  for (const mahalle of getYayindaMahalleler()) {
    for (const etap of getAllEtaplar(mahalle.slug)) {
      const mevcut = enIyi.get(etap.no);
      if (mevcut && mevcut.adalar.length >= etap.adalar.length) continue;
      enIyi.set(etap.no, {
        ...etap,
        mahalle,
        sinirliAdaSayisi: etapAdaHalkalari(etap.no).length,
      });
    }
  }

  return Array.from(enIyi.values()).sort((a, b) => Number(a.no) - Number(b.no));
}

interface AdaHalkasi {
  /** "46518/1" — site sınır dosyasındaki ada/parsel etiketi. */
  adaParsel: string;
  ring: GeoJSON.Position[];
}

/** Bir etabın adalarına ait kadastro halkaları.
 *
 * Etabın "sınırı" diye tek bir poligon UYDURULMUYOR: adaların dış çeperini
 * birleştirmek aradaki cadde, park ve okul parsellerini de etabın içine
 * katardı. Onun yerine etap, kendi adalarının gerçek parsel poligonları
 * kümesi olarak çiziliyor (kaynak: TKGM CBS, site sınır dosyaları).
 *
 * Aynı ada/parsel birden çok siteye ait olabilir (eski kooperatif payları) —
 * bu yüzden halka listesi ada/parsel anahtarıyla tekilleştirilir. */
function etapAdaHalkalari(etapNo: string): AdaHalkasi[] {
  const gorulen = new Map<string, AdaHalkasi>();

  for (const mahalle of getAllMahalleler()) {
    for (const site of getSitelerByMahalle(mahalle.slug)) {
      const boundary = getSiteBoundary(site);
      if (!boundary) continue;
      const adalar = (boundary.properties?.adalar as string[] | undefined) ?? [];
      // Halka sırası properties.adalar ile hizalı — mahalle-map.tsx ile aynı kalıp.
      const halkalar = geoJsonRings(boundary);
      halkalar.forEach((ring, index) => {
        const adaParsel = adalar[index];
        if (!adaParsel) return;
        const adaNo = adaParsel.split("/")[0];
        if (adaOnayliEtap(adaNo) !== etapNo) return;
        const key = `${mahalle.slug}:${adaParsel}`;
        if (!gorulen.has(key)) gorulen.set(key, { adaParsel, ring });
      });
    }
  }

  return Array.from(gorulen.values());
}

/** GeoJSON Polygon/MultiPolygon → düz halka listesi (ham [lng,lat] hâliyle).
 * lib/geo.ts'teki geoJsonPolygonToPaths ile aynı düzleştirme sırası; burada
 * Koordinat nesnesine çevrilmiyor çünkü çıktı yeniden GeoJSON'a yazılıyor. */
function geoJsonRings(feature: GeoJSON.Feature): GeoJSON.Position[][] {
  const geometry = feature.geometry;
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

/** Etabın kadastro poligonları — haritaya verilecek MultiPolygon.
 * Sınırı çizilebilen adası yoksa undefined döner (harita o etabı hiç
 * göstermez; uydurma çerçeve çizilmez). */
export function getEtapBoundary(etapNo: string): GeoJSON.Feature | undefined {
  const halkalar = etapAdaHalkalari(etapNo);
  if (halkalar.length === 0) return undefined;

  return {
    type: "Feature",
    properties: {
      etap: etapNo,
      adalar: halkalar.map((halka) => halka.adaParsel),
      kaynak:
        "TKGM Parsel Sorgu (CBS) verisine dayalıdır; bilgilendirme amaçlıdır, resmi kadastro belgesi yerine geçmez.",
    },
    geometry: {
      type: "MultiPolygon",
      coordinates: halkalar.map((halka) => [halka.ring]),
    },
  };
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return { ...(data as BlogPost), slug, content };
    })
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as BlogPost), slug, content };
}

export function getBlogPostsByMahalle(mahalleSlug: string): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.ilgiliMahalle === mahalleSlug);
}
