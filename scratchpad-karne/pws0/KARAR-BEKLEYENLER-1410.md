# Özgün'ün kararını bekleyen işler — VERİ notu (14.10.2026)

Bu dosya karar vermez, öneri dili kullanmaz. Her maddede dört başlık: **ne ölçüldü / teknik seçenekler / ters gerekçe / Özgün'den istenen.** Rakamın yanında kaynağı yazılıdır.

Ortak kaynaklar ve pencereler:
- GSC 28 gün = **14.09–11.10.2026** (`scratchpad/sayfalar28.tsv`, `sorgular28.tsv`, `sayfa-sorgu28.tsv`, ilk satırdaki `# pencere`). Sorgu×sayfa kırılımı sayfa toplamının %41,4'ünü kapsar (GSC uzun kuyruğu anonimleştiriyor; `gorunurluk/analiz.json` → `sinif_toplam.not`).
- GA4 28 gün = **16.09–13.10** (`scratchpad/ga4-temas28.json` pencere alanı; `gorunurluk/kanal-medium.tsv` aynı çekim, `ga4-ek.mjs`).
- Canlı site kayıtları: `content/siteler/*/*.json` (520 kayıt, `gorunurluk/site-indeks.json`). Kaldırılan Yenimahalle kayıtları: git `650f905^` (203 JSON, bu gece `scratchpad/yenimahalle-410/` altına çıkarıldı).
- Bu gece yazılan hesap betiği: `scratchpad/karar-analiz.py` → `karar-analiz.json` / `karar-analiz.log`.
- GSC URL denetimi (salt okunur API, 14.10 ~23:00): `node scripts/gsc-api.mjs denetle …`, 12 adres.
- GSC günlük seri: `scratchpad-karne/pws0/gsc-q.mjs` (page filtresi + date boyutu; cihaz/ülke boyutu kullanılmadı — 07.10 tuzağı).

---

## 1) Yenimahalle 410 adreslerinde "ad ikizi" vakaları

### Ne ölçüldü
**410 kümesinin bütünü (28g):** 202 eski adres hâlâ gösterim alıyor: **6.049 gösterim / 107 tık** (`analiz.json` → `eski."yenimahalle(410)"`). Sorgu tarafında 117 sorgu "yalnız 410 sayfası görünüyor, canlı varis yok" sınıfında: 2.120 gösterim / 29 tık (`yanlis_sayfa.kaldirilmis_410_*`); en büyükleri ruşen park evleri 140, koruçam sitesi 117, white dream sitesi 113, diamond göksu 93, anadolu vizyon konutları 88, kainat evleri 78 (hepsinin tıkı 0–3).

**Sönme hızı (gsc-q, haftalık, page regex `/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?/`, `scratchpad/olu410-gunluk.tsv`):**

| hafta | gösterim | tık | konum |
|---|---:|---:|---:|
| 24–30.08 | 7.337 | 169 | 7,59 |
| 31.08–06.09 | 6.192 | 150 | 7,60 |
| 07–13.09 | 4.350 | 80 | 7,61 |
| 14–20.09 | 2.454 | 42 | 7,85 |
| 21–27.09 | 1.586 | 35 | 8,03 |
| 28.09–04.10 | 1.047 | 16 | 8,01 |
| 05–11.10 | 741 | 13 | 8,17 |

24.08 haftasından 05.10 haftasına gösterim **−%90**, tık 169 → 13. (Görev metnindeki "%78" farklı bir pencereye ait olmalı; bu seri doğrudan ölçümdür.)

**"Ad ikizi" tanımı (bu notta):** 410 dönen eski sayfa bir sorguda görünüyor VE kaldırılan kaydın adı/alternatif adı (tam ad, çekirdek değil) canlı bir Eryaman kaydının adı/alternatif adıyla birebir eşleşiyor. Tarama: `sayfa-sorgu28.tsv`'deki her 410 satırı × `content/siteler` + `yenimahalle-410` ad dizini (`karar-analiz.py` §1). `analiz.py`'nin "+410 ad ikizi" etiketi de yeniden üretildi (çok sayfalı 3, tek sayfalı 6 sorgu) ve aşağıdaki listeyle çakıştırıldı.

**Sonuç: ad-ikizi vakası 5 kayıt çifti, bunların yalnız BİRİ hacimli.**

| # | sorgu | 410 adres | gös/tık/poz | canlı varis adayı | aynı site mi? (kanıt) |
|---|---|---|---:|---|---|
| 1 | **göksu hisar evleri** | /mahalleler/susuz-mahallesi/goksu-hisar-evleri | **157 / 0 / 7,74** | /mahalleler/goksu-mahallesi/**ma1-tower** (alternatifAdlar: "Göksu Hisar Evleri", "MA1 Yapı", "MA1 Sitesi") | **BELİRSİZ.** 410 kaydı: Susuz, ada/parsel **63929/3**, tapu "17 katlı A + 16 katlı B blok", parsel ~14.750 m², koordinat 40,011097/32,632622. Canlı kayıt: Göksu, **64517/1**, 5.534 m² "Arsa", 118 konut, 40,007739/32,636384. Aralarında **492 m**, ada/parsel ve mahalle farklı, parsel alanı 2,7 kat farklı. MA1 açıklaması "haritalarda 'Göksu Hisar Evleri' adıyla da etiketlenir" diyor (24.07 zenginleştirme, kaynak belirtilmemiş). Bellekteki "benzer adlı proje tuzağı" (Sky Göksu) örüntüsüyle aynı. |
| 1b | göksu hisar evleri satılık | aynı 410 adres | 26 / 0 / 6,77 | ma1-tower | aynı |
| 1c | başkent göksu sitesi | aynı 410 adres | 1 / 0 / 10 | — | gürültü |
| 2 | palmiye evleri eryaman · palmiye evleri ata mahallesi | /mahalleler/ata-mahallesi/palmiye-evleri | 1 + 1 / 0 | /mahalleler/altay-mahallesi/palmiye-evleri | **FARKLI site, aynı ad.** 44784/1 (Ata, 5 blok, 19.783 m²) vs 45889/4 (Altay); **5.451 m**. Canlı sayfa "palmiye evleri eryaman"da zaten görünüyor (poz 8). |
| 3 | paşa evleri satılık daire | /mahalleler/ata-mahallesi/adalar/44753-1 (Paşa Evleri, alt "Paşa Sitesi") | 1 / 0 / 11 | /mahalleler/eryaman-mahallesi/pasa-konaklari (alt "Paşa Sitesi") | **FARKLI site**; yalnız alternatif ad çakışması; 3.175 m. |
| 4 | akasya sitesi | /mahalleler/cumhuriyet-mahallesi/akasya-sitesi | 1 / 0 / 12 | /mahalleler/sehit-osman-avci-mahallesi/akasya-sitesi | **FARKLI site, aynı ad.** 43254/4 (Cumhuriyet, 10.072 m²) vs 46653/1 (ŞOA); 2.914 m. Canlı ŞOA sayfası "akasya sitesi eryaman"da 54 gös/poz 6,5, "akasya sitesi kiralık daire"de 11 gös ile görünüyor (eski şema /sehit-osman-avci/akasya-sitesi de 11+12 gös alıyor — bu 410 değil 308 vakası). |
| 5 | özkardeşler sitesi | /mahalleler/ata-mahallesi/selale-sitesi | 1 / 0 / 11 | /mahalleler/guzelkent-mahallesi/selale-sitesi | **FARKLI site** (46196/4 vs 18451/1, 1.377 m); sorgu adı kaydın adı değil, 1 gösterim, gürültü. |

`analiz.py`'nin ayrıca etiketlediği "eryaman mutlu sitesi satılık daire" (410 ada 45836-1 = Şirin Güneşkent) ve "göksu mutlu sitesi" (canlı havuzlu-evler) sorgu-metni eşleşmesidir, ad ikizi değildir; "akasya sitesi kiralık (daire)" çiftinde 410 sayfası hiç görünmemiştir (etiket yalnız ad dizininden gelmiş).

**1 numaralı vakanın ek ölçümleri:**
- 410 sayfası sönmüyor: günlük seri (gsc-q, page equals) 24–30.08 haftası 64 gösterim → 05–11.10 haftası 59 gösterim; konum 6–8 bandında sabit. Küme −%90 erirken bu adres yerinde duruyor.
- Canlı aday ma1-tower: GSC'de **90 günde (14.07–11.10) sıfır satır** (hiçbir sorguda görünmemiş); URL denetimi: DİZİNDE, "Submitted and indexed", son tarama 08.10 07:00Z.

### Teknik seçenekler
- **A — Olduğu gibi (410):** proxy.ts `KALDIRILAN_BOLGE_ONEKLERI` dokunulmaz. Göksu Hisar adresi 410 döndüğü hâlde 7 haftadır aynı gösterimi alıyor; kümenin geri kalanı −%90.
- **B — Yalnız bu adrese 308:** `next.config.ts` redirects'e `/mahalleler/susuz-mahallesi/goksu-hisar-evleri` (ve `/mahalleler/susuz/goksu-hisar-evleri`) → `/mahalleler/goksu-mahallesi/ma1-tower`. Mekanik olarak mümkün: proxy matcher `/mahalleler/susuz-mahallesi/:path*` yolunu yakalıyor; Next'te redirects proxy'den ÖNCE çalışır (next.config.ts yorumu, 27.08: "önce 308'e düşer, oradan buraya gelir" zinciri tersi yönde ölçülmüş), yani tekil redirect kuralı proxy'yi geçer. Tek adres işi; bölge öneki değişmez.
- **C — Alternatif adı canlı kayıttan çıkarmak:** ma1-tower.json `alternatifAdlar` içindeki "Göksu Hisar Evleri" ifadesi (24.07 zenginleştirme) — iki kayıt farklı yapıysa bu ad yanlış kayıtta duruyor demektir. İçerik dosyası değişir → `npm run lastmod -- --yalniz-gecmis`.
- 2–5 numaralı vakalar 1–2 gösterimlik; aynı adlı başka siteler; canlı sayfalar o sorgularda zaten ya görünüyor (2, 4) ya da sorgu adı kaydı tutmuyor (3, 5). Bunlar için teknik iş yok.

### Ters gerekçe
- **27.08 kesin karar:** Ata/Susuz/Cumhuriyet siteden kaldırıldı, "Eryaman" denmez, yeniden ekleme önerilmez (`project_eryaman_scope.md`, 3. kapsam değişimi). B seçeneği bir Susuz adresini Eryaman sayfasına bağlar; kayıt gerçekten aynı yapı değilse 27.08 kararının "Yenimahalle'ye Eryaman deme" kuralını adres düzeyinde çiğner.
- **Aynı site olduğu kanıtlanmadı:** ada/parsel, mahalle, parsel alanı ve 492 m fark; tek bağ 24.07'de kaynaksız yazılmış alternatif ad. "Çelişkili kaynak = ekleme" (`feedback_data_integrity_no_fabrication.md`); bellekteki Sky Göksu vakasında 4 kaynak aynı yanlış varlığı doğrulamıştı.
- **Yönlendirme kazancı ölçülmedi:** 10 eski→yeni adres çiftinde eski adres sönünce yeni adres gösterimi hiç artmadı (828 → 828; `kaldirac-defteri.json` "Eski adresi yeniden taratma" okuma_0810). 308'in gösterimi "taşıdığı" varsayımı sitede desteklenmiyor.
- Sönme zaten işliyor: küme 6 haftada −%90; proxy.ts'nin gerekçesi (410 > 301, tarama bütçesi) olduğu gibi duruyor.

### Özgün'den istenen
1. Göksu Hisar Evleri (Susuz, 63929/3) ile MA1 Tower (Göksu, 64517/1) **aynı yapı mı, komşu iki ayrı proje mi?** Saha bilgisi ya da TKGM koordinat sorgusu (kota ~400/gün, `reference_tkgm_and_etap_krokileri.md`) karar verdirir.
2. Aynı yapıysa B mi C mi (ya da ikisi); farklı yapıysa C (alternatif adın kaldırılması) yapılsın mı.
3. 2–5 numaralı vakalar için iş istenmiyor; yalnız kayıt.

---

## 2) Ada sayfasının site sayfasını geçtiği ve site sayfasının hiç görünmediği vakalar

### Ne ölçüldü
Tanım: sorgu bir canlı site adını içeriyor; o sorguda gösterim alan sayfalar arasında **beklenen site sayfası yok**, en çok gösterimi **ada sayfası** almış (`karar-analiz.py` §2; `analiz.py`'nin "tip=ada, beklenen görünmedi" etiketiyle birebir aynı 7 çok sayfalı sorgu + tek sayfalı ekler). Toplam 27 sorgu bu tanıma giriyor; 17'si 1–3 gösterimlik. Ana 7 vaka ve URL denetimi (14.10 gece, API):

| # | sorgu | ada URL (gös/tık/poz) | site URL | API hükmü (son tarama) | site sayfası 28g (başka sorgularda) |
|---|---|---|---|---|---|
| 1 | durtaş 91 sitesi | guzelkent-mahallesi/adalar/**18484-1** (54/0/9,43) [+18485-1 3, ak-91 4, doğuş-91 1] | guzelkent-mahallesi/durtas-91-sitesi | DİZİNDE, Submitted and indexed, **14.10 09:24Z** | 16 gös / 0 tık / 6,8 |
| 2 | dalgıç rezidans | sehit-osman-avci-mahallesi/adalar/**46654-5** (42/0/10,5) [+46654-6 1, 46654-8 1] | sehit-osman-avci-mahallesi/dalgic-residence | DİZİNDE, **14.10 09:37Z** | 5 / 0 / 5,8 |
| 3 | koçaklar tower | yesilova-mahallesi/adalar/**47540-2** (29/0/8,17) [+mahalle 1] | yesilova-mahallesi/kocaklar-tower | DİZİNDE, **14.10 10:10Z** | 1 / 0 / 5,0 |
| 4 | gülvatan sitesi | yavuz-selim-mahallesi/adalar/**19502-1** (25/0/8,92) [+mahalle 4] | yavuz-selim-mahallesi/gulvatan-sitesi | DİZİNDE, 07.10 12:19Z | **0** |
| 5 | nefeskent sitesi | sehit-osman-avci-mahallesi/adalar/**46667-4** (21/0/10,43) [+mahalle 1] | sehit-osman-avci-mahallesi/nefeskent-sitesi | DİZİNDE, **14.10 09:02Z** | 8 / 0 / 6,5 |
| 6 | gözde 91 sitesi | guzelkent-mahallesi/adalar/**18641-1** (5/0/10,4) [+18642-1 5] | guzelkent-mahallesi/gozde-91-sitesi | DİZİNDE, 09.10 18:02Z | 8 / 0 / 9,3 |
| 7 | gsv spor sitesi | goksu-mahallesi/adalar/**46465-1** (1/0/2,0) [+3 başka site 1'er] | goksu-mahallesi/gsv-spor-sitesi | DİZİNDE, 16.09 00:20Z | **0** |

Tek sayfalı ekler (sorguda yalnız ada sayfası var): eylül sitesi → 46234-1 (19/0/10,26), site eylul-sitesi DİZİNDE 29.09, 28g 75 gös/8,7; genç avrasya sitesi → 46239-1 (5/0/10,2), site DİZİNDE 26.09, 28g 2; yeni huzur bahçesi sitesi → eski şema /devlet/adalar/18677-1 (31/0/5,61), site yeni-huzur-bahcesi-sitesi DİZİNDE 05.10 (`gorunurluk/denetim-sonuc.tsv`), 28g 0.

Ada sayfalarının kendisi de dizinde: 18484-1 (son tarama 07.10) ve 46654-5 (12.10) "Submitted and indexed", Google kanoniği adanın kendisi (16.08 ölçümüyle tutarlı).

Yedi vakanın yedisinde ada, beklenen sitenin kendi adası (`ada_beklenen_sitenin_adasi: True`). 7 site sayfasının 7'si dizinde; 4'ü 14.10 sabahı yeniden taranmış (sitemap tabanı 04.10'da ilerlemişti). Tıkların tamamı 0: ada sayfaları 28g 4.751 gösterim / 43 tık / TO %0,91, 522 sayfanın 488'i tıksız (`analiz.json` → `aile`).

Bağlam: SERP'te ada sayfası çıkan site sorgusu 42 (31.08) → 22 (06.09) → 12 (07.10); ada sayfası haftalık GSC gösterimi 3.362 (27.07) → 657 (28.09), site sayfası aynı dönemde 11.162 → 11.883 (`kaldirac-defteri.json` "Ada başlığından site adını çıkarma", okuma_0810).

### Teknik seçenekler (her biri için ters gerekçe yanında)
- **A — Bekle:** devir ölçülmüş (42→22→12 vaka; ada gösterimi 5 kat eridi). Ters: 7 vakanın 4'ünde site sayfası aynı sorguda sıfır; "bekle" ne zaman biteceğini söylemiyor.
- **B — Ada → site 301 (yalnız bu 7 ada):** next.config.ts'e 7 kural. Ters: "hiçbir sayfa silinmez/noindex yapılmaz (açıkça istenen hariç)" kuralı — 301 ada sayfasını fiilen kaldırır; ChatGPT 07.10 istişaresinde "1:1 ada 301'i (8 vaka)" için **dokunma** denmişti (`PROTOKOL-gece.md` 07.10); ada sayfası sitenin tapu/blok künyesi, kopya değil (bu yüzden canonical de reddedildi).
- **C — Canonical/başlık:** zaten yapıldı: canonical site sayfasına (03.08), başlıktan site adı çıkarıldı (16.08). Ölçüm: 34 taranan sayfada kabul **2/34 = %6** (`ada-canonical-olcumu-2026-08-16.md`); 30 sayfada 17/17 Google kendi adresini seçti (31.08). Ters: kaldıraç defterde **çürük**; tekrar deneyecek bir şey yok.
- **D — noindex / sitemap dışı:** kuralla yasak; ayrıca defterde çürük (ada sayfaları tarama bütçesi yemiyor: 7 günde site 10/30, ada 4/30 taranmış, 31.08).
- **E — Site sayfasına dizin isteği:** 7'si zaten dizinde ve 6'sı Ekim'de taranmış; "istek → sıra" bağı zayıf (altıda üç, defter). Ters: kota 11/gün ve Başlık deneyi 2'ye tahsisli (14–21.10, 67 istek).
- **F — Site sayfasına içerik:** "yalın ad içerik çıkmazı" (`project_yalin_ad_icerik_cikmazi.md`), 31.08 ölçümü: 4–10 bandındaki açıklamalar ilk 3'tekilerden uzun; PR #91 okuması zayıf olumlu, anlamlı değil (Fisher p=0,50).

### Özgün'den istenen
- B (7 adaya 301) **açıkça istenirse** yapılır; istenmezse A sürer ve 04.11'de aynı tanımla yeniden sayılır. Kural gereği bu notta B önerilmiyor; karar Özgün'ün.

---

## 3) Bing: Webmaster Tools kaydı + Bing Places kontrolü

### Ne ölçüldü
- **Bu gece (14.10), gerçek tarayıcı — görev metninden:** `site:` sorgusu 50 sonuç gösterdi (eski şema adresler dahil: "mahalleler › eryaman"); "eryaman emlakçı"da Bing harita paketi Tekinşahlar / Ayyıldız / Ekol, biz yokuz; organik ilk 10'da yokuz.
- 07.10 paneli: Bing dizini **~50 / 1.178** adres (`SIP-DIYE-PLAN-07-10.md` §3.5); bu gece çekilen canlı sitemap'te **1.178** `<loc>` (`scratchpad/rakip/biz-sitemap.xml`).
- Bing kaynaklı trafik (GA4 28g): `bing / organic` **6 oturum / 3 etkileşimli** (`kanal-medium.tsv`); sip-diye ajan notu 28g 8 oturum (07.10).
- **Site tarafı:** Bing Webmaster Tools **kaydı yok**, `msvalidate` meta yok (`app/layout.tsx` verification alanında yalnız `yandex: "2cc35b6ab01f7026"`; `DENETIM-04-10.md` #7). **IndexNow çalışıyor:** `scripts/indexnow.mjs`, anahtar dosyaları `public/07db06e6….txt` ve `public/4f66b60d….txt`; 07.10'da hakkımızda + 520 site sayfası bildirildi, Bingbot/OAI-SearchBot/GPTBot/PerplexityBot 200 (`PROTOKOL-gece.md:877`). Yani Bing'e "bildirim" var, "rapor/tanı" yok.
- **Bing Places (bellek `reference_bing_places_kaydi.md`):** kayıt "Şirin Gayrimenkul – Eryaman", bizid `cabfc4da-ac00-4cfc-83ba-a0a3d9b6500b`, ~07.08 GBP importu, doğrulama tamam, 12.08'de "7–12 gün içinde yayımlanacak"; giriş **bingplaces.com → "Google ile devam et" → 1hamza.sirin@gmail.com**; ozgundeniss ile ikinci kayıt açılamadı (12.08 "zaten başka kullanıcıya bağlı" hatası). NAP kaynağı GBP, haftalık senkron.
- **Herkese açık Bing kartı (07.10, `sip-diye-ajan-sonucu-0710.json` satır 88–92):** ad "ERYAMAN ŞİRİN GAYRİMENKUL - EMLAK DANIŞMANLIĞI -EMLAKÇI", kategori Emlakçı, 208. Sokak 4, saatler GBP ile aynı, **ypid YN90F3FA9E81699BCE**, "İşletmeyi yönetin" bağı `bingplaces.com/DashBoard/Edit?Id=YN90F3FA9E81699BCE`. Bu ad GBP adıyla ("Şirin Gayrimenkul – Eryaman") **uyuşmuyor**; aynı ad dizesi Trustindex kartında da duruyor (madde 5). İki kayıt (cabfc4da / YN90F3…) aynı mı ayrı mı — panel açılmadan bilinmiyor.

### Teknik seçenekler
**BWT kaydı — GSC içe aktarma yolu (Bing resmi blog, blogs.bing.com/webmaster/september-2019/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools; 14.10 çekildi):**
1. bing.com/webmasters → oturum aç (Microsoft/Google/Facebook). Hesap seçimi aşağıda.
2. "My Sites" / karşılama ekranında **Import** (Google Search Console'dan içe aktar).
3. Google oturumu → **Allow**: Bing, GSC'deki doğrulanmış mülk listesi + sitemap'lere erişim ister.
4. Listeden `https://www.siringayrimenkul.com/` seç → **Import**. Doğrulama otomatik; trafik verisi 48 saate kadar gecikir.
5. Sonra: Sitemaps'e `https://www.siringayrimenkul.com/sitemap.xml`; "URL Submission"a ana sayfa, /mahalleler, /siteler, /etaplar + 11 mahalle sayfası (plan §3.5 listesi); "Site Explorer / Index"ten 50 sayfalık kapsamın neden 50'de kaldığına bakılır (tanı burada).
   - Kalıcılık notu (Bing): sahiplik GSC hesabıyla **periyodik yeniden doğrulanır**; o Google hesabının GSC erişimi kesilirse yeniden içe aktarma ya da meta/DNS doğrulaması gerekir.
   - İçe aktarma takılırsa yedek: `app/layout.tsx` → `verification.other["msvalidate.01"]` (Next metadata alanı; kod bu notun kapsamı dışında, ayrı PR).

**Hangi hesapla:** İki ayrı yetki var: (a) BWT'ye giriş kimliği, (b) içe aktarma adımında yetkilendirilen Google hesabı (GSC'ye erişimi olan). Bing "birden çok GSC hesabından içe aktarılabilir" diyor; yani (a) ve (b) aynı olmak zorunda değil. Bellekte GSC mülkünün arayüz sahibi hesap açıkça yazılı değil (API servis hesabı Özgün'ün GCP projesinde — `reference_ga4_api.md`). Bing Places kimliği hamza Google'ına bağlı; BWT için aynı Google ile girilirse Places ile tek Microsoft kimliği olur, ozgundeniss ile girilirse ayrı kimlik olur — BWT'de 12.08'deki "zaten başka kullanıcıya bağlı" kısıtının geçerli olup olmadığı **ölçülmedi**.

**Bing Places'ta kontrol edilecek alanlar (yalnız okuma; ad alanına dokunulmaz — plan §3.6):**
- cabfc4da kaydının durumu: Yayında / Doğrulama bekliyor / Reddedildi.
- Listede YN90F3FA9E81699BCE kimlikli ikinci kayıt var mı; yoksa herkese açık kart "Şimdi talep et" diyor mu (talep/birleştirme akışı panelde).
- Kartın adı (GBP ile birebir mi), birincil kategori (GBP'de "Gayrimenkul Danışmanı/Emlak Bürosu" sorusu açık — 13.10 notu: kategori **değiştirilmez**), telefon/adres/web, saatler, GBP senkronunun açık olup olmadığı.
- Ekran görüntüsü yeterli; Claude sonucu `kaldirac-defteri.json` ve belleğe işler.

### Ters gerekçe
- Plan §4: "Bing'i 'görünmüyoruz' diye kurtarmak yanlış öncül; 50 sayfa dizinde ve sıralıyor; sorun kapsam, iş BWT tanısı." Beklenen etki küçük ve dolaylı (GA4 bing/organic 28g 6 oturum).
- Yerel dizin/künye paketi kapanmış iş (08.08); Bing Places'ta ad/kategori değişikliği NAP tutarlılığını ve GBP senkronunu bozar.
- BWT'nin kendisi sıra değiştirmez; verdiği şey tanı ve bildirim. IndexNow zaten bildirim yapıyor.

### Özgün'den istenen
1. BWT'ye hangi hesapla girileceği (hamza mı, ozgundeniss mi) ve içe aktarmada hangi Google hesabının yetkilendirileceği.
2. Bing Places panelinde yukarıdaki alanların ekran görüntüsü (ad alanına dokunmadan).
3. İçe aktarma takılırsa msvalidate meta PR'ına izin.

---

## 4) GBP: web sitesi bağına UTM ve "Sohbet/WhatsApp" seçeneği

### Ne ölçüldü
- **UTM'li bağ çalıştığı dönem (GSC, `hat-gsc-gbp.tsv`):** `/?utm_source=google&utm_medium=gbp` adresi **26.07–11.08** arasında günde 59–160 gösterim / 0–7 tık aldı (09.08: 160 gösterim); **12.08'den 11.10'a kadar 0**. GA4 `sessionMedium=gbp` (`hat-ga4-gbp.tsv`): 26.07–11.08 arası günde 1–9 oturum (28.07 desktop 9), sonrası satır yok. Defter: W31 14, W32 14, W33 4, sonra 7+ hafta 0; GSC UTM'li sayfa 481 gösterim → 0 (`kaldirac-defteri.json` 04.10 kaydı).
- **Bugün (GA4 28g, `kanal-medium.tsv`):** kanal satırları Organic Search/google 1.013, Direct 109, Organic Social/ig 33, AI Assistant/chatgpt.com 23, yandex 7+2, bing 6 … — **`gbp` medium satırı YOK** (`analiz.json` → `ga4_kanal_not`). Site tarafı temiz: UTM'li adres 200, yönlendirme yok (defter) → bağ panelde değişmiş.
- **Ölçülemeyenler (UTM yokken):** (a) GBP'den gelen web ziyareti sayısı (kanal #1'in web ayağı); (b) Map Pack → web → WhatsApp zinciri; (c) Direct'in ne kadarının profil düğmesi olduğu — UTM'liyken ana sayfa mobil Direct haftada 0–3, UTM'sizken 4–10; 09.09–06.10 mobil Direct 71 oturum = ana sayfa 18 + site sayfaları 53 (defter `duzeltme_0810`); (d) 01.11 hero CTA okuması: GBP'den gelenler organik/direct'e karışık sayılır; (e) GBP Performans paneli 09.08'den beri okunmadı, `gbp-performans.jsonl` boş.
- **Temas (GA4 28g, `ga4-temas28.json`):** whatsapp_click 11 olay / 10 oturum (mobil çubuk 9, site üst 2), phone_click 6 / 5; wa.me çıkışı 9 oturum; form gönderimi 0. Temas oturumlarının 15/15'i Organic Search + 1 AI Assistant + 1 Direct (`temas-kanal.tsv`).
- **GBP WhatsApp sohbeti (defter 13.10 kaydı, `chatgpt-istisare-1310.md` E + 14.10 2. tur):** henüz ölçülmedi. Panel yolu: Profili düzenle → İletişim → Sohbet → WhatsApp; özellik "belirli bölgelerde, bazı profillerde", Türkiye/kategori uygunluğu bilinmiyor; 24 saat yanıt şartı yeni entegrasyonda yok. Önerilen benzersiz hazır mesaj: "Merhaba, Google İşletme Profilinizden yazıyorum. Eryaman'da bir dairem var; satış veya kiralama için görüşmek istiyorum." Ölçüm tasarımı: önceki 30 / sonraki 30 gün, (GBP arama tıkı + o mesajla başlayan benzersiz WhatsApp konuşması) / 1.000 profil görüntülemesi; kontrol: çağrı + mesaj + web tıkı toplamı ARTMALI.

### Teknik seçenekler
- **UTM:** GBP "Web sitesi" alanına `https://www.siringayrimenkul.com/?utm_source=google&utm_medium=gbp` (09.08'deki hâli; şema `utm_medium=gbp`, 13.10 ChatGPT notu "bizim şema kalır"). Site tarafında iş yok (adres 200, canonical `/`). Okuma: UTM'li adresin GSC'de yeniden göründüğü ilk gün + 31 gün; komut defterde.
- **WhatsApp sohbeti:** panelde "Sohbet" alanı varsa açılır, hazır mesaj girilir; yoksa zorlamanın yolu yok. Sayım WhatsApp'ta elle.
- Yapan: Özgün ya da hamza oturumu açıkken açık onayla Claude (defter `bekleyen_onay`).

### Ters gerekçe
- Bağ 18.08'de kendiliğinden geri dönmüştü ("Google tarafından güncellendi" ihtimali) — tek seferlik düzeltme yetmeyebilir, seri izlenmeli (defter takvim 10.10 notu).
- UTM geri gelince Direct/Organic serileri kırılır: 04.11 okuması Direct için kıyas değil taban kaydı olur (defter `duzeltme_0810`).
- WhatsApp: telefonu WhatsApp'a kaydırmak başarı değildir (toplam temas artmalı); özellik görünmeyebilir; hazır metni silen sayılmaz (alt sınır).
- GBP paneli değişikliği Özgün onayı ister (bellek: panel değişiklikleri Özgün'de).

### Özgün'den istenen
1. UTM'li bağı GBP'ye yazma onayı/işlemi; aynı oturumda "Web sitesi" alanında bekleyen Google önerisi var mı notu.
2. "Sohbet" alanı panelde görünüyor mu; görünüyorsa hazır mesaj metni ve deneyin 30+30 gün takvimi onayı.
3. Performans ekranı (son 6 ay) ekran görüntüsü — `gbp-performans.jsonl` ilk kaydı.

---

## 5) Dış atıf: Trustindex ve firmasec (yalnız olgu)

### Ne ölçüldü (14.10 gece)
- **WebSearch `"Şirin Gayrimenkul" Eryaman`:** markamızı adıyla anan tek dış kaynak **trustindex.io** (kategori sayfası + `trustindex.io/reviews/www.siringayrimenkul.com`); diğer sonuçlar trovit ilan sayfaları (bizi anmıyor).
- **Trustindex sayfası (WebFetch):** ad "ERYAMAN ŞİRİN GAYRİMENKUL - EMLAK DANIŞMANLIĞI - EMLAKÇI"; **344 yorum / 5,0** (340×5★, 1×2★, 3×1★), 344'ü Google kaynaklı, Trustindex kaynaklı 0; telefon +90 532 363 96 60, web www.siringayrimenkul.com, adres "Tunahan, 208. Sk. 4. Etap Çarşı, Etimesgut 06824"; sayfa kendini "collected 344 reviews from Google and Trustindex" diye tanımlıyor (3. parti yorum toplayıcı). Bellek: Trustindex widget'ı bizim değil (`project_google_business_profile.md`); GBP'deki güncel sayı 404 (07.10) → sayfa bayat. Bu kart bizim kontrolümüzde değil; "herkese açık profilde yorum sayısı yok" kuralı kendi profillerimiz için (`feedback_no_review_counts_in_public_bios.md`). Dış bağlantı profilinde trustindex 3 bağ (`DENETIM-04-10.md` #10: toplam 26; kolaybull 11, premiumeryamanemlak 6).
- **Aynı ad dizesi** Bing herkese açık kartında da duruyor (madde 3) — iki üçüncü-parti kart aynı eski ad kaydını taşıyor.
- **firmasec.com:** WebSearch (firmasec.com ile sınırlı) "Şirin Gayrimenkul Eryaman emlak" → kayıt yok (çıkanlar Doğan Emlak, Koçak Gayrimenkul Eryaman Etap, Tekinay Emlak, Turkay Gayrimenkul). `firmasec.com/firmalar/rb-emlak/ankara/etimesgut/` ilk sayfa (332 kayıt, 12 sayfa): Şirin yok; 12 sayfanın tamamı taranmadı → "kaydımız yok" görev metninin olgusu + bu gece iki kontrolle tutarlı, tam liste taramasıyla kesinleştirilmedi. "firmasec AI özetlerini besliyor" ifadesi görev metninden; bu gece doğrulanmadı.

### Teknik seçenekler
- Trustindex kartı düzenlenemez (3. parti); yalnız kayıt.
- firmasec kaydı açmak = yerel dizin künye işi; plan §4'te "yerel dizin künye paketi … kapanmış/yapılmış işler, tekrar açılmaz" yazıyor. Bu notta iş önerilmiyor.

### Ters gerekçe
- Künye dizinlerinin bulunabilirliğe ölçülmüş etkisi sıfır (plan §4); nofollow/düşük öncelik (bellek Bing Places notu: bulurum/11880).

### Özgün'den istenen
- Yalnız bilgi. Karar gerektiren tek soru: firmasec kaydı istiyor mu (varsayılan: hayır, kapalı iş).

---

## 6) PAZARLAMA_ONCE_KOHORT — 28 günlük GSC kıyası (kaba)

### Ne ölçüldü
Kohort: `app/mahalleler/[mahalle]/[site]/page.tsx:365-376`, 15.08 Özgün kararı (PR #23, commit 617b164d; plan `kohort-plani-2026-08-15.md`: "25.08 ölçümüne dek liste SABİT"). 25.08 okuması dosyalarda yok (`PROTOKOL-gece.md` ve `DENETIM-04-10.md`'de "kohort" geçmiyor). 27.08'de efsane-evleri (Ata) ve hittown (Cumhuriyet) 410'a düştü; kohort 8 → 6.

GSC 28g (14.09–11.10, `sayfalar28.tsv`; kıyas = aynı mahallede, kohort dışı, gösterimi 0,5–2× bandındaki site sayfaları; `karar-analiz.py` §6):

| sayfa | gös | tık | TO | konum | kıyas bandı (n) | band TO | band konum | 15.08 plan notu (gös/konum) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| ŞOA / relax-goksu-konutlari | 1.536 | 4 | %0,26 | 8,8 | 0 (bandında sayfa yok) | — | — | 875 / 8,4 |
| ŞOA / mia-concept-konutlari | 872 | 4 | %0,46 | 6,7 | 2 (arkadya 514/%1,17; kc-lale 505/%1,58) | %1,37 | 8,55 | 368 / 6,4 |
| Tunahan / mavicam-sitesi | 659 | 12 | **%1,82** | 8,0 | 3 (dema-park 647/%0,62; canberk 632/%1,27; sarıgül 347/%0,58) | %0,86 | 7,53 | 477 / 7,8 |
| ŞOA / koz-modern | 502 | 1 | %0,20 | 9,7 | 7 (kc-lale, arkadya, bordo-life 430/%0,23, kıratlı 391/%0,26, bp 294/%2,38, hill-tower 277/%0,72 …) | %1,35 | 7,38 | 524 / 8,1 |
| ŞOA / alpak-neve-armonia-residence | 276 | 1 | %0,36 | 8,6 | 20 (hill-tower, bp, happy-life 256/%4,30, akasya 218/%0, ardıç 203/%3,94, safir 201/%1,0 …) | %2,07 | 7,35 | 626 / 8,7 |
| Tunahan / age-sitesi | 434 | 4 | %0,92 | 8,1 | 7 (sarıgül, sütek 296/%0,68, özar 268/%1,87, canberk, metromall 235/%2,13, kur-46496 234/%2,14 …) | %1,17 | 7,45 | 384 / 7,3 |
| Ata / efsane-evleri | — | — | — | — | 410, sayfalar28'de satır yok | | | 369 / 6,2 |
| Cumhuriyet / hittown | 26 | 1 | %3,85 | 9,4 | 410 sayfası hâlâ gösterim alıyor | | | 524 / 8,1 |

Toplamlar: 6 canlı kohort sayfası **4.279 gös / 26 tık / TO %0,61 / ağırlıklı konum 8,3**. Mahalle tabanları (kohort hariç): ŞOA 62 sayfa 6.747 gös / 143 tık / **TO %2,12** / konum 7,70; Tunahan 24 sayfa 4.234 / 51 / **%1,20** / 7,69. Site ailesi geneli TO %1,86 / konum 7,7 (`analiz.json` → `aile`).

Ham okuma: 6 sayfanın 5'inde TO kendi bandının altında (yalnız maviçam üstünde); konum 6 sayfada da bandın gerisinde ya da eşit.

**Bu kıyas kabadır:** (1) kohort 15.08'de zaten "poz > 6, zayıf" sayfalardan seçildi (seçim yanlılığı; plan dosyası); (2) sorgu karışımı farklı — relax göksu tek sorguda 510 gösterim/0 tık, 2. sayfada (`analiz.json` → `ikinci_sayfa`), koz modern 199/0; yalın-ad sorgularının TO'su site genelinde zaten %0,68; (3) 15.08 rakamlarının penceresi plan dosyasında yazılı değil; (4) bu dönemde 04.10 başlık değişikliği (PR #97) ve 07.10 Başlık deneyi 2 (bu sayfalar deneyde mi, `lib/baslik-deneyi-0710.ts` bu notta açılmadı) üst üste bindi; (5) kontrol kolu yok, nedensellik çıkarılamaz.

### Teknik seçenekler
- Girişi standart dört varyanta döndürmek (set boşaltılır; görünen gövde metni değişir → site tabanı ilerlemez, 6 sayfa yeniden tarama ister).
- Olduğu gibi bırakıp 04.11'de aynı tabloyu yeniden çekmek (Başlık deneyi 2 ara okumasıyla aynı gün; o deneyin kolu biliniyorsa ayrıştırılır).
- Kohortu büyütmek/küçültmek — ölçülmüş gerekçesi yok.

### Ters gerekçe
- "Sayfaya içerik/metin eklemek" kaldıracı defterde çürük; giriş paragrafı varyantının TO'ya etkisi hiçbir ölçümde ayrıştırılmadı; geri almak da ileri götürmek de ölçülmemiş bir şeyi değiştirir.
- 17.11'e kadar web tarafı dondurma önerisi (ChatGPT 13.10, defter `not_1310`); şablon gövdesine dokunmak Başlık deneyi 2'nin gövde-sabit varsayımını bozar.

### Özgün'den istenen
- Kohort 15.08 kararıyla duruyor ("başlangıçlar bu tarzda olsun"). Soru: set 04.11'e kadar aynen kalsın mı, yoksa şimdi kapatılsın mı. İkisi de uygulanabilir; veri tek yönlü değil.

---

## 7) GA4: chatgpt.com kaynaklı oturumlar (olgu)

- **28g (16.09–13.10):** `AI Assistant / ai-assistant / chatgpt.com` **23 oturum, 11 etkileşimli**, toplamın **%1,9**'u (`kanal-medium.tsv`, `analiz.json` → `ga4_kanal`). 90 günde 70 oturum (plan §3.5). Yalnız chatgpt.com; Perplexity/Claude/Gemini kaynaklı satır yok.
- Açılış sayfaları (`acilis-kanal.tsv`): `/` 5, `/siteler` 4, goksupark-konutlari 2, ve 1'er: altay ada 17542, alış sitesi, eryaman mahallesi, oyak 555, kaşmir göl evleri, göksukent, izoser, meydan ada, lider yaşam evleri, metromall, sütek, (not set) 1. Aile dağılımı: site 11, ana 5, diğer 4, ada 1, mahalle 1.
- Temas: AI Assistant kanalından **1 phone_click** (mobil) — 28g'deki 6 phone_click'in biri (`temas-kanal.tsv`).
- **Teknik hazırlık (mevcut):** `app/llms.txt/route.ts` canlı (force-static; mahalle/site özetleri + 6 rehber); `app/robots.ts` tüm kullanıcı aracılarına açık (yalnız Googlebot için opengraph-image istisnası); 07.10 kontrolü OAI-SearchBot / GPTBot / PerplexityBot / Bingbot 200 (`PROTOKOL-gece.md:877`); IndexNow bildirimi (Bing/Yandex) çalışıyor; JSON-LD temiz (plan §4 "AI tarayıcı erişimi ve JSON-LD zaten temiz"). ChatGPT araması Bing dizininden beslenir; Bing'de ~50/1.178 sayfa (madde 3) — kapsam darlığı AI kanalının da tavanı.
- Ölçülemeyen: Vercel log saklama 1 saat/1 gün → AI tarayıcı ziyaret sıklığı 30 günlük okunamıyor (plan §4). AI görünürlük tabanı `ai-gorunurluk.jsonl` (Perplexity 2 soru) — 04.11'de tekrar.
- Bu maddede karar gerektiren iş yok; kayıt amaçlı.

---

### Bu notta YAPILMAYANLAR / yapılamayanlar
- Bing panelleri ve GBP paneli açılmadı (hesap girişi yok); Bing ölçümü görev metnindeki 14.10 gözlemi + 07.10 ajan kaydıyla sınırlı.
- firmasec'in 12 sayfalık tam listesi taranmadı (ilk sayfa + site içi arama).
- Göksu Hisar / MA1 Tower aynı-yapı sorusu TKGM'ye sorulmadı (kota), koordinat/parsel kıyasıyla "belirsiz" bırakıldı.
- Kohort için 25.08 okuması bulunamadı; 15.08 rakamlarının penceresi bilinmiyor.
- Hiçbir dosya git'e eklenmedi; `content/` değişmedi; lastmod'a dokunulmadı.
