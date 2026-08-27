---
name: gsc-dizin
description: siringayrimenkul.com için GSC dizin damlası — URL denetimi, dizine ekleme isteği, kuyruk ve kota disiplini. Özgün "dizine ekle", "dizin isteği gönder", "dizine eklenmesi gerekenleri bul/denetle", "kota açıldı mı bak" veya kuyruk/DIZINE-EKLENECEKLER dosyalarından bahsettiğinde MUTLAKA bu beceriyi kullan. GSC'de URL denetimi yapılacak her işte (sayfa dizinde mi kontrolü dahil) önce bunu oku — UI'nin kota yakan tuzakları burada belgeli.
---

# GSC dizin damlası

Amaç: `scratchpad-karne/pws0/gsc-dizin-kuyrugu-194.md` kuyruğundaki sayfaları
Google dizinine sokmak. Tek geçerli dizin-durumu kaynağı **GSC URL denetimi**dir;
`site:` araması ve "cümle testi" yanılttı (Tunahan/Güzelkent vakaları), kullanma.

## Dosyalar ve işaret düzeni

- Ana kuyruk: `scratchpad-karne/pws0/gsc-dizin-kuyrugu-194.md` — talep sıralı
  (talep sıralı; Yenimahalle grubu 27.08'de siteden kaldırıldı, kuyrukta yok). Olay notları dosyanın sonuna
  `> tarih — not` biçiminde eklenir.
- Özgün'e verilen çalışma kopyası: `scratchpad-karne/pws0/DIZINE-EKLENECEKLER.md`
  (kuyruktan yeniden üretilir; elle senkron etme, üret).
- İşaretler:
  - `- [x] URL ← GG.AA istek gönderildi` — istek kabul onayı GÖRÜLDÜYSE
  - `- [x] URL ← GG.AA DİZİNDE (kendiliğinden)` — denetim "mevcut" dediyse
  - `- [ ] URL ← GG.AA dizin dışı teyit` — dizin dışı ama istek HENÜZ gitmedi
- Her anlamlı parça sonunda hedefli `git add` + commit + push (paralel oturumlar
  var; asla `git add -A` yapma, sadece dokunduğun dosyaları ekle).

## Kota gerçekleri (ölçülmüş)

- Günde ~6-10 istek; pencere takvim günü değil **kayan 24 saat**. Dünkü istekler
  sindirilmeden "Kota Aşıldı" gelir; genelde ertesi gün öğleden sonra açılır.
- "Kota Aşıldı" gelen istek İŞLENMEMİŞTİR: işaretleme, deftere not düş, commit'le, dur.
- Onay ("Dizine eklenmesi istendi") görülen sayfada butona İKİNCİ kez basmak da
  kota yakar (12.08 İlke Sitesi dersi). Onayı gördüysen o sayfa bitti.
- GÜNLÜK OTOMATİK DAMLA (27.08 akşam, Özgün: "sürekli devam et" — 25.08'deki
  elle-tetikli iptal GERİ ALINDI): her gün 10:26'da otomatik damla + 02:23'te
  gecelik SERP turu (CronCreate, oturum içi, 7 günde yenilenmeli). Kural:
  her adayı göndermeden ÖNCE API ile doğrula (kendiliğinden girenlere kota
  harcanmaz); "Kota aşıldı"nda dur, ertesi gün devam; kuyruk tamamen bitince
  Özgün'e haber verilir ve görev silinir. Sıra: mahalle içi talep sıralı.
  (27.08: Yenimahalle grubu ata/susuz/cumhuriyet SİTEDEN KALDIRILDI — bu üç
  mahalleye asla istek gönderme; adresleri 410 dönüyor.)

## Denetim akışı (tarayıcı)

1. `https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.siringayrimenkul.com%2F`
2. Arama kutusuna URL yaz + Enter → ~14 sn bekle.
3. Hükmü sayfa metninden oku (JS ile — ekran görüntüsünden hızlı):
   ```js
   const t=document.body.innerText;
   const m=t.match(/https:\/\/www\.siringayrimenkul\.com\/[^\n]*/);
   const i=t.indexOf("URL Google'da");
   JSON.stringify({u:m?m[0]:'',v:i>=0?t.substr(i,24):'BEKLIYOR'})
   ```
   **`u` alanını mutlaka doğrula:** kutunun "son denetimler" açılır listesi Enter'ı
   kapıp AYNI sayfayı yeniden denetletebiliyor (mavi-koy vakası). `u` beklediğin
   URL değilse sonucu yazma, o URL'yi yeniden denetle.
4. "URL Google'da mevcut" → kendiliğinden dizinde işaretle, İSTEK GÖNDERME.
   "URL Google'da yok" → kota varsa istek gönder (aşağıda), yoksa teyit işareti.

## İstek gönderme tuzakları

- "DİZİNE EKLENMESİNİN İSTE" ilk tıklamada bazen modal açmaz → 3 sn bekleyip bir
  kez daha tıkla (çift tıklama deseni). Test ~1-2 dk sürer, sabret.
- Onay toast'ı açıkken kutuya yazılan yeni URL YUTULUR → her istekten sonra
  "Kapat"a tıkla, ~2 sn bekle, sonra sıradakine geç.
- Tek tıklama kutuyu odaklamayabiliyor → yazmadan önce `document.activeElement`
  INPUT mu diye bak; değilse çift tıkla. Klavye olayları hiç ulaşmıyorsa (Özgün
  Chrome'u aktif kullanıyor veya ekran kilitli) ZARİF DUR: işaretsiz bırak,
  deftere not, commit, kullanıcıya kısa durum yaz.

## API kanalı (kurulursa)

Servis hesabı anahtarı `~/.config/gsc-servis-anahtari.json` yolunda VARSA
denetimleri tarayıcı yerine `node scripts/gsc-api.mjs denetle <url>` ile yap —
günde 2000 denetim hakkı verir ve UI tuzaklarının hiçbiri yoktur. Kurulum adımları:
[references/api-kurulum.md](references/api-kurulum.md). DİKKAT: API yalnız
denetim/performans/sitemap içindir; dizine ekleme İSTEĞİ API'den gönderilemez
(Indexing API sadece iş ilanları içindir, kullanımı kural ihlali) — istekler her
zaman UI'den gider.

## Bitiş raporu

Tur bitince Özgün'e Türkçe, sade özet: kaç istek kabul, kaç kendiliğinden
dizinde, kota durumu, sıradaki adım. Rakamları kuyruk dosyasındaki işaretlerden
say, ezberden yazma.
