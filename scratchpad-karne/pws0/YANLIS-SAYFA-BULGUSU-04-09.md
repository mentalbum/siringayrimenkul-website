# Yanlış sayfa çıkıyor — 04.09 taramasının ana bulgusu

139 sorgu ölçüldü (Tunahan, Altay, Devlet, Eryaman'ın 37'si). İlk 3'te %70'iz.
Ama sıraladığımız sorguların **32'sinde (%23) Google bizim BAŞKA bir sayfamızı
gösteriyor.** Bu sayı, ilk 3'e giremediğimiz sorgu sayısıyla (42) aynı büyüklükte.

| çıkan sayfanın türü | n |
|---|---:|
| başka site sayfası (komşu/yakın adlı) | 12 |
| eski adres şeması (kopya) | 7 |
| ana sayfa | 6 |
| ada sayfası | 5 |
| mahalle sayfası | 2 |

Bunların 19'unda **ilk 3'teyiz** — yani sıra kaybı değil, kullanıcı yanlış
sayfaya iniyor. 13'ünde 4-10 bandındayız.

## 1. Eski adres kopyaları (7) — ÖLÇÜLDÜ, dizinde ÇİFT duruyor

26.07 URL taşımasından kalan eski adresler yenileriyle **aynı anda dizinde**:

| eski adres | son tarama | yeni adres | son tarama |
|---|---|---|---|
| tunahan/sutek-sitesi | 21.07 | tunahan-mahallesi/sutek-sitesi | 03.09 |
| devlet/dastarli-sitesi | 30.06 | devlet-mahallesi/dastarli-sitesi | 03.09 |
| tunahan/kur-sitesi-46495-ada | 17.07 | tunahan-mahallesi/… | 30.08 |
| tunahan/kur-sitesi-46496-ada | 17.07 | tunahan-mahallesi/… | 20.08 |
| sehit-osman-avci/soyak-sitesi | 17.08 | sehit-osman-avci-mahallesi/… | 17.08 |
| eryaman/atakent-metro-sitesi | 11.08 | eryaman-mahallesi/… | 11.08 |
| tunahan/klima-bloklari | 17.07 | tunahan-mahallesi/klima-bloklari | 23.08 |

Hepsi "Submitted and indexed". Yönlendirme doğru çalışıyor (308) ve eski
adreslerin **hiçbiri sitemap'te değil** (1.187 adres tarandı, eski şema 0).
Yani teknik taraf temiz; Google birleştirmiyor.

Kur Sitesi 46496'da ikisi birden ilk 3'te: eski 2., yeni 3. sırada.

**Kaldıraç yok (03.09'da ölçüldü):** eski adrese yeniden tarama isteği
göndermek slotu günler içinde serbest bırakmıyor — 9 vakanın 9'unda ölçüm
Google'ın son taramasından sonraydı, üçünde "Page with redirect" damgası
basılmış ve adres hâlâ sıradaydı. Kota oraya harcanmaz.
**Yeniden ölçüm: 01.10** — birleştirme aylar sürüyor olabilir.

## 2. Yakın adlı çiftler (12) — 07.09 BAŞLIK İŞİNİN ASIL HEDEFİ

Google bizim iki benzer adlı sayfamızı ayırt edemiyor:

| sorgu | çıkan sayfa | olması gereken |
|---|---|---|
| Age Blokları | Age **Sitesi** (Tunahan) | Age Blokları (Altay) |
| Sutek Blokları | Sutek Blokları (**Şeyh Şamil**) | Sutek Blokları (**Altay**) |
| Uzuner Konutları | Uzuner **Sitesi** (eski) | Uzuner Konutları |
| Endora Park | Endora **Eryaman** | Endora Park |
| Hotki Meydan | Hotki **Ritm** | Hotki Meydan |
| Güzel Ankara Evleri | Güzel Ankara **Sitesi** | Güzel Ankara Evleri |
| Camlı Klima Blokları | **Klima Blokları** | Camlı Klima Blokları |
| Bayrak Sitesi | **Mavi** Bayrak (410, ölü) | Bayrak Sitesi |
| Bahar Sitesi | Bahar Sitesi (**Göksu**) | Bahar Sitesi (**Eryaman**) |
| Dema Park | **Age Sitesi** (ortak kelime 0) | Dema Park |
| Yeni Huzur Bahçesi | **Cevizlidere** (ortak 1) | Yeni Huzur Bahçesi |
| İzgi Park Evleri | **Palmiye Evleri** (ortak 1) | İzgi Park Evleri |
| Erland Residence | **Address Eryaman** (ortak 0) | Erland Residence |

İlk dokuzu ayırt edicilik sorunu: adlar bir kelime farkla ayrılıyor ve
başlıklarımız o farkı öne çıkarmıyor. Son dördünde ortak kelime yok —
oralarda doğru sayfa zayıf, ayrı teşhis gerekiyor.

**07.09'da başlık donması bitince iş buraya gider.** Ölçülmüş kaldıraç
(n=22, ort 3,64→2,27) tam bu bandın işi ve bu sayfaların Google kopyası taze.

## 3. Ölü sayfa sıralıyor (1, ama sınıf açık)

"Bayrak Sitesi emlakçı" 6. sırasını `/mahalleler/ata-mahallesi/mavi-bayrak-sitesi`
tutuyor — 27.08'de kaldırıldı, canlıda **410** dönüyor (doğrulandı). Yaşayan
Devlet sayfamızın slotunu yiyor. Yenimahalle grubundan kaç ölü sayfanın hâlâ
sıraladığı taranmadı; kalan mahallelerde bu işaretlenecek.

## 4. Ada ve mahalle sayfası vakaları (7) — kaldıraç ÖLÜ

Cabadağ, Pembe Rüya, Vizyon Prestige, Elif Elvan, Demirkent'te ada sayfası;
Çayılkay ve Günötesi'nde mahalle sayfası çıkıyor. Ada canonical'ı 31.08'de
denendi ve **17/17 reddedildi** — bu yönde iş yapılmaz.

## Ölçüm hijyeni notu

İlk sayımım 34'tü; ikisi benim kayıt hatamdı (Kutlutaş ve Soyak kayıtlarında
`s` alanını sorgu adından türetmişim, kuyruktaki gerçek değerden değil).
Kuyruğun 511 hedefinin tamamı kontrol edildi, hepsinin içerik dosyası var.
Kayıtlar kuyrukla hizalandı; doğru sayı **32**.

---

## Teşhis kesinleşti: tarama değil, AYIRT EDİCİLİK

32 vakadaki doğru sayfaların tamamı 04.09'da API ile denetlendi:

| | n |
|---|---:|
| dizinde | **29 / 31** |
| son 7 gün içinde taranmış | **19** |
| 8-30 gün | 7 |
| 30+ gün | 3 |
| dizin dışı | 2 (ikisi de benim kayıt hatamdan çıkan hayalet slug) |

Yani Google bu sayfaları **biliyor**, çoğunun kopyası **taze**, ve yine de
başka bir sayfamızı seçiyor. Ne dizin sorunu, ne tarama sorunu. Google iki
benzer sayfamız arasında seçim yapamıyor ve yanlış olanı seçiyor.

Ayırt edicilik için elimizdeki tek kanıtlı kaldıraç **başlık** (07-09.08,
n=22: 13 yükseldi, 0 düştü, ort 3,64→2,27). 07.09'da donma bitiyor.

### 07.09 iş listesi — ayırt edici başlık (öncelik sırası)

Kopyası TAZE olanlar önce; değişiklik Google'a hemen ulaşır.

**A. Bir kelime farkla ayrışan çiftler (başlıkta farkı öne çıkar):**
1. `altay-mahallesi/age-bloklari` ← "Age **Sitesi**" ile karışıyor (≤7g)
2. `tunahan-mahallesi/camli-klima-bloklari` ← "Klima Blokları" ile (≤7g)
3. `eryaman-mahallesi/guzel-ankara-evleri-sitesi` ← "Güzel Ankara Sitesi" ile (≤7g)
4. `eryaman-mahallesi/endora-park` ← "Endora Eryaman" ile (≤7g)
5. `eryaman-mahallesi/bahar-sitesi` ← Göksu'daki adaşıyla (≤7g)
6. `altay-mahallesi/uzuner-konutlari` ← "Uzuner Sitesi" eski adresiyle (≤7g)
7. `altay-mahallesi/sutek-bloklari` ← Şeyh Şamil'deki adaşıyla (8-30g)
8. `devlet-mahallesi/hotki-meydan` ← "Hotki Ritm" ile (30+g — önce tarama)

**B. Ortak kelimesi olmayan, doğru sayfa zayıf (ayrı teşhis gerek):**
9. `tunahan-mahallesi/dema-park` ← Age Sitesi çıkıyor (≤7g, taze ama seçilmiyor)
10. `altay-mahallesi/erland-residence` ← Address Eryaman çıkıyor (8-30g)
11. `altay-mahallesi/izgi-park-evleri` ← Palmiye Evleri çıkıyor (30+g)
12. `devlet-mahallesi/yeni-huzur-bahcesi-sitesi` ← Cevizlidere çıkıyor (≤7g)

B grubu daha zor: Google hiç ortak kelimesi olmayan bir sayfayı seçiyor.
Bu, doğru sayfanın o sorgu için çok zayıf olduğu anlamına gelir; başlık tek
başına yetmeyebilir. Ölçüm 21.09'da A ve B ayrı raporlanır.

**Dokunulmayacak:** ada sayfası vakaları (canonical 17/17 reddedildi),
eski adres kopyaları (kaldıraç yok, 01.10'da yeniden ölçülecek),
ana sayfa vakaları (15.08 dersi: ana sayfaya dokunmak TO'yu düşürdü).

## 06.09 akşam — 390 sorguluk taban (site sorguları: 377, mahalle+etap: 14)

| sınıf | sorgu |
|---|---|
| doğru | 240 |
| başka site sayfası | 42 |
| ilk10 dışı | 33 |
| eski adres | 26 |
| ada sayfası | 18 |
| mahalle sayfası | 7 |
| sayfa2 | 6 |
| ölü 410 | 3 |
| ana sayfa/mağaza | 2 |

İlk 3'te: 281/377 (%75); ilk 3'te DOĞRU sayfa: 223 (%59).
Sıraladığımız 338 sorgunun 98'i yanlış sayfa (%29).

Mahalleye göre yanlış sayfa (eski adres / ada / başka site / mahalle / ana / ölü):
- altay-mahallesi: başka site sayfası 5, ada sayfası 3, eski adres 1 — toplam 9/26
- devlet-mahallesi: başka site sayfası 3, ölü 410 1, ada sayfası 1, mahalle sayfası 1 — toplam 6/44
- eryaman-mahallesi: başka site sayfası 4, eski adres 1, ada sayfası 1, ana sayfa/mağaza 1, mahalle sayfası 1, ölü 410 1 — toplam 9/51
- goksu-mahallesi: başka site sayfası 10, ada sayfası 6, eski adres 3, mahalle sayfası 2 — toplam 21/67
- guzelkent-mahallesi: başka site sayfası 12, eski adres 10, ada sayfası 1 — toplam 23/79
- sehit-osman-avci-mahallesi: eski adres 8, mahalle sayfası 3, ada sayfası 3, başka site sayfası 2, ölü 410 1 — toplam 17/67
- seker-mahallesi: eski adres 2, ada sayfası 2, başka site sayfası 1 — toplam 5/16
- seyh-samil-mahallesi: ada sayfası 1 — toplam 1/1
- tunahan-mahallesi: başka site sayfası 5, ana sayfa/mağaza 1, eski adres 1 — toplam 7/25

Eski adres vakaları (26): kur-sitesi-46495-ada, uzuner-konutlari, atakent-metro-sitesi, goksu-bilge-sitesi, kasmir-gol-evleri, irem-konutlari, anadolu-sitesi, er-ay-3-sitesi, gercek-92-sitesi, konuta-ozlem-sitesi, kucuk-ankara-villalari, master-kent-sitesi, portakal-cicegi-2-sitesi, postakent-sitesi, cagdas-95-sitesi, ozle-iletisim-sitesi, akdal-residence, altas-relax-line, address-goksu, bp-residence-eryaman, bossphorus-konutlari, garden-zirve, kiratli-residence, soyak-sitesi, tan-yildizi-sitesi, tureli-residence

Bu taban 21.09 karşılaştırmasının referansıdır (PR #90 kontrol kolu: lib/baslik-kontrol-kolu.ts). 137 sorgu (Şeyh Şamil 56, Yavuz Selim 56, Yeşilova 23, Acar, Ak Kent) 07.09'da tamamlanır.
