# Sorunlu Siteler — Zenginleştirme Süpürmesi Notları

Zenginleştirme sırasında yakalanan, çözümü sonraya bırakılan haritalama/veri sorunları.
Çözülen kayıt buradan silinir; çözüm commit'i not düşülür.

## Bekleyenler
### SOA İntes kümesi — be gruplaması kaba (2026-07-15, QA kapısı yakaladı)
- bilgiemlak 'İntes Blokları' 4 ada gösteriyor (17468-71) ama 17470 = bizim
  camlik-sitesi, 17471 = cicek-sitesi. İntes kaydına eklemiştim, QA çakışma verdi
  → GERİ ALINDI; İntes 17468+17469 ile kaldı.
- Muhtemelen İntes yapımcı firmanın kümesi; Çamlık/Çiçek o kümede ayrı adlandırılmış
  siteler. Çamlık/Çiçek zenginleştirilirken bu bağ metne yazılabilir (TKGM verileri
  hazır: 17470 = 5 apt 6.276 m², 17471 = 5 apt 6.751 m²).

### SOA İçtaş-Kazım Sarı kümesinin sahipsiz 3 adası (2026-07-15)
- bilgiemlak 'İçtaş, Kazım Sarı Blokları' kümesinde 4 ada gösteriyor: 17480 (7 apt),
  17481 (9 apt), 17482 (6 apt), 17498 (6 apt = bizim ictas kaydı).
- Bizim kazim-sari-sitesi ise 17483'te (4 kârgir apt — be kümesinde YOK).
- 17480/81/82 (toplam 22 apartman) hangi kayda ait? İçtaş'ın mı, Kazım Sarı'nın mı,
  ayrı bir site mi? → Özgün'e sor; şimdilik iki kayıt kendi tek adasıyla zenginleştirildi.

### tunahan/kur-sitesi — MÜKERRER ŞÜPHESİ (2026-07-15)
- kur-sitesi (46496/2) ile kur-sitesi-c2b-2h (46496/2) AYNI ada/parseli taşıyor;
  bilgiemlak Kur Blokları'nı tek yerleşim, iki ada (46495+46496) olarak gösteriyor.
- C1B-2K ve C2B-2H kayıtları zenginleştirildi; jenerik "kur-sitesi" muhtemelen silinmeli
  ya da iki grubun çatı kaydı olarak mı kalmalı? → Özgün onayı.

### devlet/cagkent-sitesi — tapu niteliği "Tarla" (2026-07-15)
- 18673/1 TKGM'de nitelik "Tarla" + Kat İrtifak (15.885 m²) — binalar var ama cins tashihi
  yapılmamış görünüyor. Metne nitelik/kat mülkiyeti YAZILMADI, sadece alan verildi.
- Özgün'e bilgi: bu sitede satışta tapu cinsi sorusu gelebilir (arsa tapulu kat irtifakı).


### devlet/arslanlar + cagrikent — AYNI ADA ÇAKIŞMASI (2026-07-14)
- İki dosya da 18679 adasını iddia ediyor; bilgiemlak 18679'u "Arslanlar Sitesi" gösteriyor.
- Çağrıkent'in gerçek adası TKGM/başka kaynakla bulunmadan ikisi de zenginleştirilmedi.
- Devlet'te ayrıca bekleyen TAM eşleşmeler (sıradaki partiler): eryaman-royal-city↔"Royal"
  (18693, takma ad!), gulhayat (18698), ikizler (18695), mavi-koy (18689), mavikent (18691),
  mil-kooperatifi↔"Mil Koop" (18687), oray (18701), ozdenizyildizi↔"Özdeniz Yıldızı" (18705),
  sari-cinar↔"Sarıçınar" (18692), selcuklu (18690), sergah-evleri↔"Eryaman Sergah" (18675),
  turgut-aslan (18694), yeni-huzur-bahcesi (18677), yesiloz↔"Yeşil Öz" (18686),
  yildiz-tatil (18706). Tunahan'da da 7 TAM eşleşme var.

### Parti 21 kayıt tamamlama — ✅ TAMAMLANDI 2026-07-15 (6/6 TKGM doğrudan uç noktayla doğrulandı; adalar+koordinat+sınır+alan/nitelik yazıldı)
altay (18519), gulsah-95 (18518), sirin-91 (18653), yenigun-isigi (18465),
yesil-guven-kent (18490), yesimkent (18520) — dosyalarda adalar/koordinat alanı YOK;
TKGM açılınca 124123/{ada}/1 ile doğrula → adalar + koordinat (merkez) + sınır GeoJSON üret,
açıklamaya alan+nitelik cümlesi ekle.

### Çift-adalı / belirsiz eşleşmeler (TKGM günü çözülecek)
- gozde-1 + gozde-2 ↔ be "gozde-sitesi 18651-18652" (hangi dosya hangi ada? TKGM nitelik+konum ile ayrıştır)
- gozde-91 ↔ 18641-18642 (iki ada, tek dosya — Anka 2001 tipi çoklu parsel olabilir)
- seniz-sitesi + seniz-konut-kooperatifi ↔ 18516-18517 (iki dosya iki ada mı, tek site mi?)
- mesa-sitesi ↔ be "mesa-cls 18506-18507(?)"; mesa-calisanlari-kooperatifi ↔ be "mesa-sitesi 18659" — adlar ÇAPRAZ, dikkat!
- ozuguzelkent: dosyada 18664, be "18664-18665" — 18665 (anka taramasında görülen 5.212 m² 6 blok parseli) muhtemelen bunun 2. adası → teyitle ekle
- ipek-yapi ↔ be "ipek-sitesi 18476" (ad farkı var, nitelikle teyit et)
- pinarkent-91 ↔ be "pinar-sitesi 18511" (ad farkı büyük, temkinli)
- portakal-cicegi ailesi: 3 dosya (portakal-cicegi, portakal-cicegi-2, 1-portakal-cicegi) ↔ be apartman "18450" + villa bölgesi "19517" — aile ayrıştırması gerekli

### Güzelkent VİLLA BÖLGESİ (be yer/guzelkent-villalar-54, 195xx adaları — ayrı analiz günü)
Villa bölgesi indexinde 40+ site var (Renk Villaları 19516, Erenköy 19517, Köşk-Ersan 19516,
Eczacılar 19516, Angora 19516, Korukent no-10/no-15, Guz-Göl 19506, ikinci bir "Kardelen no-17
19504" vb.). Bizim koordinatsız villa/atipik dosyaların (renk-villalari, eryaman-renk-villalari,
kucuk-ankara-villalari, erenkoy, eczacilar, kosk, ersan, angora, korukent, kardelen, guz-gol,
kurtulus, karasimsek, ritim-eryaman, sehit-ferhat-koc, yayikli ailesi, mesa ailesi...) gerçek
evi burası olabilir. DİKKAT: apartman bölgesindeki adlarla çakışanlar var (Kardelen 18453 vs
Kardelen no-17 19504) — dosya başına hangi bölge olduğu netleşmeden zenginleştirme YAPMA.


### Parti 17-22 TKGM tamamlama kuyruğu (2026-07-14 — kota dolu olduğundan yarına)
Parti 17-19 (elele, gardenya, gokkusagi, gulenkent, kusburnu, meltem, asilkent, evrimkent,
tez-konak, yeni-isikent, sahinbey, selale, eryapi, gordogu-sen, nazlideniz, oz-muhtar,
guzel-ankara, isi-kent, master-kent, ekin, metro-yasam, postakent, yesim-kent2,
yukselay, er-ay-3 + DEVLET: asiyan, cagkent, camdali, cinar, demirkent, denizim,
bilgi-sevgi-hosgoru) bilgiemlak blok
kayıtlarıyla zenginleştirildi; TKGM açılınca her birine tek sorguyla **alan + tapu niteliği +
kat mülkiyeti** cümlesi eklenecek (`api/parsel/{koordinat}` ya da 124123/{ada}/1).
DİKKAT: bilgiemlak "Alan" değeri TKGM'den sapıyor (Konuta Özlem: 5.638 vs 5.169 m²) —
alan HER ZAMAN TKGM'den yazılır, bilgiemlak alanı kullanılmaz.

### Eksik ikinci ada bulunanlar — ✅ TAMAMLANDI 2026-07-15 (18640/18502/18504/18521 TKGM'den çekildi, sınırlar MultiPolygon'a genişletildi, koordinatlar birleşik merkeze düzeltildi)
- **erkent-sitesi**: dosyada 18639, bilgiemlak 18639+18640 → 18640 TKGM'den doğrulanıp eklenecek.
- **ulas-sitesi**: dosyada 18503, bilgiemlak 18502+18503 → 18502 eklenecek (koordinatı da GB cebinde, bozuk).
- **safi-apak-sitesi**: dosyada 18505, bilgiemlak 18504+18505 → 18504 eklenecek (koordinat GB cebi).
Üçünde de sınır GeoJSON genişletmesi gerekir (Anka 2001/Akkonak yöntemi).

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
- [parti-24 notu] Güngörler Tower (SOA, 46643/5, Malazgirt 1071 Cd No:18): Google verisi ince — IG sigorta akışlarında '129 daire' ve '60 konut+2 ticari' quote'ları farklı projelere ait olabilir, güvenilmez → sayı yazılmadı, zenginleştirilmedi. Özgün'e sor: blok/daire yapısı? | firat-life-style-goksu-sitesi (SOA, adasız/koordinatsız): Fırat Life Style'ın Göksu projesi = relax-goksu-konutlari olabilir (aynı müteahhit) — mükerrer mi, ayrı proje mi? Özgün'e sor.
