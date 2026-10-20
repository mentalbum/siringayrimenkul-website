# goksu/parsel-63387-2 — ÇÜRÜTME TURU (bağımsız şüpheci, 20.10.2026)

Karar: **KABUL (çürütülemedi)**. Araştırmacının tek açık bıraktığı nokta (Susuz mu Göksu mu) depodaki
TKGM önbelleğiyle ilçe düzeyinde kapanıyor; mahalle düzeyinde de aynı adanın kayıtlı adresleri Göksu diyor.

## 1. Mevcut 532 kayıtla çakışma — YOK
- grep 'çağ life|cag-life' content/ → 0; '63387' content/siteler → 0.
- Nokta 40.003812/32.641801 hiçbir *-boundary.geojson içinde değil (pip-63387-2.py). En yakın: Doğa Konutları 63381/1 185 m, Çınar Göksu 63381/2 231 m, Ilgaz Life 63388/3 258 m — hepsi goksu-mahallesi.

## 2. Parsel kimliği — TKGM (depo önbelleği scratchpad-karne/kapsam-2010/tkgm-cache.json, 20.10)
- 124123/63387/2 → ilAd Ankara, **ilceAd Etimesgut**, mahalleAd (kadastro) Eryaman, nitelik '17 Katlı Betonarme Apartman Binası Ve Arsası', alan 7.841,04, zeminKmdurum 'Kat Mülkiyet', durum 1.
- Önbellekteki poligon (15 köşe, bbox 32.64112–32.64204 / 40.00326–40.00443) eski susuz/cag-life-sitesi-boundary.geojson ile **0,0 m** farkla aynı → aynı parsel (skeptik-eski-caglife-boundary.geojson).
- Aynı adanın /3 (12 kat, Duru Göksu) ve /4 (arsa) parselleri de ilceAd Etimesgut.

## 3. Mahalle çelişkisinin çözümü
Susuz diyenler: OSM is_in (admin_level 8), bilgiemlak etiketi, Moovit özeti, sahibinden 'Site Seçiniz' Susuz listesi (06.07 kaydının kaynağı).
Göksu/Etimesgut diyenler: TKGM ilçe alanı, Yandex toponimi, Remaxnote ilan slug'ı, eczane nöbet listesi (aynı ada), komşu ada icra ilanı.

(a) **TKGM kadastro ayrımı**: Eryaman=124123 Etimesgut; Susuz-İmar=123432 Yenimahalle (hafıza reference_tkgm_and_etap_krokileri.md:34; eski scripts/tkgm-eksik-parsel.py:38 'susuz-mahallesi': [123431,123432,205665]; commit 3916ee08 'Sky Göksu 63356/2 Susuz-İmar').
    124123 altında 63387/2-3-4 ve 63381/1-2, 63388/2-3 DOLU (Etimesgut); eski Susuz parselleri 63384/1 (Bulut Kule), 63385/1 (Serline), 63385/3 (Bella Garden) 124123 altında BOŞ: {"63384/1/": {"hata": 404}, "63384/2/": {"hata": 404}, "63385/1/": {"hata": 404}, "63385/3/": {"hata": 404}, "63387/1/": {"hata": 404}, "63387/5/": {"hata": 404}}
    → Tapu kaydına göre ilçe sınırı 63384/63385 ile 63387 arasından, yani 5331. Cadde (kuzey) ve 2. İnönü Cad. (batı) hattından geçiyor.
(b) **Yandex** (kendim çağırdım, skeptik-yandex-caglife.txt): 'Çağ Life Sitesi | Göksu Mah., Etimesgut' tag district, 33 m; URI gömülü nokta lon 32.641479 lat 40.003983 → 63387/2 poligonu İÇİNDE. Kardeş dosyalar: 'Bulut Kule | Susuz Mah., Yenimahalle' 89 m (5331. Cad. 1DE), '5331. Cad. | Susuz Mah.' 101 m, 'Duru Göksu | Göksu Mah., Etimesgut'. Yandex'in sınırı da aynı cadde hattında — TKGM ile tutarlı.
(c) **OSM sınırı kaba**: content/mahalleler/goksu-boundary.geojson (OSM relation 6747547) köşe 59→60: (32.645069,40.003581)→(32.639254,40.003609) = ~500 m düz çizgi, 5331. Cad.'nin ~100 m güneyinden, 63387/2 ve 63387/3 parsellerinin ve Migros/eczane bloğunun İÇİNDEN geçiyor. Aday nokta bu çizginin 24 m dışında. OSM is_in bu adada güvenilmez.
(d) **Kayıtlı adres, aynı ada**: Şule Delen Eczanesi 'Göksu Mah. 2. İnönü Cad. No:20/D (Duru Göksu Apt.)' — Yeni Ankara 17-18 Ekim 2026 nöbet listesinde 'Etimesgut – Eryaman' başlığı altında; listede 'Susuz' hiç geçmiyor (kendim açtım: https://www.yeniankara.com.tr/ankara/ankara-nobetci-eczaneler-17-18-ekim-2026-hafta-sonu-hangi-eczaneler-acik-186533). OSM node 12863355847 bu eczaneyi 63387/3 noktasının 4 m yanına koyuyor.
(e) **Komşu ada resmî ilan**: Ankara Batı İcra Dairesi ilanı (https://www.turkiyegazetesi.com.tr/resmi-ilan/ornek-no-55-tc-ankara-bati-icra-dairesi-468): tapu 'Etimesgut İlçe, ERYAMAN Mahalle, 63388 ada 2 parsel', adres 'Göksu Mahallesi, 2. İnönü Caddesi, Zirveden Göksu Sitesi No:27-B, Etimesgut' — kadastro Eryaman + idari Göksu kalıbı aynı caddede.
(f) Moovit: sayfa 403 (kardeş moovit-caglife.html + WebFetch TR/EN boş); WebSearch dizin başlığı 'Çağ Life, Yenimahalle nerede…' (site_227997635). Adres metni doğrulanamadı; ters geokod türevi, bağımsız idari kaynak değil.
(g) bilgiemlak: 'çağ' araması Çağ Life vermiyor (bilgiemlak-çağ.html); 63387 ada sayfası etiketi kural gereği ad/mahalle kaynağı değil.

## 4. Ad kaynaklarının bağımsızlığı
- Yandex toponimi (konumlu, parsel içi) — bağımsız.
- sahibinden 'Site Seçiniz' Susuz listesi (Özgün ekran görüntüsü, commit 4fa4ee4f) — bağımsız, ad var konum yok; Susuz etiketi ilan verenlerin girişi.
- Remaxnote slug 'etimesgut-goksu-mah-cag-life-sitesi-kiralik-4-plus1-daire-KKSZyIeN' — sayfa 500 ('SAYFAMIZ BAKIMDADIR'); içerik doğrulanamadı, slug ad+Göksu+konut taşıyor. remaxnote.com ve moovitapp.com alan adına sınırlı aramalar izin sınıflandırıcısınca engellendi.
- Yandex noktası (40.003983/32.641479) eski depo koordinatından (40.00382/32.641539) 18 m farklı → Yandex kaydı bizim sayfadan türememiş.
- Adaşlar: Çağ Life Yakacık (Yenimahalle Yakacık; emlakjet 16325339, emlakclick 43606135, @caglifeyakacik; 5 katlı), Çağ Yaşam Evleri/'Cag Life Houses' durağı (Cumhuriyet, 4,2 km). Her ikisi başka yer; bu parseldeki 17 katlı yapı ile uyuşmuyor.

## 5. Yapılamayanlar
- KEOS mahalle poligonu / numarataj: tarayıcı yasak; curl nonce denemesi izin sınıflandırıcısınca reddedildi. TKGM ilçe alanı + kayıtlı adresler yeterli sayıldı; KEOS yine de son resmî damga olarak önerilir (engel değil).
- Yandex Haritalar geo sayfası 429; web.archive.org erişilemez.

## 6. Yayın notları (karar Özgün'ün)
- 27.08 kararı Yenimahalle grubunu kaldırdı; TKGM bu parseli Etimesgut'a yazdığı için kayıt o gruba hiç ait değildi — Göksu altında açmak kararla çelişmez, 06.07'deki yanlış mahalle atamasını düzeltir.
- Ad: 'Çağ Life Sitesi' (Yandex/Remaxnote biçimi) ya da 'Çağ Life' (sahibinden/Moovit). 'Çağ Life Göksu' hiçbir kaynakta yok — kullanılmamalı.
- Eski URL /mahalleler/susuz-mahallesi/cag-life-sitesi dizinde 80 gösterim/7 tık almıştı (sayfalar28-0609.tsv:87); yeni sayfa açılırsa eski adresten yönlendirme düşünülmeli.
