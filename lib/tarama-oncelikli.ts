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
 * TAMAMLANDI (2026-08-18): kalan 211 sayfa da denetlendi, 29'u daha dizin dışı
 * çıktı. Artık 723 site sayfasının 722'si ölçülü (1 sayfa kotaya takıldı) ve bu
 * liste TAHMİN İÇERMİYOR — her kayıt GSC URL Inspection ile tek tek doğrulandı.
 *
 * KORPUS ÖZETİ:
 *   722 ölçülen · 567 dizinde · 155 DİZİN DIŞI (%21)
 *   en açık mahalleler: Güzelkent 28, Şehit Osman Avcı 23, Ata 20, Cumhuriyet 20
 *
 * OTOPSİ BULGUSU (2026-08-20) — BAĞ POMPASI DİZİNE SOKMUYOR, BEKLENTİYİ DÜZELT:
 * 723 sayfanın gelen iç bağı build çıktısından sayıldı ve dizin durumuyla
 * çakıştırıldı. Sonuç TERS: dizin dışı sayfalar ortalamanın ÜSTÜNDE bağ alıyor
 * (26,8'e 18,2; 30+ bağ alanların %69'u dizin dışı) — çünkü bu mekanizma onlara
 * zaten ekstra bağ pompalıyor. İçerik zenginliği farkı SIFIR (açıklama 887'ye
 * 883 kr, özellik 5,9'a 5,9, koordinat/sınır ~%100 her iki kümede). Tek gerçek
 * ayırıcı SORGU TALEBİ: dizindekilerin 90 günlük medyan gösterimi 79, dizin
 * dışıların 3. Yani Google aranmayan sayfayı erteliyor (Illyes: tarama talebi).
 * DERS: bu listeye daha fazla bağ eklemek dizine sokmaz; dosya yine de kalıyor
 * çünkü tarama sıklığını destekliyor ve zararı yok. Dizine sokan kanıtlı araç
 * dizin isteği damlası (14.08: 8/8 <24 saat) + sayfanın aranır olması.
 *
 * TAZELİK UYARISI: 16.08 taraması bir gün eskidi ve 17-18.08 nokta kontrolünde
 * iki sayfa (mes-polaris-evleri, ata-life-sitesi) kendiliğinden dizine girmiş
 * çıktı — listeden çıkarıldılar. Yani liste her gün biraz bayatlar; dizin
 * isteği GÖNDERMEDEN ÖNCE o sayfayı tek tek doğrula, kota boşa gitmesin.
 *
 * ÖZEL VAKA — goksu-mahallesi/gsv-spor-sitesi bu listede DEĞİL: dizin sorunu
 * değil, adres sorunu. GSC "Duplicate, Google chose different canonical" diyor
 * ve seçtiği kanonik ESKİ adres (/mahalleler/goksu/gsv-spor-sitesi, 25.07'de
 * taranmış). Eski adres zaten sitemap-eski-adresler.xml'de; çözüm iç bağ değil,
 * o adresin yeniden taranması.
 *
 * SONRAKİ TAZELEME: bu liste kendiliğinden bayatlar — sayfa dizine girince
 * çıkarılmalı. Ölçüm komutu (tahmin etme, ölç):
 *   node scripts/gsc-api.mjs denetle-dosya <url-listesi.txt>
 *
 * BAKIM 2026-08-23 (GSC API teyitli): rusen-park-evleri (tarama 22.08) ve
 * bp-residence-eryaman (17.08) kendiliğinden DİZİNE GİRDİ → çıkarıldı.
 * cumhuriyet/botanik-sitesi eklendi: "URL is unknown to Google" teyitli ama
 * listede hiç yoktu (dökümdeki 'botanik-evleri' adı botanik-sitesi.json
 * kaydının isim alanı — slug karışması). 23.08 istek damlasında gönderilen
 * 8 Güzelkent + caglar-belde LİSTEDE BIRAKILDI: dizine girişleri GSC'de
 * teyit edilince çıkarılacak (24-48 saat).

 * GERİ ALINDI 2026-08-24: altay/metropol-bloklari 23.08'de eklenmişti ama O
 * SAYFA YOK (canlı 404, içerik kaydı da yok) — GSC'nin "unknown" demesi bu
 * yüzden. Ders: bu listeye eklemeden önce content/siteler/<mahalle>/<slug>.json
 * dosyasının VARLIĞINI doğrula; ölçüm defterindeki anahtar sayfa var demek
 * değil (bazı turlarda sayfası olmayan siteler de ölçülmüş).
 *
 * EK 2026-08-24: caglar-belde-sitesi çıkarıldı — 23.08 istek → 35 dk'da
 * tarandı, DİZİNDE (API teyitli). Dünkü Güzelkent 8'lisinin 5'i UNKNOWN'dan
 * "Discovered"a ilerledi (istek işleniyor); dizine girince çıkarılacaklar.
 */
const DIZINSIZ: Record<string, readonly string[]> = {
  "altay-mahallesi": [
    "betontas-bloklari",
    "eryaman-park-evleri",
    "ilbeyi-sitesi",
    "vatan-sitesi",
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
    "acar-sitesi",
    "camlica-sitesi",
    "gul-sitesi",
    "kosk-birlik-sitesi",
    "kuryap-sitesi",
    "liderkent",
    "onur-sitesi",
    "ozanadolu",
    "ozluce-guzelevim",
    "sumeyra-sitesi",
    "yagan-kent",
    "yesil-asiyan-sitesi",
    "zadegan-sitesi",
  ],
  "tunahan-mahallesi": [
    "akturk-sitesi",
    "camli-klima-bloklari",
    "ilgazlar-sitesi",
    "okyanus-plaza",
  ],
  "yavuz-selim-mahallesi": [
    "acat-konutlari",
    "erkaraca-sitesi",
    "ozenkent-2-villalari",
    "sahibin-sitesi",
    "uyum-90-sitesi",
    "yesil-goksu-konutyapi-kooperatifi",
    "yunuskent-sitesi",
  ],
  "yesilova-mahallesi": [
    "gokdemir-tower",
    "lokasyon-eryaman",
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
