# Dizine eklenecekler — TALEBE GORE sirali (16.08.2026)

Kuyruktaki 160 sayfanin tamami dizin disi TEYITLI (GSC API, 15-16.08).
Kota acildikca bu sirayla istek gonderilir. Akis ve tuzaklar: `gsc-dizin` becerisi.

## Sira neden degisti

Liste 15.08'de mahalleye gore alfabetikti — talebe gore degil. Gunde ancak 10-12
istek gonderebiliyoruz, yani sira dogrudan gecikme demek. 90 gunluk GSC SAYFA
verisiyle (eski + yeni adres BIRLESTIRILEREK) yeniden siralandi:

| Ilk 20 istegin tasidigi talep | gosterim |
|---|---:|
| eski (alfabetik) sira | 503 |
| **talebe gore sira** | **3.396** |
| fark | **6,8 kat** |

En buyuk kayip: **Mes Polaris Evleri** 619 gosterim tasiyor ve eski kuyrukta
115. siradaydi — gunde 10-12 istekle ~11 gun sonrasina dusuyordu.

**160 sayfanin 77'si 90 gunde tek bir gosterim bile almamis.** Kisitli kotanin
yarisi hic aranmayan sayfalara gidiyordu; onlar artik listenin sonunda.

NOT: talep SAYFA boyutundan okunur, sorgu x sayfa boyutundan DEGIL — Google
gosterimlerin %59'unun sorgusunu gizliyor, o dosya gercek talebin %41'ini gosterir.




## ESKİ ADRESLER — BİRLEŞTİRME İSTEĞİ (19.08)

Bunlar dizine GİRSİN diye değil, BİRLEŞSİN diye gönderilir. Hepsi 308 ile yeni
adresine yönleniyor ama Google eski adresi yeniden TARAMADAN yönlendirmeyi
göremiyor; eski adres kendi başına dizinde duruyor ve gösterimi o topluyor.
Dizin isteği eski adrese gönderilince Google 308'i görüp yeni adrese katlıyor —
gösterim yeni sayfaya geçiyor.

ÖLÇÜM (19.08, en çok gösterim alan 150 eski adres):
  123  "Submitted and indexed"  — hâlâ sıkışık, 18591 gösterim
   27  "Page with redirect"     — birleşmiş (harita 16.08'de yayına girdi, 3 günde %18)
Sıkışıkların neredeyse tamamı TEMMUZ taramalı; sıra onlara gelmemiş.

Kaybın büyüklüğü: yalın site adı aramalarında eski adreslerde sıkışan 7.435
gösterim, ada sayfalarındakinden (5.230) daha büyük.

Sıra gösterime göre. Biçim: <90 günlük gösterim> · son tarama

- [x] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/mes-polaris-evleri  <!-- 619 gos · 2026-07-10 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/ata/selvi-evleri-sitesi  <!-- 553 gos · 2026-07-12 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/goksu/goksu-metrokent-sitesi  <!-- 415 gos · 2026-07-15 · 19.08 istek gönderildi -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan/adalar/46493-2  <!-- 22.08: 16.08 SERP'inde sıralanan URL buydu; 308→yeni slug birleşsin (dizin-istegi-kuyrugu.md:282'den taşındı) -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/er-ay-3-sitesi  <!-- 22.08 SERP #3'te eski slug, yeni sayfa #4'ün ÖNÜNDE; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/gozde-91-sitesi  <!-- 22.08 SERP #5'te eski kopya; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/ulas-sitesi  <!-- 22.08 SERP #3-4 çift kopya; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/yenigun-isigi-sitesi  <!-- 22.08 SERP #2-3 çift kopya; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/kucuk-ankara-villalari  <!-- 22.08 SERP #4'te eski slug (#1 yeni); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/postakent-sitesi  <!-- 22.08 SERP #4'te eski slug (#1 yeni); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/adalar/18652-1  <!-- 22.08 Gözde 2 sorgusunda #2 eski slug ada -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent/adalar/18450-1  <!-- 22.08 Portakal Çiçeği 2 sorgusunda #4 eski slug ada -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim/elit-nar-cicegi  <!-- 22.08 SERP #4'te eski slug (#1 yeni); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/tugce-kent-sitesi  <!-- 22.08 SERP #2'de eski slug (yeni sayfa #6'nın ÖNÜNDE); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/yeni-burak-sitesi  <!-- 22.08 SERP #1'de eski slug (yeni #4); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/zadegan-sitesi  <!-- 22.08 SERP #2'de eski slug; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/ozluce-guzelevim  <!-- 22.08 SERP #3'te eski slug; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova/alpar-sitesi  <!-- 23.08 SERP #1'de eski slug (yeni #3); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova/eryaman-port  <!-- 23.08 SERP #1'de eski slug; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova/kocaklar-tower  <!-- 23.08 SERP #2'de eski slug (yeni #3, çift); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu/eceser-sitesi  <!-- 23.08 SERP #3'te eski slug (yeni #1); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu/ma1-tower  <!-- 23.08 SERP #1'de eski slug (yeni görünmüyor); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu/uzunali-goksu-konutlari  <!-- 23.08 SERP #3'te eski slug; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim/metrokent-villalari  <!-- 22.08 SERP #3-5 çift kopya; 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim/turaykent-sitesi  <!-- 22.08 SERP #2'de eski slug (#1 yeni); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/diamond-goksu  <!-- 23.08 "Wind Göksu emlakçı" SERP #8'de eski slug + eski başlık (snippet wind-goksu metni — Google iki kaydı karıştırıyor); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/wind-goksu  <!-- 23.08 wind-goksu yeni sayfası kendi sorgusunda ilk 10'da yok; eski slug 308 doğrulandı, birleşince temsil düzelir -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz/ap-forest-gate  <!-- 23.08 SERP #4'te eski kopya (#1 yeni); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz/green-life-goksu  <!-- 23.08 SERP #3'te eski slug ('ücretsiz değerlendirme' devri metniyle; #1 yeni); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz/neovadi-konutlari  <!-- 23.08 SERP #2+#5 İKİ eski kopya (yeni sayfa #8'in önünde); 308 doğrulandı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/kainat-evler-2  <!-- 23.08 'Kainat Evleri' sorgusunda #2'de eski slug kardeş kaydı (kainat-evleri yeni sayfası #3'ün önünde); kendi yeni sayfası #1'de sağlam; 308 doğrulandı -->
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci/bordo-platinum-residence  <!-- 359 gos · 2026-07-16 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/natura-goksu  <!-- 334 gos · 2026-07-11 · 19.08 DÜŞMÜŞ — eski adres dizinden çıkmış, birleşme kendiliğinden; kota harcanmadı -->
- [x] https://www.siringayrimenkul.com/mahalleler/goksu/kasmir-gol-evleri  <!-- 326 gos · 2026-07-14 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/gulbaran-residence  <!-- 324 gos · 2026-07-09 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/seyh-samil  <!-- 301 gos · 2026-07-16 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/seker/bahcen-eryaman-konutlari  <!-- 287 gos · 2026-07-02 · 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/yavuz-selim  <!-- 265 gos · 2026-07-21 · 19.08 istek gönderildi -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/gold-life-konutlari  <!-- 264 gos · 2026-07-09 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/mercan-life-buse-konutlari  <!-- 236 gos · 2026-07-09 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz/bordo-gol-evleri  <!-- 234 gos · 2026-07-10 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu/yeniceri-kule  <!-- 224 gos · 2026-07-21 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/vera-point  <!-- 221 gos · 2026-07-07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu/polsan1-ayisigi-sitesi  <!-- 219 gos · 2026-07-18 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/gold-stone-evleri  <!-- 218 gos · 2026-07-14 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/alarko-bloklari  <!-- 215 gos · 2026-07-15 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci/relax-goksu-konutlari  <!-- 215 gos · 2026-07-15 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/kainat-evler-2  <!-- 214 gos · 2026-07-11 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet/oz-gimat-sitesi  <!-- 213 gos · 2026-07-16 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/angora-goksu-evleri  <!-- 211 gos · 2026-07-10 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/vera-west  <!-- 204 gos · 2026-07-17 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci/kiratli-residence  <!-- 203 gos · 2026-07-15 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/trend-life-sitesi  <!-- 200 gos · 2026-07-17 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan  <!-- 195 gos · 2026-07-20 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/hittown  <!-- 194 gos · 2026-07-09 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan/kur-sitesi-46495-ada  <!-- 193 gos · 2026-07-17 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/beloren-manzara-evleri  <!-- 193 gos · 2026-07-09 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/inci-park-evleri  <!-- 189 gos · 2026-07-16 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/altay  <!-- 189 gos · 2026-07-24 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu/gsv-spor-sitesi  <!-- 184 gos · 2026-07-25 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil/ozahikent-sitesi  <!-- 183 gos · 2026-07-20 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/tekirdag-park-evleri  <!-- 181 gos · 2026-07-10 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/mavi-bayrak-sitesi  <!-- 180 gos · 2026-07-09 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/elit-yasam-konutlari-3  <!-- 176 gos · 2026-07-07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/vizyon-baspinar-sitesi  <!-- 174 gos · 2026-07-19 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata/efsane-evleri  <!-- 174 gos · 2026-07-07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz/goksu-hisar-evleri  <!-- 166 gos · 2026-07-10 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet/ap-istgate  <!-- 165 gos · 2026-07-09 -->

(Kalan 83 sıkışık adres: scratchpad/sikisik.txt — bunlar site
haritasının kendi hızıyla birleşecek, kota harcanmaz.)

## TUNAHAN — BAYAT ADA SAYFALARI (18.08) — site sayfasını bunlar yiyor

Özgün 18.08'de "yüksel blokları emlakçı" aramasında şunu gördü ve sordu:
"güncel halimiz bu muydu?"
  SERP'te : "17662/1 Ada Satılık ve Kiralık Daireler - Şirin Gayrimenkul"
  CANLIDA : "Tunahan 17662/1 Ada — Tapu ve Blok Künyesi | Eryaman"
Hayır — Google'ın kopyası 26 TEMMUZ'dan. Yani 09.08'de ada başlığından sökülen
ticari kalıbı ve 16.08'de sökülen site adını HİÇ görmemiş.

Kanibalizasyonun mekanizması tam burada: ada sayfası site sayfasını yeniyorsa,
Google'ın elindeki ada kopyası HÂLÂ ticari başlıklı demektir. 16.08 ölçümünde
site sayfasının önüne geçen 5 ada sayfası denetlendi:
  17662-1 (Yüksel)      26.07  BAYAT  <- Özgün'ün gördüğü
  17673-1 (STFA)        27.07  BAYAT
  46512-9 (Su Damlası)  26.07  BAYAT
  17659-1 (Öztaş)       26.07  BAYAT
  46497-2 (Sarıgül)     11.08  güncel — yeni başlığı gösteriyor
  17635-1 (Haznedaroğlu)16.08  güncel
Yani BAYAT olan dördü site sayfasını yiyor, güncel olan ikisi zaten düzelmiş.
İlgili site sayfaları (ör. yuksel-bloklari 16.08'de tarandı) GÜNCEL — sorun
onlarda değil.

Bunlar dizin isteği listesine site sayfalarıyla BİRLİKTE gönderilmeli.

- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/adalar/17662-1  <!-- 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/adalar/17673-1  <!-- 19.08 istek gönderildi -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/adalar/46512-9  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/adalar/17659-1  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/adalar/46493-2  <!-- 22.08 teşhis: Ilgazlar sorgusunda bayat kopya #9, site sayfası #4'te; 16.08 denetiminden atlanmıştı -->

## TUNAHAN — YENİDEN TARATILACAK (17.08, Özgün'ün görünüm kararları)

Bunlar dizinde VAR ama Google'ın kopyası **26-29 Temmuz**'dan kalma — yani
07.08'de alıcı dilinden ev sahibi diline çevirdiğimiz başlığı hiç görmemişler.
SERP'te hâlâ "Eryaman X Sitesi Satılık Daire ve Kiralık Daire" çıkıyor.
Özgün 25 Tunahan sayfasının tamamına "DEĞİŞSİN" dedi; ölçüm gösterdi ki sorun
metin değil TARAMA. Dizin isteği zaten dizinde olan sayfada da yeniden taramayı
tetikler — bu liste onun için.

Sıra talebe göre. Biçim: <90 günlük gösterim> · son tarama

- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/mavicam-sitesi  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/sutek-sitesi  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/klima-bloklari  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/metromall-sitesi  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [x] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/kur-sitesi-46496-ada  <!-- 20.08 istek gönderildi (yeniden tarama) -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/su-damlasi-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/elit-yasam-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/haznedaroglu-bloklari
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/yardimci-bloklari
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/tunahan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/soyak-sitesi

## GÜZELKENT — DİZİNDE AMA BAYAT SİTE SAYFALARI (22.08 SERP turu teşhisi)

SERP'te ilk 10'a giremiyorlar; Google kopyaları 26-27.07'den (eski ticari başlık).
Yeniden tarama isteği gönderilecek (dizinsiz Güzelkent sayfaları yukarıdaki talep
sıralı listede zaten bekliyor; oradaki sıra bozulmasın).

- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/aksu-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/cozum-kent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/erenkoy-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gulenkent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/kardelen-sitesi  <!-- 22.08: bayat 27.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/mesa-sitesi  <!-- 22.08: bayat 26.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/nazlideniz-sitesi  <!-- 22.08: bayat 26.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/portakal-cicegi  <!-- 22.08: bayat 29.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/safi-apak-sitesi  <!-- 22.08: bayat 27.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/sahinbey-sitesi  <!-- 22.08: bayat 26.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/yayikli-4-sitesi  <!-- 22.08: bayat 25.07; SERP ilk 10 dışı -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/1-portakal-cicegi-sitesi  <!-- 22.08: SERP #2 ama başlık çok eski 'Emlakçısı' + eski description; yeniden tarama -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/akkonak-sitesi  <!-- 22.08: SERP #2 ama kopya Temmuz'dan ('ücretsiz değerlendirme'li eski description) -->

## YAVUZ SELİM — DİZİNDE AMA BAYAT SİTE SAYFALARI (22.08 SERP turu teşhisi)

SERP'te ilk 10'a giremiyorlar; Google kopyaları 26-29.07'den. Yeniden tarama isteği.

- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/atadostlar-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/esenkent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/eylul-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/gulvatan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/ozharitacilar-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/pasaj-eryaman
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/safir-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/taskent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/utku-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/endora-eryaman  <!-- 4-10 arası (#6), bayat 26.07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/yavuz-selim-sitesi  <!-- #4, bayat 26.07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/konut-sitesi  <!-- bayat ama sorgu yapısal jenerik; düşük öncelik -->

## ALTAY + ŞEKER — DİZİNDE AMA BAYAT (22.08 gece SERP turu)

- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/ataturk-sitesi  <!-- 16.08 #3 → ilk 10 dışı; bayat 26.07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/cabadag-bloklari  <!-- 16.08 #1 → ilk 10 dışı; bayat 26.07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/rainbow-sitesi  <!-- ilk 10 dışı; bayat 29.07 -->
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/arya-nuans-residence  <!-- #5, ara-dönem başlıklı bayat kopya -->
<!-- NOT: altay/betontas-bloklari BUGÜN (22.08) tarandı, istek GEREKMEZ — yansıma izlenir (Yüksel deseni).
     altay/eryaman-park-evleri DİZİNDEN DÜŞMÜŞ (Discovered) — talep sıralı listede önceliklendirildi. -->

AÇIK İŞ: aynı bayat-kopya taraması 723 sayfanın tamamına yapılmalı. 16.08
ölçümünde 512 site sayfasının 267'si Temmuz'da, 338'i hiç taranmamıştı — yani
bu sorun Tunahan'a özgü değil, korpus geneli.

## ŞEYH ŞAMİL — DİZİNDE AMA BAYAT SİTE SAYFALARI (22.08 gece SERP turu)

GSC API teyitli: dizindeler ama kopya 26.07–03.08 dönemi (eski şablon). İlk 10
dışılar; ilaç metin değil YENİDEN TARAMA (Sarıgül 7→2 kanıtı). Kota açılınca
dizin-dışılardan artan hak bunlara:
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/ak-kent-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/atayildiz-yasam-konutlari ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/baris-sitesi ← 03.08
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/bizim-alperenler-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/eston-bloklari ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/ilkdogus-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/mavera-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/melis-sitesi ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/nisan-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/ovgu-iletisim-sitesi ← 28.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/oz-cozum-kent-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/selinkent-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/sitekonut-sitesi ← 26.07 (ad yapısal zor: 'Site Konut' jenerik)

DOKUNMA notları: sumeyra #2'de bayat kopyayla — tazeleme İSTENMEZ (bayat başlık
sorguyla eşleşiyor). serender 18.08 taze taranmış ama sıralamıyor — tarama işi
değil, izlemeye alındı. duskent #2 / kackar #1 sıralıyor; dizin isteği zararsız
ama acele değil.

## DEVLET — DİZİNDE AMA BAYAT SİTE SAYFALARI (23.08 SERP turu teşhisi)

GSC API teyitli; ilk 10 dışılar, kopya 25.07–30.07:
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/guneyce-sitesi ← 26.07 (23.08 API teyidi; SERP #4 eski başlıkla — Güneyce ofis/Güdül adaşı da var)
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sahil-sitesi ← 27.07 (YS Sahil Kent adaşı da karışıyor)
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sari-cinar-sitesi ← 25.07 ('Sarıçınar' bitişik varyant adayı)
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sozova-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/yeni-huzur-bahcesi-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/yuceyurt-sitesi ← 30.07 (Sivas Yüceyurt Mah. adaşı baskın)

DOKUNMA notları: demirkent 14.08 TAZE taranmış ama sıralamıyor (Sincan OSB + Gölbaşı
adaşları) — tarama işi değil. oray 05.08 + referans 05.08: adaş baskınlığı yapısal
(Kadıköy Oray; Referans Gayrimenkul ofis markası) — tarama düşük öncelik.

## YEŞİLOVA — DİZİNDE AMA BAYAT SİTE SAYFALARI (23.08 SERP turu teşhisi)

GSC API teyitli; ilk 10 dışılar, kopya 26.07:
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/anka-vega ← 26.07 (Vega Emlak ofis adaşı da baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/dogan-city ← 26.07 (müteahhit IG baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/dogan-life ← 26.07 (müteahhit sitesi baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/sertower-busidence ← 26.07 (46395-1 ada sayfamız #3 vitrini tutuyor)

## ERYAMAN — DİZİNDE AMA BAYAT SİTE SAYFALARI (23.08 SERP turu teşhisi)

GSC API teyitli; ilk 10 dışılar, kopya 26.07–01.08:
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/akkonaklar-sitesi ← 01.08 (İÇ ADAŞ: Güzelkent Akkonak eski-slug'u #1'de — birleşme sonrası netleşir)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/bahar-sitesi ← 27.07 (Göksu bahar kardeşleri sorguyu alıyor)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/basak-sitesi ← 30.07 (Başak Emlak ofis adaşı baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/elif-ozgen-sitesi ← 26.07 (48297-1 ada #6 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/endora-park ← 26.07 (kardeş Endora sayfaları temsil ediyor)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/eryaman-evleri ← 26.07 (ad = ofis adı, yapısal zor)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/gunotesi-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/isikkent-sitesi ← 26.07 (İzmir Işıkkent adaşı baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/maximum-konutlari ← 27.07 (Maximum Gayrimenkul ofis adaşları baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/turk-konut-calisanlar-sitesi ← 27.07 (Çankaya Türkkonut baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/platin-konutlari ← 27.07 (kardeş platin-2 #4'te)

DOKUNMA notları: ankapark 17.08 + atakent-sitesi 17.08 TAZE taranmış ama sıralamıyor
(portal/ofis adaşları) — tarama işi değil.

## GÖKSU — DİZİNDE AMA BAYAT SİTE SAYFALARI (23.08 SERP turu teşhisi)

GSC API teyitli; ilk 10 dışılar, kopya 26.07–02.08 (18 sayfa):
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/admira-goksu-konutlari ← 27.07 (neovadi #5 temsil)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/aksafak-sitesi ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/bordo-loca ← 31.07 (Denizli Bordo Loca ofis adaşı baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/doga-konutlari ← 28.07 (63381-1 ada #5 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/enday-sitesi ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-aura-sitesi ← 27.07 (46453-1 ada #4 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-evleri-sitesi ← 26.07 (ŞOA arkadya adaşı karışıyor)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-vadi-konutlari ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksupark-konutlari ← 27.07 (üçlü adaş karmaşası)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/golkent-1-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/golkent-sitesi ← 26.07 (Gölbaşı adaşı)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/havacilar-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/hekimler-ve-saglikcilar-sitesi ← 02.08 (İslamhaneleri adaşı)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/merkez-sitesi ← 26.07 (jenerik ad, yapısal zor)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/park-inci-konutlari ← 27.07 (ŞŞ İnci Park adaşı)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/selale-evleri-sitesi ← 26.07 (Şelale Emlak adaşı)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/seyirtepe-baspinar ← 27.07 (müteahhit baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/sude-konutlari ← 27.07 (48056-1 ada #3 vitrin)

- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/zirveden-goksu ← 31.07 (23.08 API teyidi — dünkü hata kapandı)

DOKUNMA notu: evinora 09.08 taranmış ama sıralamıyor (Kayseri/Keçiören adaşları) — tarama işi değil.

## ŞOA — DİZİNDE AMA BAYAT / ADAŞ-BASKIN (23.08 SERP turu teşhisi)

BAYAT (yeniden tarama):
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/elit-yasam-konutlari-1 ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/gokdemirler-suit ← 26.07

DOKUNMA (taze taranmış, adaş baskın — tarama işi değil): ahikent 02.08 (Eyüpsultan
Ahikent), bossphorus 17.08 ('Bosphorus' tek-s resmi yazım), elit-yasam-2 17.08,
eston 04.08 (ŞŞ eston kardeşleri).

## ATA — DİZİNDE AMA BAYAT SİTE SAYFALARI (23.08 SERP turu teşhisi)

GSC API teyitli; ilk 10 dışılar, kopya 26.07–02.08:
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/ada-loft-eryaman ← 30.07 (müteahhit kanalları baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/atasayanlar-sitesi ← 26.07 (Alacaatlı/İncek adaşları baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/bayer-sitesi ← 26.07 (Bayer Emlak adaşı)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/belmi-kent ← 26.07 (Belmi Emlak ofis adaşı, yapısal zor)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/emin-guven-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/etikent-sitesi ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/genova ← 02.08 (iş merkezi/YS kaydı gürültüsü)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/parkyaman-evleri ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/taflan-sitesi ← 26.07 (Kışlalı Taflan adaşı)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/turuncu-site ← 26.07 (44785-2 ada #4 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/selale-sitesi ← 27.07 (46196-4 ada #1 vitrin)

DOKUNMA notu: cagdas-onur 22.08 taranmış (DÜN) ama sıralamıyor — yansıma bekleniyor, izleme.

## CUMHURİYET — DİZİNDE AMA BAYAT (23.08 SERP turu teşhisi)

DİKKAT: Cumhuriyet'te 8 sayfa UNKNOWN çıktı (10-botanik, ap-istgate, ap-istway,
arissa, batihan, botanik-evleri, konar-manzara, park-sera) — Google bu URL'leri
HİÇ görmemiş; mahallenin ada-vitrin sayfaları siteyi taşıyor. Keşif sorunu
sistemsel olabilir; sitemap taze mi kontrol edilecek.

BAYAT (yeniden tarama):
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/altin-basak-konutlari ← 27.07 ('Altınbaşak' bitişik varyant adayı)
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/city-life ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/greenpark-evleri ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/huzur-park-sitesi ← 27.07
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/nisanur-sitesi ← 26.07
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/guney-park-evleri ← 28.07 (Çankaya Güneypark adaşı baskın)
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/yesil-koru-sitesi ← 26.07 (İstanbul Yeşilkoru adaşları baskın; 23.08 teşhis)

DOKUNMA: natural 14.08 + oasis 15.08 + ender-dogus 02.08 taze taranmış (adaş/vitrin
temsili sürüyor) — tarama işi değil.

## SUSUZ — 23.08 SERP turu teşhisi (TUR BİTTİ — 46 sorgu)

BAYAT (yeniden tarama; kopya 26.07):
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/batimahal-baspinar ← 26.07 (müteahhit kanalları baskın; 'Batı Mahal' ayrık yazım varyant adayı)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/eser-yapi-sitesi ← 26.07 ('Eser Yapı Evleri' Ata Mah. etiketli gürültü)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/dostlar-birikim-sitesi ← 26.07 (SERP #2 ama eski başlıkla)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/merdin-sitesi ← 26.07 (SERP #2 ama eski başlıkla)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/starlife ← 02.08 ('Star Life Gayrimenkul' ofis-marka adaşı SERP'i tutuyor — beklenti düşük)

DİZİNSİZ (istek kuyruğuna):
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/lake-life ← 23.08 dizin dışı teyit (Discovered; 63379-1 ada #2 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/major-goksu ← 23.08 dizin dışı teyit (Discovered; 63377-5 ada #3 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/mavera-goksu ← 23.08 UNKNOWN (Google hiç görmemiş; 63356-1 ada #4 vitrin)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/tatli-yamac-palmiye-evleri ← 15.08 dizin dışı teyit (44784-1 ada #3 vitrin; 'Tatlıyamaç' bitişik varyant adayı)

DOKUNMA (taze taranmış, sıralamıyor — tarama işi değil): cag-life 19.08 (tüm
portallar 'Yakacık Çağ Life' diyor, panel Susuz — mahalle çelişkisi KEOS'la
çözülecek — 23.08 TKGM teyidi: kayıt doğru, Yakacık Çağ Life 6 katlı DIŞ ADAŞ),
goksu-marina 17.08 (portallar 'Göksu Mh. Etimesgut' etiketli; Arus Göksu Marina 2
gürültüsü), serline 20.08 (müteahhit SERGrup kanalları baskın), sky-goksu 18.08
(Yukarıyurtçu Sky-B projesi adı tutuyor — bilinen benzer-ad vakası, yapısal).

## 4-10 KUŞAĞI — DİZİNDE AMA BAYAT (23.08 akşam dökümü; en yakın ilk-3 adayları)

Bu sorgularda İLK 10'DAYIZ ama yanlış sayfayla (mahalle/ada/komşu) veya bayat
başlıkla — site sayfasının Google kopyası 26.07-02.08. İlaç yeniden TARAMA;
tarama gelince doğru sayfa doğru başlıkla yarışır (Serender kanıtı: 18.08
tarama → 23.08 #1).

- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/buse-konutlari ← 26.07 (#4'te Ata adaşımız çıkıyor)
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/kiratli-residence ← 27.07 (#4 mahalle sayfası)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/havuzlu-bahce-konutlari ← 26.07 (#4 kardeş Havuzlu Evler)
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/yavuz-selim-sitesi ← 26.07 (#4 mahalle sayfası; ad=mahalle adı, yapısal zorluk da var)
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/izgi-park-evleri ← 02.08 (#4-7 komşular+ada)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/platin-konutlari ← 27.07 (#4 kardeş platin-2)
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/alpak-neve-armonia-residence ← 26.07 (#5 mahalle)
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/mahal-cag-sitesi ← 26.07 (#5 komşu Liva)
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/yeni-portakal-cicegi-sitesi ← 26.07 (#5 ada)
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/zen-park-plus ← 26.07 (#5 ada; adaş mağaza #1)
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ap-green-tower ← 27.07 (#6 mahalle)
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/inci-life-residence ← 26.07 (#6-10 komşular)
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/zen-park-goksu ← 26.07 (#6 kardeşin adası)
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/meydan-ada-sitesi ← DOKUNMA: 21.08 taranmış, yansıma bekle
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/endora-eryaman ← 26.07 (#6 kardeş Endora Plus; 4'lü aile)
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/dort-mevsim-eryaman-konutlari ← 26.07 (#7 ada)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/konum-eryaman ← 26.07 (#9 ana sayfa; 'konum' jenerik)
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/arya-nuans-residence ← 31.07 (#5 ara-dönem başlık)
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/arissa-goksu ← 26.07 (#4 bayat başlık)
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/su-damlasi-sitesi ← DİZİNDE ama SERP kopyası ESKİ ticari başlık (#5); bugün 'kendiliğinden dizinde' diye istek atlanmıştı — YENİDEN TARAMA İSTEĞİ gerekli (mevcut hükmü isteği engellemez)

DOKUNMA: mavi-bayrak 17.08, meydan-ada 21.08 taranmış (yansıma bekleniyor).
UNKNOWN: altay/metropol-bloklari — istek kuyruğu + bağ pompasına eklendi (23.08).

## Talebi olanlar (83 sayfa) — once bunlar

- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/mercan-life-buse-konutlari  <!-- 236 gos / 7 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/polsan1-ayisigi-sitesi  <!-- 219 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/gold-stone-evleri  <!-- 218 gos / 4 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/trend-life-sitesi  <!-- 200 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/tekirdag-park-evleri  <!-- 181 gos / 6 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ap-istgate  <!-- 165 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/basaksehir-ankara-konutlari  <!-- 148 gos / 5 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/sumeyra-2-sitesi  <!-- 139 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/konar-manzara-evleri  <!-- 137 gos / 6 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/liva-life-yasam-konutlari  <!-- 124 gos / 3 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/cizgi-otesi-residence  <!-- 121 gos / 3 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/anadolu-vizyon-konutlari  <!-- 120 gos / 4 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/kainat-evleri  <!-- 117 gos / 3 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/dogasu-evleri  <!-- 112 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/botanik-park-evleri  <!-- 106 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/zirveden-bati  <!-- 105 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/astim-metrolife  <!-- 92 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/bulvar-1071-sitesi  <!-- 89 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/vera-vista  <!-- 88 gos / 4 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/havuz-kent  <!-- 86 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/bulut-kule  <!-- 78 gos / 6 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/sirin-guneskent-sitesi  <!-- 77 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/arissa-botanik  <!-- 74 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/utkan-sitesi  <!-- 73 gos / 5 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/caglar-belde-sitesi  <!-- 73 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/buyuk-ankara-sitesi  <!-- 68 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/address-enda  <!-- 63 gos / 3 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/gul-sitesi  <!-- 62 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/motto-goksu  <!-- 62 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/panorama-gold  <!-- 61 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/yesiloz-sitesi  <!-- 59 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/liderkent  <!-- 58 gos / 4 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/altas-relax-line  <!-- 58 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ata-yildiz-bati-konutlari  <!-- 57 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ap-istway  <!-- 57 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/camli-klima-bloklari  <!-- 55 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/serline-konutlari  <!-- 54 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/cigdem-sitesi  <!-- 53 gos / 4 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/guldede-sitesi  <!-- 51 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/astim-flora-evleri  <!-- 48 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/relax-eryaman-konutlari  <!-- 47 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gercek-92-sitesi  <!-- 47 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/metropark-concept  <!-- 42 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/park-sera-evleri  <!-- 38 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/arslanlar-sitesi  <!-- 34 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/wind-goksu  <!-- 34 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/mavera-goksu  <!-- 33 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/sehit-ferhat-koc-sitesi  <!-- 32 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/cagdas-onur-sitesi  <!-- 31 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/elele-sitesi  <!-- 29 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/yagan-kent  <!-- 27 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/ay-sitesi  <!-- 27 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/acat-konutlari  <!-- 25 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/okyanus-plaza  <!-- 24 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/hill-tower-goksu  <!-- 23 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/yeni-botanik-sitesi  <!-- 22 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/ozluce-guzelevim  <!-- 20 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/kafdagi-sitesi  <!-- 18 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/oz-muhtar-sitesi  <!-- 17 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/tatli-yamac-palmiye-evleri  <!-- 17 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/address-goksu  <!-- 16 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/akin-688-konutlari  <!-- 15 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/mizan-sitesi  <!-- 14 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/tulip-life  <!-- 13 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/turkkonut-sinem-sitesi  <!-- 12 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/10-botanik-evleri  <!-- 12 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/major-goksu  <!-- 12 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/zadegan-sitesi  <!-- 11 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/1-portakal-cicegi-sitesi  <!-- 10 gos / 2 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/vatan-sitesi  <!-- 10 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/ak-91-sitesi  <!-- 9 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gozde-1-sitesi  <!-- 9 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/izoser-residence  <!-- 9 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-arma  <!-- 6 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/konuta-ozlem-sitesi  <!-- 5 gos / 1 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/renk-villalari  <!-- 5 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/sumeyra-sitesi  <!-- 3 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/manzara-evleri  <!-- 3 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/rayli-sistemciler-sitesi  <!-- 3 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/batihan-konutlari  <!-- 3 gos / 0 tik -->
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/arkadya-goksu-evleri  <!-- 1 gos / 0 tik -->

## 90 gunde hic gosterim almamis (77 sayfa) — en sona

Talebi olan sayfalar bitmeden buraya kota ayrilmamali.

- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/akturk-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/tunahan-mahallesi/ilgazlar-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gozde-2-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/uyum-90-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/paro-life
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/bulvar-312-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/neva-panora-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/akdal-residence
- [x] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/bp-residence-eryaman  <!-- 23.08 DİZİNDE (kendiliğinden, tarama 17.08, SERP #2) -->
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/gokdemir-tower
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/dogus-91-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/erkaraca-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/altas-rezidans
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/endora-goksu
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/denizim-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/lacin-eryaman-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sergah-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-bilge-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/kosk-birlik-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-park-vadi-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/dastarli-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/eryaman-park-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/kuryap-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/goksu-prestij
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/irem-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/utku-kent-2-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/goksu-arma
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/kafdagi-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/tulip-life
- [ ] https://www.siringayrimenkul.com/mahalleler/goksu-mahallesi/utkan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/address-goksu
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/bulvar-1071-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/cicek-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/ictas
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/inci-park-evleri-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/relax-eryaman-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/dogasu-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/liva-life-yasam-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/mizan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/rayli-sistemciler-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/sumeyra-2-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/10-botanik-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/anadolu-vizyon-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ap-istgate
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ap-istway
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/arissa-botanik
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/astim-flora-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/ata-yildiz-bati-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/batihan-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/botanik-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/botanik-park-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/konar-manzara-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/motto-goksu
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/park-sera-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/akasya-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/bossphorus-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/cicek-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/cumhuriyet-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/gode-yasam-konutlari
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/ictas
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/inci-park-evleri-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/kardelen-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/soyak-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/ucyildiz-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/sehit-osman-avci-mahallesi/yildiz-eryaman
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/altay-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/ankolular-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/arzutas-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/ekin-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gordogu-sen-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/gulsah-95-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/ipek-yapi-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/kurtulus-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/kusburnu-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/master-kent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/meltem-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/mesa-calisanlari-kooperatifi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/selale-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/seniz-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/yesim-kent2-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/guzelkent-mahallesi/yukselay-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/acar-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/camlica-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/duskent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/kackar-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/onur-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/ozanadolu
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/gul-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/kosk-birlik-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/kuryap-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/liderkent
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/yagan-kent
- [ ] https://www.siringayrimenkul.com/mahalleler/seyh-samil-mahallesi/yesil-asiyan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/atakent-1-asiyan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/caglar-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/guzel-ankara-evleri-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/ay-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/eryaman-mahallesi/lacin-eryaman-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/mavi-koy-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sedirkent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/vatan-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/dastarli-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/denizim-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/sergah-evleri
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/turkkonut-sinem-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/devlet-mahallesi/yesiloz-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/betontas-bloklari
- [ ] https://www.siringayrimenkul.com/mahalleler/altay-mahallesi/ilbeyi-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/ozenkent-2-villalari
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/sahibin-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/yesil-goksu-konutyapi-kooperatifi
- [ ] https://www.siringayrimenkul.com/mahalleler/yavuz-selim-mahallesi/yunuskent-sitesi
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/lokasyon-eryaman
- [ ] https://www.siringayrimenkul.com/mahalleler/yesilova-mahallesi/gokdemir-tower
- [ ] https://www.siringayrimenkul.com/mahalleler/seker-mahallesi/diamond-residence
- [ ] https://www.siringayrimenkul.com/mahalleler/cumhuriyet-mahallesi/grup-dayanisma-sitesi
- [x] https://www.siringayrimenkul.com/mahalleler/ata-mahallesi/rusen-park-evleri  <!-- 23.08 DİZİNDE (kendiliğinden, tarama 22.08, SERP #2) -->
- [ ] https://www.siringayrimenkul.com/mahalleler/susuz-mahallesi/lake-life

## ADA-TARAMA SIRALAMA KURALI (22.08 gece — İHLAL ETME)

18 sorguda dizinsiz SİTE sayfasının vitrinini şu an ADA sayfamız tutuyor
(arzutas 18644-1, cozum-kent 18480-1, elele 18454-1, gozde-2 18652-1, ipek-yapi
18476-1, konuta-ozlem 18468-1, mesa-calisanlari 18506-1, nazlideniz 18490-1,
portakal-cicegi-2 18450-1, renk 19516-2, sehit-ferhat-koc 18641-1, seniz 18516-1,
yayikli-4 18520-1, eylul 46234-1, gulvatan 19502-1, ozenkent-2 19531-1,
uyum-90 47603-1, ozanadolu 46268-4, dastarli 46519-1, sergah 18675-1, sertower 46395-1, elif-ozgen 48297-1, doga-konutlari 63381-1, goksu-aura 46453-1, sude 48056-1, paro-life 63406-1, utkan 46457-1, rayli-sistemciler 44774-2, lake-life 63379-1, major-goksu 63377-5, mavera-goksu 63356-1, tatli-yamac 44784-1 + yukselay komşu adaları). Bu ada sayfalarının Google kopyaları
ESKİ (site adlı) olduğu için sorguda çıkabiliyorlar — şimdilik İYİ Kİ ÇIKIYORLAR.
KURAL: Bu adalara yeniden-tarama isteği, ANCAK ilgili SİTE sayfası dizine girip
sorguda göründükten SONRA gönderilir (taze ada kopyası site-adsızdır, sorgudan
düşer; erken tazelersek vitrin tamamen boşalır). Site dizine girince ada
tazelenir → kanibalizasyon temiz kapanır (Yüksel/Sarıgül deseni).

EK (23.08 — noindex bulgusu): Şablon bugün PAYLAŞIMLI adalara (aynı adada 2+
site kaydı) robots noindex basıyor (tek-siteli adalar index,follow). Sonuç:
paylaşımlı bir ada taze taranırsa dizinden DÜŞER — bu, site sayfası dizine
girdikten sonra istenen temiz kapanışla aynı, ama siteden ÖNCE yapılırsa vitrin
kalıcı gider. Vitrin listesindeki paylaşımlı adalar (öncelik sırası aynı, ekstra
dikkat): goksu-aura/utkan ortak vitrini 46453-1 + 46457-1 (5'er site!) ve
dastarli 46519-1 (3 site — Alis + Türkkonut Sinem ile ortak). Geri kalan vitrin
adaları tek-siteli, taze tarama başlık tazeler ama site adını başlıktan
düşürür (95f4aef) — kural değişmez: ÖNCE SİTE, SONRA ADA.
Tarih penceresi kanıtı: 28.07–03.08 arası taranan adalar noindex kopyasında
sıkıştı (46493-2 vakası, istek gönderildi); 26–28.07 taramalılar dizinde kaldı
(17662-1, 46196-4, 63379-1 API teyitli).
