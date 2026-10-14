/**
 * ESKİ ADRES TARAMA TETİKLEME DENEYİ (kurulum 2026-10-14, okuma 2026-10-28).
 *
 * SORUN: 26.07 slug taşımasının eski adresleri (/mahalleler/<slug>/... ,
 * '-mahallesi'siz) canlıda 2,5 aydır tek adımlı 308 veriyor ama Google'ın
 * dizininde 'canonical = kendisi' olarak duruyor: 14.10 API tabanında 100
 * adresin 39'u hâlâ "Submitted and indexed" ve son taramaları 24.06–25.07,
 * yani Google 308'i hiç görmemiş. Denenen ve işe yaramayan tetikleyiciler:
 * eski-adres site haritası (16.08–07.10, kaldırıldı) ve GSC dizine ekleme
 * isteği (07.10, 11 adres: 4'ü tarandı, 6'sında iz yok). Son denenmemiş
 * tetikleyici: TARANAN bir sayfadan iç bağ.
 *
 * TASARIM: 100 eski adres (GSC 'sayfalar 28' gösterim sırasına göre ilk 100,
 * 11 mahalle; Yenimahalle ve 410'lar yok), tür içinde dönüşümlü atama:
 *   tedavi 50 (39 site + 11 ada) — bu dosyadaki liste, /eski-adresler
 *     sayfasından düz <a href> ile bağlanır (rel yok, nofollow yok).
 *   kontrol 50 (39 site + 11 ada) — hiçbir yerden bağlanmaz, dokunulmaz;
 *     listesi yalnız kaynak TSV'de (bilerek koda alınmadı: koda girse de
 *     bağ üretmez ama yanlışlıkla sayfaya basılma riski sıfırlanır).
 * Kollar gösterim/tık/tür bakımından dengeli: gos28 tedavi 1564 / kontrol
 * 1184 (fark 1. sıradaki kiratli-residence'tan), tik28 18 / 17.
 * Taban (14.10 ~20:00Z, API URL denetimi): son tarama > 07.10 15:00Z olan
 * adres tedavi 3/50, kontrol 7/50.
 *
 * ÇAKIŞMA: 07.10 dizine ekleme isteğindeki 11 adresin 8'i bu havuzda
 * (tedavi: kiratli-residence, 46643-7, 17365-1, 18668-1, eryaman-evleri,
 * konuta-ozlem-sitesi; kontrol: bosphorus-ankara-konutlari, ilk-bahar-sitesi).
 * Okumada ayrı kova açılır ya da dışarıda tutulur (o zaman kollar 44 / 48).
 *
 * OKUMA KURALI (28.10, node scripts/gsc-api.mjs denetle-dosya, aynı 100 adres):
 *   birincil = her kolda lastCrawlTime'ı tabandan farklı VE > 2026-10-15 olan
 *   adres oranı; karar iki oranın farkına göre (kol↔kol düz kıyas, tabanlar
 *   eşlenik). İkincil = varis adresin aynı sorgulardaki gösterim payı (gsc
 *   'sayfalar 28' eski/varis oranı, kol bazında); kesin ikincil okuma 11.11.
 *
 * KALDIRMA KOŞULU: /eski-adresler sayfası ve bu dosya, 28.10 okuması
 * YAPILDIKTAN SONRA kaldırılır (sonuç ne olursa olsun; işe yaradıysa kalan
 * eski adresler için ayrı karar). Sayfa noindex,follow ve site haritasında
 * YOK; hub sayfalarındaki (siteler, mahalleler) tek satırlık bağ da onunla
 * birlikte söküllür.
 *
 * KAYNAK: scratchpad-karne/pws0/eski-adres-deneyi-1410.tsv (tasarım, 100
 * satır, taban sütunları) ve scratchpad-karne/pws0/eski-adres-deneyi-tedavi.json
 * (tedavi yolları). `varis` = eski adresin canlı 308 hedefi (curl, 14.10);
 * '-mahallesi' ekinden başka yere giden iki hedef next.config.ts özel kuralı:
 * seyh-samil/concept-eryaman → yavuz-selim-mahallesi/concept-eryaman,
 * goksu/utku-kent-1-sitesi → goksu-mahallesi/utku-kent-2-sitesi.
 * Sıra: TSV'deki genel sıra (gos28 azalan).
 */
export interface EskiAdresDeneyiSatiri {
  /** Eski şema yolu — SAYFADA BAĞLANAN adres budur. */
  eski: string;
  /** 308 hedefi (yeni şema) — sayfada yalnız okunur adı basılır, bağlanmaz. */
  varis: string;
}

export const ESKI_ADRES_DENEYI_TEDAVI: readonly EskiAdresDeneyiSatiri[] = [
  { eski: "/mahalleler/sehit-osman-avci/kiratli-residence", varis: "/mahalleler/sehit-osman-avci-mahallesi/kiratli-residence" },
  { eski: "/mahalleler/tunahan/sutek-sitesi", varis: "/mahalleler/tunahan-mahallesi/sutek-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/adalar/46643-7", varis: "/mahalleler/sehit-osman-avci-mahallesi/adalar/46643-7" },
  { eski: "/mahalleler/guzelkent/eryapi-sitesi", varis: "/mahalleler/guzelkent-mahallesi/eryapi-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/akasya-sitesi", varis: "/mahalleler/sehit-osman-avci-mahallesi/akasya-sitesi" },
  { eski: "/mahalleler/yavuz-selim/guz-gol-sitesi", varis: "/mahalleler/yavuz-selim-mahallesi/guz-gol-sitesi" },
  { eski: "/mahalleler/devlet/sedirkent-sitesi", varis: "/mahalleler/devlet-mahallesi/sedirkent-sitesi" },
  { eski: "/mahalleler/guzelkent/meltem-sitesi", varis: "/mahalleler/guzelkent-mahallesi/meltem-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/akin-688-konutlari", varis: "/mahalleler/sehit-osman-avci-mahallesi/akin-688-konutlari" },
  { eski: "/mahalleler/tunahan/adalar/17639-1", varis: "/mahalleler/tunahan-mahallesi/adalar/17639-1" },
  { eski: "/mahalleler/altay/doktorlar-sitesi", varis: "/mahalleler/altay-mahallesi/doktorlar-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/inci-park-evleri-sitesi", varis: "/mahalleler/sehit-osman-avci-mahallesi/inci-park-evleri-sitesi" },
  { eski: "/mahalleler/guzelkent/oz-muhtar-sitesi", varis: "/mahalleler/guzelkent-mahallesi/oz-muhtar-sitesi" },
  { eski: "/mahalleler/guzelkent/cankaya-vefa-sitesi", varis: "/mahalleler/guzelkent-mahallesi/cankaya-vefa-sitesi" },
  { eski: "/mahalleler/goksu/irem-konutlari", varis: "/mahalleler/goksu-mahallesi/irem-konutlari" },
  { eski: "/mahalleler/eryaman/guzel-ankara-evleri-sitesi", varis: "/mahalleler/eryaman-mahallesi/guzel-ankara-evleri-sitesi" },
  { eski: "/mahalleler/guzelkent/postakent-sitesi", varis: "/mahalleler/guzelkent-mahallesi/postakent-sitesi" },
  { eski: "/mahalleler/guzelkent/master-kent-sitesi", varis: "/mahalleler/guzelkent-mahallesi/master-kent-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/adalar/46651-5", varis: "/mahalleler/sehit-osman-avci-mahallesi/adalar/46651-5" },
  { eski: "/mahalleler/altay/palmiye-evleri", varis: "/mahalleler/altay-mahallesi/palmiye-evleri" },
  { eski: "/mahalleler/seyh-samil/adalar/17365-1", varis: "/mahalleler/seyh-samil-mahallesi/adalar/17365-1" },
  { eski: "/mahalleler/tunahan/okyanus-plaza", varis: "/mahalleler/tunahan-mahallesi/okyanus-plaza" },
  { eski: "/mahalleler/goksu/kasmir-gol-evleri", varis: "/mahalleler/goksu-mahallesi/kasmir-gol-evleri" },
  { eski: "/mahalleler/yavuz-selim/erkaraca-sitesi", varis: "/mahalleler/yavuz-selim-mahallesi/erkaraca-sitesi" },
  { eski: "/mahalleler/guzelkent/adalar/18668-1", varis: "/mahalleler/guzelkent-mahallesi/adalar/18668-1" },
  { eski: "/mahalleler/goksu/goksu-park-vadi-konutlari", varis: "/mahalleler/goksu-mahallesi/goksu-park-vadi-konutlari" },
  { eski: "/mahalleler/guzelkent/ipek-yapi-sitesi", varis: "/mahalleler/guzelkent-mahallesi/ipek-yapi-sitesi" },
  { eski: "/mahalleler/devlet/mavi-koy-sitesi", varis: "/mahalleler/devlet-mahallesi/mavi-koy-sitesi" },
  { eski: "/mahalleler/seyh-samil/adalar/46569-1", varis: "/mahalleler/seyh-samil-mahallesi/adalar/46569-1" },
  { eski: "/mahalleler/yavuz-selim/yunuskent-sitesi", varis: "/mahalleler/yavuz-selim-mahallesi/yunuskent-sitesi" },
  { eski: "/mahalleler/guzelkent/gordogu-sen-sitesi", varis: "/mahalleler/guzelkent-mahallesi/gordogu-sen-sitesi" },
  { eski: "/mahalleler/tunahan/tunahan-sitesi", varis: "/mahalleler/tunahan-mahallesi/tunahan-sitesi" },
  { eski: "/mahalleler/seyh-samil/concept-eryaman", varis: "/mahalleler/yavuz-selim-mahallesi/concept-eryaman" },
  { eski: "/mahalleler/eryaman/eryaman-evleri", varis: "/mahalleler/eryaman-mahallesi/eryaman-evleri" },
  { eski: "/mahalleler/guzelkent/konuta-ozlem-sitesi", varis: "/mahalleler/guzelkent-mahallesi/konuta-ozlem-sitesi" },
  { eski: "/mahalleler/altay/adalar/45899-3", varis: "/mahalleler/altay-mahallesi/adalar/45899-3" },
  { eski: "/mahalleler/goksu/havuzlu-evler-sitesi", varis: "/mahalleler/goksu-mahallesi/havuzlu-evler-sitesi" },
  { eski: "/mahalleler/tunahan/adalar/17633-1", varis: "/mahalleler/tunahan-mahallesi/adalar/17633-1" },
  { eski: "/mahalleler/eryaman/atakent-metro-sitesi", varis: "/mahalleler/eryaman-mahallesi/atakent-metro-sitesi" },
  { eski: "/mahalleler/goksu/utku-kent-1-sitesi", varis: "/mahalleler/goksu-mahallesi/utku-kent-2-sitesi" },
  { eski: "/mahalleler/guzelkent/sehit-ferhat-koc-sitesi", varis: "/mahalleler/guzelkent-mahallesi/sehit-ferhat-koc-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/adalar/46644-1", varis: "/mahalleler/sehit-osman-avci-mahallesi/adalar/46644-1" },
  { eski: "/mahalleler/yavuz-selim/genc-avrasya-sitesi", varis: "/mahalleler/yavuz-selim-mahallesi/genc-avrasya-sitesi" },
  { eski: "/mahalleler/eryaman/pasa-konaklari", varis: "/mahalleler/eryaman-mahallesi/pasa-konaklari" },
  { eski: "/mahalleler/goksu/goksu-aura-sitesi", varis: "/mahalleler/goksu-mahallesi/goksu-aura-sitesi" },
  { eski: "/mahalleler/guzelkent/er-ay-3-sitesi", varis: "/mahalleler/guzelkent-mahallesi/er-ay-3-sitesi" },
  { eski: "/mahalleler/guzelkent/ozle-iletisim-sitesi", varis: "/mahalleler/guzelkent-mahallesi/ozle-iletisim-sitesi" },
  { eski: "/mahalleler/sehit-osman-avci/adalar/17462-1", varis: "/mahalleler/sehit-osman-avci-mahallesi/adalar/17462-1" },
  { eski: "/mahalleler/seyh-samil/adalar/46269-3", varis: "/mahalleler/seyh-samil-mahallesi/adalar/46269-3" },
  { eski: "/mahalleler/yavuz-selim/esenkent-sitesi", varis: "/mahalleler/yavuz-selim-mahallesi/esenkent-sitesi" },
];
