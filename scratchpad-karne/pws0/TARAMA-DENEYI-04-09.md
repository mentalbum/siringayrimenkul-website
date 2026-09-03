# TARAMA DENEYİ — dizin isteği BAYAT sayfayı yeniden taratır mı?

> Kurulum 03.09.2026 (kollar akşam TAZE denetimle yeniden kuruldu) ·
> deney kolu isteği **04.09** · ilk okuma **07.09** · ikinci okuma **11.09**

## Neden bu deney

Bugüne kadarki dizin damlası yalnız **dizin DIŞI** sayfalara istek gönderdi ve
%95 dönüşüm verdi. İlk 3'e giremeyen sorguların bir kısmı ise başka yerde takılı:
**sayfa dizinde, ama Google'ın kopyası aylar öncesinden.**

03.09 ölçümü — ilk 3'te olmayan 172 sorgunun dağılımı:

| sınıf | ne demek | n | ölçülmüş kaldıraç |
|---|---|---:|---|
| A | dizin dışı | 15 | **damla** (%95 dönüşüm) |
| B | dizinde, ilk 10 dışı | 63 | yok |
| C+F | sayfa 1'de, 4-10 arası | 94 | **başlık** (n=22: ort 3,64→2,27) |

C+F, başlık kaldıracının tam menzili: 4-10'dan 1-3'e taşımak ölçülmüş etkinin
büyüklüğüyle örtüşüyor. Ama başlık ancak Google sayfayı **yeniden tararsa** işe yarar.

### 03.09 API denetimi — 94 C+F sayfasının GERÇEK durumu

| tarama yaşı | sayfa |
|---|---:|
| ≤7 gün | **48** |
| 8-30 gün | 9 |
| 30+ gün | 27 |
| hiç taranmamış | 10 |

Dizin durumu: 84 MEVCUT, **10 YOK** (bunlar başlık işinin değil DAMLA'nın konusu).

Yani 07.09 başlık işi **48 sayfada doğrudan görülecek**; 36 sayfada (27+9)
önce tarama gerekiyor. Deney o 36 sayfanın kapısını ölçüyor.

## Hipotez

**H1:** Dizinde olan bayat bir sayfaya GSC'den dizine ekleme isteği göndermek,
o sayfanın yeniden taranmasını tetikler.

**H0:** Tetiklemez; istek yalnız dizin DIŞI sayfalarda işe yarar (mevcut "boşuna"
kuralı yalnız n=2 gözleme dayanıyor — bu yüzden zayıf).

## Tasarım — eşleştirilmiş, kontrol gruplu

94 C+F sayfasının tamamı 03.09'da API ile denetlendi. Dizinde olan ve 21+ gündür
taranmamış **29 aday** tarama yaşına ve SERP sırasına göre sıralanıp ardışık
ikililere bölündü; her ikilinin biri **deney**, biri **kontrol** koluna gitti.
14 çift oluştu, kota nedeniyle ilk 10'u kullanılıyor.

Denge: deney ort. yaş 35,3 / sıra 5,0 — kontrol ort. yaş 35,8 / sıra 5,2.

| # | DENEY (istek gider) | yaş | sıra | KONTROL (istek gitmez) | yaş | sıra |
|---:|---|---:|---:|---|---:|---:|
| 1 | `yavuz-selim-mahallesi/yukselen-sitesi` | 23g | #4 | `seyh-samil-mahallesi/etaplar/3` | 26g | #6 |
| 2 | `altay-mahallesi/izgi-park-evleri` | 32g | #4 | `sehit-osman-avci-mahallesi/nefeskent-sitesi` | 32g | #4 |
| 3 | `altay-mahallesi/arya-nuans-residence` | 34g | #6 | `goksu-mahallesi/zirveden-goksu` | 34g | #7 |
| 4 | `devlet-mahallesi/cinar-sitesi` | 36g | #4 | `guzelkent-mahallesi/portakal-cicegi` | 36g | #4 |
| 5 | `tunahan-mahallesi/su-damlasi-sitesi` | 36g | #6 | `guzelkent-mahallesi/anadolu-sitesi` | 38g | #4 |
| 6 | `devlet-mahallesi/sahil-sitesi` | 38g | #5 | `goksu-mahallesi/koru-eryaman` | 38g | #5 |
| 7 | `guzelkent-mahallesi/safi-apak-sitesi` | 38g | #6 | `goksu-mahallesi/goksu-aura-sitesi` | 38g | #7 |
| 8 | `goksu-mahallesi/goksu-vadi-konutlari` | 38g | #7 | `goksu-mahallesi/oyak-goksupark` | 38g | #7 |
| 9 | `devlet-mahallesi/mavikent-sitesi` | 39g | #4 | `goksu-mahallesi/havuzlu-bahce-konutlari` | 39g | #4 |
| 10 | `guzelkent-mahallesi/durtas-91-sitesi` | 39g | #4 | `seyh-samil-mahallesi/oz-cozum-kent-sitesi` | 39g | #4 |

**Kontrol grubu şart:** 03.09'da istek gönderilmeden kendiliğinden dizine giren
4 sayfa vardı. Kontrolsüz ölçümde "istek tarattı" ile "zaten taranacaktı"
ayrılamaz — müdahale defterinin baştan beri kabul ettiği kusur budur.

## Yürütme

**04.09** — deney kolundaki 10 sayfaya GSC arayüzünden dizine ekleme isteği.
Kontrol koluna **dokunulmaz**; damla kuyruğunda çıkarlarsa 11.09'a kadar atlanır.
Şeyh Şamil'in 3. Etap sayfası kontrol kolunda — **başlığına da dokunulmaz**.

**07.09 (3. gün)** — 20 sayfa `gsc-api.mjs denetle-dosya` ile denetlenir.
Ölçüt: `son_tarama >= 2026-09-04` mü? İki kol Fisher kesin testiyle karşılaştırılır.

**11.09 (7. gün)** — tarama ölçümü tekrarlanır + SERP sırası yeniden ölçülür.
Sıra değişimi ikincil çıktı ve **beklenti sıranın SABİT kalması**: kaldıraç
defterinde "tarama tek başına sıra değiştirmiyor" kaydı var (02.09, n=2 —
kendiliğinden taranan Göksu 10+→10+ ve Yavuz Selim 5→5). Sıra oynarsa bu ayrıca
not edilir.

## Karar kuralı (baştan yazılı)

- Deney ≥7/10, kontrol ≤3/10 taranmışsa → **H1 kabul**: 36 bayat sayfanın tarama
  kapısı açık; kalan 26'sına kota ayrılır ve 07.09 başlık işi onlarda da görülür.
- İki kol arasında fark yoksa → **H0 kalır**: o 36 sayfa için kaldıraç yok;
  başlık işi 48 taze sayfayla sınırlı kalır, kalanı dürüstçe raporlanır.
- Arada kalırsa (ör. 5/10 vs 3/10) → örneklem kalan 4 çiftle genişletilir.

## Riskler

- **Kota**: 10 istek günlük kotanın tamamı. 04.09'da damla durur; damlanın 33 açık
  hedefi 05.09'da devam eder. Damla kaldıracı kanıtlı (%95), bu deney ise
  kanıtlanmamış 36 sayfanın kapısı — bir günlük gecikme buna değer.
- **Gösterim kaybı yok**: sayfalar zaten dizinde; istek dizinden çıkarma değil,
  yeniden tarama talebidir.

---

## 03.09 akşamı — İLK KOL ATAMASI İPTAL EDİLDİ (yakalanan hata)

İlk 10 çift `ilk3-hedef.json`'daki `son_tarama` alanından türetilmişti. O alan
karışık tarihli denetim dosyalarından besleniyor (27.08 envanteri, 31.08 turları,
02.09 partileri) — "36 gündür taranmamış" etiketi 27.08'de doğruydu, bugün değil.

Kollar kurulduktan sonra 20 sayfanın taban denetimi alındı ve **beşinin aslında
taze** olduğu görüldü:

| sayfa | kol | türetilen yaş | GERÇEK son tarama |
|---|---|---|---|
| eryaman-mahallesi/kent-konaklari-sitesi | deney | 38 gün | **03.09** (bugün) |
| sehit-osman-avci-mahallesi/zekioglu-rezidans | deney | 38 gün | **03.09** (bugün) |
| goksu-mahallesi/park-inci-konutlari | deney | 35 gün | **02.09** |
| eryaman-mahallesi/dogankaya-sitesi | deney | — | **01.09** |
| goksu-mahallesi/vaditepe-baspinar | kontrol | — | **03.09** (bugün) |

Deney kolunun 4/10'u zaten taze olsaydı "istekten sonra tarandı" ölçütü anlamsız
çıkardı. Kollar 94 sayfanın tamamının 03.09 denetimiyle yeniden kuruldu.

Aynı denetim, stratejik tabloyu da düzeltti: C+F sayfalarının bayat oranı
türetilmiş veride %72 görünüyordu (68/94), gerçekte **%38** (36/94). Yani
başlık kaldıracının önündeki tarama engeli sanılandan çok daha küçük.

**Yönteme yazılan ders:** kol ataması, atamadan hemen önce alınmış TEK BİR
denetim turuna dayanır. Türetilmiş tarama yaşı deney tasarımında kullanılamaz;
yalnız kaba önceliklendirmede kullanılır.
