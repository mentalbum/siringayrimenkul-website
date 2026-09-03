# TARAMA DENEYİ — dizin isteği BAYAT sayfayı yeniden taratır mı?

> Kurulum 03.09.2026 · deney kolu isteği **04.09**'da gider · ilk okuma **07.09** · ikinci okuma **11.09**

## Neden bu deney

Bugüne kadarki dizin damlası yalnız **dizin DIŞI** sayfalara istek gönderdi ve
%95 dönüşüm verdi. Ama ilk 3'e giremeyen sorguların büyük kısmı başka bir yerde
takılı: **sayfa dizinde, ama Google'ın kopyası aylar öncesinden.**

03.09 ölçümü — ilk 3'te olmayan 172 sorgunun dağılımı:

| sınıf | ne demek | n | ölçülmüş kaldıraç |
|---|---|---:|---|
| A | dizin dışı | 15 | **damla** (%95 dönüşüm) |
| B | dizinde, ilk 10 dışı | 63 | yok |
| C+F | sayfa 1'de, 4-10 arası | 94 | **başlık** (n=22: ort 3,64→2,27) |

C+F, başlık kaldıracının tam menzili: 4-10'dan 1-3'e taşımak ölçülmüş etkinin
büyüklüğüyle örtüşüyor. Ama başlık ancak Google sayfayı **yeniden tararsa** işe
yarar ve bu 94 sorgunun **68'inde** Google'ın kopyası bayat (39'u 30+ gün,
15'i hiç taranmamış, 14'ü 8-30 gün). Yani 07.09'daki başlık işi, tarama
sorunu çözülmezse 94 sorgunun sadece 26'sında görülür.

Bu deney, **68 sorgunun kapısını** açıp açamayacağımızı ölçer.

## Hipotez

H1: Dizinde olan bayat bir sayfaya GSC'den dizine ekleme isteği göndermek,
o sayfanın yeniden taranmasını tetikler.

H0: Tetiklemez; istek yalnız dizin DIŞI sayfalarda işe yarar (mevcut kural,
n=2 gözleme dayanıyor — bu yüzden zayıf).

## Tasarım — eşleştirilmiş, kontrol gruplu

43 aday (C+F sınıfı, dizinde, 25+ gündür taranmamış) tarama yaşına ve sıraya
göre sıralanıp ardışık ikililere bölündü; her ikilinin biri **deney**, biri
**kontrol** koluna gitti. Denge: deney ort. yaş 37,4 / sıra 5,5 — kontrol
ort. yaş 37,9 / sıra 5,9.

Kontrol grubu ŞART: 03.09'da istek gönderilmeden kendiliğinden dizine giren
4 sayfa vardı. Kontrolsüz ölçümde "istek tarattı" ile "zaten taranacaktı"
ayrılamaz — müdahale defterinin baştan beri kabul ettiği kusur budur.

| # | DENEY (istek gider) | yaş | sıra | KONTROL (istek gitmez) | yaş | sıra |
|---:|---|---:|---:|---|---:|---:|
| 1 | `seyh-samil-mahallesi/etaplar/3` | 26g | #6 | `altay-mahallesi/izgi-park-evleri` | 32g | #4 |
| 2 | `sehit-osman-avci-mahallesi/nefeskent-sitesi` | 32g | #4 | `altay-mahallesi/arya-nuans-residence` | 34g | #6 |
| 3 | `goksu-mahallesi/zirveden-goksu` | 34g | #7 | `devlet-mahallesi/cinar-sitesi` | 36g | #4 |
| 4 | `guzelkent-mahallesi/portakal-cicegi` | 36g | #4 | `tunahan-mahallesi/su-damlasi-sitesi` | 36g | #6 |
| 5 | `eryaman-mahallesi/kent-konaklari-sitesi` | 38g | #4 | `guzelkent-mahallesi/anadolu-sitesi` | 38g | #4 |
| 6 | `sehit-osman-avci-mahallesi/zekioglu-rezidans` | 38g | #4 | `devlet-mahallesi/sahil-sitesi` | 38g | #5 |
| 7 | `eryaman-mahallesi/dogankaya-sitesi` | 38g | #5 | `goksu-mahallesi/koru-eryaman` | 38g | #5 |
| 8 | `goksu-mahallesi/park-inci-konutlari` | 38g | #6 | `guzelkent-mahallesi/safi-apak-sitesi` | 38g | #6 |
| 9 | `goksu-mahallesi/goksu-aura-sitesi` | 38g | #7 | `goksu-mahallesi/goksu-vadi-konutlari` | 38g | #7 |
| 10 | `goksu-mahallesi/oyak-goksupark` | 38g | #7 | `goksu-mahallesi/vaditepe-baspinar` | 38g | #9 |

## Yürütme

**04.09** — deney kolundaki 10 sayfaya GSC arayüzünden dizine ekleme isteği.
Kontrol koluna **dokunulmaz** (damla kuyruğunda çıkarlarsa atlanır — deney
bozulmasın diye 11.09'a kadar kuyruktan muaf).

**07.09 (3. gün)** — her 20 sayfa için `gsc-api.mjs denetle-dosya`; ölçüt:
`son_tarama >= 2026-09-04` mü? Fisher kesin testi ile iki kolu karşılaştır.

**11.09 (7. gün)** — tarama ölçümü tekrarlanır + SERP sırası yeniden ölçülür.
Sıra değişimi ikincil çıktı: tarama gerçekleşse bile sıranın oynaması için
sayfada değişmiş bir şey olması gerekir; bu turda sayfalar değişmiyor, o yüzden
sıranın SABİT kalması beklenir. Sıra oynarsa bu, "tarama tek başına sıra
değiştirir" anlamına gelir ve ayrıca not edilir.

## Karar kuralı

- Deney ≥7/10, kontrol ≤3/10 taranmışsa → **H1 kabul**: 68 sorgunun tarama
  kapısı açık; kalan 33 bayat sayfaya kota ayrılır, 07.09 başlık işi bu
  sayfalarda da görülür.
- İki kol arasında fark yoksa → **H0 kalır**: 68 sorgu için elimizde kaldıraç
  yok; 07.09 başlık işi yalnız 26 taze sorguya yapılır, kalanı dürüstçe
  "kaldıraç yok" diye raporlanır.
- Arada kalırsa (ör. 5/10 vs 3/10) → örneklem kalan 11 çiftle genişletilir.

## Riskler

- **Kota**: 10 istek günlük kotanın tamamı. 04.09'da damla duracak; damlanın
  33 açık hedefi 05.09'da devam eder. Damla kaldıracı kanıtlı (%95), bu deney
  ise kanıtlanmamış 68 sorgunun kapısı — bir günlük gecikme buna değer.
- **Gösterim kaybı**: sayfalar zaten dizinde; istek dizinden çıkarma değil,
  yeniden tarama talebidir. "Gösterimler düşmesin" kuralıyla çelişmiyor.

---

## 03.09 akşamı — KOLLAR YENİDEN KURULUYOR (yakalanan hata)

Yukarıdaki 10 çift, `ilk3-hedef.json`'daki `son_tarama` alanından türetildi. O alan
karışık tarihli denetim dosyalarından besleniyor (27.08 envanteri, 31.08 turları,
02.09 partileri) — yani "36 gündür taranmamış" etiketi 27.08'de doğruydu, bugün
değil.

Kolları kurduktan sonra 20 sayfanın TABAN denetimi alındı (`deney-taban-0309.tsv`)
ve beşinin aslında taze olduğu görüldü:

| sayfa | kol | türetilen yaş | GERÇEK son tarama |
|---|---|---|---|
| eryaman-mahallesi/kent-konaklari-sitesi | deney | 38 gün | **03.09** (bugün) |
| sehit-osman-avci-mahallesi/zekioglu-rezidans | deney | 38 gün | **03.09** (bugün) |
| goksu-mahallesi/park-inci-konutlari | deney | 35 gün | **02.09** |
| eryaman-mahallesi/dogankaya-sitesi | deney | — | **01.09** |
| goksu-mahallesi/vaditepe-baspinar | kontrol | — | **03.09** (bugün) |

Deney kolunun 4/10'u zaten taze olsaydı "istekten sonra tarandı" ölçütü anlamsız
çıkardı — istek gitmeden önce zaten taranmışlardı.

**Alınan ders (yönteme yazıldı):** kol ataması, atamadan hemen önce alınmış TEK
BİR denetim turuna dayanmalı. Türetilmiş tarama yaşı deney tasarımı için
kullanılamaz; yalnız kaba önceliklendirme için kullanılır.

Kollar, 94 C+F sayfasının tamamının 03.09 denetimiyle yeniden kurulacak
(`cf-taze-denetim.tsv`). Taban okuması artık aynı gün alınmış olacak.

