# goksu/parsel-63387-3 — ÇÜRÜTME denemesi (bağımsız şüpheci, 20.10.2026)

Aday: "Duru Göksu", TKGM 63387/3, 12 Katlı Betonarme Apartman Ve Arsası, 5.652,84 m², nokta 40.003567, 32.640394.
Sonuç: ÇÜRÜTÜLEMEDİ → kabul. Aşağıdaki her satır bu oturumda KENDİ açtığım kaynaklara dayanır (skeptik-*.{txt,json,html} ham dosyaları bu dizinde).

## 1. Parsel poligonu ile nokta sınaması (depo içi TKGM önbelleği, API çağrısı YOK)
Kaynak: /Users/ozgun/websitem/scratchpad-karne/kapsam-2010/tkgm-cache.json (commit c56c8ff4; anahtar .../parsel/124123/63387/3/). Poligon 11 köşe, bbox lat 40.00315–40.00388, lon 32.64021–32.64115, hesaplanan alan ≈ 5.653 m² (TKGM 5.652,84 ile birebir). ilceAd=Etimesgut, kadastro mahalleAd=Eryaman, zeminKmdurum=Kat Mülkiyet.
- Yandex "Duru Göksu" toponimi (40.00346, 32.640762) → 63387/3 İÇİNDE
- Yandex "2. İnönü Cad., 20" house toponimi (40.003494, 32.640671) → 63387/3 İÇİNDE
- OSM Şule Delen Eczanesi node/12863355847 (40.0036024, 32.6403853) → İÇİNDE
- OSM Migros node/12863308750, Yapı Kredi ATM node/12863378764 → İÇİNDE
- OSM apartman bloğu way/1422367591 (4 köşe) → 4/4 İÇİNDE; OSM retail bloğu way/1504691134 (4 köşe) → 4/4 İÇİNDE
- Yandex "Bulut Kule" toponimi (40.004219, 32.640907; parsel noktasından 84,7 m) → 63387/2, /3, /4'ün HİÇBİRİNDE DEĞİL (yol/kuzey); Bulut Kule'nin tapu parseli 63384/1 (silinmiş depo kaydı git 30f27612^, 21.180 m², A/B/C/D blok) → ayrı yapı, adaş tuzağı değil
- Yandex "Çağ Life Sitesi" toponimi (40.003983, 32.641479) → 63387/2 İÇİNDE (komşu, 17 katlı) → 63387/3 Çağ Life değil
Ham: skeptik-tkgm-cache-pip.txt

## 2. Kaynak bağımsızlığı
- Yandex toponimi "Duru Göksu" (source_id 6942549184, tag 'district' = site katmanı; Ilgaz Life, Çağ Life Sitesi ile aynı tip). Yandex'in KENDİ eczane işletme kaydı (oid 146652338870) adresi yalnız "2. İnönü Cad., 20" diyor, "Duru Göksu" geçmiyor → toponim eczane adresinden türetilmiş değil. (skeptik-ysug-*.txt)
- AEO nöbet listesi türevleri (tek aile, birbirinden türemiş): Yeni Ankara 17-18.10.2026 ve 20.08.2026, Ankara Masası 17.10.2026 — üçünü de WebFetch ile açtım: "Göksu Mah. 2. İnönü Cad. No:20/D (Duru Göksu Apt.)" / "Duru Göksu Apartmanı", tel 0 312 260 75 92, başlık Etimesgut-Eryaman. Bu adresi konuma OSM eczane düğümü (parsel içinde, 4 m) ve Yandex "2. İnönü Cad., 20" house noktası (parsel içinde) bağlıyor.
- eczaneler.gen.tr snippet'i: sayfa bana da 403 verdi → DOĞRULANAMADI, ama gerekli değil.
- firmasec.com çelişkisi (Atakent/Elvankent adresi, aynı telefon): sayfa tarihsiz; OSM eczane düğümü v2 27.04.2026, nöbet listeleri 08–10.2026 Göksu diyor → eski adres yorumu makul.
→ İki bağımsız kaynak ailesi aynı parsele bağlı. Üçüncü (ilan/proje/yönetim) kaynak YOK: WebSearch (genel, portal alan adı kısıtlı, "sahibinden/aidat/site yönetimi", "Duru inşaat/yapı Göksu") sıfır; hepsiemlak 403, trovit 401, emlakjet 404, Yandex org sayfası SmartCaptcha (bırakıldı).

## 3. Depo kıyası
- content/siteler: isim/alternatifAdlar içinde "Duru" geçen kayıt YOK (JSON alan bazlı tarama); "63387" geçen kayıt YOK; "2. İnönü" geçen 4 Göksu kaydı (hayal-park, paro-life, kasmir-gol, arissa) başka adalar.
- 532 sınır dosyası: hiçbiri parsel noktasını, Duru noktasını veya Bulut noktasını içermiyor; en yakın ilgaz-life 63388/3 136 m, zirveden-goksu 63388/2 159 m.
- Silinmiş Susuz grubu (git 30f27612^, 205 sınır): hiçbiri noktaları içermiyor; cag-life 63387/2 (123 m), bella-garden 63385/3, bulut-kule 63384/1 (192 m). Silinmiş ağaçta "Duru G*" yok; "Duru Life Konutları" 63268/3 (2,1 km) ayrı site.

## 4. Mahalle / ilçe
- TKGM önbelleği: ilçe Etimesgut (kadastro mahallesi "Eryaman" — idari mahalle değil). Nominatim ters geokod (OSM idari sınır): "2. İnönü Caddesi, Göksu Mahallesi, Etimesgut" (skeptik-nominatim-*.json). Yandex: Göksu Mah., Etimesgut. AEO adresi: Göksu Mah., Eryaman/Etimesgut.
- Karşı etiketler: bilgiemlak "63387 Ada" sayfası (/yer/63387-ada-1691) adayı "Susuz Mh." altında, enlem 40.0031 boylam 32.6411 (ada merkezi) — bilgiemlak etiketi, site adı/mahalle kaynağı değil; eski depo kaydı da 63387/2'yi Susuz'a yazmıştı. TKGM ilçe=Etimesgut olduğundan Susuz (Yenimahalle) dışlanır. İlçe sınırı 2. İnönü Cad. boyunca: kuzeydeki Bulut Kule ve No:31 Bella Garden Yandex'te Yenimahalle/Susuz, güneydeki 63387 adası Etimesgut/Göksu.

## 5. Olgu düzeltmeleri (araştırmacı metnine)
- "Parsel noktası retail bloğu ile apartman bloğu aynı OSM landuse poligonunda": OSM landuse 1504691161'in 7 köşesinden 2'si 63387/3 dışında ve retail bloğu landuse'un dışında bırakılmış bir girintide → landuse argümanı gevşek; ama TKGM poligonu her iki bloğu da kapsıyor, sonuç değişmez.
- "Girdi TKGM mahallesi Göksu": TKGM kadastro mahallesi "Eryaman"; Göksu idari mahalle (OSM/Yandex/AEO).
- OSM eczane/retail/landuse aynı değişiklik kümesinden (changeset 181912051, kullanıcı ankamera, 27.04.2026) — OSM içinde tek kaynak; apartman bloğu ayrı kullanıcı (keyyushi, 14.08.2025).

## 6. Eksikler (kabulü değiştirmez)
Blok/daire sayısı, müteahhit, yapım yılı, ilan/proje sayfası bulunamadı. Zemin kat ticari (Migros, eczane, Yapı Kredi ATM).
