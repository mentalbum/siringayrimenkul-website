// Değer import'u bilinçli olarak YOK: bu modül scripts/kunye-dokum.mjs
// tarafından Node --experimental-strip-types ile de çalıştırılır; tip
// import'ları silinir ama değer import'larının yolu çözülemez.
import type { Site } from "./types";

/** Site künyesi: kayıt metinlerinde (aciklama + ozellikler) ZATEN YAZILI olan
 * yapısal bilgilerin deterministik çıkarımı. Hiçbir alan tahmin edilmez —
 * metinde geçmeyen ya da güvenle çıkarılamayan alan undefined kalır ve
 * görünürde "—" gösterilir (veri uydurma yasağı).
 *
 * 113 kayıtlık çürütme turunun (2026-07-29, 7 ajan) bulguları bu parser'ın
 * korumalarını şekillendirdi; her koruma bir gerçek hata sınıfına karşılık
 * gelir — kaldırmadan önce o turu tekrarlayın:
 *  - Binlik ayraç: "1.800 konut" 800 okunuyordu → sayiCoz noktaları söker.
 *  - Ticari/yan blok katı ("2 Katlı Dükkan", "3 Katlı A Blok ... ticari")
 *    konut aralığına giriyordu → düşük kat değerleri katGosterimi'nde
 *    "en yüksek bloğu N katlı" kalıbına düşürülür, aralık iddia edilmez.
 *  - "X-Y kat aralığında" özellik satırları bazı kayıtlarda tapu alıntısıyla
 *    çelişen şablon artığı → bu kalıp HİÇ okunmaz; yalnız "N katlı" ifadeleri.
 *  - Paylaşılan yerleşim adası alanı ("altı site bir arada") tek siteye
 *    yazılıyordu → "paylaş" penceresindeki m² atlanır.
 *  - Proje/inşaat alanı parsel sanılıyordu → "parsel" bağlamlı m² varsa
 *    yalnız onlar kullanılır.
 *  - "4+1 dubleks daire" villa sanılıyordu → villa tespiti isim/yapı
 *    ifadeleriyle sınırlandı.
 *  - Ofis-işyeri tapulu rezidanslar "konut sitesi" sunuluyordu → rezidans
 *    tespiti tur seçiminde önceliklidir.
 *  - "Oyak 555" gibi site adındaki sayı konut sayısı sanılıyordu → konut
 *    taramasından site adı silinir; "kapasiteli/ilk etabında" sayıları alınmaz.
 *  - Çok adalı sitede tek adanın blok sayısı bütünmüş gibi görünüyordu →
 *    "toplam N blok" yoksa ve site birden çok adaya yayılıyorsa blok yazılmaz.
 *
 * Kullanım yerleri: site sayfası açılış cümlesi (AEO "önce cevap" kalıbı),
 * /araclar/site-karsilastirma ve /eryaman-site-dokusu raporu. */
export interface Kunye {
  /** "parsel" bağlamında geçen alan; birden çok parselli sitede toplam. */
  parselAlaniM2?: number;
  tapuNiteligi?: "kat mülkiyeti" | "kat irtifakı" | "kat mülkiyeti + kat irtifakı";
  blokSayisi?: number;
  katMin?: number;
  katMax?: number;
  /** Ticari/yardımcı blok katı elendi mi? (katGosterimi'nin dürüstlük anahtarı) */
  katFiltrelendi: boolean;
  /** Toplam daire/konut sayısı (metinde geçen en büyük güvenli toplam). */
  konutSayisi?: number;
  yapiTipi: "villa/dubleks" | "rezidans" | "apartman/blok";
  /** Metinde adı geçen donatılar (yalnızca whitelist; yokluk kanıt değildir). */
  donatilar: string[];
}

/** "on birer katlı", "ikişer" gibi üleştirme ve yazı sayıları rakama çevirmek
 * için normalizasyon tablosu. Sıra önemli: uzun kalıplar önce. */
// DİKKAT: JS \b sınırı ASCII'dir — "üç", "beşer" gibi Türkçe harfli
// kelimelerde sessizce ÇALIŞMAZ ("on üç katlı" 13'e çevrilemiyordu, çürütme
// turunda yakalandı). Sınırlar \p{L}/\d lookaround'larıyla kurulur.
function kelime(k: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\d])${k}(?![\\p{L}\\d])`, "gu");
}
const ULESTIRME: Array<[RegExp, string]> = (
  [
    ["birer", "bir"], ["ikişer", "iki"], ["üçer", "üç"], ["dörder", "dört"],
    ["beşer", "beş"], ["altışar", "altı"], ["yedişer", "yedi"],
    ["sekizer", "sekiz"], ["dokuzar", "dokuz"], ["onar", "on"],
  ] as Array<[string, string]>
).map(([u, s]) => [kelime(u), s]);
const BIRLER: Array<[string, number]> = [
  ["bir", 1], ["iki", 2], ["üç", 3], ["dört", 4], ["beş", 5],
  ["altı", 6], ["yedi", 7], ["sekiz", 8], ["dokuz", 9],
];
const ONLAR: Array<[string, number]> = [["on", 10], ["yirmi", 20], ["otuz", 30], ["kırk", 40]];
const YAZI_SAYI: Array<[RegExp, string]> = [
  // Bileşikler önce: "yirmi yedi" → 27 ("yirmi"→20 tekil dönüşümünden önce).
  ...ONLAR.flatMap(([onluk, o]) =>
    BIRLER.map(([birlik, b]): [RegExp, string] => [kelime(`${onluk} ${birlik}`), String(o + b)])
  ),
  ...ONLAR.map(([onluk, o]): [RegExp, string] => [kelime(onluk), String(o)]),
  [kelime("tek"), "1"],
  ...BIRLER.map(([birlik, b]): [RegExp, string] => [kelime(birlik), String(b)]),
];

function normalize(metin: string): string {
  let m = metin.toLocaleLowerCase("tr-TR");
  for (const [r, y] of ULESTIRME) m = m.replace(r, y);
  for (const [r, y] of YAZI_SAYI) m = m.replace(r, y);
  return m;
}

/** Türkçe binlik ayraçlı sayı: "1.800" → 1800 (aksi hâlde 800 okunuyordu). */
function sayiCoz(ham: string): number {
  return Number.parseInt(ham.replaceAll(".", ""), 10);
}

/** Konut dışı yapı bağlamları: "2 katlı çarşı bloğu" gibi eşleşmeler kat
 * aralığını kirletmesin. Pencere "|" (özellik satırı sınırı) aşmaz.
 * İSTİSNA (2. çürütme turu): kuyrukta mesken/konut/apartman/daire ya da
 * "niteliğiyle" da geçiyorsa eşleşme TUTULUR — "16 Katlı Mesken-Ofis-İşyeri"
 * karma bloğu ve "on dört katlı A2 bloktan oluşur ve ofis-işyeri niteliğiyle
 * kayıtlıdır" gibi tüm-yapı tanımları konut katıdır; onları atmak gerçek
 * konut bloklarını yok sayıyordu. */
// "al[ıi]şveriş": TKGM nitelik metinleri i/ı ayrımını tutarsız yazıyor
// ("2 Katli 5. Blok Alişveriş Merkezi") — iki yazım da yakalanmalı.
const KONUT_DISI = /çarşı|dükk|mağaza|al[ıi]şveriş|ofis|işyeri|iş yeri|ticari|otopark|garaj|trafo|depo|yönetim|sosyal tesis|kreş/;
const KONUT_ISTISNA = /mesken|konut|apartman|daire|niteli/;

/** Komşu siteleri anan cümlelerdeki sayılar BU siteye ait değildir
 * ("birlikte 25 bloğa ulaşan İlkiz kümesi" = iki sitenin toplamı). */
const KOMSU_IZI = /komşu|paylaş|bitişiğ|yanındaki|karşısındaki|yanı başındaki|birlikte|küme/;

const DONATI_KALIPLARI: Array<[RegExp, string]> = [
  [/kapalı otopark/, "kapalı otopark"],
  [/açık otopark|\botopark\b/, "otopark"],
  [/7\/24|24 saat|güvenlik/, "güvenlik"],
  [/havuz/, "havuz"],
  [/asansör/, "asansör"],
  [/çocuk oyun|oyun alanı|oyun parkı/, "çocuk oyun alanı"],
  [/yeşil alan|peyzaj/, "yeşil alan/peyzaj"],
  [/jeneratör/, "jeneratör"],
  [/mantolama|ısı yalıtım/, "ısı yalıtımı"],
  [/fitness|spor salonu|spor alanı|basketbol|tenis/, "spor alanı"],
  [/kamera/, "kamera sistemi"],
];

function pencere(metin: string, bas: number, son: number, gen = 45): string {
  return metin.slice(Math.max(0, bas - gen), Math.min(metin.length, son + gen));
}

interface KatSonuc {
  katlar: number[];
  /** Ticari/yardımcı blok olduğu için elenen kat değeri var mıydı? Varsa
   * görünür metin düz "N katlı" diyemez ("en yüksek bloğu N katlı" der). */
  filtrelendi: boolean;
}

function katlariCikar(metin: string, komsuKorumasi: boolean): KatSonuc {
  const katlar: number[] = [];
  let filtrelendi = false;
  // "22-25 kat arası" / "22 ile 25 kat arasında" kalıpları.
  for (const m of metin.matchAll(/(\d+)\s*(?:-|ile)\s*(\d+)\s*kat aras/g)) {
    for (const grup of [m[1], m[2]]) {
      const deger = Number.parseInt(grup, 10);
      if (deger >= 1 && deger <= 40) katlar.push(deger);
    }
  }
  // "kat'lı" apostroflu yazımı da yakalanır ("19 Kat'lı 7 Blok").
  for (const m of metin.matchAll(/(?:(\d+)\s*-\s*)?(\d+)(?:'?[şsç]?[ea]?r)?\s*kat'?l[ıi]/g)) {
    const son = m.index! + m[0].length;
    // Kuyruk cümle/satır/madde sınırında kesilir (";" dahil: "12 katlı B11;
    // ayrıca tek katlı ticari blok" — ticari sözcüğü sonraki maddenin).
    const kuyruk = metin.slice(son, son + 45).split(/[|.;]/)[0];
    if (KONUT_DISI.test(kuyruk) && !KONUT_ISTISNA.test(kuyruk)) {
      filtrelendi = true;
      continue;
    }
    if (komsuKorumasi && KOMSU_IZI.test(pencere(metin, m.index!, son))) continue;
    for (const grup of [m[1], m[2]]) {
      if (!grup) continue;
      const deger = Number.parseInt(grup, 10);
      if (deger >= 1 && deger <= 40) katlar.push(deger);
    }
  }
  return { katlar, filtrelendi };
}

/** TKGM nitelik metni (adalar[].nitelik) serbest düzyazı DEĞİL, dar bir tapu
 * grameridir: "A Blok 16 Katlı Betonarme Mesken B Blok 13 Katlı … D Blok 2
 * Katlı Betonarme Ofis". Bu yüzden ayrı çözümlenir:
 *  - kat sayısı iki sırada gelir: "N Katlı" ve "Blok N" ("A Blok 14, B Blok13").
 *  - Ticari/yardımcı blok ayıklaması YALNIZ metinde konut ifadesi de varsa
 *    uygulanır. Eryaman'da tüm yapının ofis-işyeri tapulu olması yaygındır
 *    ("14 Katlı Betonarme Ofis İşyeri Ve Arsası" = 14 katlı yapının kendisi);
 *    orada ayıklama yapmak parselin tek kat bilgisini yok ederdi. */
const NITELIK_KONUT_IZI = /mesken|apartman|konut|daire|dubleks|bina|\bev\b/;

function niteliktenKatlar(nitelik: string): KatSonuc {
  const metin = normalize(nitelik);
  const tumYapiTicari = !NITELIK_KONUT_IZI.test(metin);
  const katlar: number[] = [];
  let filtrelendi = false;
  const ekle = (ham: string, son: number) => {
    const deger = Number.parseInt(ham, 10);
    if (!(deger >= 1 && deger <= 40)) return;
    const kuyruk = metin.slice(son, son + 45);
    if (!tumYapiTicari && KONUT_DISI.test(kuyruk) && !KONUT_ISTISNA.test(kuyruk)) {
      filtrelendi = true;
      return;
    }
    katlar.push(deger);
  };
  for (const m of metin.matchAll(/(\d+)\s*(?:'?[şsç]?[ea]?r)?\s*kat'?l?[ıi]?(?![\p{L}\d])/gu)) {
    ekle(m[1], m.index! + m[0].length);
  }
  // "Blok" SONRASI rakam kat sayısıdır ("A Blok 14, B Blok13, C Blok 14 Katlı");
  // blok ADINDAKİ rakam ("B1 25 Katlı") bu kalıba girmez çünkü rakam blok
  // sözcüğünden önce gelir.
  for (const m of metin.matchAll(/blo[kğ]\s*-?\s*(\d+)(?![\p{L}\d])/gu)) {
    ekle(m[1], m.index! + m[0].length);
  }
  return { katlar, filtrelendi };
}

/** TKGM niteliğinden blok sayısı — yalnız RAKAMLA yazılmış, TEK anlamlı değer
 * kabul edilir ("8 Blok Kargir Apartman", "7 Adet Kargir Apartman"). Birden
 * çok farklı sayı varsa ("7 Adet Kargir Apartman 8 Adet Dublks Konut") hangisi
 * blok toplamıdır belirsizdir → yazılmaz. Harf dizilerinden sayım
 * ("A-B-C Bloktan Oluşan") bilinçli olarak YOK: "A1,A2,B,C1,C2,D Ve E2 Blok"
 * gibi kayıtlarda kaç blok olduğu harflerden güvenle sayılamaz. */
function niteliktenBlok(nitelik: string): number | undefined {
  const metin = normalize(nitelik);
  const adaylar = new Set<number>();
  const desenler = [
    /(?<![-\p{L}\d])(\d+)\s*(?:adet\s+)?blo[kğ]/gu,
    /(?<![-\p{L}\d])(\d+)\s*adet\s+(?:\p{L}+\s+)*?(?:apartman|mesken|bina)/gu,
  ];
  for (const desen of desenler) {
    for (const m of metin.matchAll(desen)) {
      const deger = Number.parseInt(m[1], 10);
      if (deger >= 1 && deger <= 60) adaylar.add(deger);
    }
  }
  return adaylar.size === 1 ? [...adaylar][0] : undefined;
}

function blokDegerleri(metin: string, komsuKorumasi: boolean): number[] {
  const degerler: number[] = [];
  // Lookbehind: "B-5A ve C-5 blokları" gibi blok ADLARINDAKİ rakamlar blok
  // sayısı değildir (çürütme turu: Çağlar Sitesi 3 blokken 5 sayılmıştı).
  for (const m of metin.matchAll(/(?<![-\p{L}\d])(\d+)\s*(?:konut\s+)?blo[kğ]/gu)) {
    if (komsuKorumasi && KOMSU_IZI.test(pencere(metin, m.index!, m.index! + m[0].length))) continue;
    const deger = Number.parseInt(m[1], 10);
    if (deger >= 1 && deger <= 60) degerler.push(deger);
  }
  return degerler;
}

function konutCikar(metin: string, komsuKorumasi: boolean): number | undefined {
  let konutSayisi: number | undefined;
  for (const m of metin.matchAll(/([\d.]+)\s*(?:daire|konut|bağımsız bölüm|mesken|dubleks|villa)/g)) {
    const onek = metin.slice(Math.max(0, m.index! - 60), m.index!);
    // Birim sayılar ("her katta 4 daire"), tamamlanmamış kapasiteler, etap
    // kırılımları ve tek parselin sayısı ("ilk parselde 15 blok ve 340 daire")
    // site TOPLAMI değildir — alınmaz.
    if (/katta|katında|kat başına|zeminde|her kat|etap|etab|ilk parsel|1\. parsel/.test(onek))
      continue;
    const kuyruk = metin.slice(m.index! + m[0].length, m.index! + m[0].length + 24);
    if (/^\s*blo[kğ]/.test(kuyruk)) continue;
    if (/kapasite|planlan|tasarlan|hedeflen|etap/.test(kuyruk)) continue;
    if (komsuKorumasi && KOMSU_IZI.test(pencere(metin, m.index!, m.index! + m[0].length))) continue;
    const deger = sayiCoz(m[1]);
    if (!Number.isFinite(deger) || deger < 4 || deger > 3000) continue;
    if (konutSayisi === undefined || deger > konutSayisi) konutSayisi = deger;
  }
  return konutSayisi;
}

export function cikarKunye(site: Site): Kunye {
  // ozellikler[] satırları site-özel, öz-yazımlı veri satırlarıdır; açıklama
  // düzyazısı ise komşu siteleri de anabilir. Yapı alanları iki metinden
  // birleşik okunur; düzyazı tarafında komşu koruması açıktır.
  // Site adı metinden silinir: "Oyak 555 Konut Sitesi" adındaki sayı konut
  // sayısı sanılmasın.
  const adSil = (m: string) => m.split(site.isim.toLocaleLowerCase("tr-TR")).join(" ");
  const oz = adSil(normalize((site.ozellikler ?? []).join(" | ")));
  const ac = adSil(normalize(site.aciklama));
  const tum = `${ac} | ${oz}`;

  // --- parsel alanı. Öncelik DAR pencerede (±30) "parsel" bağlamlı m²
  // değerleri; proje/inşaat/işyeri alanları ("38.700 m² alan üzerinde 3 etap",
  // "12.500 m² büyüklüğünde 18 işyeri") elenir. Siteler ortak yerleşim adası
  // paylaşıyorsa alan HİÇ yazılmaz: ortak adanın alanını tek siteye mal etmek
  // siteyi kat kat büyük gösterir (çürütme turu: 6 sitelik ortak ada).
  let parselAlaniM2: number | undefined;
  // "paylaş" kökü hangi kalıpla gelirse gelsin ("adayı paylaşır", "parseli
  // ... siteleriyle paylaşır", "dört sitenin paylaştığı ada") alan yazılmaz.
  if (!/paylaş/.test(tum)) {
    const parselli: number[] = [];
    const digerAlan: number[] = [];
    for (const m of tum.matchAll(/([\d.]+)\s*m²/g)) {
      const deger = sayiCoz(m[1]);
      if (!Number.isFinite(deger) || deger < 500) continue;
      const genisCevre = pencere(tum, m.index!, m.index! + m[0].length, 60);
      if (KOMSU_IZI.test(genisCevre)) continue;
      const darCevre = pencere(tum, m.index!, m.index! + m[0].length, 30);
      if (/inşaat|işyeri|mağaza|dükk|ticari|proje|alan üzerinde|alanda/.test(darCevre)) continue;
      (/parsel/.test(darCevre) ? parselli : digerAlan).push(deger);
    }
    const benzersiz = [...new Set(parselli)];
    if (benzersiz.length === 1) {
      parselAlaniM2 = benzersiz[0];
    } else if (benzersiz.length > 1) {
      // Çok parselli site: en büyük değer diğerlerinin toplamıysa o zaten
      // toplamdır; değilse parseller toplanır ("iki komşu parsele oturur").
      const enBuyuk = Math.max(...benzersiz);
      const digerToplam = benzersiz.reduce((t, v) => t + v, 0) - enBuyuk;
      parselAlaniM2 = Math.abs(enBuyuk - digerToplam) / enBuyuk < 0.05
        ? enBuyuk
        : benzersiz.reduce((t, v) => t + v, 0);
    } else if (digerAlan.length === 1) {
      parselAlaniM2 = digerAlan[0];
    }
  }
  // Metinde alan yoksa TKGM verisine düşülür (adalar[].alanM2 = doğrudan
  // parsel sorgusu yanıtı). Kaydın TÜM parsellerinde alan olmalı: eksik
  // parselli toplam siteyi olduğundan küçük gösterir.
  // Buradaki değer PARSEL kapsamlıdır, metindeki m² gibi ortak adanın toplamı
  // olamaz; üstelik birden çok site kaydına atanmış parsellerde alan hiç
  // işlenmez (scripts/tkgm-kunye-uygula.py). Bu yüzden "paylaş" metin
  // korumasının dışındadır — o koruma "çevresini paylaşır" gibi parselle
  // ilgisi olmayan cümlelerde de kapanıyor ve gerçek parsel alanını yutuyordu.
  if (parselAlaniM2 === undefined) {
    const parseller = new Map<string, number>();
    for (const a of site.adalar ?? []) {
      if (typeof a.alanM2 !== "number") {
        parseller.clear();
        break;
      }
      parseller.set(`${a.no}/${a.parsel ?? "1"}`, a.alanM2);
    }
    const toplam = [...parseller.values()].reduce((t, v) => t + v, 0);
    if (toplam >= 500) parselAlaniM2 = toplam;
  }

  // --- tapu niteliği
  const km = tum.includes("kat mülkiyet");
  const ki = tum.includes("kat irtifak");
  const tapuNiteligi = km && ki ? ("kat mülkiyeti + kat irtifakı" as const) : km ? ("kat mülkiyeti" as const) : ki ? ("kat irtifakı" as const) : undefined;

  // --- blok: iki metinden en büyük değer (tapu toplamı pazarlama alt
  // kümesinden büyüktür). Çok adalı sitede tek adanın sayısı bütün sanılmasın:
  // "toplam N blok" yoksa ve site 2+ adaya yayılıyorsa blok yazılmaz.
  const toplamBlok = tum.match(/toplam (\d+) blo[kğ]/);
  const blokAdaylari = [...blokDegerleri(oz, false), ...blokDegerleri(ac, true)];
  let blokSayisi: number | undefined = toplamBlok
    ? Number.parseInt(toplamBlok[1], 10)
    : blokAdaylari.length
      ? Math.max(...blokAdaylari)
      : undefined;
  if (!toplamBlok && (site.adalar?.length ?? 0) > 1) blokSayisi = undefined;
  // Metin blok sayısı vermiyorsa TKGM niteliğine düşülür. Yalnız TEK parselli
  // kayıtta: çok parselli sitede her parselin niteliği kendi bloklarını sayar,
  // toplamı kurmak parsellerden birinin niteliği eksikse yanlış olur.
  if (blokSayisi === undefined && site.adalar?.length === 1 && site.adalar[0].nitelik) {
    blokSayisi = niteliktenBlok(site.adalar[0].nitelik);
  }

  const ozKat = katlariCikar(oz, false);
  const acKat = katlariCikar(ac, true);
  const katlar = [...ozKat.katlar, ...acKat.katlar];
  let katFiltrelendi = ozKat.filtrelendi || acKat.filtrelendi;
  // Metin kat bilgisi vermiyorsa TKGM tapu niteliğine düşülür (adalar[].nitelik).
  // Yalnız YEDEK: metinden gelen değerlerle karıştırmak, tapuda henüz
  // güncellenmemiş blokla yazılı metni çelişkili bir aralığa sokar.
  if (katlar.length === 0) {
    for (const a of site.adalar ?? []) {
      if (!a.nitelik) continue;
      const nk = niteliktenKatlar(a.nitelik);
      katlar.push(...nk.katlar);
      katFiltrelendi ||= nk.filtrelendi;
    }
  }
  const katMin = katlar.length ? Math.min(...katlar) : undefined;
  const katMax = katlar.length ? Math.max(...katlar) : undefined;

  const ozKonut = konutCikar(oz, false);
  const acKonut = konutCikar(ac, true);
  const konutSayisi =
    ozKonut !== undefined && acKonut !== undefined
      ? Math.max(ozKonut, acKonut)
      : (ozKonut ?? acKonut);

  // --- yapı tipi. Rezidans etiketi yalnız GÜÇLÜ sinyalde verilir (2. çürütme
  // turu, ~20 hata): "konut blokları + küçük ticari blok" düzeni ofis-işyeri
  // kelimesini geçirse de KONUT sitesidir; adında Residence olup tapusu
  // apartman olanlar, "bu rezidansta satılık..." kapanışları ve sözlükteki
  // "rezidans tapusu" maddesine verilen linkler rezidans KANITI DEĞİLDİR.
  // Güçlü sinyal: (a) metin yapıyı açıkça rezidans olarak TANIMLIYOR, ya da
  // (b) tüm yapı ofis-işyeri tapulu VE metinde hiçbir konut/apartman/mesken
  // tanımı yok.
  // DİKKAT: tum, normalize edilmiştir — "bir" kelimesi "1"e dönüşür; pattern
  // sayı kelimesi İÇERMEMELİ ("butik bir rezidans" burada "butik 1 rezidans").
  const rezidans =
    /rezidans (sitesi|projesi|yapısı|tipinde|tipi\b|dairelerinde)|niteliği rezidans/.test(tum) ||
    (/ofis[ ,/-]*işyeri niteliğiyle kayıtl/.test(tum) &&
      !/apartman|mesken|konut blo|konut sitesi|konut yapısı|konut projesi/.test(tum));
  // "villa dokusu" bilinçli olarak listede YOK: komşu kuşağı anlatan cümleler
  // ("Mavi Ladin'in az katlı villa dokusu") 11 katlı apartmanı villa yapıyordu.
  const villa =
    /villa/i.test(site.isim) ||
    /dubleks (ev|bina|konut|yapı|villa)|müstakil (ev|konut|villa|yapı)|villa (sitesi|tipi)/.test(tum) ||
    (/dubleks|müstakil|villa/.test(tum) && (katMax ?? 99) <= 4);
  const yapiTipi: Kunye["yapiTipi"] = rezidans ? "rezidans" : villa ? "villa/dubleks" : "apartman/blok";

  const donatilar: string[] = [];
  for (const [kalip, ad] of DONATI_KALIPLARI) {
    if (kalip.test(tum) && !donatilar.includes(ad)) donatilar.push(ad);
  }

  return { parselAlaniM2, tapuNiteligi, blokSayisi, katMin, katMax, katFiltrelendi, konutSayisi, yapiTipi, donatilar };
}

/** Kat gösterimi. Düşük alt değerler çoğunlukla ticari/yardımcı bloktur
 * ("2 Katlı Dükkan", "3 Katlı A Blok — ticari taban"); aralık iddia etmek
 * ("2-15 katlı") siteyi yanlış tanıtır. Alt değer 4'ün altındaysa YA DA elenen
 * ticari blok katı varsa (tek kalan değer tüm blokları temsil etmeyebilir)
 * yalnız "en yüksek bloğu N katlı" denir — her durumda doğru bir ifade. */
export function katGosterimi(
  katMin?: number,
  katMax?: number,
  katFiltrelendi = false
): string | null {
  if (katMin === undefined || katMax === undefined) return null;
  if (katMin === katMax) return katFiltrelendi ? `en yüksek bloğu ${katMax} katlı` : `${katMax} katlı`;
  if (katMin >= 4) return `${katMin}-${katMax} katlı`;
  return `en yüksek bloğu ${katMax} katlı`;
}

/** AEO "önce cevap" açılış cümlesi: müşteriye telefonda verilecek cevap gibi —
 * somut yapı + tapu bilgisi önde. Künyede kullanılabilir alan yoksa null döner
 * ve sayfa mevcut genel kalıbına düşer. Cümleye ada/parsel NUMARASI yazılmaz
 * (görünür metin kuralı); "kule" kelimesi kullanılmaz. */
export function kunyeCumlesi(
  site: Site,
  kunye: Kunye,
  mahalleIsim: string,
  eryamanda: boolean
): string | null {
  const parcalar: string[] = [];
  const katMetni = katGosterimi(kunye.katMin, kunye.katMax, kunye.katFiltrelendi);

  if (kunye.blokSayisi && katMetni) {
    parcalar.push(
      kunye.blokSayisi === 1 ? `tek blokta ${katMetni}` : `${kunye.blokSayisi} blokta ${katMetni}`
    );
  } else if (katMetni) {
    parcalar.push(katMetni);
  } else if (kunye.blokSayisi) {
    parcalar.push(kunye.blokSayisi === 1 ? "tek bloklu" : `${kunye.blokSayisi} bloklu`);
  }

  // "bağımsız bölüm" DENMEZ: karma sitelerde dükkânlar da bağımsız bölümdür,
  // daire sayısını öyle etiketlemek yanlış toplam iddia eder. "Daire" güvenli.
  if (kunye.konutSayisi) {
    parcalar.push(
      kunye.yapiTipi === "villa/dubleks"
        ? `toplam ${kunye.konutSayisi} konutluk`
        : `toplam ${kunye.konutSayisi} daireli`
    );
  }

  if (kunye.tapuNiteligi === "kat mülkiyeti") {
    parcalar.push("TKGM kayıtlarında kat mülkiyetli parselde yer alan");
  } else if (kunye.tapuNiteligi === "kat irtifakı") {
    parcalar.push("TKGM kayıtlarında kat irtifaklı parselde yer alan");
  } else if (kunye.tapuNiteligi) {
    parcalar.push("TKGM kayıtlarında kısmen kat mülkiyetli parsellerde yer alan");
  }

  if (parcalar.length === 0) return null;

  const tur =
    kunye.yapiTipi === "rezidans"
      ? "bir rezidans projesidir"
      : kunye.yapiTipi === "villa/dubleks"
        ? "villa/dubleks dokulu bir konut sitesidir"
        : "bir konut sitesidir";

  return `${site.isim}, ${eryamanda ? "Eryaman'da " : ""}${mahalleIsim} sınırları içinde, ${parcalar.join(", ")} ${tur}.`;
}

/** Karşılaştırma aracına giden kompakt satır (istemciye taşınır — küçük tut). */
export interface KunyeSatiri {
  isim: string;
  slug: string;
  mahalleSlug: string;
  mahalleIsim: string;
  tapu?: string;
  alanM2?: number;
  blok?: number;
  katMin?: number;
  katMax?: number;
  katFiltreli: boolean;
  konut?: number;
  tip: Kunye["yapiTipi"];
  donatilar: string[];
}

export function kunyeSatiri(site: Site, mahalleIsim: string): KunyeSatiri {
  const k = cikarKunye(site);
  return {
    isim: site.isim,
    slug: site.slug,
    mahalleSlug: site.mahalleSlug,
    mahalleIsim,
    tapu: k.tapuNiteligi,
    alanM2: k.parselAlaniM2,
    blok: k.blokSayisi,
    katMin: k.katMin,
    katMax: k.katMax,
    katFiltreli: k.katFiltrelendi,
    konut: k.konutSayisi,
    tip: k.yapiTipi,
    donatilar: k.donatilar,
  };
}
