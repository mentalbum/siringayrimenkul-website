# Aday: Göksu Kent Konutları (sehit-osman-avci/goksu-kent-konutlari) — KARAR: RET (mevcut kaydın adı)

Tarih: 2026-10-20. Salt okunur inceleme; dosya değiştirilmedi.

## Özet
"Göksu Kent Konutları" Yandex'in **mevcut depo kaydı `sehit-osman-avci-mahallesi/goksukent-sitesi` (Göksukent Sitesi, 46619/4)** için kullandığı yazımdır. Yeni bir site değildir.
Adayın "goksukent-sitesi Yavuz Selim'de" önermesi yanlıştır: kayıt `content/siteler/sehit-osman-avci-mahallesi/goksukent-sitesi.json` yolunda, mahalleSlug `sehit-osman-avci-mahallesi`.

## Kaynaklar (adı konuma bağlayan)
1. **Yandex suggest-geo** (toponim, tags=["district"], kimlik 2216771171)
   URL: https://suggest-maps.yandex.ru/suggest-geo?v=9&search_type=all&part=G%C3%B6ksu%20Kent%20Konutlar%C4%B1&ll=32.652957,39.988503&spn=0.03,0.02&results=7&lang=tr_TR&bases=geo,biz
   Sonuç: "Göksu Kent Konutları, Şehit Osman Avcı Mah., Etimesgut, Ankara"; uri'deki float32 koordinat **lng 32.652897, lat 39.988506**; mevcut kayıt koordinatına (39.988503, 32.652957) uzaklık 5,23 m (Yandex'in kendi `distance` alanı).
   Point-in-polygon: `goksukent-sitesi-boundary.geojson` (46619/4) poligonunun **İÇİNDE** (ham çıktı: yandex_goksukent_konutlari.txt).
   "Göksukent" yazımıyla sorgu da aynı tek toponimi döndürdü (yandex_goksukent.txt); biz tabanında ayrı bir işletme/yönetim kaydı çıkmadı.
2. **OSM Overpass** — way 481425021, `landuse=residential`, `name=Göksukent Sitesi`, merkez 39.9884775, 32.6530243 (toponime ~50 m; aynı poligon).
   Sorgu: nwr name~"G[öo]ksu" around:500 (39.9885,32.6530) — https://overpass-api.de/api/interpreter (ham çıktı: overpass_goksu.json). 500 m içinde "Göksu Kent" adlı başka bir konut poligonu yok.
3. **bilgiemlak** (yalnız konum/blok teyidi, ad kaynağı değil)
   - https://eryaman.bilgiemlak.com.tr/yer/goksukent-sitesi-46419-ada-402 — "Şehit Osman Avcı Mh. Göksukent Sitesi", 11,9 dönüm, koordinat 39.988510, 32.652962 (depo koordinatına ~1 m). Bloklar: 7-A, 7-B, 7-C, 7-D.
   - https://eryaman.bilgiemlak.com.tr/yer/goksukent-sit-7-a-blok-2789 — 7-A Blok: 39.988529, 32.652458; bina katı 8; 32 daire; 3+1 (~130 m²); doğalgaz kombi.
   - https://eryaman.bilgiemlak.com.tr/yer/goksukent-sit-7-d-blok-2792 — 7-D Blok: 39.988350, 32.653439; 8 kat; 32 daire; 3+1.
   Not: bilgiemlak ada etiketi "46419", depo "46619/4" (TKGM). Koordinatlar birebir aynı parsel; etiket farkı bilgiemlak yazım hatası görünümünde. TKGM bu görevde yasak olduğundan doğrulanmadı — mevcut kayıt değişmez, yalnız not.
4. **Web araması** ("Göksu Kent Konutları" Eryaman Şehit Osman Avcı; "Göksukent Sitesi" ...) — bu adla ayrı bir proje/geliştirici/ilan sayfası çıkmadı; sonuçlar Relax Göksu, Maybak Göksupark gibi mevcut kayıtlara ait ilanlar (emlakjet/trovit).

## Adayın "63401/1 çevresi" bağlamı
bilgiemlak: https://eryaman.bilgiemlak.com.tr/yer/63401-ada-1687 — "Göksu Kentsel Gelişim ve Dönüşüm Bölgesi 63401 Ada, **Susuz Mh.**" (Yenimahalle), 39.999115, 32.651031. Yandex toponimine uzaklık **1.192 m**. Yani toponim 63401 çevresinde değil; sorgu span'ı (0.03×0.02) geniş olduğu için listeye girmiş. Depoda 63401 adalı kayıt yok (grep).

## Mevcut kayıtla çakışma
- `content/siteler/sehit-osman-avci-mahallesi/goksukent-sitesi.json`: isim "Göksukent Sitesi", koordinat 39.988503/32.652957, adalar 46619/4, alternatifAdlar YOK.
- Aynı adayı paylaşan diğer kayıt: `kardelen-sitesi.json` (46619/7, alternatifAdlar ["Kardelen Konutları"]) — farklı parsel, çakışma yok.

## Öneri (bu görevde uygulanmadı, salt okunur)
`goksukent-sitesi.json` kaydına `alternatifAdlar: ["Göksu Kent Konutları"]` eklenmesi (kaynak: Yandex toponimi 2216771171). Yeni kayıt AÇILMAMALI.

## Ham dosyalar (bu klasör)
yandex_goksukent_konutlari.txt, yandex_goksukent.txt, overpass_goksu.json, bilgiemlak_goksukent.html, bilgiemlak_goksu_kent.html, bilgiemlak_goksukent-*.html, bilgiemlak_63401.html, bilgiemlak_63401_ada.html
