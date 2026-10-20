# Ev sahibi sorgu kalıpları — Google Suggest taraması (KAYNAK 5)

Tarih: 2026-10-20. Salt okunur iş; depoda hiçbir dosya değiştirilmedi.
**Bu bir hacim ölçümü DEĞİLDİR.** Öneri listesi Google'ın otomatik tamamlama artefaktıdır: bir kalıbın görünmesi "insanlar bunu arıyor" demek, kaç kişinin aradığını söylemez. Hacim için GSC'ye bakılmalı (bölüm D).

## Yöntem

- Uç: `https://suggestqueries.google.com/complete/search?client=firefox&hl=tr&gl=tr&ie=utf-8&oe=utf-8&q=<tohum>` (Google arama sayfası DEĞİL), istekler arası 1,6 sn, tarayıcı benzeri UA.
- Toplam **149 istek** (sınır ~150): 
  - (a) 11 × `<mahalle> mahallesi ` + 11 × `<mahalle> sitesi` + 29 × `eryaman <harf> sitesi` + 11 × `etimesgut <mahalle> site` = 62
  - (b) GSC'de 28 günde en çok gösterim alan 15 site sayfası (`node scripts/gsc-api.mjs sayfalar 28`, pencere 2026-09-20 – 2026-10-17) için `<site adı> ` = 15
  - (c) ek: 29 × `eryaman <harf>` (a'daki harf tohumu artefakt verdiği için) + 11 × `<mahalle> mahallesi site` = 40
  - (d) derin sonda: ilk 4 site × `<site adı> <a|y|f|e|d|t|m>` = 28 (aidat / yönetim / fiyat / emlakçı / değer / tapu / m2 harflerini yakalamak için)
  - (e) aday doğrulama: 4 aday adı = 4
- Doğrulama: Yandex suggest-geo (50 sorgu, ll=32.64,39.97), eryaman.bilgiemlak.com.tr arama + /yer sayfaları (≥1 sn), OSM Overpass (1 başarılı sorgu; ilk deneme 502 "kapasite dolu"), WebSearch (5). TKGM ÇAĞRILMADI, Google arama sayfası açılmadı, tarayıcı kullanılmadı.
- Ham veri: `kapsam/oneri-ham/*.json` (149 yanıt), `oneri-sonuc1..4.jsonl`, `oneri-yandex/`, `oneri-bilgiemlak/`, `oneri-dizin.tsv` (520 kayıt + alternatifAdlar), `oneri-top15.tsv`.

### Tohum artefaktları (sonraki taramalar için uyarı)

- `eryaman <harf> sitesi` tohumu harfi açmıyor; Google harfi kelime sanıp "eryaman b sitesi satılık daire" gibi **yankı** döndürüyor (29 tohumun 28'inde yalnız yankı ya da boş yanıt — a/i/o ayrıca bilinen "eryaman sitesi" önerilerini döndürdü, u boş; tek yeni bulgu: `eryaman n sitesi` → "bahçen eryaman sitesi"). Site adı keşfi için `eryaman <harf>` (sonda boşluksuz) tohumu kullanılmalı.
- `eryaman ğ` → `eryaman p` önerilerini döndürüyor (ğ ile başlayan kelime yok, Google normalleştiriyor) — boşa istek.
- `eryaman <harf>` önerilerinin büyük kısmı işletme/okul/ulaşım (avm, eczane, kolej, döviz…); 29 tohumdan site adı çıkan: ç (çocuk evleri sitesi — kurum), e (eryaman evleri), f (fırat rezidans), ı (ılgazlar, ısıkent), ö (özahikent), r (referans, relax, rezidans), u (umut yapı sitesi — Ata/Yenimahalle).

## A. Site düzeyi ev sahibi kalıpları — `<site adı> ` (15 site)

| Kalıp | Kaç sitede (15) | Örnek öneri |
|---|---|---|
| satılık / satılık daire | 15/15 | "oyak 555 konut sitesi satılık daire", "relax göksu konutları satılık" |
| kiralık / kiralık daire | 15/15 | "maviçam sitesi kiralık daire", "koz modern kiralık 1+1" |
| yer niteleyici (eryaman / etimesgut / ankara) | 10/15 | "oyak eryaman 555 konut sitesi", "eryaman kc lale evleri kiralık" |
| yorum(lar) | 9/15 | "oyak 555 konut sitesi yorumlar", "canberk sitesi yorumları" |
| fotoğraflar / resimleri | 5/15 | "polsan 1 bahar sitesi fotoğraflar", "hill tower göksu resimleri" |
| adres / yol tarifi | 5/15 | "canberk sitesi adres", "kaşmir mavi orkide sitesi adres" |
| rezidans eki | 3/15 | "koz modern rezidans", "hill tower göksu rezidans" |
| oda tipi (1+1, 4+1) | 2/15 | "arkadya göksu evleri satılık 4+1" |
| yönetim | 1/15 | "oyak 555 konut sitesi yönetim" |
| sahibinden | 1/15 | "kc lale evleri satılık sahibinden" |
| proje | 1/15 | "oyak 555 konut sitesi projesi" |
| başka ilçedeki aynı ad | 1/15 | "hill tower dikmen" (Çankaya — benzer ad tuzağı) |
| fiyat, değer, aidat, tapu, kat irtifakı, m2, emlakçı | **0/15** | ilk 10 öneride hiç çıkmadı |

## B. Derin sonda — `<site adı> <harf>` (4 site: Oyak 555, Relax Göksu, Mia Concept, Maviçam)

İlk 10'a giremeyen ev sahibi kalıpları harf eklenince açılıyor:

| Kalıp | Kaç sitede (4) | Örnek öneri |
|---|---|---|
| fiyat / fiyatları / fiyat listesi / ev fiyatları | 4/4 | "oyak 555 konut sitesi ev fiyatları", "mia concept konutları fiyat listesi" |
| yönetim / yönetmeliği | 4/4 | "relax göksu konutları yönetim", "oyak 555 konut sitesi yönetmeliği" |
| yorumlar, fotoğraflar, adres / yol tarifi | 4/4 | "mia concept konutları yorumlar", "relax göksu konutları adres" |
| başka il/ilçedeki aynı ad | 4/4 | "oyak 555 konut sitesi antalya/mersin/marmaris", "maviçam sitesi didim/fethiye", "mia concept konutları temelli/mamak" |
| daire planları | 3/4 | "oyak 555 konut sitesi daire planları", "relax göksu konutları daire planları" |
| aidat | 2/4 | "relax göksu konutları aidat", "mia concept konutları aidat" |
| tesisleri | 2/4 | "relax göksu konutları tesisleri" |
| toki | 2/4 | "relax göksu konutları toki", "mia concept konutları toki" |
| telefon (numarası) | 2/4 | "oyak 555 konut sitesi telefon numarası", "maviçam sitesi telefon" |
| durak / otobüs / metro / taksi | 2/4 | "relax göksu konutları durağından geçen otobüsler" |
| değeri | 1/4 | "oyak 555 konut sitesi değeri" |
| teslim tarihi | 1/4 | "oyak 555 konut sitesi teslim tarihi" |
| tapu, kat irtifakı, m2, emlakçı | **0/4** | "t", "m", "e" harflerinde de çıkmadı |

## C. Mahalle düzeyi kalıplar

| Tohum ailesi | Kalıp → kaç mahallede | Not |
|---|---|---|
| `<mahalle> mahallesi ` (11) | satılık daire 11/11, kiralık daire 11/11, posta kodu 11/11, muhtarlık 10/11, kesinti 9/11, yol tarifi 9/11, cadde/sokak 7/11, nöbetçi eczane 6/11, satılık villa 2/11 (Güzelkent, Yavuz Selim), kiralık dükkan 1/11 (Eryaman) | Yeşilova: "4016 cadde / 4014 cadde / 3999 sokak" önerileri **İzmir-Bornova Yeşilova**'ya ait (Yandex: "Atıfbey Sitesi Pool Club … Bornova, Yeşilova Mah., 4016. Sok."). Şeyh Şamil → "sivas", Yavuz Selim → "çubuk" de başka yer. |
| `<mahalle> sitesi` (11) | satılık daire 9/11, satılık 7/11, kiralık daire 5/11, fotoğraflar 5/11, **başka il/ilçe 8/11** | "altay sitesi kumla/van/konya…", "göksu sitesi kağıthane/beykoz/davutlar", "şeker sitesi dikmen/batıkent" — yalın "<mahalle> sitesi" ifadesi büyük ölçüde başka şehirlere gidiyor. |
| `etimesgut <mahalle> site` (11) | satılık daire 10/11, kiralık daire 9/11, siteleri 5/11, **site yönetimi 3/11** (Devlet, Eryaman, Şehit Osman Avcı) | "etimesgut" öneki benzer ad gürültüsünü tümüyle siliyor (0/11 başka yer). |
| `<mahalle> mahallesi site` (11) | siteler 9/11, satılık daire 7/11, site yönetimi 3/11 (Göksu, Şehit Osman Avcı, Şeyh Şamil), "site içi satılık daire" 2/11 | Site adı keşfinde en verimli tohum (Tunahan 10, Yavuz Selim 10, Devlet 10, Eryaman 10, Göksu 10 öneri). |

## D. GSC karşılaştırması (yön verici, 180 gün, kapsam/gsc-q-180g.tsv — paralel oturumun dosyası, salt okundu)

Önerideki kalıbın bizde gerçekten gösterim üretip üretmediği:

| Kalıp | GSC sorgu sayısı | Toplam gösterim | En büyük örnekler |
|---|---|---|---|
| fotoğraf / resim | 66 | 702 | "akşafak sitesi fotoğraflar" 95, "umut sitesi fotoğraflar" 46, "pozitif life yeşilova rezidans fotoğraflar" 41 |
| tapu / irtifak / iskan | 109 | 432 | genel ("tapu harcı hesaplama" 71) — site adına bağlı değil |
| yorum | 43 | 392 | "koz modern sitesi yorumları" 60, "oyak 555 konut sitesi yorumları" 38 |
| yönetim | 7 | 124 | "maybak sitesi yönetimi eryaman" 74, "relax göksu yönetim" 19 |
| siteler | 8 | 65 | "umar siteleri" 25, "eryaman siteler" 6 |
| fiyat | 12 | 19 | "mood göksu fiyat" 3, "meva şehir 2+1 fiyatları" 3 |
| değer | 4 | 4 | — |
| m2 | 4 | 8 | — |
| aidat | 1 | 1 | — |
| daire planları | 0 | 0 | öneride 3/4 sitede var, GSC'de bize hiç gösterim yok |

Okuma: öneride çok görünen "fiyat / aidat / daire planları" bizde neredeyse sıfır gösterim; "fotoğraflar / yorumlar / yönetim" ise hem önerilerde hem GSC'de var.

## E. Site adı keşfi — öneriler + 08.08 arşivi × 520 kayıtlık dizin

### E1. Bu taramadaki önerilerde geçen ve dizinde **bulunan** adlar (eşleşme: isim + alternatifAdlar, Türkçe harf normalleştirme)
Aşiyan, Çağkent, İkizler, Vatan (Devlet; "türkkonut vatan" Yandex'te Devlet Mah.), Selçuklu (Devlet), Atakent, Atakent Vadi ("atakent vadisi"), Bahar, Çiğdem, Cumhuriyet, Doğakent (Eryaman mah.), Eryaman Evleri ("eryaman sitesi"), Oyak Sitesi, Spor Sitesi (gsv-spor-sitesi), Admira, Angora, Mutlu, Yeşil Göl ("yeşilgöl"), Polsan 1 Bahar/Gözde, Konum Eryaman, Meydan Eryaman (Göksu), Akasya, Ardıç, Kutlutaş 2 ("şehit osman avcı cumhuriyet sitesi"), Relax Eryaman, Bahçen Eryaman, Dört Mevsim ("4 mevsim", Şeker), Hill Tower (Şeker) + Hill Tower Göksu, Turkuaz (Şeyh Şamil), Özahikent, Referans Ankara, Ilgazlar, Isı Kent ("ısıkent"), Tunahan, Sutek, Aktürk, Sarıgül, Kur, Canberk, Neopolitan, Age, Maviçam ("türkkonut maviçam"), Yavuz Selim, Utku, Yeşil Göksu, Altay Sitesi (Güzelkent), Göksu Sitesi (Güzelkent), Eryaman Residence → BP Residence Eryaman (Yandex noktası 21 m), Pasaj Eryaman. **Bu taramanın önerilerinde geçip dizinde olmayan konut sitesi yalnızca 1: Fırat Rezidans.**

### E2. Adaylar (dizinde yok, 11 mahalle içinde, kanıtlı)

| Aday | Mahalle | Koordinat (kaynak) | Kanıt | Güven |
|---|---|---|---|---|
| **Fırat Residence** (Fırat Rezidans / "Fırat Residence life") | Altay | 39.965832, 32.647572 (bilgiemlak /yer/firat-residence-life-4850); Yandex 39.966011, 32.647564 | Öneri: "eryaman fırat rezidans" (`eryaman f`), "fırat rezidans eryaman / satılık daire / kiralık / günlük kiralık"; bilgiemlak: "45898 Ada … Altay Mahallesi Konutları, Alanı 920 m²"; Yandex toponym "Fırat Residence, Altay Mah., Etimesgut"; Trovit ilanı "Altay Mahallesi, Fırat Residans, 2+1". 08.08 arşivi (scratchpad-karne/arama-talebi/eryaman-arama-sorgulari-TAM.csv): 8 sorgu ("eryaman fırat rezidans telefon numarası", "eryaman fırat rezidans günlük kiralık" vb.). | Yüksek. Aynı adada (45898) dizinde p2 Mood Street, p3 Vizyon Prestige, p4 Arya Nüans var (5.364–5.729 m²); Fırat 920 m² ile ayrı parsel görünüyor. Arya Nüans'a 66 m. "Günlük kiralık" önerisi apart/konaklama kullanımı da olabileceğini gösteriyor. Fırat Life Style (Botanik, Göksu Prestij, Relax) ile KARIŞTIRILMAMALI. |
| **Lotus Eryaman Sitesi** | Şeker | 39.967907, 32.655514 (Yandex suggest-geo, float32) | Yandex toponym "Lotus Eryaman Sitesi, Şeker Mah., Etimesgut, Ankara"; öneri: "lotus eryaman sitesi / satılık / kiralık / satılık daire / yorumları / fotoğraflar"; 08.08 arşivi: "lotus eryaman satılık daire", "lotus eryaman kiralık". bilgiemlak'ta ve OSM'de yok; web aramasında yok. | Orta. Nokta, dizindeki Rainbow Sitesi (46361/2, 62 m) ile Meydan Cadde (46361/4, 63 m) ARASINDA — aynı adada ayrı bir parsel olabilir ya da bu iki yapıdan birinin pazarlama adı olabilir. Numarataj/TKGM ile ayrıştırılmadan eklenmemeli. |
| **Gölyaka Evleri** | Göksu | 39.999664, 32.645027 (Yandex suggest-geo) | Yandex toponym "Gölyaka Evleri, Göksu Mah., Etimesgut" + işletme kaydı "Konut blokları · Göksu Mah., 5342. Sok., 10"; öneri: "gölyaka evleri eryaman satılık daire", "gölyaka evleri eryaman", "gölyaka evleri satılık eryaman"; 08.08 arşivi: "gölyaka evleri eryaman satılık daire". | Orta-yüksek. En yakın dizin kaydı Mercan Smart House 85 m; ad tamamen farklı. Öneride "avcılar / menemen / istanbul" da var — benzer ad, sayfa adında "Eryaman" şart. |
| **Benna Prestij Sitesi** | Yeşilova | 39.961609, 32.605278 (Yandex suggest-geo) | Yalnız Yandex toponym "Benna Prestij Sitesi, Yeşilova Mah., Etimesgut" (yandex `yeşilova sitesi` sondasında çıktı). Google Suggest "benna prestij " → 0 öneri; bilgiemlak'ta yok; WebSearch'te yok. | Düşük. Tek kaynak; en yakın dizin kaydı Doğan Life 216 m. Yeni proje olabilir. |
| **Tarman (Tarman İnşaat apartmanları)** | Eryaman (bilgiemlak noktaları) | yok — tek bir site noktası değil | 08.08 arşivi: "eryaman tarman konutları", "eryaman tarman konutları satılık daire"; bilgiemlak'ta 4 ayrı "Apt." kaydı: Tarman Apt.1.Blok (39.969868, 32.615326), Tarman Apt.No:256 (39.972164, 32.614475), Gülhan Tarman Apt.No:9 (39.972427, 32.614525), Paşa Dede Apt.(Tarman İnş) (39.971653, 32.615238). Yandex'te sonuç yok. | Düşük. Bir site değil, aynı yüklenicinin tekil apartmanları olabilir; en yakın dizin kaydı Platin 2 Konutları 176 m. |

### E3. Dışlananlar (benzer ad / kapsam dışı / konut değil)

| Öneri | Neden dışarıda | Kanıt |
|---|---|---|
| eryaman umut yapı sitesi | Ata Mah., **Yenimahalle** (27.08'de kaldırıldı) | Yandex: "Umut Yapı Sitesi, Ata Mah., Yenimahalle" |
| eryaman ata mahallesi mutlu sitesi | Ata = Yenimahalle | öneri metninin kendisi |
| mood altınok (GSC 180 günde ~295 gösterim) | Susuz Mah., **Yenimahalle** — eski /mahalleler/susuz-mahallesi/mood-altinok adresi hâlâ gösterim alıyor | Yandex: "Mood Altınok · Konut blokları · Yenimahalle, Susuz Mah."; gsc-qp-180g.tsv |
| park prestij konutları (bilgiemlak, 44769 ada) | "Etikent, Susuz Mh." — Yenimahalle | bilgiemlak /yer/park-prestij-konutlari-44769-ada-4201 |
| rüyakent, liva life, armoni life, taflan, ruşen park, özkardeşler, çağlayan (08.08 arşivi) | hepsi Ata Mah., Yenimahalle | Yandex toponimleri |
| akın kent, çamlıtepe (30 Ağustos), zümrüt park, safran evleri, burç konutları (Süvari), ceylan, kıyıbirlik (Ahi Mesut), tekvak (Piyade), trend life (Ayyıldız), banka blokları (Atakent/Elvankent), çağlayan (Topçu) | Etimesgut'un 11 mahalle DIŞI mahalleleri | Yandex toponimleri |
| eryaman çocuk evleri sitesi | Devlet kurumu (çocuk bakım sitesi), ev sahibi yok | Yandex işletme: "Eryaman Çocuk Evleri Sitesi · Güzelkent Mah., 731. Sok." |
| eryaman has tarhan rezidans | Konaklama işletmesi | Yandex: "Eryaman Has Tarhan Konaklama · Otel · Altay Mah., Söğüt Cad." |
| emlak city eryaman | Emlak ofisi | Yandex: "Emlak City Eryaman · Emlak ofisi · Şeyh Şamil Mah." |
| (4) devlet mahallesi sitesi | 06.10'da 410 ile kaldırıldı (Maliye lojmanı, kat mülkiyeti yok) — öneride hâlâ "4 devlet mahallesi sitesi fotoğraflar" var; YENİDEN EKLENMEZ | proxy.ts KALDIRILAN_SITE_SAYFALARI |
| şeker sitesi / etimesgut şeker sitesi | Gerçek "Şeker Sitesi" Sincan-Ulubatlı Hasan (3,7 km) ve Çankaya-Huzur; Batıkent Şeker Sitesi Yenimahalle | Yandex toponimleri |
| güzelkent sitesi, şeyh şamil sitesi, yeşilova sitesi, tunahan sitesi* | Mahalle adının "sitesi"yle aranması; Yandex yalnız mahalledeki siteleri listeliyor (Güzelkent Sitesi adlı tek kayıt Silivri'de) | Yandex sondaları (*Tunahan Sitesi dizinde ayrıca var) |
| subaylar sitesi (yavuz selim) | Bağcılar/İstanbul ve Bayraklı/İzmir | Yandex işletme kayıtları |
| yeşilova vogue / gümüş / atıfbey, kazan yeşilova | İzmit, Bursa, İzmir-Bornova, Kahramankazan | Yandex |
| mavi çam sitesi alacaatlı, maviçam iasos, hill tower dikmen, hamidiye mahallesi göksu sitesi, şelale mahallesi güzelkent sitesi, huzur mahallesi şeker sitesi | başka ilçe/il | öneri metinleri |
| yavuz selim mahallesi küçük sanayi / yeni sanayi sitesi | sanayi sitesi, konut değil | öneri metinleri |

## F. Yön verici sonuçlar (kapsam dışı ama SEO işine girdi)

1. **Ev sahibi niyeti öneride ikinci katmanda.** İlk 10 öneri her sitede alıcı/kiracı dili (satılık 15/15, kiralık 15/15). Ev sahibine özgü kalıplar (aidat, yönetim, değeri, daire planları, teslim tarihi, yönetmeliği) ancak harf sondasıyla açılıyor; tapu / kat irtifakı / m2 / emlakçı site adıyla birlikte HİÇ görünmedi (0/15 ve 0/4).
2. **"Yönetim" kalıbı gerçek ve bizde gösterim üretiyor** (önerilerde 4/4 sitede; GSC'de "maybak sitesi yönetimi eryaman" 74 gösterim). Mahalle düzeyinde de "etimesgut <mahalle> site yönetimi" 3/11, "<mahalle> mahallesi site yönetimi" 3/11. Site yönetimine başvuran kişi çoğunlukla bir sakin ya da ev sahibidir.
3. **"Fotoğraflar" ve "yorumlar"** hem önerilerde (5/15, 9/15; derin sondada 4/4) hem GSC'de en büyük iki site kalıbı (702 ve 392 gösterim).
4. **"Fiyat / aidat / değeri" önerisi var, GSC'de neredeyse yok** (19 / 1 / 4 gösterim). Kural gereği sitede güncel fiyat rakamı yazılmaz; bu kalıba rakamla yanıt verilemez (aidat da bayatlayan bir rakam).
5. **Benzer ad baskısı yaygın.** Derin sondada 4/4 site başka il/ilçe adıyla tamamlanıyor (Oyak 555: Antalya, Mersin, Marmaris…; Maviçam: Didim, Fethiye, Tuzla…); yalın `<mahalle> sitesi` tohumlarının 8/11'i başka şehre gidiyor. Kullanıcı bunu "eryaman"/"etimesgut" ekleyerek çözüyor (b'de 10/15 sitede yer niteleyici öneri). "etimesgut" öneki gürültüyü 0/11'e indiriyor.
6. **Kalıp biçimi:** ev sahipleri ve arayanlar siteyi çoğunlukla dizindeki tam adla değil kısaltmayla yazıyor ("koz modern sitesi", "kozmodern"; "hill tower göksu rezidans"; "oyak eryaman 555"; "eryaman sitesi" = Eryaman Evleri; "4 mevsim" = Dört Mevsim). Dizindeki alternatifAdlar alanı bunların çoğunu zaten kapsıyor; eksik kalanlar: "Yeşilgöl" (tek kelime) Yeşil Göl için, "4 Mevsim" Dört Mevsim için, "Atakent Vadisi" Atakent Vadi için, "Türkkonut Maviçam" / "Türkkonut Vatan" (Yandex'teki yüklenici önekli adlar).

## Yan bulgu (kapsam dışı, doğrulanmadı)

- Rainbow Sitesi: dizinde `adalar: 46361/2`; bilgiemlak /yer/rainbow-residence-4848 aynı yapıyı "46331 Ada" olarak veriyor. Tek harf farkı — hangisinin doğru olduğu numarataj/TKGM ile ayrıştırılmalı (bu iş TKGM çağırmadı).
