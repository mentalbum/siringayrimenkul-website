# goksu/parsel-63387-3 — ad araştırması (20.10.2026)

Girdi: TKGM 63387/3, "12 Katlı Betonarme Apartman Ve Arsası", 5.652,84 m², nokta 40.003567, 32.640394 (Göksu Mah., Etimesgut).

## Bulunan ad: DURU GÖKSU (Duru Göksu Apt.)

### Kaynak 1 — Yandex toponim (site/konut tipi, tag 'district')
- suggest-geo: "Duru Göksu | Göksu Mah., Etimesgut, Ankara", source_id 6942549184, girdi noktasından 33,75 m (Yandex mesafesi), kendi hesabım 33,6 m.
- uri çözümü (ymapsbm1://geo?data=...): nokta lng 32.640762, lat 40.003458.
- Yandex Haritalar sayfası: https://yandex.com.tr/maps/115679/etimesgut/geo/duru_goksu/6942549184/ (curl 429 verdi; WebSearch önizlemesi aynı koordinatı veriyor: 40.003458, 32.640762)
- Ham dosya: ysug-göksu.txt, ysug-duru.txt

### Kaynak 2 — Eczane adres kaydı (AEO nöbet listesi türevleri; Yandex'ten bağımsız)
- Yeni Ankara 17-18 Ekim 2026 nöbetçi eczane listesi: "Şule Delen Eczanesi — Göksu Mah. 2. İnönü Cad. No:20/D (Duru Göksu Apt.) — 0 (312) 260-75-92", başlık "Etimesgut - Eryaman"
  https://www.yeniankara.com.tr/ankara/ankara-nobetci-eczaneler-17-18-ekim-2026-hafta-sonu-hangi-eczaneler-acik-186533
- Yeni Ankara 20 Ağustos 2026 listesi (aynı adres metni): https://www.yeniankara.com.tr/amp/ankara/acil-ilac-arayanlar-dikkat-iste-ankaranin-20-agustos-persembe-nobetci-eczaneleri-179619
- Ankara Masası 17 Ekim 2026 listesi (WebSearch özeti: "Duru Göksu Apartmanı", Göksu Mah. 2. İnönü Cad. No:20/D): https://www.ankaramasasi.com.tr/haber/2223997/ankara-nobetci-eczaneler-17-ekim-2026-listesi
- eczaneler.gen.tr Etimesgut dizini (WebSearch snippet: "Şule Delen Eczanesi Göksu Mahallesi, 2.İnönü Caddesi, Duru Göksu Apt. No:20/D"): https://www.eczaneler.gen.tr/eczaneler/ankara-etimesgut (sayfa 403, snippet'ten)

### Adresi konuma bağlayan kayıtlar
- OSM node 12863355847 amenity=pharmacy name="Şule Delen Eczanesi" @ 40.0036024, 32.6403853 — girdi noktasından 4,0 m. (osm-nodes.json)
- Yandex işletme: "Şule Delen Eczanesi | Eczaneler · Ankara, Etimesgut, 2. İnönü Cad., 20" oid 146652338870, Duru noktasından 19,8 m (ysug3-Şule Delen.txt)
- Yandex toponim "2. İnönü Cad., 20 | Etimesgut, Ankara" Duru noktasından 8,9 m (ysug3-2. İnönü Cad., 20.txt)
- OSM node 12863308750 shop=supermarket "Migros" @ 40.0034354, 32.6403931 — 14,6 m (zemin kat ticari)
- OSM way 1504691134 building=retail: girdi noktası bu poligonun İÇİNDE (bbox 40.00329-40.00363 / 32.64035-32.64054) → parsel noktası zemin ticari bloğa düşüyor
- OSM way 1422367591 building=apartments (adsız) bbox 40.00331-40.00366 / 32.64058-32.64086 → Yandex Duru noktası bu bloğun içinde
- OSM way 1504691161 landuse=residential residential=apartments (adsız) bbox 40.00319-40.00388 / 32.6402-32.64114 (~77×80 m ≈ 6.100 m², TKGM 5.652 m² ile uyumlu)
- OSM'de bu yapıya ad etiketi YOK (osm-63387-3.json)

### Çelişki notu
- firmasec.com (tarihsiz) Şule Delen Eczanesi'ni "Atakent Mah. 1474 Sk. No:1/A Elvankent" adresinde gösteriyor, telefon aynı (+90 312 260 75 92): https://www.firmasec.com/firma/aerz31-sule-delen-eczanesi — muhtemelen eski adres (2026 nöbet listeleri Göksu'yu veriyor; OSM ve Yandex de Göksu'da).

## Mevcut 532 kayıtla ilişki
- content/siteler'de isim/alternatifAdlar içinde "Duru" geçen kayıt yok; "63387" geçen kayıt yok.
- Point-in-polygon: hiçbir sınır dosyası noktayı içermiyor. En yakınlar: ilgaz-life (63388/3) 136 m, zirveden-goksu (63388/2) 159 m, doga-konutlari (63381/1) 268 m.
- Çalışma ağacındaki eryaman-site-listesi.md / denetim-api.tsv'de de 63387 / Duru yok.

## Komşular / adaş tuzağı
- "Çağ Life Sitesi" (Yandex toponim) 40.003983, 32.641479 — girdi noktasından 103 m DOĞU; OSM'de ayrı landuse (1504691160) ve ayrı apartman bloğu (1422367589) → komşu parsel, 63387/3 değil. Depoda kaydı yok (ayrı aday).
- "Bella Garden Sitesi" 2. İnönü Cad. 31 (Yenimahalle, Susuz) 134-147 m KUZEY — OSM 681358829 addr 31, 15 kat; Susuz = kapsam dışı.
- Adaşlar: "Duru Life Sitesi" Cumhuriyet Mah. Yenimahalle (2,1 km), "Duru Park Sitesi" Çakırlar, "Duru Beytepe" Ahlatlıbel — farklı adlar, karıştırılmamalı. "Göksu Duru" adlı FB kişi profili ilgisiz.

## İlan/geliştirici
- hepsiemlak/emlakjet/zingat/trovit WebSearch'lerinde "Duru Göksu" adlı ilan/proje sayfası bulunamadı; müteahhit bilinmiyor.
- Konut olduğu: TKGM niteliği "12 Katlı Betonarme Apartman" (girdi) + Yandex 'district' (site) tipi + adres "Apt." eki.

## Depo tarihçesi (git, salt okunur)
- Silinmiş kayıt `content/siteler/susuz-mahallesi/cag-life-sitesi.json` (30f27612^ = PR #79 öncesi): isim "Çağ Life Sitesi", adalar 63387/2, "17 Katlı Betonarme Apartman", ~7.841 m² → girdideki 63387/2 komşusu BU. Eski kayıt Susuz'a (Yenimahalle) yazılmıştı; Yandex ise Çağ Life'ı ve Duru Göksu'yu "Göksu Mah., Etimesgut"ta gösteriyor; girdi TKGM mahallesi de Göksu. Mahalle atfı tutarsızlığı not edildi (ilçe sınırı yakın).
- Silinmiş kayıt `content/siteler/susuz-mahallesi/duru-life-konutlari.json`: "Duru Life Konutları" (alt: "Duru Life Sitesi"), adalar 63268/3, sınır merkezi 39.992698, 32.660304 → girdi noktasından 2.082 m. FARKLI site; "Duru" adaşı, karıştırılmamalı.
- Mevcut ağaçta ne "Duru Göksu" ne 63387 geçen kayıt var.

## Karar: KABUL
- Ad ≥2 bağımsız kaynakta aynı yere bağlı (Yandex toponim 33,6 m; AEO nöbet listesi adres kaydı "2. İnönü Cad. No:20/D (Duru Göksu Apt.)" + OSM eczane düğümü 4,0 m + Yandex işletme/toponim No:20 8,9–19,8 m).
- Konut: TKGM "12 Katlı Betonarme Apartman ve Arsası"; zemin kat ticari (Migros, eczane).
- Mevcut 532 kaydın adı/ikinci adı değil; koordinat var (TKGM parsel noktası).
