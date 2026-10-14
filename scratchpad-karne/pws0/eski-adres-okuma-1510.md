# Eski adrese istek okuması — 15.10 (bir gün erken: 14.10 19:57Z, API)

Kaynak: `kaldirac-defteri.json` kaldıraç [11] "Eski adresi yeniden taratma" takvim maddesi (15.10).
Soru: 07.10'da dizine ekleme isteği gönderilen 11 eski adresten (26.07 taşıması öncesi şema, hepsi 308)
istekten SONRA (eşik: `lastCrawlTime > 2026-10-07T15:00Z`) taranan var mı?

Yöntem: `node scripts/gsc-api.mjs denetle-dosya` (11 adres, 14.10 ~19:50Z); GSC performansı
`sayfalar28.tsv` (pencere 2026-09-14 – 2026-10-11, 28 veri günü; istek sonrası yalnız 4 veri günü
pencerede, o yüzden performans sütunları çoğunlukla istek ÖNCESİ talebi gösterir). Varis = aynı yol,
mahalle slug'ına `-mahallesi` eklenmiş; her eski adresin 308'i ve varisin 200'ü curl ile doğrulandı
(istisna: bosphorus satırı, aşağıda).

## Tablo

| # | Eski adres (`/mahalleler/...`) | Tür | API hüküm (14.10) | Kapsam | Google canonical | Son tarama | 07.10 15:00Z sonrası? | Eski gös/tık/poz (28g) | Varis gös/tık/poz (28g) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | guzelkent/kucuk-ankara-villalari | site | YOK | Page with redirect | **yeni** (guzelkent-mahallesi/...) | 2026-10-08T20:38Z | **EVET** (+~1,5 gün) | 2 / 0 / 5,0 | 15 / 0 / 5,7 |
| 2 | guzelkent/konuta-ozlem-sitesi | site | MEVCUT | Submitted and indexed | kendisi | 2026-07-19T18:39Z | hayır | 7 / 0 / 6,3 | 31 / 1 / 7,6 |
| 3 | guzelkent/adalar/18668-1 | ada | MEVCUT | Submitted and indexed | kendisi | 2026-07-17T11:36Z | hayır | 12 / 0 / 12,2 | 8 / 0 / 8,0 |
| 4 | devlet/ilk-bahar-sitesi | site | YOK | Page with redirect | **yeni** | 2026-10-08T14:34Z | **EVET** (+~1 gün) | 9 / 0 / 3,6 | 0 / 0 / – |
| 5 | eryaman/eryaman-evleri | site | YOK | Page with redirect | **yeni** | 2026-10-13T22:44Z | **EVET** (+~6,5 gün) | 7 / 0 / 8,7 | 9 / 0 / 8,8 |
| 6 | goksu/ma1-tower | site | YOK | Page with redirect | **yeni** | 2026-10-08T07:00Z | **EVET** (+~16 saat) | 1 / 0 / 2,0 | 0 / 0 / – |
| 7 | seyh-samil/adalar/17365-1 | ada | MEVCUT | Submitted and indexed | kendisi | 2026-07-12T10:23Z | hayır | 15 / 0 / 10,7 | 23 / 1 / 9,2 |
| 8 | sehit-osman-avci/bosphorus-ankara-konutlari | site | YOK | Page with redirect | **alpak-neve-armonia-residence** (!) | 2026-10-07T03:01Z | hayır (istekten ÖNCE, 07.10 sabahı) | 14 / 0 / 8,9 | –mahallesi varisi de 308 → bossphorus-konutlari: 2 / 0 / 9,0 |
| 9 | sehit-osman-avci/kiratli-residence | site | MEVCUT | Submitted and indexed | kendisi | 2026-07-15T15:06Z | hayır | 362 / 1 / 8,3 | 391 / 1 / 5,3 |
| 10 | sehit-osman-avci/tan-yildizi-sitesi | site | YOK | Crawled - currently not indexed | kendisi | 2026-06-28T09:52Z | hayır | 1 / 0 / 3,0 | 2 / 0 / 3,0 |
| 11 | sehit-osman-avci/adalar/46643-7 | ada | MEVCUT | Submitted and indexed | kendisi | 2026-07-05T01:40Z | hayır | 123 / 0 / 8,9 | 0 / 0 / – |

Sayım: **4/11 istekten sonra tarandı** (08.10 ×3, 13.10 ×1) ve dördü de "Page with redirect" +
canonical yeni adrese geçti (sindirim). 6/11'de hiç iz yok (son tarama 28.06–19.07, userCanonical
hâlâ kendisi; 5'i hâlâ "Submitted and indexed"). 1/11 (bosphorus) 07.10 03:01Z'de taranmış — istek
gönderilmeden önce (08.10 okuması "15 saat sonra" diyor, istek 07.10 sabah/öğle); 08.10'daki
"1 iz" budur, isteğe yazılmaz. Dikkat: bosphorus'ta Google canonical 308 hedefi (bossphorus-konutlari)
değil, **alpak-neve-armonia-residence** — next.config'de armonia-konutlari → alpak-neve kuralı var,
Google iki kaydı aynı yerde sayıyor olabilir; ayrı iş, bu okumanın konusu değil.

## Kontrol kıyası — istek gitmemiş eski adresler (aynı gün, aynı API)

`eski-adres-deneyi-1410.tsv` tabanı için 14.10'da denetlenen 101 eski adresin (28g gösterime göre ilk
101 site/ada, 3–168 gösterim) 07.10 isteği ALMAMIŞ 93'ünde `son tarama > 2026-10-07T15:00Z` olan: **9/93 (%10)**
(rainbow-sitesi 14.10, kocaklar-tower 14.10, green-life-goksu 14.10 [404], arya-nuans 13.10, tunahan/adalar/17639-1 12.10,
guz-gol-sitesi 12.10, cagdas-sistem 10.10, gozde-91 09.10, camdali 08.10). Son tarama ayı dağılımı (93): Haz 1,
Tem 29, Ağu 28, Eyl 23, Eki 12 — yani istek olmadan da eski adresler ayda ~%12–30 hızla yeniden taranıyor;
7 günlük pencerede beklenen taban ~%10.

| Küme | n | 07.10 15:00Z sonrası taranan | Oran |
|---|---|---|---|
| 07.10 istek gönderilen eski adresler | 11 | 4 | %36 |
| İstek gitmemiş eski adresler (aynı havuz, aynı gün denetim) | 93 | 9 | %10 |

Fark 3,6 kat (4/11 vs 9/93); n küçük, Fisher kesin testi p=0,030 (tek yönlü, hipergeometrik hesap). Yön tutarlı,
kesinlik düşük — 28.10 deneyi (100 adres, iki kol) bu soruyu daha sağlam ölçer.

## Hüküm (3 cümle)

1. İstek eski adresi taratıyor, ama dizindeki sayfadaki gibi "aynı dakikada" değil: 11'in 4'ü 16 saat – 6,5 gün
   gecikmeyle tarandı ve dördü de birleşti (Page with redirect, canonical yeni); 08.10 okumasındaki
   "10/11 iz yok" hükmü erkendi, 15 saat yetersiz bir pencereydi.
2. 6/11'de 7 gün sonra bile iz yok; taranan 4'ün ortak noktası görünür talebinin düşük olması
   (1–9 gösterim/28g), taranmayanlar ise hacimli olanları da içeriyor (kiratli 362, 46643-7 123) — yani
   istek "garanti" değil, %36'lık bir tetikleyici — isteksiz tabanın (%10) 3,6 katı, p=0,03; kaldıraç
   "ölü" değil "zayıf ama var" diye daraltılmalı (defterdeki 'olu' hükmü bu veriyle çelişiyor).
3. Performans tarafında sindirim ≠ devir doğrulanıyor: birleşen 4 adresin varisleri 28g'de 0–15 gösterimde
   (kucuk-ankara 15, eryaman-evleri 9, ilk-bahar 0, ma1 0) ve pencerenin yalnız 4 günü istek sonrası —
   gösterim devri için 28.10 okuması gerekir, bugün söylenemez.
