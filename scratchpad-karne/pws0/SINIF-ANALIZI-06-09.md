# 496 sorguluk tabanın sınıf analizi — 06.09.2026 akşam

Kaynak: `sonuclar-site-emlakci.jsonl` (04-06.09, pws=0), `sayfalar28-0609.tsv`
(GSC 08.08-04.09), `eski-adres-denetim-0609.tsv` (62 URL, API).
Amaç: "ilk 3'te olmayanları ilk 3'e çıkar" isteğinde GERÇEK kaldıraç kalıp
kalmadığını sınıf sınıf ölçmek.

## Site sorguları: 482 ölçüm, ilk 3'te 360 (%75)

| sınıf | sorgu | durum |
|---|---|---|
| doğru sayfa | 307 | — |
| eski adres | 51 | kaldıraç ÖLÜ (aşağıda ölçüm) |
| ilk 10 dışı | 41+12 sayfa2 | 19'u yapısal adaş, 34'ü yerel boşluk |
| başka site sayfası | 35 | PR #90 (06.09 merge) hedefi, okuma 21.09 |
| ada sayfası | 15 | 16.08 kararı çalışıyor (%28 → %3) |
| mahalle sayfası | 14 | içerik ort 796 krk (doğru çıkanlar 913) |
| ana sayfa/mağaza | 4 | — |
| ölü 410 | 3 | doğal sindirim, müdahale yok |

## 1. ESKİ ADRES (51 sorgu, 44'ü ilk 3'te) — kaldıraç yok, kayıp küçük
62 eski-şema adres API ile denetlendi: 35'i **30+ gün** taranmamış (en eskisi
70 gün: seker/relax-line, sehit-osman-avci/tan-yildizi-sitesi,
seyh-samil/yeni-burak-sitesi). Hepsi "Submitted and indexed", 2'si
"Page with redirect". Yani Google 308'i biliyor ama eski kopyayı gösteriyor.

**Ölçülen kayıp (GSC 28 gün, aynı sitenin iki şeması, 306 çift):**
- eski şema: 135 tık / 6.059 gösterim → TO %2,23, ağırlıklı poz 7,8
- yeni şema: 862 tık / 34.549 gösterim → TO %2,50, ağırlıklı poz 7,5

Fark 0,27 puan TO ≈ 16 tık/28 gün. Eski şemanın site trafiğindeki payı
gösterimde %8,0, tıkta %7,5 — yani eski adres tıklanmıyor değil, neredeyse
yeni adres kadar tıklanıyor. **Özgün'ün "Evinizi Satalım çıkmadı" gözlemi
doğru ama parasal karşılığı küçük.** Yeniden taratma 03.09'da 9 sayfada
denendi, ölü (kaldiraç defteri). 06.09'da tek diyagnostik istek gönderildi
(yeni-burak, 70 günlük kopya — 03.09 testindekilerden farklı vaka), okuma 01.10.

## 2. ADA SAYFASI (15 sorgu) — 16.08 kararı çalışıyor, dokunma
16.08'de ada başlığından site adı çıkarılmıştı. O gün Tunahan'ın 25 sitesinin
7'sinde (%28) ada sayfası site sayfasının önündeydi; bugün 482 sorguda 15 (%3).
**Karar doğrulandı, geri alma yok.**
GSC: 803 ada sayfası, 15.066 gösterim, 136 tık (TO %0,90); 702 sayfa hiç tık
almıyor. Bu düşük TO ada sayfasının doğası (kimse "18519/1 ada" aramıyor);
başlığa site adını geri koymak 16.08'de ölçülmüş zararı geri getirir.

## 3. İLK 10 DIŞI (53 sorgu) — ikiye ayrılıyor
- **19 yapısal adaş** (ilk 3'te Eryaman/Etimesgut yok): Atatürk, Barış, Konut,
  Kurtuluş, Mavikent, Mesa, Umut, İlksebat, TOKİ, Maximum… Burada yarışılmıyor,
  ad paylaşılıyor. Kaldıraç yok.
- **34 yerel boşluk** (ilk 3 Eryaman'lı ama biz yokuz): Ak Kent, Akkonak, Aksu,
  Altıntepe, Asilkent, Atakent, Beyaz Residence, Doğa Konutları, Erenköy,
  Esenkent, Göksu Evleri, Göksu Sitesi, Göksupark, Havacılar, Işıkkent, Mavera,
  Meltem, Merkez, Oyak Göksupark, Pasaj Eryaman, Platin, Referans Ankara, Safir,
  Sude, Taşkent, Turkuaz, Utku, Yüceyurt, Çamlıca, Çamlık, Çağkent, Üçyıldız,
  İkizler, İlk Bahar.
  GSC: 32'si gösterim alıyor (1.534 gösterim / 28 tık, ort poz 7,5), 2'si hiç.
  **Dizin sorunu YOK** (06.09'da 116 sayfa denetlendi, 115'i dizinde).
  Açıklama uzunluğu ort **695 karakter** — doğru çıkanlarda 913, mahalle
  sayfası yiyenlerde 796, en kısaları 501-546.

## Açık tek hipotez: içerik uzunluğu
Korelasyon var (695 / 796 / 913) ama nedensellik ölçülmedi ve karıştırıcı
faktör güçlü (kısa açıklamalı sitelerin çoğu jenerik adlı). "Yalın ad içerik
çıkmazı" (bellek) YALIN AD sorguları için içerik eklemenin işe yaramadığını
ölçmüştü; "<ad> emlakçı" sınıfı ölçülmedi.
**Test edilebilir tasarım:** 34 boşluk sayfasının 17'sine gerçek veriye dayalı
içerik derinleştirmesi (TKGM/bilgiemlak/site kaynaklı olgu), 17'si kontrol.
Okuma 21.09 ve 05.10, aynı sorgular. Başlık müdahalesi (PR #90) iki kolda da
aynı olduğu için fark içeriğin katkısıdır. UYDURMA VERİ YASAK — kaynak yoksa
o site kolun dışında bırakılır.

## EK — 06.09 akşam: taramanın hedeflediği sorgu kalıbının GERÇEK hacmi

GSC 28 gün (08.08-04.09): 2.631 sorgu, 648 tık, 43.909 gösterim.

| sorgu sınıfı | sorgu | tık | gösterim | TO | ort. poz |
|---|---|---|---|---|---|
| yalın site adı / diğer | 1.640 | 233 | 28.564 | %0,82 | 9,5 |
| alıcı-kiracı niyeti (satılık/kiralık/fiyat) | 848 | 366 | 11.946 | %3,06 | 7,2 |
| emlakçı / gayrimenkul | 125 | 49 | 1.809 | %2,71 | **4,6** |
| bilgi (Eryaman nereye bağlı) | 18 | 0 | 1.590 | %0,00 | 9,3 |

**"\<site adı\> emlakçı" kalıbı: 4 sorgu, 12 gösterim, 0 tık (28 gün).**

Yani 527 sorguluk komple tarama, gerçekte neredeyse hiç aranmayan bir kalıbı
tarıyor. Bu bir sorun değil — turun amacı **teşhis**: "site adı arandığında
Google bizim HANGİ sayfamızı seçiyor?" sorusuna cevap veriyor ve yanlış-sayfa /
eski-adres / ada-kanibalizasyonu bulgularının tamamı buradan çıktı. Ama
turdaki sıraların doğrudan trafik karşılığı yok; "ilk 3'e çıkarma" işi
trafik değil **ayırt edicilik** hedefidir. Rapor dili buna göre kurulmalı.

**Asıl hacim iki yerde:**
1. Yalın site adı — 28.564 gösterim (%65), ama TO %0,82 ve poz 9,5. Bu sınıf
   "yalın ad içerik çıkmazı" ölçümüyle kapatılmıştı (sıralayan/sıralamayan
   sayfalar aynı çıktı). Kaldıraç bilinmiyor.
2. Alıcı-kiracı niyeti — 11.946 gösterim, TO %3,06, 366 tık. En çok tık buradan
   geliyor ama hedef kitle EV SAHİBİ değil (Özgün kararı: satış/kiralama eşit,
   alıcı kümesi kayırılmaz).

**En güçlü olduğumuz yer:** "emlakçı/gayrimenkul" sınıfı, ortalama pozisyon 4,6.
"eryaman emlakçı" 480 gösterim / 17 tık / poz 1,4.

**Bilgi sorguları (1.590 gösterim, poz 9,3, SIFIR tık):** "eryaman nereye bağlı"
(1.109), "eryaman hangi ilçeye bağlı" (293) ve 16 varyantı. Cevap sitede var
(ana sayfa: "Etimesgut'un Eryaman bölgesinde") ama üste çıkmıyor.
KARAR ÖZGÜN'ÜN: bu sorguyu arayan kişi Eryaman'da mülkü olan biri değil
(zaten bilir) — Özgün'ün "gereksiz tıklanma istemiyoruz / ölçüt: Eryaman'da
mülkü olana mı sesleniyor" kuralına göre bu iş AÇILMAZ. Ölçüm burada duruyor,
istenirse mevcut bir sayfaya tek SSS maddesi olarak eklenir (yeni sayfa değil).
