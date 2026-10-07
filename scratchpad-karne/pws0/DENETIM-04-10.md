# Site denetimi — 04.10.2026 (GSC + GA4 + canlı site)

Yöntem: inline veri toplama (DENETIM-04-10-on-bulgular.md) → 5 mercekli denetçi ajan
(teknik, içerik/kural, dönüşüm, dizin/tarama, algoritma) → her bulguya 1–2 çürütücü →
tamlık eleştirmeni. 42 ajan, 762 araç çağrısı. Ham sonuç: denetim-04-10-ajan-sonucu.json.
24 bulgunun 13'ü çürüdü (çoğu bilinçli kararın beklenen sonucuydu).

## Trafik düşüşü (28g tık −39,5 %) — açıklandı
- Yenimahalle 410 (27.08 kararı): −525 tık; genel blog 410 (07.08): −63; eski adres: −19.
- Yaşayan sayfalar: 1.329→1.074 (−19 %), gösterim −12 %; kaybın ~%60'ı 0 tık veren bilgi
  sorguları ("eryaman nereye bağlı" 1.218→1). Alıcı/kiracı niyeti tık −9,5 %.
- GA4 phone_click 14→14, whatsapp 7→9: dönüşüm düşmedi. Organic Social 11→125 (IG), AI Assistant 17→41.
- Ada ailesi −81 %: 16.08 "ada sayfası siteyi yemesin" manevrasının sonucu (ce068bd), darbe değil.
- PR #90 başlık değişikliği aklandı: deney/kontrol kolu aynı oranda düştü.
- 14–16.09 tümseği ölçüm artefaktı (15.09: 422 masaüstü gösterim @1,0, 0 tık); 17.09 "basamağı" yok,
  doğru taban 10–13.09 → −10,7 %, dört aileye dağınık.
- Eylül 2026 spam update (24.09→, 30.09 ikinci dalga): 24.09 basamağı var; "ana gövde zarar görmedi"
  ve "önce başladı" iddialarının ikisi de çürüdü → KARARSIZ, 30.09 sonrası veriyle tekrar bak.

## Ayakta kalan eksikler (çürütücü onaylı)
1. GBP web sitesi bağının UTM izi 18.08'den beri YOK (sessionMedium=gbp W33'ten beri 0; GSC'de
   /?utm_source=google&utm_medium=gbp 481 gös → 0). Site tarafı temiz → GBP kaydında bağ değişmiş.
   Kanal #1 7 haftadır ölçülemiyor. → Özgün: GBP paneli → Web sitesi alanı UTM'li adrese geri.
2. "500'den fazla site" kalıbı 11 dosya/14 konum (footer her sayfada, ana sayfa meta+SSS+FAQPage
   JSON-LD, 4 statik sayfa meta) + llms.txt'de "522+" ×3. İkinci çürütücü: 04.09 "her N site yasak"
   dersi profil işinde Claude çıkarımı, Özgün'ün siteye dair sözü yok; 15.08 site kuralı #2 "700+
   övünmesi kullanılmaz" (app/page.tsx:181-194) ile iç çelişki var. → ÖZGÜN KARARI.
   "blok blok" ifadesi sitede 15.08'de reddedildi — öneri metinlerinde kullanma.
3. Değerleme formu: contact_form_submit Haz 3, Tem 6, Ağu–Eki 0; anahtar etkinlik değil.
   "form_start 4" ana sayfa arama kutusu. Site sayfası ana CTA (Evinizi Değerlendirelim) izlenmiyor,
   1.166 görüntülemede ~4 tık. → GA4 panel (Özgün) + CTA izleme/WhatsApp'a doğrudan (kod).
4. Sahibinden çıkışı en büyük eylem (60 tık) ama 10 bağdan 1'i etiketli. → sahibinden_click+konum (kod).
5. Mahalle sayfası meta description 236–266 krkt (11/11); mobil kesme ~120. → şablon (kod).
6. GA4 yönetim okunamadı (Admin API 403): veri saklama 14 ay?, iç trafik tanımı?, GSC bağlantısı? → Özgün 5 dk.
7. Bing Webmaster Tools yok (msvalidate yok); IndexNow çalışıyor, eksik olan rapor görünürlüğü. → Özgün 10 dk.
8. Küçükler (kod): güvenlik başlıkları (nosniff, frame-ancestors, referrer, permissions); 4 kayıtta
   ad yazımı (Alis/Aliş, Isı Kent/Işı Kent, Yeni Isıkent, Gode/Göde — başlığa dokunma, gövde düzelt);
   endora-goksu.json:10 Yeni Batı göndermesi; ana sayfa LCP 5,4 s (hero paragrafı animate-fade-up);
   sabit WhatsApp düğmesi kontrast 1,98.
9. GSC'de yalnız URL-öneki mülkü; Alan adı mülkü belirsiz (isteğe bağlı).
10. Dış bağlantı profili: toplam 26; kolaybull 11, premiumeryamanemlak 6 (içeriğimizi kopyalayan rakip), trustindex 3.

## Ölçüldü, temiz
Manuel işlem/güvenlik/HTTPS; sitemap 1.178 adres hepsi 200, 0 hata; canonical 45/45; JSON-LD validator 0 hata;
yasak kelime 0 (kule/kredi/ücretsiz/6-7.etap/fiyat/Yenimahalle); iç bağlarda eski slug/410 yok; NAP tutarlı;
Lighthouse mobil ana 80/96/100/100, site sayfası 97/96/100/100; TTFB 0,17–0,24 s; PR #90 başlıkları dizine girdi (30/30);
çok siteli ada noindex maliyetsiz; /ev-degerleme parametreli adresler zararsız; eski adres sitemap'i robots.ts'teki 15.10 kuralına uygun.

## Düzeltilen ön bulgular
- "Keşfedildi 108 = Altay ada sayfaları" YANLIŞ: Altay adalarının %71'i dizinde; keşfedildi oranı Altay %7,7 / diğer %6,8.
- "eryaman emlakçı" GSC konumu 1,4 harita kutusundaki GBP bağını yansıtıyor (defter 05.09), organik sıra değil.
- 40 ad-değiştirilmiş kopya sayfa / 196 ince sayfa / 603 ada kalıbı: GSC'de zarar yok, "doorway" nitelemesi çürüdü.

## Zamanlama
05.10: PR #90 son ölçümü → lib/baslik-kontrol-kolu.ts silinir → kod PR'ları (3,4,5,8) ondan sonra.
PR #91 (24 sayfa + şablon paragraf) MERGEABLE, 4 haftadır açık — Özgün kararı.

## Yapılanlar (04.10 akşamı, Özgün "sırayla sen yap" kararı)
- PR #91 merge (24 sayfa ikinci paragraf + şablonda \n\n paragraf bölme).
- PR #92 merge — sahibinden_click + konum (10 bağ), degerleme_cta + konum (site_ust/site_banner),
  footer/iletişim WhatsApp konum; karne betikleri iki olayın toplamını okur. Yerelde dataLayer doğrulandı.
- PR #93 merge — mahalle meta description ≤150 (118–145), telefon sonda; SABLON.mahalle 04.10.
- PR #94 merge — güvenlik başlıkları (nosniff, frame-ancestors, referrer, permissions; proxy 410'da da),
  ana sayfa hero paragrafı animasyonsuz (LCP), mobil WhatsApp düğmesi #128C7E. Canlıda başlıklar ve
  harita (Tunahan, 69 tile, konsol temiz) doğrulandı.
- PR #95 merge — Isı Kent/Yeni Isıkent gövde yazımı, Aliş isim, Endora Göksu/Park Yeni Batı temizliği; lastmod.
- PR #96 AÇIK, merge EDİLMEDİ (Özgün kararı): "500'den fazla site" 14 konum + 6 statik description ≤155.
- Yapılmadı: Göde/Gölde (tabela doğrulaması Özgün'de); site CTA'sını WhatsApp'a çevirme deneyi (önce
  ölçüm, 4 hafta sonra karar); llms.txt dinamik sayaç (15.08 kararı gereği duruyor).
- Özgün'ün panel işleri: GBP web sitesi bağı UTM, GA4 (contact_form_submit anahtar, saklama 14 ay,
  iç trafik, GSC bağı), Bing Webmaster Tools.
- 05.10: PR #90 son ölçümü → lib/baslik-kontrol-kolu.ts silinir.
- 04.10 21:20 — PR #96 merge edildi (Özgün). PR #97 merge: kontrol kolu kapandı, SABLON.site 04.10.
- 04.10 22:00 — Ağustos'tan kalma 9 açık PR karara bağlandı: MERGE #41 (harita hata sınırı + ref düzeltmesi),
  #89 (profil defteri sayı iddiası temizliği), #84 (%90 hedefi dokümanı), #16→#98 (Anka Vega 47542/5, yeniden
  uygulandı); KAPAT #38 (#41 kapsadı), #8 (etap Service+ItemList main'de zaten var), #32 (eski FB sayfası),
  #83 (#89 kapsadı; sektortanitim/bulurum bulguları deftere 7a olarak taşındı), #70 (ŞFK tabela kanıtı
  sorunlu-siteler'e taşındı). Açık PR: 0 (#4 de kapatıldı — üç düzeltmesi başka yoldan girmişti).
- 04.10 23:10 — Canlı Lighthouse (mobil, ana sayfa): performans 80→96, LCP 5,4 s→2,4 s (hero animasyonu, PR #94);
  erişilebilirlik tek hata WhatsApp düğmesi 4,13 → PR #99 (#075E54, 7,1). Karne Version 21 yayınlandı
  (gsc-q.mjs depoya, is-takvimi düzeltmesi). 15.10 görevi deftere: sitemap-eski-adresler kaldırma
  (robots.ts satırı + public/sitemap-eski-adresler.xml + GSC).

## 07.10 eki — spam güncellemesi okuması (GSC verisi 04.10'a kadar)
Site sayfaları (ada/blog/Yenimahalle hariç) gös/gün: 10–23.09 **2.223** → 24–29.09 **1.866** → 30.09–04.10 **1.842**
(−%17); tık/gün 41 → 34 → 36; pozisyon 7,5 sabit. Ada ailesi 266 → 159 → 122 (bilinçli erime, ayrı).
Sonuç: 24.09 basamağı Eylül spam güncellemesiyle aynı gün, 30.09 ikinci dalga ek basamak getirmedi,
10 günde toparlanma yok. Sıra sabitken gösterim düşmesi = daha az sorguda gösteriliyoruz; eyleme
dönüştürülebilir bir kalıp yok, 20.10'da yeniden okunacak. GBP bağı 07.10'da hâlâ UTM'siz (GA4 medium=gbp 0).
Diğer oturumlar 05–07.10: PR #100 (sayfa denetimi), #103 (Kurtuluş=Yükselay), #104 (4. Devlet 410),
#105 (hero WhatsApp CTA + başlık deneyi 2 + eski-adres sitemap'i kaldırıldı), #106/#107/#108 (karne 07.10,
hedef sorgular uule ile); deney taraması 76/174 (gece-log).
**07.10 eki-2 — kaybın ayrışması (sorgu sınıfı × sayfa, site sayfaları, günlük ort. 10–23.09 → 24.09–04.10):**
yalın ad 624→525 (−%16), alıcı/kiracı 268→229 (−%15, tık 7,1→7,8), **emlakçı 95→44 (−%54)**, bilgi 6→4.
emlak* sorgularının kaybı neredeyse tamamen **ana sayfada**: 78,9→35,5 gös/gün (−%55), poz 2,98→3,89;
"eryaman emlakçı" günlük gösterim ~15→~5 (poz 1,3–1,6 = harita kutusundaki GBP bağı, defter 05.09).
Yorum: 24.09 sonrası kaybın iki ayağı var — (a) site sayfalarında geniş −%15 (spam güncellemesiyle aynı gün),
(b) ana sayfada emlakçı sınıfı −%55 = harita kutusuna daha az girme (GBP tarafı; 07.10 uule ölçümü 6/17 kutu,
Eylül'de 9/17). GBP açıklama/onay sorunu aynı dönemde → "Açıklamayı kabul etmemiş" oturumuna iletildi.
GSC sorgu boyutu gizlilik süzgeciyle günlük ~990 gös gösteriyor (sayfa boyutu 2.223) — oranlar geçerli, mutlaklar değil.

## 07.10 — harita kutusu hipotezinin SERP sınaması (deney taraması oturumu)

Paralel oturum (GSC kolu) "24.09'dan beri gösterim düştü → muhtemelen harita kutusuna
daha az giriyoruz" hipotezini iletti. Bugün pws=0 + uule(Eryaman merkez) ile sınandı:

**HİPOTEZ DESTEKLENMEDİ.** "eryaman emlakçı": harita kutusu **#1** (Şirin Gayrimenkul –
Eryaman), organik **#2** (ana sayfa). 28.08 bölge turundaki (10/10 noktada kutu #1,
organik 2-3) tabloyla aynı. Yani kutudaki KONUMUMUZ değişmemiş; gösterim düşüşünün
nedeni başka yerde aranmalı (sorgu hacmi, kutunun hangi sorgularda tetiklendiği, ya da
GSC'nin kutu gösterimini ana sayfaya atfetme biçimi).

**Kutu kartından iki ham veri (ölçüm, yorum değil):**
- Yorum **404** / 5,0 (28.08'de 398 idi → yorum akışı sürüyor).
- **Birincil kategori: "Gayrimenkul Danışmanı"** — Ağustos araştırmasında "birincil
  kategori tam uygunluğu" #1 sıralama faktörü çıkmış ve "kontrol et" diye Özgün'ün
  panel listesine yazılmıştı; ölçümle ilk kez görüldü. Hâkim sorgu kelimesi "emlakçı";
  Google'ın TR listesinde "Emlakçı/Emlak Acentesi" ayrı bir kategori. Bu bir
  DEĞİŞTİRME önerisi değil — kategori #1 faktör olduğu için yanlış değişiklik zarar
  verir; Özgün panelde mevcut birincil+ek kategori listesini görüp karar vermeli.
- "Açık · Kapanış saati 19:00" — Ağustos araştırmasındaki "arama anında açık olmak"
  kaldıracı; saatler hâlâ 19:00'da.
> 07.10 düzeltme — harita kutusu hipotezi ÇÜRÜTÜLDÜ (diğer oturum, pws=0+uule): "eryaman emlakçı"da kutu #1,
> organik #2, 28.08'le aynı. Gösterim düşüşü konum kaybı değil; hacim / tetiklenme / atıf — neden bilinmiyor.
> Panel listesine: GBP birincil kategori "Gayrimenkul Danışmanı" (ölçümle ilk teyit) — Özgün kategori geçmişine baksın.
> Eski adresler: deney taramasında 7 eski adres hâlâ sıralıyor, 2'si yeniyi geçiyor (küçük-ankara-villalari,
> konuta-ozlem) → öneri: eski adreslere GSC isteği (308'i yeniden okutur), damla kuyruğuna yazıldı.
**07.10 eki-3 — düşüşün anatomisi (GSC, tam veri; 10–23.09 → 24.09–04.10, günlük ort.):**
- Tüm site, cihaz: masaüstü gös −%23 / tık −%28; mobil gös −%23 / tık −%22; TO ve poz her ikisinde sabit.
- Site sayfaları, önceki TO kovasına göre: TO=0 sayfalar −%18, TO 0–2% −%17, TO 2%+ −%17 → **yatay düşüş**,
  "kalitesiz gösterim temizlendi" hipotezi ÇÜRÜDÜ (ilk ölçümdeki TO artışı filtre+cihaz artefaktıydı, aşağıda).
- Önceki pozisyona göre: poz 1–3 sayfalar −%40 (ana sayfa ağırlıklı), 4–10 −%15, 11+ −%38.
- Tek somut KONUM kaybı: yalın **"emlakçı"** sorgusunda ana sayfa 42,1 → 10,7 gös/gün, poz 3,9 → 6,5
  (Ankara geneli sorgu; masaüstünde 16,5→1,5). "eryaman emlakçı" kutu #1 / organik #2 yerinde (SERP 07.10).
- Görsel arama 35→36 gös/gün (etkisiz), video 0.
- Sorgu sınıfı: yalın ad −%16, alıcı/kiracı −%15 (tık 7,1→7,8!), emlakçı −%54 (ana sayfa), bilgi −%34.
Sonuç: eyleme dönüştürülebilir sayfa/sorgu kalıbı yok; düşüş geniş tabanlı (talep ya da Google'ın
gösterim kesmesi), spam güncellemesiyle aynı gün başladı. 20.10'da yeniden oku; "emlakçı" sorgusu için
uule SERP ölçümü (ana sayfa organik konumu) istendi.
**GSC API tuzağı (07.10 ölçümü):** page FİLTRESİ + device/country BOYUTU birlikte veriyi yarıdan fazla
düşürüyor (31.116 → 13.895 gösterim); cihaz/ülke kırılımı yalnız filtresiz, filtreli analiz page boyutuyla.

## 07.10 — Çıplak "emlakçı" taban ölçümü (paralel oturumun GSC bulgusu üzerine)

Paralel oturum GSC'de tek somut konum kaybını çıplak "emlakçı" sorgusunda
buldu (ana sayfa 42→11 gös/gün, poz 3,9→6,5, masaüstü 16,5→1,5). SERP'te
sınandı — **GSC'yi doğruluyor ve daha sert**:

| tarih | organik | harita kutusu |
|---|---|---|
| 28.08 | **3** | 1 |
| 07.10 | **ilk 10 DIŞI** (2. sayfada da yok) | **1** |

Ölçüm: `q=emlakçı&pws=0&gl=tr&hl=tr` + uule Eryaman merkez (39.9779, 32.6382),
`sonuclar-bolge.jsonl`'e yazıldı (28.08 tabanıyla aynı araç/nokta/sorgu).

### Okuma
1. **Harita kutusu sağlam, organik çöktü.** Kutuda hâlâ #1'iz (ilk üç: biz,
   Ayyıldız, Efor — üçü de Eryaman, yani uule tuttu). Yani bu bir "işletme
   görünürlüğü" kaybı değil, SAYFA kaybı. Harita kutusu hipotezinin
   çürütülmesiyle tutarlı: iki kanal bağımsız.
2. **GSC'den daha kötü.** GSC "poz 6,5" diyor; bu noktadan ilk 20'de yokuz.
   İkisi çelişmiyor: GSC yalnızca GÖSTERİLDİĞİMİZ aramaları ortalıyor, biz
   tek noktadan bakıyoruz. Ama Eryaman merkez bizim en güçlü noktamız
   olmalıydı — oradan düşmüşsek kayıp gerçek.
3. Sayfa 1'de yalnızca 8 organik sonuç var (kutu yer kaplıyor) — slot zaten
   dar, düşüş o yüzden daha keskin hissediliyor.

### İhtiyat
TEK ölçüm. 20.10 okumasında aynı nokta+sorgu tekrarlanmalı; tek seferlik
dalgalanma ihtimali elenmeden "kalıcı kayıp" denmemeli. Karşılaştırma için
bugün ölçülen "eryaman emlakçı" (kutu #1, organik #2) sağlam — yani kayıp
çıplak sorguya ÖZGÜ, marka/bölge sorgularına bulaşmamış.

### Araç notu
`bolge-tur.mjs` ölçüm JS'indeki `loc` seçicisi (`.dfB0uf`/`#swml`) boş
dönüyor — Google arayüzü değişmiş. Protokolde "loc beklenen semti
göstermiyorsa DUR" yazıyor; bu turda uule'nin tuttuğu kutudaki üç Eryaman
işletmesinden doğrulandı, ama seçici güncellenmeli yoksa sonraki turlar
boşuna duracak.
> 07.10 akşam — yalın "emlakçı" SERP ölçümü (diğer oturum, uule Eryaman merkez, pws=0): **organik 28.08 #3 →
> ilk 10 DIŞI** (2. sayfada da yok), harita kutusu #1 değişmedi → GSC'deki 42→11 gös/gün kaybı doğrulandı ve
> organik kanala özgü; harita ve organik kanalların bağımsızlığı bir kez daha tuttu. Tek ölçüm — 20.10 tekrarı
> olmadan "kalıcı" denmez. Sayfa 1'de yalnız 8 organik slot. Araç notu: bolge-tur.mjs loc seçicisi
> (.dfB0uf/#swml) boş dönüyor; bu oturumda onarılıyor. Kota: tavan 11/gün (iki gün teyit), "Hata! Bir sorun
> oluştu" URL'ye özgü ve geçici (kota kanıtı yalnız "Kota Aşıldı"). Eski adres 16 canlı vaka, 11'ine istek.
