// Başlık şablonu KONTROL KOLU — 07.09.2026 → 05.10.2026.
//
// 07.09'da site sayfası başlığına mahalle adı her kayıtta girdi (452 sayfa
// değişti). Yanlış sayfanın kendiliğinden doğru sayfaya dönme oranı ölçüldü:
// 27-31.08 → 04-05.09 turları arasında 34/89 vaka (%38) müdahalesiz düzeldi.
// Bu tabanla "değişti mi" sorusuna kontrolsüz cevap verilemez; o yüzden
// değişen kümeden mahalleye göre katmanlı, deterministik (sha1) seçilmiş 45
// sayfa ESKİ kuralda tutulur. Birincil hedef çiftleri (Güzel Ankara Evleri/
// Sitesi, Endora Park/Eryaman, Hotki Meydan/Ritm, Park İnci/İnci Park) ve
// YANLIS-SAYFA-BULGUSU-04-09.md listesi kontrole ALINMADI.
// Taban (04-06.09, pws=0): kontrol 28 ölçüm → 20 doğru / 5 yanlış / 3 ilk 10
// dışı; deney 257 ölçüm → 164 / 66 / 27.
// Okuma: 21.09 ve 05.10 (scratchpad-karne/pws0, aynı sorgular). 05.10'dan
// sonra bu dosya SİLİNİR ve kural herkese uygulanır — kontrol kolu bir
// ölçüm aracıdır, kalıcı istisna değil.
// Seçim betiği ve liste: scratchpad-karne/pws0/PLAN-06-09.md.
export const BASLIK_KONTROL_KOLU: ReadonlySet<string> = new Set([
  "altay-mahallesi/palmiye-evleri",
  "altay-mahallesi/motto-butik",
  "devlet-mahallesi/arslanlar-sitesi",
  "devlet-mahallesi/cagkent-sitesi",
  "devlet-mahallesi/turkkonut-istas-sitesi",
  "devlet-mahallesi/yeni-huzur-bahcesi-sitesi",
  "eryaman-mahallesi/intes-dogakent-konutlari",
  "eryaman-mahallesi/elif-elvan-sitesi",
  "eryaman-mahallesi/maximum-konutlari",
  "eryaman-mahallesi/kent-konaklari-sitesi",
  "eryaman-mahallesi/cumhuriyet-sitesi",
  "goksu-mahallesi/buse-konutlari",
  "goksu-mahallesi/ilgaz-life",
  "goksu-mahallesi/polsan-1-gozde-sitesi",
  "goksu-mahallesi/selale-evleri-sitesi",
  "goksu-mahallesi/park-evo-konutlari",
  "guzelkent-mahallesi/kosk-sitesi",
  "guzelkent-mahallesi/yukselay-sitesi",
  "guzelkent-mahallesi/gercek-92-sitesi",
  "guzelkent-mahallesi/eczacilar-sitesi",
  "guzelkent-mahallesi/buyuk-ankara-sitesi",
  "guzelkent-mahallesi/kurtulus-sitesi",
  "guzelkent-mahallesi/postakent-sitesi",
  "sehit-osman-avci-mahallesi/neva-panora-konutlari",
  "sehit-osman-avci-mahallesi/gungorler-tower",
  "sehit-osman-avci-mahallesi/yildiz-eryaman",
  "sehit-osman-avci-mahallesi/inci-life-residence",
  "sehit-osman-avci-mahallesi/bulvar-312-konutlari",
  "sehit-osman-avci-mahallesi/goksukent-sitesi",
  "seker-mahallesi/hill-tower",
  "seker-mahallesi/address-enda",
  "seyh-samil-mahallesi/baris-sitesi",
  "seyh-samil-mahallesi/yesil-asiyan-sitesi",
  "seyh-samil-mahallesi/sitekonut-sitesi",
  "seyh-samil-mahallesi/ozahikent-sitesi",
  "seyh-samil-mahallesi/yagan-kent",
  "tunahan-mahallesi/kur-sitesi-46495-ada",
  "tunahan-mahallesi/okyanus-plaza",
  "yavuz-selim-mahallesi/ozenkent-2-villalari",
  "yavuz-selim-mahallesi/yuksel-kent-91-sitesi",
  "yavuz-selim-mahallesi/yeni-ilkay-sitesi",
  "yavuz-selim-mahallesi/kucukevlerimiz-sitesi",
  "yavuz-selim-mahallesi/altintepe-sitesi",
  "yesilova-mahallesi/rema-delux",
  "yesilova-mahallesi/anka-vega",
]);
