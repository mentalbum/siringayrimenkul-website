# Sorunlu Siteler — Zenginleştirme Süpürmesi Notları

Zenginleştirme sırasında yakalanan, çözümü sonraya bırakılan haritalama/veri sorunları.
Çözülen kayıt buradan silinir; çözüm commit'i not düşülür.

## Bekleyenler

### Parti 17 TKGM tamamlama kuyruğu (2026-07-14 — kota dolu olduğundan yarına)
Parti 17 (elele, gardenya, gokkusagi, gulenkent, kusburnu, meltem) bilgiemlak blok
kayıtlarıyla zenginleştirildi; TKGM açılınca her birine tek sorguyla **alan + tapu niteliği +
kat mülkiyeti** cümlesi eklenecek (`api/parsel/{koordinat}` ya da 124123/{ada}/1).
DİKKAT: bilgiemlak "Alan" değeri TKGM'den sapıyor (Konuta Özlem: 5.638 vs 5.169 m²) —
alan HER ZAMAN TKGM'den yazılır, bilgiemlak alanı kullanılmaz.

### Eksik ikinci ada bulunanlar (2026-07-14, bilgiemlak indeks taraması)
- **erkent-sitesi**: dosyada 18639, bilgiemlak 18639+18640 → 18640 TKGM'den doğrulanıp eklenecek.
- **ulas-sitesi**: dosyada 18503, bilgiemlak 18502+18503 → 18502 eklenecek (koordinatı da GB cebinde, bozuk).
- **safi-apak-sitesi**: dosyada 18505, bilgiemlak 18504+18505 → 18504 eklenecek (koordinat GB cebi).
Üçünde de sınır GeoJSON genişletmesi gerekir (Anka 2001/Akkonak yöntemi).

### Takma ad adayları (zenginleştirilirken açıklamaya gömülecek)
- eryapi-sitesi ↔ bilgiemlak "Eray Sitesi" (18657)
- gordogu-sen-sitesi ↔ "Gürdoğuşen Sitesi" (18646)
- oz-muhtar-sitesi ↔ "Öz Muhtarlar 2 Sitesi" (18670)
- nazlideniz-sitesi ↔ "Nazlı Deniz" ayrık yazımı (18488)

### guzelkent/aksu-sitesi (2026-07-14, parti 15'te atlandı)
- Dosyadaki koordinat (39.987639, 32.609934) TKGM'de **ada numarasız boş parsele** düşüyor
  ("Eryaman-/49", 8.125 m², Tarla) — muhtemelen park/yeşil alan parseli.
- Dosyada ve yerel kayıtta (bilgiemlak `yer/aksu-sitesi-18512-ada-610`) site **18512** adasında;
  ±260 m yarıçaplı TKGM taramasında 18512 bulunamadı.
- Yerel kayıtta bloklar: 8, 8A, 8B, 8C, 8-D, 8-E (6 blok).
- Yapılacak: 18512'nin gerçek konumu bulunup koordinat + sınır GeoJSON yeniden üretilecek,
  sonra zenginleştirilecek.

### guzelkent/baskent-sular-sitesi (2026-07-14, parti 16'da atlandı)
- Dosya koordinatı (39.993773, 32.614902) TKGM'de ada numarasız tarlaya düşüyor ("Eryaman-/50", 9.637 m²).
- Hedef ada 18477 (dosya + bilgiemlak uyumlu); ±180 m taramada bulunamadı, sonra TKGM günlük kotası doldu.
- Yerel sayfa: `yer/baskent-sular-sitesi-18477-ada-617`.

### guzelkent/cankaya-vefa-sitesi (2026-07-14, parti 16'da atlandı)
- Dosya koordinatı (39.991810, 32.606339) ada numarasız tarlaya düşüyor ("Eryaman-/883", 5.547 m²).
- bilgiemlak siteyi İKİ adada gösteriyor: **18521-18522** (`yer/cankaya-vefa-sitesi-18521-18522-ada-622`);
  dosyada yalnızca 18522/1 var → bulununca ada + sınır genişletmesi de gerekli.

### GÜZELKENT GB CEBİ — sistematik koordinat sorunu (2026-07-14)
- aksu, ekin, ulas, safi-apak koordinatları TKGM'de ya boş dönüyor ya numarasız tarlaya düşüyor;
  185xx ada cebinin dosyalardaki koordinatları topluca kaymış görünüyor.
- Bu cebe girmeden önce koordinat kaynağını düzelt; tek tek halka taramasıyla uğraşma.
- KOLAY YOL: TKGM'nin `api/parsel/{mahalleId}/{ada}/{parsel}/` doğrudan uç noktası GEÇERLİ
  (Eryaman mahalleId=124123) — 2026-07-14'te kota dolu olduğu için denenemedi; kota açılınca
  18512 (aksu), 18477 (başkent sular), 18521+18522 (çankaya vefa), 18501/18503/18505
  (ekin/ulaş/safi apak) doğrudan çekilip koordinat+sınır yeniden üretilebilir.

### eryaman/atakent-metro (önceki oturumdan devir)
- 46523/8'e force edilmişti; bilgiemlak o adayı Oyak 555'e ait gösteriyor
  (bloklar A1/A2/B1/D1, TKGM nitelikle uyumlu).
- Yapılacak: Atakent Metro'nun kendi parseli aranacak, kota açılınca yeniden bakılacak.

## Çözülenler

### guzelkent/anadolu-sitesi ✅ (2026-07-14, parti 15'te çözüldü)
- Eski kayıt 18493/1'e bağlıydı; TKGM o parseli "4 Katlı Betonarme Dükkan" gösterdi (site değil).
- Yerel kayıt + TKGM taramasıyla gerçek parsel bulundu: **18474/1** (4.923 m², 6 Blok Kârgir
  Apartman, bloklar 6/6A/6B/7/12/12A). Koordinat, adalar ve sınır GeoJSON 18474'e taşındı.
- Not: 18493/1 dükkan parseli sitenin çarşısı olabilir ama aidiyeti doğrulanamadı — kayda alınmadı.
