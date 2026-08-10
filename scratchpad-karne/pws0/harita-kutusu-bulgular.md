# HARİTA KUTUSU (LOCAL PACK) — İLK ÖLÇÜM, 2026-08-09

Özgün'ün sorusu: *"Eryaman'da hangi mahalle, hangi etap, hangi site 'emlakçı'
aranırsa aransın harita kutusunda biz çıkalım — mümkün mü?"*

Bugüne kadarki 1.481 + 720 sorguluk taramaların **hiçbiri harita kutusunu
ölçmemişti**; sadece organik sıra kaydediliyordu. Bu, o eksiğin ilk kapatılması.

Yöntem: `pws=0&gl=tr&hl=tr`, uygulama içi tarayıcı, tek sekme, sırayla.
Google'ın atadığı konum: **Alacaatlı, Yenimahalle/Ankara** (ofise ~8 km) —
yani ölçüm "Eryaman'dan aranmış" değil, nötr Ankara konumundan.
Ham veri: `sonuclar-harita.jsonl`. Kuyruk: `kuyruk-harita.json`.

## Ölçüm (11 sorgu — 08:41Z'de robot doğrulaması gelince durduruldu)

| Sorgu | Harita kutusu | Kutuda sıramız | Organik sıra | Kutudakiler |
|---|---|---|---|---|
| Yaygınkent Sitesi emlakçı | var | **1** | 1 | Şirin, YAYGINKENT, Ofis Emlak-Eryaman |
| Tunahan Sitesi emlakçı | var | **1** | **yok** | Şirin, Tunahan Sitesi, Metromall Konutları |
| Alis Sitesi emlakçı | var | **1** | **yok** | Şirin, Ofis Emlak-Eryaman, Galaxy Emlak |
| Yardımcı Blokları emlakçı | var | yok | 1 | Kapadokya Emlak, Tek Emlak, Yardımcı Blokları |
| Demirkent Sitesi emlakçı | var | yok | 1 | EMLAKENT Nihal ÇINAR, Demirkent On Sitesi, DEMİR EMLAK İNŞAAT |
| Çayılkay Sitesi emlakçı | var | yok | 1 | Çayilkay Sitesi, Höyük Emlak, **Eryaman Emlakçı** Ayyıldız Gayrimenkul |
| Vatan Sitesi emlakçı | var | yok | yok | Vatan Gayrimenkul, VATAN EMLAK, Vatan emlak gayrimenkul |
| Eryaman Royal City emlakçı | **YOK** | – | 1 | – |
| Öz Gimat Sitesi emlakçı | **YOK** | – | 1 | – |
| Referans Ankara emlakçı | **YOK** | – | yok | – |
| Ata Life Sitesi emlakçı | **YOK** | – | yok | – |

**11 sorgu → 7'sinde kutu çıktı → 3'ünde biz varız, üçünde de 1. sırada.**

## Kanıtlanan: organik sıra ile harita sırası BİRBİRİNDEN BAĞIMSIZ

Dört kombinasyonun dördü de gözlendi:

- organik 1 + haritada 1 → Yaygınkent
- organik 1 + haritada **yok** → Yardımcı, Demirkent, Çayılkay
- organik **yok** + haritada **1** → Tunahan Sitesi, Alis Sitesi
- ikisinde de yok → Vatan Sitesi

**Sonuç:** site sayfalarına içerik/başlık yatırımı harita kutusunu HAREKETE
GEÇİRMİYOR. Tersi de doğru: harita kutusu, organikte hiç çıkmadığımız sitelerde
bizi ilk sıraya taşıyabiliyor. Bunlar iki ayrı savaş.

## Elenen açıklama: mesafe

Ofisten (39.9892632, 32.6238687) kuş uçuşu:

| Site | Ofise km | Kutuda biz |
|---|---|---|
| Yardımcı Blokları | **0,62** | hayır |
| Tunahan Sitesi | 1,05 | **evet (1.)** |
| Çayılkay Sitesi | 1,09 | hayır |
| Yaygınkent Sitesi | 1,10 | **evet (1.)** |
| Öz Gimat Sitesi | 1,23 | paket yok |
| Alis Sitesi | 1,41 | **evet (1.)** |
| Demirkent Sitesi | 1,74 | hayır |
| Eryaman Royal City | 2,28 | paket yok |
| Vatan Sitesi | 3,14 | hayır |

En yakın site (Yardımcı, 620 m) kutuda bizi getirmiyor; 1,41 km'deki Alis
getiriyor. **Ofis–site mesafesi tek başına açıklamıyor.**

## BİRLEŞİK TABLO — 34 sorgu (bu dosya + `sonuclar-emlakci.jsonl`)

Aynı gün 07:14'te paralel bir oturum 14 mahalle + 5 etap + 4 çatı sorgusunu
harita alanıyla birlikte ölçmüş (`sonuclar-emlakci.jsonl`, `h`/`hp` alanları).
Ortak ölçtüğümüz 4 mahallede iki ölçüm **birbirini doğruluyor** (Tunahan h:1,
Altay h:0, Güzelkent h:0, Devlet h:0; yalnız kutunun 3. sırası oynak).

| Sınıf | Sorgu | Kutu çıkan | Kutuda BİZ |
|---|---|---|---|
| Site | 11 | 7 | **3** (hepsi 1.) |
| Mahalle | 14 | 13 | **2** (Tunahan, Eryaman — ikisi de 1.) |
| Etap | 5 | 5 | **4** (2. Etap'ta 2., diğerleri 1.) |
| Çatı | 4 | 4 | **3** |
| **Toplam** | **34** | **29** | **12** |

Kutuya girdiğimiz 12 sorgunun hiçbirinde bir emlak rakibi bizi geçmedi.
Sorun "geçilmek" değil, **kutuya hiç girememek**.

## AÇIKLAYICI KALIP: sorguda ADIMIZ/ADRESİMİZ geçiyor mu

GBP kaydımızın adı "Şirin Gayrimenkul – **Eryaman**", adresi **Tunahan** Mah.

| Sorgu sınıfı | Sorgu | Kutuda biz |
|---|---|---|
| İçinde "Eryaman" geçen | 10 | **8 (%80)** |
| İçinde "Tunahan" geçen | 2 | **2 (%100)** |
| İkisi de geçmeyen | 22 | **2 (%9)** |

Fisher kesin testi (çift yönlü): **p = 0,000028**. Bu tesadüf değil.

Kutuda olmadığımız sorgularda 1. sırayı tutanlar da aynı kalıbı gösteriyor —
kazanan işletmenin adı sorgunun kelimesini içeriyor:

| Sorgu | Kutuda 1. sıra |
|---|---|
| Şeker Mahallesi | **Şeker** Emlak |
| Cumhuriyet Mahallesi | **Cumhuriyet** Gayrimenkul |
| Göksu Mahallesi | **GÖKSU** İMAJ EMLAK |
| Devlet Mahallesi | (POI) + **Devlet** Emlak |
| Demirkent Sitesi | **EMLAKENT** / **DEMİR EMLAK** |
| Vatan Sitesi | üç ayrı **Vatan**\* |
| Eryaman 2. Etap | Empa Gayrimenkul **Eryaman 2.Etap Temsilciliği** |
| Çayılkay Sitesi | POI + "**Eryaman Emlakçı** Ayyıldız Gayrimenkul" |

Açıklanamayan iki istisna: Yaygınkent ve Alis Sitesi — adımız/adresimiz
geçmiyor ama 1.'yiz. Muhtemel sebep: o sorgularda ad eşleşmeli rakip yok.

**Bunun sonucu ağır:** kaldıraç GBP kaydının ADINDA. Adımıza kelime eklemek
Google politikasında yasak (380 yorumlu profil askıya alınabilir) ve daha önce
karara bağlanmış. Yani "her site/mahalle için kutuda çıkalım" hedefinin
doğrudan kaldıracı bizde YOK.

## Sınanmamış hipotez: rakip AD eşleşmesi

Kutuda olmadığımız 4 sorgunun 2'sinde kutuyu sorgu adıyla harf benzeşen
işletmeler doldurmuş: "Demirkent" → *DEMİR EMLAK* / *EMLAKENT*; "Vatan Sitesi" →
üç ayrı *Vatan** emlakçı. Çayılkay'da ise adında hizmet+bölge kelimesi taşıyan
bir rakip var: *"Eryaman Emlakçı Ayyıldız Gayrimenkul"*.

Bu bir gözlem, kanıt değil — n=11 çok küçük. Doğrulaması için kutu ölçümünün
tüm kuyruğa yayılması gerekiyor (protokole eklendi).

## Ölçüm borcu

Engel nedeniyle ölçülemeyenler `kuyruk-harita.json` içinde duruyor:
Panorama Gold, Başak Sitesi, **9 mahalle sorgusu**, **5 etap sorgusu**,
"Eryaman emlakçı" + "Etimesgut emlakçı" kontrolleri.
Mahalle ve etap sınıfı henüz HİÇ ölçülmedi — Özgün'ün sorusunun üçte ikisi açık.

## Engel notu

08:41Z `google.com/sorry`. Sebep tempo değil günlük toplam: aynı gün paralel
oturum ~172 T2 ölçümü yapmış, 05:22Z'de bir reCAPTCHA daha yenmişti.
CAPTCHA aşılmadı, tarama durduruldu.
