# BÖLGE TURU — "hangi bölgede kaçıncıyız?" (Local Falcon'un ücretsiz karşılığı)

Özgün'ün 23.08 isteği: "eryaman emlakçı" ve "emlakçı" sorgularında bölgeye göre
sıramız, ücretsiz ölçülsün.

## Yöntem: bağımsız IP değil, uule

Local Falcon dahil hiçbir grid aracı her noktaya gerçek IP koymaz; Google'ın
`uule` parametresiyle "bu arama şu koordinattan yapılıyor" der. Google organik
ve harita sonuçlarını bildirilen konuma göre yerelleştirir. Biz de aynısını
yapıyoruz: 7 Ankara noktası × 2 sorgu = 14 ölçüm, `pws=0&gl=tr&hl=tr` + GPS
uule. Ek maliyet yok, kanal yükü 14 sorgu.

Noktalar (`bolge-tur.mjs` içinde): eryaman (merkez), etimesgut, sincan,
batikent, kizilay, kecioren, mamak.

## Nasıl koşulur (ev kanalı — uygulama içi tarayıcı)

1. `node bolge-tur.mjs --listele` → 14 URL + ölçüm JS'i basar.
   **URL'ler her turda yeniden üretilir** — uule zaman damgası taşıyor, eski
   listeyi kullanma.
2. Her URL için: navigate → 4 sn bekle → ölçüm JS → JSONL satırını ANINDA
   `sonuclar-bolge.jsonl`'e yaz. Tempo/engel/commit kuralları PROTOKOL-gece.md
   ile aynı (CAPTCHA'da dur, her ölçüm anında diske, commit sadece scratchpad-karne).
3. **loc doğrulaması (kritik):** JS çıktısındaki `loc` alanı beklenen semti
   (veya en azından Ankara'yı) göstermeli. Göstermiyorsa uule tutmamış demektir:
   turu DURDUR, sonucu YAZMA, buraya not düş.
4. `sira:0` çıkarsa aynı URL + `&start=10` ile 2. sayfaya bak, kayda `s2sira`
   ekle (protokolün 10.08/B kuralı).

## Kayıt biçimi (`sonuclar-bolge.jsonl`)

```
{"d":"<tarih>","kanal":"ev|konteyner","nokta":"eryaman","lat":39.9779,"lng":32.6382,
 "q":"emlakçı","sira":N,"u":"/yol","bas":"SERP başlığımız","s2sira":N?,
 "hp":true,"hs":N,"hl":["kutudaki adlar"],"ilk3u":["alan+yol"],"n":N,"loc":"Eryaman"}
```

`hp` harita kutusu çıktı mı, `hs` kutudaki sıramız (0 = kutu var biz yokuz),
`sira` organik sıra (0 = ilk 10 dışı). Aynı nokta+sorgu tekrar ölçülürse SON
ölçüm geçerli. Karne: `python3 karne-bolge.py`.

## Denenen ve kapanan yollar (tekrar vakit yakma)

- **Konteyner/uzak oturum kanalı (23.08):** Playwright+Chromium hazırdı ama
  çıkış politikası `www.google.com:443`'e 403 veriyor (policy denial). Uzak
  oturumdan bu tur KOŞULAMAZ; `bolge-tur.mjs`'in sürücü kipi ancak google.com'a
  çıkışı olan ortamda işe yarar.
- **curl/fetch:** zaten yasak (403 fırtınası dersi).

## Ücretli olmayan diğer seçenekler (istenirse)

- Harita kutusu ısı haritası için Local Falcon'un sınırlı ücretsiz taraması
  (GBP hesabıyla giriş ister — Özgün yapmalı).
- Aylık otomasyon istenirse SerpApi ücretsiz katmanı (100 arama/ay) yeter:
  Özgün anahtar alıp verirse tur API'den koşulur, kanal hiç kullanılmaz.
