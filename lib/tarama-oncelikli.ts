/**
 * Google dizinine HENÜZ GİRMEMİŞ site sayfaları — tarama önceliği listesi.
 *
 * ÖLÇÜM (2026-08-16, GSC URL Inspection API — tahmin değil, tek tek soruldu):
 * 723 site sayfasının 512'si denetlendi (günlük kota şeker-mahallesi hizasında
 * bitti). Sonuç:
 *   384  dizinde
 *    93  "Discovered - currently not indexed"
 *    34  "URL is unknown to Google"
 *     1  "Duplicate, Google chose different canonical"
 * Yani ölçülen sayfaların %25'i dizin dışı. Teşhis daha önce üç kez
 * doğrulanmıştı: sorun keşif değil (sayfalar sitemap'te ve iç bağlantı
 * grafında mevcut), TARAMA BÜTÇESİ.
 *
 * ÖNCEKİ LİSTE 01.08 TAHMİNİYDİ VE YANILIYORDU: ölçülen mahallelerdeki 16
 * kaydın 14'ü ARTIK DİZİNDEYDİ — yani bağ bütçesi dizine çoktan girmiş
 * sayfalara akıyor, gerçekten dışarıda olan 126 sayfa hiç bağ almıyordu.
 * Bu yüzden liste tahminle DEĞİL yalnız ölçümle güncellenir.
 *
 * Search Console'un "dizine eklenmesini iste" düğmesi bu darboğazı 24 saatte
 * açıyor (10/10 sayfa dizine girdi, 4'ü doğrudan 1. sıraya) ama kotası günde
 * ~10 ve düğme yalnız GSC arayüzünden çalışıyor (Indexing API iş ilanları
 * dışında kural ihlali). Kuyruk: scratchpad-karne/pws0/DIZINE-EKLENECEKLER.md.
 * Elde kalan kotasız kaldıraç iç bağlantı yoğunluğu — bu dosya o.
 *
 * KULLANIM: site sayfasındaki "Komşu Siteler" bölümü 6 kart gösterir; bu
 * listedeki bir sayfa aynı mahalledeyse kartlardan biri ona ayrılır ve adaylar
 * arasında slug'a göre dönüşümlü seçilir (bağ bütçesi paylaşılsın diye).
 *
 * BAKIM: sayfa dizine girdiğinde listeden ÇIKARILMALI, yoksa bağ bütçesi
 * gereksiz yere orada kalır. Ölçüm yolu (`site:` sorgusu değil — o yanıltıyor):
 *   node scripts/gsc-api.mjs denetle-dosya <url-listesi.txt>
 *
 * AÇIK İŞ: kota nedeniyle ölçülemeyen 211 sayfa (şeker'in kalanı, şeyh şamil,
 * susuz, tunahan, yavuz selim, yeşilova) bir sonraki kota penceresinde
 * denetlenip bu liste tamamlanmalı.
 */
const DIZINSIZ: Record<string, readonly string[]> = {
  // ---- 16.08 GSC URL Inspection ile ÖLÇÜLDÜ (512 site sayfası denetlendi) ----
  "altay-mahallesi": [
    "betontas-bloklari",
    "eryaman-park-evleri",
    "ilbeyi-sitesi",
    "vatan-sitesi",
  ],
  "ata-mahallesi": [
    "ata-life-sitesi",
    "cagdas-onur-sitesi",
    "caglar-belde-sitesi",
    "cigdem-sitesi",
    "dogasu-evleri",
    "gold-stone-evleri",
    "guldede-sitesi",
    "havuz-kent",
    "kainat-evleri",
    "liva-life-yasam-konutlari",
    "manzara-evleri",
    "mercan-life-buse-konutlari",
    "mizan-sitesi",
    "panorama-gold",
    "rayli-sistemciler-sitesi",
    "rusen-park-evleri",
    "sirin-guneskent-sitesi",
    "sumeyra-2-sitesi",
    "tekirdag-park-evleri",
    "trend-life-sitesi",
  ],
  "cumhuriyet-mahallesi": [
    "10-botanik-evleri",
    "anadolu-vizyon-konutlari",
    "ap-istgate",
    "ap-istway",
    "arissa-botanik",
    "astim-flora-evleri",
    "astim-metrolife",
    "ata-yildiz-bati-konutlari",
    "basaksehir-ankara-konutlari",
    "batihan-konutlari",
    "botanik-park-evleri",
    "grup-dayanisma-sitesi",
    "konar-manzara-evleri",
    "mes-polaris-evleri",
    "motto-goksu",
    "park-sera-evleri",
    "vera-vista",
    "wind-goksu",
    "yeni-botanik-sitesi",
    "zirveden-bati",
  ],
  "devlet-mahallesi": [
    "arslanlar-sitesi",
    "dastarli-sitesi",
    "denizim-sitesi",
    "mavi-koy-sitesi",
    "sedirkent-sitesi",
    "sergah-evleri",
    "turkkonut-sinem-sitesi",
    "vatan-sitesi",
    "yesiloz-sitesi",
  ],
  "eryaman-mahallesi": [
    "atakent-1-asiyan-sitesi",
    "ay-sitesi",
    "caglar-sitesi",
    "guzel-ankara-evleri-sitesi",
    "lacin-eryaman-sitesi",
  ],
  "goksu-mahallesi": [
    "endora-goksu",
    "goksu-arma",
    "goksu-bilge-sitesi",
    "goksu-park-vadi-konutlari",
    "gsv-spor-sitesi",
    "irem-konutlari",
    "kafdagi-sitesi",
    "paro-life",
    "polsan1-ayisigi-sitesi",
    "tulip-life",
    "utkan-sitesi",
    "utku-kent-2-sitesi",
  ],
  "guzelkent-mahallesi": [
    "1-portakal-cicegi-sitesi",
    "ak-91-sitesi",
    "altay-sitesi",
    "ankolular-sitesi",
    "arzutas-sitesi",
    "buyuk-ankara-sitesi",
    "dogus-91-sitesi",
    "ekin-sitesi",
    "elele-sitesi",
    "gercek-92-sitesi",
    "gordogu-sen-sitesi",
    "gozde-1-sitesi",
    "gozde-2-sitesi",
    "gulsah-95-sitesi",
    "ipek-yapi-sitesi",
    "konuta-ozlem-sitesi",
    "kurtulus-sitesi",
    "kusburnu-sitesi",
    "master-kent-sitesi",
    "meltem-sitesi",
    "mesa-calisanlari-kooperatifi",
    "oz-muhtar-sitesi",
    "renk-villalari",
    "sehit-ferhat-koc-sitesi",
    "selale-sitesi",
    "seniz-sitesi",
    "yesim-kent2-sitesi",
    "yukselay-sitesi",
  ],
  "sehit-osman-avci-mahallesi": [
    "address-goksu",
    "akasya-sitesi",
    "akin-688-konutlari",
    "arkadya-goksu-evleri",
    "bossphorus-konutlari",
    "bp-residence-eryaman",
    "bulvar-1071-sitesi",
    "bulvar-312-konutlari",
    "cicek-sitesi",
    "cizgi-otesi-residence",
    "cumhuriyet-sitesi",
    "gode-yasam-konutlari",
    "goksu-prestij",
    "hill-tower-goksu",
    "ictas",
    "inci-park-evleri-sitesi",
    "kardelen-sitesi",
    "metropark-concept",
    "neva-panora-konutlari",
    "relax-eryaman-konutlari",
    "soyak-sitesi",
    "ucyildiz-sitesi",
    "yildiz-eryaman",
  ],
  "seker-mahallesi": [
    "address-enda",
    "akdal-residence",
    "altas-relax-line",
    "altas-rezidans",
    "diamond-residence",
    "izoser-residence",
  ],
  "seyh-samil-mahallesi": [
    "liderkent",
  ],
  // ---- ÖLÇÜLEMEDİ: 16.08 turunda günlük kota şeker-mahallesi hizasında bitti.
  //      Aşağıdakiler 01.08 tahminidir; ölçülen mahallelerde bu tahminlerin
  //      16'sının 14'ü YANLIŞ çıktı, o yüzden bunlara güvenilmemeli.
  //      Tunahan istisna: bu üç sayfa 16.08'de tek tek denetlendi.
  "susuz-mahallesi": [
    "basak-life",
    "starlife",
    "baskent-goksu",
  ],
  "yavuz-selim-mahallesi": [
    "dogapark-sitesi",
    "goksu-sitesi",
  ],
  "tunahan-mahallesi": [
    "ilgazlar-sitesi",
    "okyanus-plaza",
    "camli-klima-bloklari",
    "akturk-sitesi",
  ],
};

/** Bu mahalledeki dizinsiz site slug'ları (ölçüm tarihi: 2026-08-01). */
export function taramaOncelikliSlugs(mahalleSlug: string): readonly string[] {
  return DIZINSIZ[mahalleSlug] ?? [];
}

/** Sayfanın kendisi tarama önceliğinde mi — kendine bağ vermeyi engellemek için. */
export function taramaOncelikliMi(mahalleSlug: string, siteSlug: string): boolean {
  return (DIZINSIZ[mahalleSlug] ?? []).includes(siteSlug);
}
