# 28.08 BULUNABİLİRLİK TUR PLANI (27.08 akşam hazırlığı, otonom döngü)

Kaynak analiz: wf bulunabilirlik-tur1 (Güzelkent 36 + Göksu 32 ilk-10-dışı
sorgunun dizin çapraz analizi). Program: bulunabilirlik-programi.md.

## A. BÖLGE TURU (SERP kanalı açılınca İLK İŞ — ~26 sorgu)

`node bolge-tur.mjs` — noktalara 6 Eryaman-içi mahalle EKLENDİ (27.08):
sehit-osman-avci, seker, goksu, altay, yesilova, guzelkent. 13 nokta × 2
sorgu ("eryaman emlakçı" + "emlakçı"). Amaç: dış/orta halkadan arayanın
kutusunda var mıyız — %90 hedefinin tek büyük bilinmeyeni. Önce mahalle
noktaları koşulsun (BOLGE_NOKTALAR=sehit-osman-avci,seker,goksu,altay,yesilova,guzelkent),
ilçe noktaları kanal ömrüne göre sona.

## B. DİZİN DAMLASI (GSC kotası açılınca; gsc-dizin becerisini YÜKLE)

GÜZELKENT İLK 10 (sıralı):
1. sehit-ferhat-koc-sitesi — Özgün'ün 23.08 kararı: damla İLK SIRASI
   (ŞFK/Er-Ay 3 birleştirme ön şartı; bayat-kuyruk geçişinde kaybolmuştu)
2. safi-apak-sitesi (75 gos, bayat 27.07) — v2 TEMİZ bandında ZATEN sırada:
   ayrıca istek açma, aynı damlada say
3. nazlideniz-sitesi (70, bayat) — v2 TEMİZ, aynı uyarı
4. cozum-kent-sitesi (70, bayat, adaşlı)
5. portakal-cicegi (28, bayat, adaşlı)
6. sahinbey-sitesi (20, bayat, adaşlı)
7. yayikli-4-sitesi (14, bayat, adaşlı)
8. kusburnu-sitesi (dizinsiz, adaşsız — istek hiç gitmemiş)
9. gulsah-95-sitesi (dizinsiz, adaşsız)
10. konuta-ozlem-sitesi (dizinsiz, adaşsız)

GÖKSU SONRAKİ DAMLA (talep sıralı): polsan1-ayisigi (219 gos eski adreste,
sayfa Google'a meçhul!), park-inci (114), zirveden (103), golkent-1 (103),
admira (93), seyirtepe (86), utkan (73), goksu-vadi (61), goksu-aura (37),
kafdagi (18). NOT: oyak-goksupark (25.08) + aksafak + sude (27.08) istekleri
ZATEN GİTTİ — kota harcama, yansıma ölç.

## C. KUYRUK DÜŞÜRME/DÜZELTME (gsc-dizin becerisiyle uygulanacak)

- gulenkent-sitesi: kuyruktan DÜŞÜR — Google sorguyu "Güzelkent"e spell-correct
  ediyor, tarama tazeleme çözmez (yapısal).
- erenkoy-sitesi: dizin-tazele kaydını DÜŞÜR — 25.08'de kendiliğinden tazelendi;
  28.08 SERP'te yeniden ölç, hâlâ dışarıdaysa yapısal kesinleşir.
- Yapısal (kota HARCANMAZ): korukent, aksu, mesa, gulenkent (Güzelkent);
  Göksu'da 8 rakip-ofis/coğrafi adaş vakası (Evinora dahil — taze kopyaya
  rağmen dışarıda, tazeleme çürütüldü).
- 28.08 SERP yeniden ölçüm adayları: erenkoy, kardelen (taze taramalar
  22.08 ölçümünden SONRA geldi — belki kendiliğinden girmiştir).
- gozde-2 + portakal-cicegi-2: önce ilgili ESKİ-SLUG ada birleştirmeleri
  (18652-1, 18450-1 — birleştirme kuyruğunda zaten var), site isteği sonra.
- Güzelkent dizinsiz kümesinde 23.08'de isteği gidip 4 günde dönüşmeyen 8
  sayfa var: TEKRAR istek atma (25.08/3 dersi: dizinsiz+talepsiz sayfada
  istek→dizin dönüşümü düşük).

## D. SIRADAKİ ANALİZLER (kanal beklerken, otonom döngü)

- Devlet cross-ref (iç halkanın en kötüsü: site-adı ilk3 %46, 24 dışarıda)
- Şeyh Şamil (23 dışarıda) + Yavuz Selim (22 dışarıda) cross-ref
- Etimesgut katmanı teşhis dosyası (SERP dökümü kanal açılınca 1-2 sorgu)
