# TIKLAMA BANDI ANALİZİ — GSC son 3 ay (2026-08-10'da çekildi)

Kaynak: GSC Performans > 3 ay > Sorgular, 1000 satır, pozisyon kolonu açık.
Toplam: **29.740 gösterim · 571 tıklama · TO %1,9**

## Bulgu 1 — gösterimlerimizin yarısından fazlası ölü bantta

| Pozisyon | Sorgu | Gösterim | Tık | TO |
|---|---|---|---|---|
| 1–3 | 12 | 265 | 22 | **%8,3** |
| 3–5 | 51 | 1.582 | 134 | **%8,5** |
| 5–8 | 353 | 10.286 | 238 | %2,3 |
| **8–11** | **501** | **15.645** | **164** | **%1,0** |
| 11–21 | 71 | 1.641 | 12 | %0,7 |
| 21+ | 12 | 321 | 1 | %0,3 |

Gösterimin **%53'ü 8–11 bandında** ve orada TO %1,0. Aynı kütle 3–5 bandında
olsa **8,5 kat** tıklama üretirdi. 27 sorgu 80+ gösterim alıp **sıfır** tıklama
getiriyor (3.402 gösterim, toplamın %11,4'ü).

**Görünürlük sorunumuz yok — konum bandı sorunumuz var.** Yeni sorgu hedeflemek
aynı bozuk banda gösterim eklemekten ibaret olur.

## Bulgu 2 — ÇÜRÜTÜLEN hipotez: "yanlış sayfamız sıralıyor"

Ada sayfalarının site sayfalarını yediği bilinen bir sorundu. Sıfır tıklamalı en
büyük iki sorguda test edildi (pws=0, 2026-08-10):

| Sorgu | Sıramız | Sıralayan sayfa | Doğru mu |
|---|---|---|---|
| koz modern sitesi | 6. | /mahalleler/sehit-osman-avci-mahallesi/koz-modern | ✅ doğru sayfa |
| göksu hisar evleri | 3. | /mahalleler/susuz-mahallesi/goksu-hisar-evleri | ✅ doğru sayfa |

Doğru sayfa sıralıyor. Bu hipotez kapandı.

## Bulgu 3 (ASIL) — Google ESKİ BAŞLIKLARI gösteriyor

| Sayfa | Canlıdaki başlık (doğru) | Google'ın gösterdiği (eski) |
|---|---|---|
| Koz Modern | `Koz Modern Emlakçı \| Eryaman \| Evinizi Satalım, Kiraya Verelim` | `Eryaman Koz Modern Satılık Daire ve Kiralık Daire — Eml…` |
| Göksu Hisar | `Göksu Hisar Evleri Emlakçı \| Susuz Mahallesi \| Evinizi Satalım…` | `Eryaman Göksu Hisar Evleri Satılık Daire ve Kiralık Daire` |

Eski başlıklar iki ayrı kararı ihlal ediyor: **alıcıya sesleniyor**
([[project-owner-focused-messaging]]) ve **Susuz'a "Eryaman" diyor**
([[feedback-yenimahalleye-eryaman-deme]]). İkisi de 07–09.08'de düzeltildi ama
Google henüz yeniden taramadı.

**Sonuç: yukarıdaki %1,0 TO, çoktan değiştirilmiş başlıkların oranı.**
Yeni başlıkların TO'su HENÜZ ÖLÇÜLMEDİ.

**Dürüst uyarı:** yeniden tarama TO'yu artıracak diye bir garanti YOK. Yalın site
adı arayan biri için eski başlıktaki "Satılık Daire ve Kiralık Daire" ifadesi,
yeni başlıktaki "Emlakçı | Evinizi Satalım"dan daha tıklanabilir bile olabilir.
Yeniden tarama **canlıyla ölçüleni eşitler**, iyileştirme vaat etmez. Eski
başlıklara dönmek ise zaten seçenek değil (iki kararı ihlal ediyorlar).

## Yeniden tarama kuyruğu

`yeniden-tarama-kuyrugu.txt` — gösterime göre sıralı 20 adres, hepsi 4–12
bandında ve ≥60 gösterimli. Sorgu→sayfa eşleşmesi 20/20 doğrulandı.
GSC URL denetimi kotası günde ~10-12; iki güne bölünmeli.

Değişiklikten **3 hafta sonra** aynı kesit yeniden çekilip 8–11 bandının TO'su
karşılaştırılacak. Tek ölçümle karar verilmeyecek.
