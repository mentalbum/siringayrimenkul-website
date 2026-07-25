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

const ONAYLI: readonly OnayliEtap[] = [
  {
    no: "4",
    kaynak: "Eryaman 4. Etap Toplu Yapı Yönetimi — eryaman4.com (Adalar sayfası)",
    adalar: new Set(ETAP_4_ADALARI),
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

/** Tek bir ada numarası için doğrulanmış etap. */
export function adaOnayliEtap(adaNo: string): string | null {
  for (const etap of ONAYLI) {
    if (etap.adalar.has(adaNo)) return etap.no;
  }
  return null;
}
