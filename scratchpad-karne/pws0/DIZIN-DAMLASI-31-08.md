# Dizin damlası kuyruğu — 31.08 ÖLÇÜMÜYLE YENİDEN KURULDU

Önceki kuyruk (`gsc-dizin-kuyrugu-194.md`, 88 açık kayıt) 12.08 verisiyle
sıralanmıştı ve iki kusuru vardı:

1. **Sıralama ölçütü döngüseldi.** Kuyruk "GSC 28 günlük gösterim"e göre
   dizilmişti; ama dizinde OLMAYAN sayfa tanımı gereği gösterim alamaz, o
   yüzden bu ölçüt dizin dışı sayfaları ayırt edemiyordu.
2. **Çoğu kayıt artık dizinde.** 31.08′de SERP′te görünmeyen 96 sayfa API ile
   tek tek denetlendi: **57′si "Submitted and indexed" çıktı.** Onlara istek
   göndermek kotayı yakar, sıra kazandırmaz — 28 günde 2.584 gösterim ve 75 tık
   alıyorlar, ortalama pozisyon 7,4. Sorunları dizin değil, sıra.

Bu listede yalnız **API′nin dizin dışı doğruladığı** sayfalar var. Hepsi 28
günde SIFIR gösterim, SIFIR tık aldı — yani tam ölü ve tek ilaçları dizine
girmek. Kanıt: 14.08 turunda 8/8, 29.08 turunda 10/10 sayfa aynı gün tarandı.

Sıra kümeye göre: en kalabalık mahalle önce (aynı mahallenin sayfaları arka
arkaya taranınca Google o dalı bir arada geziyor).

## ÖNCELİK 0 — bayat taranmış MAHALLE sayfaları (4)

Bunlar dizin dışı DEĞİL, hepsi dizinde. Buraya konmalarının sebebi farklı:
**hedef sorgularımızda sıra kaybediyorlar ve dördü de bayat taranmış.**

31.08 gece turunda 11 mahalle sayfası yeniden ölçüldü. Hareketin tamamı aşağı
yönlüydü (0 yükselen, 4 düşen) ve düşenlerin dördü de 21.08 ve öncesinde
taranmış olanlardı:

| mahalle | önce | 31.08 | son tarama |
|---|---|---|---|
| Göksu | 7 | 10+ | 17.08 |
| Tunahan | 9 | 10 | 17.08 |
| Yavuz Selim | 4 | 5 | 17.08 |
| Eryaman | 4 | 6 | 21.08 |

DÜRÜST OKUMA — ham tablo "bayatların 4/4'ü düştü, tazelerin 0/7'si düştü"
diyor ama bu YANILTICI: taze grubun 7 sayfasından 5'i zaten 10+, yani zeminde
ve daha fazla düşemezdi. Düşmeye yeri olanlarla gerçek karşılaştırma 4/4'e
0/2. Bu bir işaret, kanıt değil.

Yine de kota buraya harcanmalı, iki sebeple: (1) bu dört sayfa "<mahalle>
emlakçı" hedef sorgularımızın sayfaları — dizin dışı bir site sayfasından çok
daha değerliler; (2) istek → aynı gün tarama mekanizması kanıtlı (14.08 8/8,
29.08 10/10), yani en kötü ihtimalle tazelik geri gelir.

- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi ← 01.09 KENDİLİĞİNDEN TARANDI (API; istek gerekmedi)  
      _dizinde ama 17.08'den beri taranmamış; 7 → 10+_
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi ← 01.09 istek gönderildi (yeniden tarama; onay balonu görüldü)  
      _dizinde ama 17.08'den beri taranmamış; 9 → 10_
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi ← 31.08 KENDİLİĞİNDEN TARANDI (API; istek gerekmedi)  
      _dizinde ama 17.08'den beri taranmamış; 4 → 5_
- [x] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi ← 01.09 istek gönderildi (yeniden tarama; onay balonu görüldü)  
      _dizinde ama 21.08'den beri taranmamış; 4 → 6_

---

## ÖNCELİK 1 — SLOT ZATEN BİZİM, SAYFA DİZİNDE DEĞİL (35 sayfa)

02.09 sınıflandırması (ilk3-hedef.json): bu sorgularda arama sonucunda ilk 3'te ya da
4-10'da BİZİM bir sayfamız çıkıyor — ama yanlış sayfa (ada, mahalle, eski adres ya da
komşu site). Doğru site sayfası ise Google'da HİÇ YOK. Yani rekabeti kazanmışız, sadece
doğru sayfa dizinde değil: dizine girdiği anda aynı sorguda daha iyi eşleşme olarak
öne geçme şansı en yüksek grup bu.

Kuyruğun geri kalanından farkı: burada sorgunun talebi ÖLÇÜLÜ (sayfa zaten bir sıra
tutuyor), diğerlerinde talep bilinmiyor.

- [x] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/dastarli-sitesi ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Dastarlı Sitesi emlakçı" sorgusunda 1. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/yesil-goksu-konutyapi-kooperatifi ← 03.09 DİZİNDE (kendiliğinden, son tarama 2026-09-03; kota harcanmadı)
      _"Yeşil Göksu Konutyapı Kooperatifi emlakçı" sorgusunda 1. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/arslanlar-sitesi ← 03.09 DİZİNDE (kendiliğinden, son tarama 2026-08-31; kota harcanmadı)
      _"Arslanlar Sitesi emlakçı" sorgusunda 2. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sergah-evleri ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Sergah Evleri emlakçı" sorgusunda 2. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/lacin-eryaman-sitesi ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Laçin Eryaman Sitesi emlakçı" sorgusunda 2. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/paro-life ← 03.09 DİZİNDE (kendiliğinden, son tarama 2026-09-02; kota harcanmadı)
      _"Paro Life emlakçı" sorgusunda 2. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/utkan-sitesi ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Utkan Sitesi emlakçı" sorgusunda 2. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gozde-2-sitesi ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Gözde 2 Sitesi emlakçı" sorgusunda 2. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/yesim-kent2-sitesi ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Yeşim Kent2 Sitesi emlakçı" sorgusunda 2. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/bulvar-1071-sitesi ← 03.09 istek gönderildi (onay balonu 80 sn'de geldi)
      _"Bulvar 1071 Sitesi emlakçı" sorgusunda 2. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/cizgi-otesi-residence ← 03.09 istek gönderildi (onay balonu görüldü)
      _"Çizgi Ötesi Residence emlakçı" sorgusunda 2. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/akdal-residence ← 03.09 DİZİNDE (kendiliğinden, son tarama 2026-09-03; kota harcanmadı)
      _"Akdal Residence emlakçı" sorgusunda 2. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/liderkent ← 05.09 istek gönderildi  
      _"Liderkent emlakçı" sorgusunda 2. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/ozenkent-2-villalari ← 06.09 istek gönderildi (10:1x, "Dizine eklenmesi istendi")
      _"Özenkent 2 Villaları emlakçı" sorgusunda 2. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/kafdagi-sitesi ← 05.09 istek gönderildi  
      _"Kafdağı Sitesi emlakçı" sorgusunda 3. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gercek-92-sitesi ← 04.09 istek gönderildi  
      _"Gerçek - 92 Sitesi emlakçı" sorgusunda 3. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/address-goksu ← 04.09 istek gönderildi  
      _"Address Göksu emlakçı" sorgusunda 3. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/neva-panora-konutlari ← 05.09 istek gönderildi  
      _"Neva Panora Konutları emlakçı" sorgusunda 3. sırada mahalle sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/ozluce-guzelevim ← 06.09 istek gönderildi (10:2x; DİKKAT: sonraki turda kutuya yazı düşmeyince aynı sayfada "Tekrar istek gönder"e ikinci tıklama gitmiş olabilir → kota 1 fazla yanmış olabilir)
      _"Özlüce Güzelevim emlakçı" sorgusunda 3. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/yagan-kent ← 06.09 istek gönderildi (10:3x, "Dizine eklenmesi istendi")
      _"Yağan Kent emlakçı" sorgusunda 3. sırada mahalle sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/gokdemir-tower ← 04.09 DİZİNDE (kendiliğinden)  
      _"Gökdemir Tower emlakçı" sorgusunda 3. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/ak-91-sitesi ← 05.09 istek gönderildi  
      _"Ak 91 Sitesi emlakçı" sorgusunda 4. sırada mahalle sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/elele-sitesi ← 05.09 istek gönderildi  
      _"Elele Sitesi emlakçı" sorgusunda 4. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/konuta-ozlem-sitesi ← 06.09 istek gönderildi (10:4x, "Dizine eklenmesi istendi")
      _"Konuta Özlem Sitesi emlakçı" sorgusunda 4. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/acat-konutlari ← 05.09 istek gönderildi  
      _"Acat Konutları emlakçı" sorgusunda 4. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/erkaraca-sitesi ← 04.09 DİZİNDE (kendiliğinden)  
      _"Erkaraca Sitesi emlakçı" sorgusunda 4. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/kuryap-sitesi ← 04.09 DİZİNDE (kendiliğinden)  
      _"Kuryap Sitesi emlakçı" sorgusunda 5. sırada mahalle sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/uyum-90-sitesi ← 04.09 DİZİNDE (kendiliğinden)  
      _"Uyum 90 Sitesi emlakçı" sorgusunda 5. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/polsan1-ayisigi-sitesi ← 05.09 istek gönderildi  
      _"Polsan1 Ayışığı Sitesi emlakçı" sorgusunda 6. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/atakent-1-asiyan-sitesi ← 05.09 istek gönderildi  
      _"Atakent 1 Aşiyan Sitesi emlakçı" sorgusunda 8. sırada eski adres çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gulsah-95-sitesi ← 05.09 DİZİNDE (kendiliğinden)  
      _"Gülşah - 95 Sitesi emlakçı" sorgusunda 8. sırada mahalle sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/kusburnu-sitesi ← 04.09 DİZİNDE (kendiliğinden)  
      _"Kuşburnu Sitesi emlakçı" sorgusunda 8. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/endora-goksu ← 05.09 istek gönderildi  
      _"Endora Göksu emlakçı" sorgusunda 9. sırada ada sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/diamond-residence ← 04.09 DİZİNDE (kendiliğinden)  
      _"Diamond Residence emlakçı" sorgusunda 10. sırada komşu site sayfası çıkıyor; doğru sayfa dizinde değil_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/arzutas-sitesi ← 04.09 DİZİNDE (kendiliğinden)  
      _"Arzutaş Sitesi emlakçı" 5. sırada komşu site sayfamız; doğru sayfa hiç taranmamış (02.09 API)_


> AYRI SORUN — İSTEK GÖNDERME: goksu-mahallesi/gsv-spor-sitesi. API 02.09: "Duplicate,
> Google chose different canonical" — Google canonical olarak ESKİ slug'ı
> (/mahalleler/goksu/gsv-spor-sitesi) seçmiş. Dizin isteği bunu çözmez; eski adresin
> sindirilmesi gerekir (eski adres haritasında duruyor). 14.09 ölçümünde ayrı izlenecek.
> guzelkent/gordogu-sen (02.09 taranmış) ve guzelkent/yukselay (30.08) API'de DİZİNDE
> çıktı — kuyruğa alınmadı, kota harcanmayacak.

---


Toplam: **45 açık hedef** — günde ~10 kotayla 4-5 gün. Sıra: ÖNCELİK 1 (slot bizim, sayfa dizinde değil) → mahalle kümeleri.


## devlet-mahallesi (14)

      _hiç bilinmiyor_
      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/denizim-sitesi ← 01.09 istek gönderildi (onay balonu görüldü)  
      _keşfedildi, dizine alınmadı_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/yesiloz-sitesi ← 01.09 istek gönderildi (onay balonu görüldü)  
      _keşfedildi, dizine alınmadı_

## sehit-osman-avci-mahallesi (5)

- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/cicek-sitesi ← 01.09 istek gönderildi (onay balonu görüldü)  
      _keşfedildi, dizine alınmadı_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/goksu-prestij ← 01.09 istek gönderildi (onay balonu görüldü)  
      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/ictas ← 01.09 istek gönderildi (onay balonu görüldü)  
      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/ucyildiz-sitesi ← 01.09 istek gönderildi (onay balonu görüldü)  
      _keşfedildi, dizine alınmadı_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/yildiz-eryaman ← 01.09 istek gönderildi (onay balonu görüldü)  
      _keşfedildi, dizine alınmadı_

## guzelkent-mahallesi (4)

- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/ekin-sitesi ← 02.09 istek gönderildi (onay balonu görüldü)  
      _keşfedildi, dizine alınmadı_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/kurtulus-sitesi ← 02.09 istek gönderildi (onay balonu görüldü, test ~2,5 dk sürdü)  
      _keşfedildi, dizine alınmadı_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/meltem-sitesi ← 05.09 DİZİNDE (kendiliğinden) ← 02.09 dizin dışı teyit; istek 'sorun oluştu' (kayan 24 sa sınırı), GÖNDERİLMEDİ — yarın ilk  
      _keşfedildi, dizine alınmadı_
- [x] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/oz-muhtar-sitesi ← 05.09 istek gönderildi  
      _hiç bilinmiyor_

## goksu-mahallesi (3)

      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/irem-konutlari ← 02.09 DİZİNDE (kendiliğinden, 31.08 taranmış; kota harcanmadı)  
      _keşfedildi, dizine alınmadı_

## seyh-samil-mahallesi (3)

- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/camlica-sitesi ← 04.09 DİZİNDE (kendiliğinden)  
      _hiç bilinmiyor_
      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/onur-sitesi ← 02.09 DİZİNDE (kendiliğinden, 31.08 taranmış; kota harcanmadı)  
      _keşfedildi, dizine alınmadı_

## altay-mahallesi (2)

      _hiç bilinmiyor_
      _hiç bilinmiyor_

## seker-mahallesi (1)

- [x] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/izoser-residence ← 05.09 istek gönderildi  
      _keşfedildi, dizine alınmadı_

## yavuz-selim-mahallesi (1)

- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/sahibin-sitesi ← 05.09 DİZİNDE (kendiliğinden)  
      _hiç bilinmiyor_

## Yeniden denetlendi (6) — 31.08

Google API ilk turda 500 döndürmüştü. Yeniden soruldu:
**5'i zaten dizinde** (istek gerekmiyor), 1'i dizin dışı.

- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-park-vadi-konutlari ← 05.09 DİZİNDE (kendiliğinden)  
      _hiç bilinmiyor_
- [x] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/oyak-sitesi ← 31.08 DİZİNDE (yeniden denetim)
- [x] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/turk-konut-calisanlar-sitesi ← 31.08 DİZİNDE (yeniden denetim)
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/doga-konutlari ← 31.08 DİZİNDE (yeniden denetim)
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/havacilar-sitesi ← 31.08 DİZİNDE (yeniden denetim)
- [x] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/hekimler-ve-saglikcilar-sitesi ← 31.08 DİZİNDE (yeniden denetim)

---

# İKİNCİ PARTİ — eski kuyruğun denetlenmemiş kalanı (37 sayfa)

Eski kuyruktaki 65 kayıt daha API'ye soruldu: **28'i zaten dizindeymiş**
(işaretlendi, kota harcanmadı), 37'si gerçekten dizin dışı çıktı.
Böylece bugün toplam 35 sayfalık boşa istek önlendi.

Bu parti birinci partiden SONRA çekilir.

## guzelkent-mahallesi (8)


## sehit-osman-avci-mahallesi (6)

- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/kutlutas-1-bloklari ← 06.09 istek gönderildi (10:5x, "Dizine eklenmesi istendi")
      _keşfedildi, dizine alınmadı_
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/kutlutas-2-bloklari ← 06.09 istek gönderildi (11:0x, "Dizine eklenmesi istendi")
      _keşfedildi, dizine alınmadı_

## yavuz-selim-mahallesi (5)


## devlet-mahallesi (4)

- [x] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/vatan-sitesi ← 04.09 istek gönderildi  
      _keşfedildi, dizine alınmadı_

## goksu-mahallesi (4)


## seyh-samil-mahallesi (4)


## seker-mahallesi (3)

- [x] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/altas-relax-line ← 06.09 istek gönderildi (11:1x, "Dizine eklenmesi istendi")
      _hiç bilinmiyor_

## eryaman-mahallesi (2)


## yesilova-mahallesi (1)


> 01.09 — Elden tur (cron silindi). API doğrulaması: Göksu ve Yavuz Selim mahalle
> sayfaları kendiliğinden yeniden taranmış (01.09 / 31.08), kota harcanmadı.
> 9 istek kabul (Tunahan, Eryaman mahalle; Denizim, Yeşilöz, Çiçek, Göksu Prestij,
> İçtaş, Üçyıldız, Yıldız Eryaman). 10.'da (Ekin) 'Hata! Bir sorun oluştu — daha
> sonra tekrar deneyin' balonu: bu, 'Kota Aşıldı'nın başka yüzü, istek işlenmedi.
> Kalan açık hedef: 48. Yarın Ekin'den devam.

> 02.09 — Elden tur. API: 12 adaydan İrem Konutları ve Onur Sitesi kendiliğinden
> dizine girmiş (31.08 taranmış), kota harcanmadı. Kabul: Ekin, Kurtuluş (canlı
> test 2,5 dk sürdü — balonu 3 dakikaya kadar bekle). 3. istek (Meltem) sınıra
> takıldı: dünkü 9 istek kayan 24 saatlik pencerede; pencere öğleden sonra açılır.
> Kalan açık hedef 44. Yarın Meltem'den devam.

> 02.09 08:50 — Meltem ikinci deneme yine "sorun oluştu": pencere hâlâ kapalı (dünkü istekler 08:00-08:45+). Öğleden sonra ya da yarın sabah Meltem'den devam; bugün başka deneme yapılmadı.

> 02.09 17:20 — Meltem üçüncü deneme yine "sorun oluştu". Bugün başka deneme YAPILMAYACAK (başarısız denemeler de sayılıyor olabilir). Yarın 03.09 sabah 09:00 sonrası Meltem'den devam.

> 03.09 13:50-14:20 — Elden tur. API ile 12 aday denetlendi: 4'ü kendiliğinden
> dizine girmiş (Yeşil Göksu ve Akdal AYNI GÜN taranmış, Paro Life 02.09,
> Arslanlar 31.08) — kota harcanmadı. Kalan 8'in 8'i de KABUL: Daştarlı, Şergah,
> Laçin, Utkan, Gözde 2, Yeşim Kent 2, Bulvar 1071, Çizgi Ötesi. Sınır balonu
> gelmedi; 8'de durduruldu (dünkü kabuller kayan pencerede). Kalan açık 34.

> 04.09 — Damla turu. 33 açık hedef API ile denetlendi: **8'i kendiliğinden
> dizine girmiş** (31.08'den beri), kalan 25'i hâlâ dizin dışı. Talebe göre
> sıralandı (GSC tam dökümü, sayfalama düzeltmesi sonrası).
> Gönderilen: Vatan Sitesi (talep 47), Address Göksu (37), Gerçek 92 (16).
> Dördüncüde (Endora Göksu, talep 15) **Kota Aşıldı** — istek İŞLENMEDİ,
> işaretlenmedi. Sebep: 03.09 sabahı 8 istek gitmişti, kayan 24 saat penceresi
> boşalmamış. Sıradaki tur Endora Göksu'dan devam eder.

> 05.09 turu — kota TAMAMEN AÇIKTI. (Bu blok once yanlislikla 04.09 diye
> yazilmisti; oturum gece boyunca surdugu icin tarih donmus, commit damgasi
> 05.09 07:33. Duzeltildi.) 12 aday yeniden denetlendi: 2'si
> kendiliğinden dizine girmiş (Gülşah 95, Göksu Park Vadi), 10'u hâlâ dışarıda
> ve **10'unun 10'una da istek gönderildi, hepsi kabul edildi.**
> Gönderilenler: Endora Göksu, AK 91, Atakent 1 Aşiyan, Neva Panora, Öz Muhtar,
> İzoser Residence, Liderkent, Acat Konutları, Kafdağı, Elele.
>
> **Kota dersi:** bugün toplam 13 istek geçti (sabah 3 + öğleden sonra 10).
> Beceride yazan "~6-10/gün" bu turda geçerli değildi; sabah "Kota Aşıldı"
> alındıysa öğleden sonra yeniden denenmeli — pencere kayan 24 saat.
>
> **Arayüz notu:** pencere boyutu değişince "DİZİNE EKLENMESİNİ İSTE" düğmesinin
> koordinatı kaydı (1254,362 → 1290,373). Tıklamadan önce ekran görüntüsüyle
> doğrula; ıskalanan tıklama sessizce hiçbir şey yapmıyor.
>
> Atakent 1 Aşiyan'ın gönderilme gerekçesi taramadan: o sorguda Oyak Sitesi
> sayfamız 7. sırada çıkıyordu çünkü doğru sayfa dizin dışıydı.


> **05.09 SONUÇ — 10 istek, 10'u da AYNI SAAT içinde taranıp dizine girdi.**
> Tarama damgaları 04:20–04:32 UTC (07:20–07:32 İstanbul) arasında sıralanmış;
> istekler o dakikalarda gönderilmişti. Google isteği kuyruğa almadı, anında
> işledi.
>
> | sayfa | tarama (UTC) |
> |---|---|
> | goksu/endora-goksu | 04:20:42 |
> | guzelkent/ak-91-sitesi | 04:22:34 |
> | eryaman/atakent-1-asiyan-sitesi | 04:24:41 |
> | sehit-osman-avci/neva-panora-konutlari | 04:26:37 |
> | seker/izoser-residence | 04:28:37 |
> | guzelkent/oz-muhtar-sitesi | 04:28:39 |
> | yavuz-selim/acat-konutlari | 04:31:00 |
> | seyh-samil/liderkent | 04:31:02 |
> | goksu/kafdagi-sitesi | 04:32:38 |
> | guzelkent/elele-sitesi | 04:32:38 |
>
> **SIRAYA DA YANSIDI:** Ak 91 Sitesi sabah "URL is unknown to Google"du;
> istek gönderildi, 04:22'de tarandı ve aynı gün SERP'te **2. sırada** ölçüldü.
> Bu, damlanın istek→tarama→dizin→SIRA zincirini aynı gün tamamladığı ilk
> temiz vaka (önceki dönüşüm kayıtlarında sıra ölçümü günler sonraydı).

> 05.09 ikinci tur (öğleden sonra) — 10 açık hedef yeniden denetlendi: 2'si
> kendiliğinden girmiş (Meltem, Sahibin), 8'i dışarıda. **Polsan1 Ayışığı**
> gönderildi (11. istek; SERP'te ada sayfası 6. çıkıyordu, site sayfası
> dizinde yoktu). Sıradaki Konuta Özlem'de Özgün Chrome'u kullanmaya başladı,
> tur zarifçe durduruldu. Kalan 7: ozenkent-2, ozluce-guzelevim, yagan-kent,
> konuta-ozlem, kutlutas-1, kutlutas-2, altas-relax-line.
>
> Taramada ilk 10'a giremediğimiz 33 site sayfasının HEPSİ dizinde (API, 05.09):
> ≤7g 12 / 8-30g 6 / 30+g 15. Orada dizin sorunu yok — 15'i bayat kopya, kalanı
> yapısal adaş. Damla için yeni aday çıkmadı.

> 05.09 gece — Konuta Özlem'de **Kota Aşıldı**, istek İŞLENMEDİ, işaretlenmedi.
> Günün toplamı 11 istek (sabah 10 + Polsan1 Ayışığı). Kalan 7 yarına.
> 06.09 10:1x — damla turu: API ile 7 hedef doğrulandı (hepsi dışarıda: 4 "keşfedildi-dizine eklenmedi", 3 "bilinmiyor"). İlk istek ozenkent-2-villalari kabul. Klavyesiz tarif BU SABAH ÇALIŞMADI (programatik değer+sentetik Enter işlenmedi); gerçek triple-click+type+Return çalıştı; düğme JS .click() ile açılmıyor, ref/koordinat tıklaması şart.
> 06.09 10:3x — TUZAK: istek sonrası üst kutuya yazılan yeni URL bazen DÜŞMÜYOR (kutu boş kalıyor, Enter aynı sayfayı yeniden açıyor). Kural: düğmeye tıklamadan ÖNCE hükümdeki `u` hedef URL ile eşleşmeli; eşleşmiyorsa tıklama YOK (aksi halde "Tekrar istek gönder" kota yakar).
> 06.09 11:1x — tur bitti: 7/7 kabul (ozenkent-2, ozluce-guzelevim, yagan-kent, konuta-ozlem, kutlutas-1, kutlutas-2, altas-relax-line). Kalan açık madde: 0. Çalışan tarif: üst kutuya ÇİFT tıkla (ilk tıklama bildirimi kapatıyor) → yaz → Return → 17 sn → hükümdeki u eşleşiyorsa (1300,372) tıkla → ~60 sn → "Dizine eklenmesi istendi". Okuma: 07.09 sabah API denetle-dosya.

## 06.09 — başlık şablonu (PR #90) sonrası yeniden tarama istekleri + eski adres diyagnostiği
Amaç: birincil çiftlerin iki tarafı da yeni başlıkla taransın (21.09 okuması temiz); eski adres diyagnostiği (Haziran kopyası).
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil/yeni-burak-sitesi ← 06.09 istek gönderildi (ESKİ ADRES diyagnostik; hüküm "mevcut", son tarama 28.06; okuma 01.10)
> 06.09 15:0x — "Kota Aşıldı": devlet-mahallesi/hotki-meydan isteği İŞLENMEDİ (Yeni Burak diyagnostiğinden hemen sonra). 07.09 ≥10:20 sırası: hotki-meydan, hotki-ritm, guzel-ankara-sitesi (guzelkent), guzel-ankara-evleri-sitesi (eryaman), endora-park (eryaman), endora-eryaman (yavuz-selim), park-inci-konutlari (goksu), inci-park-evleri (seyh-samil); kota kalırsa erland-residence (goksu), sutek-bloklari (altay). Hepsi dizinde ("mevcut") — amaç yeni başlıkla yeniden tarama; önce API ile son tarama tarihine bak, 06.09 sonrası taranmış olan atlanır.

