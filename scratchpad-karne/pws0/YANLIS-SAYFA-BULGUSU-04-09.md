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
