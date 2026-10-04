# Ön bulgular — 04.10.2026 site denetimi (Claude, inline toplama)

Veri dosyaları (hepsi bu klasörde): gsc-ozet.json (28g), gsc-ozet84.json (12 hafta),
sayfalar28.tsv, sorgular28.tsv (sütunlar: gösterim, tık, poz, url/sorgu), gunluk.txt
(günlük toplam vs "yaşayan" seri + iki pencere sorgu JSON'u), aile-kol.json, ga4-*.txt,
sitemap.xml, sitemap-http.tsv (1178 adres, hepsi 200), ana.html, erenkoy.html.
Eski pencere sayfa verisi: scratchpad-karne/pws0/sayfalar28-0609.tsv (08.08–04.09).

## B1. Trafik: 28 günde tık −39,5 % (2.405→1.455), gösterim −27,9 %, pozisyon sabit 7,7
12 hafta: zirve 05.08 haftası 733 tık; 8 hafta aralıksız düşüş → 284.
Bileşenleri (eski pencere 08.08–04.09 vs yeni 02.09–29.09, tık):
  - Yenimahalle sayfaları (ata/susuz/cumhuriyet, 27.08'de 410): 789→264 (−525) — BİLİNÇLİ karar
  - Genel blog yazıları (07.08'de 410): 101→38 (−63) — BİLİNÇLİ
  - Eski adres (308): 110→91 (−19); parametreli: 7→0
  - YAŞAYAN sayfalar: 1.329→1.074 (−255, −19 %); gösterim 69.856→61.252 (−12 %)
Yaşayan sayfalarda sorgu bazında (gunluk.txt): gösterim kaybının ~%60'ı "bilgi" sorguları
("eryaman nereye bağlı" 1.218→1, "hangi ilçeye bağlı" 339→2) — bunlar 0 tık veriyordu.
Alıcı/kiracı niyeti −18 % gös / −9,5 % tık; yalın ad +2 % gös / −8 % tık; emlakçı +9 % gös / −22 % tık.
GA4: oturum 2.202→1.423 (−35 %) ama phone_click 14→14 (SABİT), whatsapp 10, form_start 4.

## B2. Günlük seride iki basamak (yaşayan sayfalar, gösterim/gün): 17.09 (2.522→2.131) ve
24.09 (2.211→1.870). Google Search Status: "September 2026 spam update" 24.09 16:15 UTC başladı,
28.09 "big weekend impact", 30.09 "phase two" (son GSC veri günü 29.09 — phase two henüz veride yok).
"August 2026 spam update" 18–21.08: 23.08'de −15 % (2.935→2.433) ama 27.08'de toparlandı.
HİPOTEZ: 24.09 basamağı spam güncellemesi; 17.09 açıklanamadı.

## B3. PR #90 (06.09, başlığa mahalle) kolları: deney gös −22 % / tık −36 %; kontrol gös −11 % / tık −33 %.
Tık kaybı iki kolda aynı → başlık değişikliği tıklamaya zarar vermedi (kontrol kolu küçük: 44 sayfa).
Kontrol kolu dosyası lib/baslik-kontrol-kolu.ts 05.10'dan sonra SİLİNECEK (yarın).

## B4. Sitemap tazelik sinyali 5 haftadır ölü: 1.178 adresin 1.090'ı 16.08/22.08 damgalı, en yeni 28.08.
Depoda 07.09'dan beri commit yok; PR #91 (24 sayfa içerik + şablon paragraf düzeltmesi) 4 haftadır açık.
GSC "Keşfedildi — dizine eklenmedi" 108 (Altay ada sayfaları, hiç taranmamış).

## B5. GSC dizin raporu (21.09): dizinde 1.620 / dışında 1.720 (07.09: 1.989 / 1.296).
Dışarıda: yönlendirmeli 715, 404 462 (Yenimahalle+eski adres — beklenen), canonical'lı alternatif 136,
noindex 61 (çok siteli ada sayfaları — kod kararı, ada page.tsx:133), tarandı-dizine-eklenmedi 71
(ada sayfaları + /ev-degerleme?mahalle=..&site=.. parametreli + opengraph-image), robots engeli 94
(opengraph-image), keşfedildi 108, kopya-farklı-canonical 71 (Temmuz'da taranmış eski adresler).
Site haritaları: sitemap.xml 1.178 keşfedilen (son okuma 02.10), eski-adresler 906 (30.09).
Manuel işlem / güvenlik: temiz. HTTPS: temiz. CWV: CrUX verisi yok (bilinen).

## B6. Hedef sorgu "eryaman emlakçı": poz 1,4 (eski 2,8), 388 gös, 13 tık (TO %3,4). "eryaman emlak" 1,5.
"emlakçı" 758 gös poz 4,8 (5 tık). Organik hedef tutmuş; TO düşük (harita kutusu + reklam üstte).

## B7. Teknik: 1.178 sitemap adresi hepsi 200; robots.txt sağlıklı; canonical doğru; HSTS var;
x-content-type-options / x-frame-options / referrer-policy / permissions-policy YOK;
/favicon.ico 404 (link rel=icon /icon.png var → tarayıcı için sorun değil, GSC favicon için link yeterli);
/manifest.webmanifest 404 (referans yok, önemsiz). JSON-LD: Place×14, Service×3, Offer×3, Person×2, WebSite.
Yasak kelime taraması (kule/kredi/ücretsiz/6-7.etap/fiyat/720/SPK/Yenimahalle) görünür alanlarda 0.

## B8. Dönüşüm: GA4 28g 1.423 oturum, hemen çıkma %63,7, ort. 53 sn; phone_click 14, whatsapp 10,
site_ust_sahibinden 26, form_start 4. Site sayfaları ailesi: 1.104 oturum, 47 sn, %62,6 hemen çıkma.
