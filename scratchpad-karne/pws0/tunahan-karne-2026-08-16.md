# Tunahan Mahallesi — "«site adı» emlakçı" karnesi (16.08.2026, kişiselleştirmesiz)

Ölçüm: `pws=0&gl=tr&hl=tr`, 25 site (Kur Sitesi'nin iki adası tek sorgu paylaşıyor).
Ham veri: `sonuclar-site-emlakci.jsonl`.

## Özet

| Ne çıkıyor | Adet | Oran |
|---|---:|---:|
| Doğru site sayfası | 9 | %36 |
| **Ada sayfası** (site sayfasını yiyor) | 7 | %28 |
| Başka bir sitenin sayfası (ad ikizi) | 6 | %24 |
| Etap sayfası | 1 | %4 |
| Eski adres (26.07 öncesi slug) | 1 | %4 |
| Hiç yok | 1 | %4 |

Karşılaştırma — Altay/Devlet/Eryaman'da (29 kayıt): doğru sayfa **%76**, ada %10.
**Tunahan belirgin şekilde daha kötü.** Sebebi tek: Tunahan 4. Etap, ada sayfası
en yoğun mahalle (26 kaydın tamamında `adalar` dolu) ve o sayfalar site
sayfasından önce sıralanıyor.

## Sıra sıra

| Sıra | Ne çıkıyor | Site |
|---:|---|---|
| 1 | DOĞRU | Dema Park |
| 1 | DOĞRU | Kur Sitesi 46495 Ada |
| 1 | DOĞRU | Özar Sitesi |
| 1 | ad ikizi (Şeyh Şamil) | Yardımcı Blokları |
| 2 | DOĞRU | AGE Sitesi |
| 2 | DOĞRU | Canberk Sitesi |
| 2 | DOĞRU | Gökdemir Premium |
| 2 | DOĞRU | Neopolitan Eryaman |
| 2 | ad ikizi (Altay) | Aktürk Sitesi |
| 2 | ADA 17673/1 | STFA Blokları |
| 3 | DOĞRU | Maviçam Sitesi |
| 3 | DOĞRU | Metromall Sitesi |
| 3 | ESKİ ADRES `/mahalleler/tunahan/…` | Camlı Klima Blokları |
| 3 | ad ikizi (Şehit Osman Avcı) | Elit Yaşam Evleri |
| 3 | ad ikizi (Şeyh Şamil) | Sutek Sitesi |
| 4 | ad ikizi (75. Yıl) | Soyak Sitesi |
| 4 | ADA 17635/1 (eski slug) | Haznedaroğlu Blokları |
| 4 | ADA 46512/9 | Su Damlası Sitesi |
| 5 | ETAP 4 | Klima Blokları |
| 6 | Dema Park sayfası | Okyanus Plaza |
| 6 | ADA 17659/1 | Öztaş Sitesi |
| 6 | ADA 17662/1 | Yüksel Blokları |
| 7 | ADA 46493/2 (eski slug) | Ilgazlar Sitesi |
| 7 | ADA 46497/2 | Sarıgül Sitesi |
| — | **hiç yok** | Tunahan Sitesi |

## İki ayrı sorun, iki ayrı iş

### 1) Ada sayfası site sayfasının önüne geçiyor (7 site)

Ada sayfaları sitemap'te **bilerek** duruyor, oradan çıkarılmayacak. Sorun sıra
değil, **başlık**: kullanıcı "sarıgül sitesi emlakçı" arayıp
`46497/2 Ada Satılık ve Kiralık Daireler` başlığını görüyor. İçinde ne "emlakçı"
var ne de ev sahibine hitap. Tıklanma bu yüzden düşük ve inen kişi yanlış sayfaya
iniyor.

Yapılabilir: ada sayfası başlığından **site adını çıkarmak** (o zaman site adı
sorgusunda yarışmaz) ya da tersine ada başlığını da ev sahibi diline çevirmek.
Birinciyi öneriyorum — hedef site sayfasının kazanması.

### 2) Google 07.08'deki başlıkları hâlâ görmemiş (en az 7 sayfa)

`Eryaman X Satılık Daire ve Kiralık Daire` biçimindeki **eski alıcı dilli**
başlıklar hâlâ SERP'te: Maviçam, Metromall, Elit Yaşam Konutları 1, Sutek
Blokları, Yardımcı Blokları, 75. Yıl, Camlı Klima. Yani başlık değişikliği bu
sayfalarda henüz ölçülemez — Google yeniden taramadı.

Bu, içerik sorunu değil **tarama sırası** sorunu. Ölçümü 4–6 hafta sonra
tekrarlamak gerekiyor; şimdiden "başlık işe yaramadı" yorumu yapılamaz.

## Ayrıca

- **Tunahan Sitesi** ilk 10'da hiç yok — tek örnek, ayrıca bakılmalı.
- **Okyanus Plaza** sorgusunda Dema Park sayfamız çıkıyor (ikisi de aynı ada
  civarında); Okyanus Plaza sayfası ilk 10'da yok.
- **Camlı Klima** ve **Haznedaroğlu/Ilgazlar** eski `/mahalleler/tunahan/` slug'ında
  sıralanıyor — 16.08'de yayına alınan `sitemap-eski-adresler.xml`'in tam hedefi.
  Bu üçü, o site haritasının işe yarayıp yaramadığını ölçecek kontrol noktası.
