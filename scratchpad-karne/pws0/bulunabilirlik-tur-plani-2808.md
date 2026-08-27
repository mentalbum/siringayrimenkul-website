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

## E. TUR 2 SONUÇLARI (27.08 gece — Devlet + Şeyh Şamil + Yavuz Selim)

### KARNE DÜZELTMESİ (önemli)
- DEVLET: 24 "ilk-10-dışı"nın 12'si HAYALET (11.08 eski tohum listesi,
  sayfa hiç olmamış: atk-vadi, doga, ege, emlak-bankasi, huzur, kardelen,
  miray, oyku, turk-ocagi, umut, denizati, park-vera). Gerçek tablo:
  44 sorguda ilk3 %59 (%46 değil). Karne betiğine hayalet süzgeci eklenmeli.
- İlk Bahar Sitesi: yalın sorguyu Google "İlkbahar"a düzeltiyor; Eryaman'lı
  biçimde 23.08'de #1'iz. Ölçüm kuyruğunda varyant düzeltilmeli, istek İŞE YARAMAZ.

### DEVLET damla listesi (6): selcuklu > alis > guneyce > yeni-huzur-bahcesi
(tazele; sarı-çınar emsali: 27.08 istek → aynı gün #2) + mavi-koy, sedirkent
(dizin-ekle; adaşsız GÜÇLÜ aday ama "dizinsize kota harcanmaz" kararına
istisna gerekir — Özgün onayına not düş, o gelene kadar tazele sınıfı önde).

### ŞEYH ŞAMİL damla listesi (talep sıralı): atayildiz (184) > bizim-alperenler
(114) > melis (110) > ovgu (23) > oz-cozum-kent (23) > selinkent (6) [tazele].
ÖZEL VAKA: liderkent (59 gos) + yagan-kent (27) — talep tamamen ESKİ slugda,
ikisi ESKİ ADRESLER birleştirme listesinde YOK; 308/301 doğrulanıp eski-adres
isteği olarak eklenmeli (protokolde eski adres en üst sırada).

### YAVUZ SELİM: gulvatan (44, tek temiz aday). utku + atadostlar istekleri
ZATEN GİTTİ (25/27.08) — çift istek atma. EN KRİTİK: endora-eryaman (196 gos)
— vitrini tutan ata-mahallesi/endora-plus 27.08'de 410 oldu, kendi sayfası
dışarıda; v4'te ÖNE çekilmeli, üç mükerrer kaydı teke indirilmeli.

### KUYRUK TEMİZLİĞİ (gsc-dizin becerisiyle uygulanacak — 25 kalem)
Kendiliğinden dizine girmiş/tazelenmiş → DÜŞ: turkkonut-sinem (3 kayıt),
acar, gul (çift), sumeyra, duskent, kackar, eston (2 kayıt), pasaj (yeniden ölç).
Çift kayıt → teke indir: dastarli (+ eski slug organik #1, birleştirme takip),
denizim, sergah, yesiloz, utku, yavuz-selim-sitesi (2), endora-eryaman (3→1).
Spell-correction → düş/dibe: sitekonut, ilkdogus (aday), ozharitacilar,
kucukevlerimiz, gulenkent (tur 1). "İstek işe yaramaz" sınıfı → düş: guzel-ev,
goksu-sitesi (Güzelkent çift ölçüm şüphesi, askıya).
