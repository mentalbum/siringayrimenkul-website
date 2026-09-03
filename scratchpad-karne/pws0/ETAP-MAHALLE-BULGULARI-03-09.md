# Etap ve mahalle sorguları — 03.09 bulguları

## DÜZELTME: "etap sayfaları hiç sıralanmıyor" yanlıştı

02.09 fotoğrafına bakıp "etap sayfalarının kendisi hiçbir etap sorgusunda
görünmüyor" demiştim. Tam geçmiş bunu çürütüyor:

| sorgu | 09.08 | 11.08 | 21.08 | 27.08 | 31.08 | 02.09 |
|---|---|---|---|---|---|---|
| 1. Etap | 1 (ana) | 2 (ana) | 2 (ana) | 3 (ana) | 2 (ana) | **1 (ana)** |
| 2. Etap | yok | yok | 7 (ana) | 3 (ana) | 4 (ana) | **yok** |
| 3. Etap | yok | 9 (ana) | 6 (ana) | 4 (ana) | 5 (ana) | **6 (ana)** |
| 4. Etap | 2 (ana) | 2 (ana) | 2 | 2 (ana) | 2 (ana) | **1 (ana)** |
| 5. Etap | **2 (ETAP)** | **2 (ETAP)** | **2 (ETAP)** | **2 (ETAP)** | 5 (etaplar) | **6 (ana)** |

**5. Etap sayfası 09.08–27.08 arasında dört ölçümde de 2. sırayı KENDİSİ
tutuyordu.** 31.08'de 5.'ye, 02.09'da 6.'ya düştü ve slotu ana sayfaya kaptırdı.
Sayfa 15.08'den beri değişmedi.

Bu, "etap sayfası yarışamıyor" varsayımını çürütüyor: yarışabiliyor, kaybetti.

### Ne oldu? — ölçülen ve ölçülemeyen

27.08–31.08 penceresinde siteye dokunan dört commit var:
`30f2761` Yenimahalle grubu kaldırıldı (27.08), `7fba527` "700'den fazla site"
→ "500'den fazla", 13 yer (27.08), `7579862` sitemap tazelik düzeltmesi (31.08),
`2ad48dc` GA4 telefon olayı (02.09).

**Hiçbiri etap şablonuna dokunmuyor** (`app/mahalleler/[mahalle]/etaplar/`
değişmedi); değişen, her sayfada duran footer.

Ama tek yönlü bir çöküş YOK: aynı pencerede 1. Etap 3→1 ve 4. Etap 2→1
**yükseldi**, 2/3/5 düştü. Yani "27.08 değişikliği etapları vurdu" veri
tarafından desteklenmiyor. Elimizde n=1 gerileme var, nedeni belirsiz.

### Ana sayfa örüntüsü — ölçüldü, ilişki YOK

Gözlem: ana sayfa metninde "1. Etap" 1 kez, "4. Etap" 4 kez geçiyor (ofis
4. Etap Çarşı'da), 2/3/5 hiç geçmiyor — ve 1 ile 4'te 1. sıradayız.
Çekici bir hikâye ama sayı tutmuyor: terim geçiş sayısı ile sıra arasında
rho +0,138, p=0,61. Ayrıca beş etabın adı da **zaten** ana sayfada, footer'daki
"Eryaman Etapları" listesinde. Ana sayfaya etap adı eklemek kaldıraç değil.

## Kapatılan hipotezler (bir daha denenmeyecek)

| Hipotez | Neden kapandı |
|---|---|
| Mahalle sayfasında "emlakçı" kelimesini çoğaltmak | 11 sayfada sabit 9 kez (Şeyh Şamil 12) iken sıralar 4/5/5 ve 7 sayfa ilk 10 dışı — en iyi sıra en yüksek sayımda |
| Sayfaya bölüm/metin eklemek | Ölçülen 19 değişkenin 17'sinde 11 sayfa birebir aynı; değişen 3'ünde ilk 10 dışı grup ilk 10 grubunu hem alttan hem üstten kuşatıyor |
| El yazısı mahalle metnini uzatmak | ilk10 medyan 114 kelime, ilk10 dışı 147 — p=0,073; tek sayfa taraf değiştirince p=0,43 |
| Ana sayfaya etap adı eklemek | rho +0,138, p=0,61; adlar zaten footer'da |
| Ofis mesafesiyle harita kutusunu açıklamak | rho −0,155, p≈0,65. Ofise 2. en yakın mahallede (Şeyh Şamil 1,12 km) 6/6 ölçümde kutuda yokuz; 3,96 km'deki Şeker'de bir kez girdik |

## Harita kutusu — ölçüm düzeltmesi yapıldı

`h` alanının anlamı partiler arasında kaymış (eski: kutudaki sıramız;
01-02.09: kutu var mı). Karne iki yerde yanlış yazıyordu, düzeltildi (commit
`7b3b13a`). Doğru kaynak işletme adı listesi.

Kutu durumu bugünkü hâliyle: kutuda 9 sorgu (8'inde 1., Yavuz Selim'de 2.),
kutu var ama biz yokuz 7 (Göksu, Güzelkent, Şeker, ŞOA, Şeyh Şamil, 2. ve
3. Etap), kutu hiç çıkmıyor 1 (Yeşilova).

Kutuda olmayı belirleyen şey sayfa değil **adımızın sorguyla eşleşmesi**:
kutunun kaydedildiği 36 sorguda ad eşleşmesi olanlarda kutuda olma %81 (13/16),
olmayanlarda %30 (6/20).

### Oynaklık uyarısı
86 ardışık ölçüm çiftinde kutu üyeliği 10 kez değişti (%11,6). Kesin içeride
33 ölçüm / 0 değişim, kesin dışarıda 24 ölçüm / 0 değişim. Oynak olanlar:
**Şeker, 2. Etap, 3. Etap** — bu üçünde "kutudan çıktık" demeden önce ikinci
ölçüm istenir. "Asla girmez" yazılmaz: 7 ölçümde hiç girmemek, gerçek giriş
oranının %35'e kadar olmasıyla uyumlu.

## Sıradaki ölçümler

- **04.09** tarama deneyi başlar (bkz. TARAMA-DENEYI-04-09.md). Şeyh Şamil'in
  3. Etap sayfası deney kolunda — **11.09'a kadar başlığına dokunulmaz**.
- **04–06.09** oynak beş sorgu ikişer kez ölçülür; 5. Etap gerilemesi de
  yeniden ölçülür (2→6 gürültü eşiğinin üstünde ama n=1).
- **07.09** title/H1 donması biter. Mahalle sayfalarının Google kopyası TAZE
  (17.08–03.09) — başlık işi burada okunabilir, bayat kopyalı site
  sayfalarında okunamaz.
