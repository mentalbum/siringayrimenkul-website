import type { AdaBilgi } from "@/lib/types";

/**
 * DOĞRULANMIŞ etap bilgisi — yalnız resmî kaynağı olan etaplar burada.
 *
 * Site kayıtlarındaki `adalar[].etap` alanı iç gruplama verisidir ve bir kısmı
 * doğrulanmamıştır; o alan sayfada "bu site N. Etap'tadır" iddiası olarak
 * KULLANILMAZ (bkz. app/mahalleler/[mahalle]/[site]/page.tsx). Görünür etap
 * etiketi yalnız bu haritadan üretilir.
 *
 * Yeni bir etap eklemek için: o etabın toplu yapı yönetiminin resmî ada listesi
 * gerekir. Liste olmadan etap etiketi gösterilmez.
 */

type OnayliEtap = {
  no: string;
  /** Listenin alındığı resmî kaynak — denetlenebilir olsun diye kayıtta. */
  kaynak: string;
  adalar: ReadonlySet<string>;
  /**
   * Resmî listenin TAM ada sayısı. `adalar` bilinçli bir alt kümeyse (ihtilaflı
   * adalar yayım dışı bırakıldıysa) sayfa metni yine doğru toplamı söylesin diye
   * ayrıca tutulur. Boşsa `adalar.size` geçerlidir.
   */
  resmiToplam?: number;
};

const ETAP_4_ADALARI = [
  "17621", "17622", "17623", "17624", "17625",
  "17629", "17630", "17631", "17632", "17633",
  "17634", "17635", "17636", "17637", "17638",
  "17639", "17644", "17645", "17646", "17647",
  "17648", "17649", "17650", "17651", "17652",
  "17653", "17654", "17655", "17656", "17657",
  "17658", "17659", "17660", "17661", "17662",
  "17665", "17666", "17669", "17670", "17671",
  "17672", "17673", "17674", "17675", "17688",
  "17689", "17703", "17704", "17705", "17711",
];

const ETAP_5_ADALARI = [
  "46493", "46494", "46495", "46496", "46497",
  "46499", "46500", "46501", "46503", "46506", "46507",
];

/*
 * 1. Etap — tapuya tescilli "Eryaman Toplu Yapı Yönetim Planı", Bölüm XV
 * "Eryaman Toplu Konut Alanı Ada Listesi". Belge "Toplam 70 adadır" der ama
 * basılı listede sıra 34/35/44 atlanmış ve 17538 iki kez basılmış: fiilen 67
 * satır, parsel ekleri (17315/1-2 vb.) tekilleştirilince 63 farklı ada.
 *
 * ATLANAN SIRALAR KAPATILDI (2026-08-08): basılı listede olmayan 17527, 17533,
 * 17544 ve 17545, yönetimin KENDİ blok tablosunda (Wayback: eryaman1.com/
 * blok_yonetimi.php, 2010 + 2016 + "Kadromuz" sayfası) sırasıyla MESA, AKTÜRK,
 * AGE, AGE bölgesinde listeleniyor — yani ikinci bir resmî kaynak bunları 1.
 * Etap içinde sayıyor ve dördü de repo kayıtlarında zaten bu kümelere bağlı.
 * Doğrulanmış toplam bu yüzden 63 değil 67; belgenin iddia ettiği 70'e kalan
 * fark için ikinci bir kaynak yok, o adalar UYDURULMADI.
 *
 * YAYIM DIŞI TUTULAN 15 ada: 17480-17482 ve 17487-17498 (Eston, İçtaş/Kazım
 * Sarı, Kutlutaş devam blokları/Cumhuriyet şeridi, bugünkü ŞOA sınırında).
 * KARAR KALICI (2026-08-07, üç-kollu araştırma — sorunlu-siteler.md):
 * tapu/yönetim bağı bu planda (eryaman1.com'un kendi ada ve blok yönetimi
 * listeleri bloğu içeriyor) AMA ilan dili, yapımcı İçtaş'ın kurumsal sayfası
 * ve coğrafi doku ("2. Etap aksının güney devamı") tamamı "2. Etap" diyor;
 * "1. Etap" kullanan tek kaynak yok. Etiket iki listeye de giremez: buraya
 * girse müşteriyi yanıltır, II. Etap listesine girse resmî planla çelişir.
 * Çözüm: 2. Etap SAYFASINDA "birlikte anılan komşu şerit" bölümü (iddiasız
 * tespit). `resmiToplam: 67` sayfa metninin gerçek resmî toplamı söylemesini
 * sağlıyor.
 */
const ETAP_1_ADALARI = [
  "16859", "16868",
  "17312", "17313", "17314", "17315", "17316",
  "17317", "17318", "17319",
  "17499", "17500", "17501", "17502", "17503",
  "17504", "17505", "17506", "17507", "17508",
  "17509", "17510", "17511",
  "17516", "17517", "17518", "17519", "17520",
  "17521", "17522", "17523", "17524", "17527",
  "17533", "17534", "17535", "17536", "17537",
  "17538", "17539", "17540", "17541", "17542",
  "17543", "17544", "17545", "17546", "17547",
  "17555", "17556", "17557", "17558",
];

// Yönetim planı kapsamı "(14+3=) on yedi ada": 14 konut adası (17460-17472 ve
// 17477; 60 blok, 2109 konut) + 3 konut dışı ada — 17476 yönetim binası,
// 17478 iş merkezi, 17479 okul. 17473-17475 etapta YOK.
const ETAP_2_ADALARI = [
  "17460", "17461", "17462", "17463", "17464",
  "17465", "17466", "17467", "17468", "17469",
  "17470", "17471", "17472", "17476", "17477",
  "17478", "17479",
];

// 17321-17354 aralığında 17355-57 yok; yönetimin kendi haritası da atlıyor.
const ETAP_3_ADALARI = [
  "17321", "17322", "17323", "17324", "17325",
  "17326", "17327", "17328", "17329", "17330",
  "17331", "17332", "17333", "17334", "17335",
  "17336", "17337", "17338", "17339", "17340",
  "17341", "17342", "17343", "17344", "17345",
  "17346", "17347", "17348", "17349", "17350",
  "17351", "17352", "17353", "17354", "17358",
  "17359", "17360", "17361", "17362", "17363",
  "17364", "17365", "17366", "17367", "17368",
];

const ONAYLI: readonly OnayliEtap[] = [
  {
    no: "1",
    kaynak:
      "Eryaman Toplu Yapı Yönetim Planı (tapuya tescilli) — eryaman1.com/mevzuat → wp-content/uploads/2020/01/eryaman-toplu-yapi-yonetim-plani.pdf, Bölüm XV ada listesi (2026-08-07 alındı; 15 ihtilaflı ada yayım dışı, üstteki nota bakın)",
    adalar: new Set(ETAP_1_ADALARI),
    resmiToplam: 67,
  },
  {
    no: "2",
    kaynak:
      "Kara Eryaman II. Etap Toplu Yapı Yönetim Planı — eryaman2.com (canlı site düşmüş; Wayback arşivi: web.archive.org/web/20090904165148/http://www.eryaman2.com/Hakkımızda/YönetimPlanı.aspx; eryaman.biz 2. Etap sayfası aynı 17 adayı verir)",
    adalar: new Set(ETAP_2_ADALARI),
  },
  {
    no: "3",
    kaynak:
      "Eryaman 3 Toplu Yapı Yönetimi — eryaman3.com/Ada-Bilgileri (ada haritası, 45 ada; 2026-08-07 alındı)",
    adalar: new Set(ETAP_3_ADALARI),
  },
  {
    no: "4",
    kaynak: "Eryaman 4. Etap Toplu Yapı Yönetimi — eryaman4.com (Adalar sayfası)",
    adalar: new Set(ETAP_4_ADALARI),
  },
  {
    no: "5",
    kaynak: "Eryaman 5. Etap Toplu Yapı Yönetimi — eryaman5.com (Adalar sayfası)",
    adalar: new Set(ETAP_5_ADALARI),
  },
];

/**
 * Bir sitenin/adanın doğrulanmış etap numarası. Resmî listede karşılığı yoksa
 * null döner — o durumda sayfada etap ibaresi gösterilmez.
 */
export function onayliEtap(adalar: AdaBilgi[] | undefined): string | null {
  if (!adalar?.length) return null;
  for (const etap of ONAYLI) {
    if (adalar.some((ada) => etap.adalar.has(ada.no))) return etap.no;
  }
  return null;
}

/**
 * Resmî listedeki toplam ada sayısı. Kayıtlarımız her adayı kapsamayabilir;
 * etap sayfası "N adanın M tanesi arşivimizde" diyebilsin diye ayrıca verilir.
 */
export function onayliEtapToplamAda(no: string): number | null {
  const etap = ONAYLI.find((item) => item.no === no);
  return etap ? (etap.resmiToplam ?? etap.adalar.size) : null;
}

/** Tek bir ada numarası için doğrulanmış etap. */
export function adaOnayliEtap(adaNo: string): string | null {
  for (const etap of ONAYLI) {
    if (etap.adalar.has(adaNo)) return etap.no;
  }
  return null;
}

/**
 * Bu etap numarası için sayfa üretiliyor mu?
 *
 * Etap sayfaları yalnızca resmî ada listesi olan etaplarda var (4 ve 5).
 * Kayıtlardaki `adalar[].etap` alanı ise doğrulanmamış etapları da taşıyor —
 * mahalle sayfası o alandan link üretince olmayan sayfaya bağ veriyordu.
 * Canlı ölçümde yakalandı (2026-08-01): Şehit Osman Avcı mahalle sayfası
 * /etaplar/2 adresine link basıyor, adres 404 dönüyordu.
 */
export function etapSayfasiVarMi(no: string | undefined): boolean {
  return !!no && ONAYLI.some((etap) => etap.no === no);
}
