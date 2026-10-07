# PR #90 (başlıkta mahalle) — GSC tabanlı okuma, 04.10.2026

Yöntem: GSC sorgu×sayfa (API), iki dönem: ÖNCE 06.08–02.09, SONRA 10.09–02.10 (merge 06.09,
yeniden tarama payı için 4 gün atlandı). Her site için adının çekirdeği geçen, "emlak" geçmeyen
sorgular (yalın ad + alıcı/kiracı niyeti — gerçek talep); "doğru sayfa" = aynı adlı site
sayfalarımız (ad ikizleri dahil). Ölçüt: sorgu kümesinde en çok gösterim alan sayfamız doğru mu.
Yalnız iki dönemde de ≥5 gösterimi olan siteler. Ham: scratchpad denetim-0410/deney-gsc-okuma.json.

| | Deney (272 site) | Kontrol (27 site) |
|---|---|---|
| Tepe sayfa doğru oranı | %66,9 → **%76,1** (+9,2) | %66,7 → %66,7 (0) |
| Önce yanlış olanların düzelme oranı | **47/90 = %52** | 2/9 = %22 |
| Önce doğru olanların bozulma oranı | 22/182 = %12 | 2/18 = %11 |
| Gösterim-ağırlıklı doğru sayfa payı | %31,9 → %39,5 | %21,3 → %34,7 (2 siteye bağlı) |

Fisher (düzelme): p ≈ 0,16 — kontrol kolu küçük (9 yanlış), tek başına kesin değil; yön ve
büyüklük müdahale lehine, bozulma iki kolda aynı (zarar yok). GSC TO okuması (04.10 denetimi):
deney/kontrol tık kaybı aynı → başlık tıklamaya zarar vermedi.
Kontrolde düzelen: arslanlar-sitesi, neva-panora-konutlari. Hâlâ yanlış: cumhuriyet-sitesi,
kent-konaklari, gercek-92, kosk, bulvar-312, yildiz-eryaman, palmiye-evleri.

Karar önerisi: 05.10 sonrası lib/baslik-kontrol-kolu.ts silinir (45 sayfa da yeni kurala geçer).
SERP taraması (aynı araçla 06.09 tabanıyla kıyas) ek okuma olarak: kontrol 45 + deney'de tabanda
yanlış/dışı olan sayfalar.

## SERP taraması 04.10 (aynı araç, pws=0, Özgün'ün Chrome'u) — kontrol kolu 41/45

Taban 06.09 → 04.10: doğru 28→27, yanlış 8→8, dışı 5→6. Geçişler: yanlış→doğru 2 (Postakent,
Özenkent 2), doğru→yanlış 2 (Bulvar 312, Neva Panora), doğru→dışı 4, dışı→doğru 3. Kontrol kolu
dört haftada YERİNDE SAYDI — doğal taban. 5 sayfada hâlâ eski adres (/mahalleler/<slug> -mahallesi'siz)
çıkıyor: yeni-huzur-bahcesi, gercek-92, inci-life, sitekonut, kur-sitesi.
reCAPTCHA 41. sorguda (toplam 44 sorgu); deney kolu (174 sorgu: tabanda yanlış/dışı olanlar) ölçülmedi —
kuyruk: deney-kuyruk-0410.json (kayıt betiği ekle-deney-0410.py; ölçülenler sonuclar-site-emlakci.jsonl kanal=deney-0410). Ertesi gece devam.

## SERP taraması 06.10 — deney kolu ARA OKUMA (40/174)

05.10 gecesi atlandı; 06.10'da index 60→105 tarandı (45 ölçüm, TEK engel bile görülmedi —
04.10'da 41. sorguda duvar vardı, bugün 45'te yok; kota kayan 24 saatte dolduğu için
05.10'un boş geçmesi kotayı tazelemiş olabilir). Devlet ve Eryaman deney kolu tamam, Göksu yarıda. Kayıt: `kanal=deney-0410`; uzun SERP'lerde araç
çıktısı kesildiği için kompakt çıkarıcı + `ekle-deney-kompakt.py` eklendi (yalnız n + ilk3 +
bizim sonuçlarımız; tam yol Chrome'dan gerçek href ile alınır, breadcrumb'dan DEĞİL).

| taban | →doğru | →yanlış | →dışı |
|---|---|---|---|
| yanlış (47) | **21** | 20 | 6 |
| dışı (29) | 3 | 3 | 23 |

**Yanlış→doğru düzelme: 21/47 = %45** (GSC okuması %52; kontrol kolu/doğal taban %22).
Yön GSC ile aynı, büyüklük arada — örneklem henüz 23 vaka, tam tarama bitmeden sonuç yazılmaz.
Dışı→doğru yalnız 3/29 (%10): başlık, hiç sıralamayan sayfayı ilk 10'a SOKMUYOR; etkisi
"zaten sıralayan ama yanlış sayfa" vakasında.

Dönüşenler: mavikent (dışı→doğru), atakent-1-asiyan, atakent-metro, guzel-ankara-evleri
(3 izole vakadan biri ✓), cigdem, endora-goksu. Hâlâ yanlış ad-ikizi vakaları: hotki-meydan
→ Hotki Ritm (Yeşilova), endora-park → Endora Eryaman (Yavuz Selim), platin-konutlari →
Platin 2, admira-goksu → Uzunali Göksu 2. **Ad ikizleri başlıkla çözülmüyor** — 06.09
"dürüst kapsam" notu doğrulandı.

**YENİ DESEN — ESKİ ADRES (3 vaka):** ilk-bahar-sitesi `/mahalleler/devlet/...`,
eryaman-evleri `/mahalleler/eryaman/...` ve ma1-tower `/mahalleler/goksu/...` eski sluglarla
ve ESKİ başlıklarla sıralıyor (İlk Bahar #1, MA1 Tower #1, Eryaman Evleri #4). Bu sayfalar deneyin yeni başlığını hiç almadı; 301
sindirimi bekliyor. Analizde "yanlış" sayılmaları deneyin etkisini OLDUĞUNDAN DÜŞÜK gösterir —
nihai okumada ayrı kova açılmalı.

07.10'da index 105→125 tarandı (+20 ölçüm, yine engelsiz — iki gün üst üste). Göksu deney kolu
TAMAM, Güzelkent başladı. Göksu'da art arda 6 doğru çıktı (oyak-goksupark, park-inci, paro-life,
polsan1-ayisigi, utkan, vaditepe) — **polsan1-ayisigi** dikkat çekici: Ağustos'ta "219 gösterim
eski adreste, dizinsiz" diye kota istisnası bekleyen vakaydı, şimdi doğru sayfayla #2.

ESKİ ADRES kovası 4'e çıktı (+ankolular, ada sayfası eski slugda). AYRICA yeni alt-desen:
**cagdas-95-sitesi'nde yeni VE eski adres aynı SERP'te** (#2 yeni, #4 eski) — 301 sindirilmemiş,
iki sürüm birbiriyle yarışıyor. 04-05.09 taramasındaki "eski adres 11+ çift" bulgusuyla aynı aile.

Kalan: 94 sorgu (Güzelkent'ten devam, kuyruk index 125+). Araç: `python3 deney-sira.py 4`.


## 07.10 ikinci dilim — ESKİ ADRES BULGUSU BÜYÜDÜ (dikkat: sitemap kararıyla kesişiyor)

Güzelkent deney kolu yarılandı. Deney 88/174; yanlış→doğru %45 bandında sabit.

**Eski adres vakası 2'den 6'ya çıktı** ve niteliği değişti — artık sadece "eski adres
sıralıyor" değil, **ikisinde eski adres YENİSİNİ GEÇİYOR**:

| sorgu | eski adres | yeni adres |
|---|---|---|
| Küçük Ankara Villaları | `/mahalleler/guzelkent/...` **#1** | `/guzelkent-mahallesi/...` #5 |
| Konuta Özlem | `/mahalleler/guzelkent/...` **#3** | `/guzelkent-mahallesi/...` #7 |
| Çağdaş-95 | `/mahalleler/guzelkent/...` #4 | `/guzelkent-mahallesi/...` **#2** |
| İlk Bahar | `/mahalleler/devlet/...` **#1** | — |
| MA1 Tower | `/mahalleler/goksu/...` **#1** | — |
| Eryaman Evleri | `/mahalleler/eryaman/...` #4 | — |
| Ankolular | `/mahalleler/guzelkent/adalar/...` #3 | — |

Hepsi ESKİ başlıkla ("...Emlakçısı - Şirin Gayrimenkul" kalıbı) çıkıyor, yani deneyin
yeni başlığını hiç almadılar. Bu sayfalar "yanlış" kovasında sayılıyor ve deneyin
ölçülen etkisini AŞAĞI çekiyor — nihai okumada ayrı kova şart.

⚠️ **KESİŞME, karar değil gözlem:** `app/sitemap-eski-adresler` 07.10 01:13'te kaldırıldı
(c407135, ChatGPT istişaresinin 3. işi; defterdeki görev 15.10 içindi). O sitemap'in işi
Google'a eski adresleri yeniden taratıp 301'i gördürmekti. Bugünkü ölçüm, en az 7 eski
adresin HÂLÂ canlı sıralandığını ve ikisinin yenisini geçtiğini gösteriyor — yani 301
sindirimi tamamlanmamış. Kaldırma kararı "eski adresler bitti" varsayımına dayanıyorsa
veri bunu desteklemiyor; başka bir gerekçeye dayanıyorsa (tarama bütçesi vb.) bu ölçüm
yalnızca süreyi uzatabileceğine dair bir not. Kararı geri almadım — ilgili oturumun
bakması için işaretliyorum.

Ayrıca iki ESKİ TEŞHİS ÇÜRÜDÜ: (1) **erenkoy-sitesi** 28.08'de "İstanbul Erenköy
kaplaması, YAPISAL KESİNLEŞTİ, kuyruktan düş" diye kapatılmıştı — bugün doğru sayfayla
**#2**. (2) **polsan1-ayisigi** Ağustos'ta "219 gösterim eski adreste, dizinsiz, kota
istisnası bekliyor" vakasıydı — bugün doğru sayfayla **#2**, istisna hiç gerekmemiş.
Ders: "yapısal/kurtarılamaz" etiketi 4-6 hafta sonra yeniden sınanmadan kalıcı sayılmaz.

Kalan: 86 sorgu (Güzelkent'ten devam, kuyruk index 141+).

## 07.10 akşam — tarama BİTTİ (210/219, 9 sorgu reCAPTCHA'da kaldı)

Deney kolu **165/174** ölçüldü. Kapanışa yakın tablo:

| taban | →doğru | →yanlış | →dışı |
|---|---|---|---|
| yanlış | **51** | 44 | 20 |
| dışı | **8** | 4 | 38 |

- **Yanlış→doğru düzelme: 51/115 = %44** (kontrol kolu %22 — deney kolu
  kontrolün İKİ KATI, GSC'nin %52'siyle aynı yönde)
- Dışı→doğru kazanım: 8/50 = %16

### ESKİ ADRES: deneyin ana gürültü kaynağı (6 → 15)
Tarama bittiğinde **13 vaka** betiğin kovasında + **2 gizli** (sutek-sitesi,
bizim-sirinkoy — oralarda YENİ adres öndeydi, betik sadece 1. sonuca baktığı
için yakalamadı) = toplam 15 canlı eski adres.

Bunlar başlık deneyinin ÖLÇÜMÜNÜ BOZUYOR: "yanlış sayfa" sayılıyorlar ama
başlıkla ilgileri yok — Google'ın hiç sindirmediği 308'ler. Düzeltilmiş
düzelme oranı: 51/(115−13) = **%50**, yani GSC okumasının (%52) tam üstüne
oturuyor. Yani deneyin gerçek etkisi ham orandan daha yüksek.

### Teşhis (API ile kesinleşti)
11 eski adresin **hepsinin son taraması 28.06–19.07**, yani 26.07'deki URL
göçünden ÖNCE. Google 308'i hiç görmedi: sitemap'te yoklar, iç bağlantıları
yok, kendiliğinden dönmelerinin yolu yoktu. Dördü de (eski+yeni) ayrı ayrı
"Submitted and indexed" olarak duruyor.

Zarar mekanizması: alan adı başına ilk sonuçlarda ~2 slot var; eski adres bir
slotu yiyor. En kötüler — elit-nar-cicegi (eski #1 / yeni #4), bosphorus ve
tan-yildizi (eski #2 / yeni ilk 10'da YOK), kiratli (eski #2 / yeni #5).

### Yapılan
11 eski adrese tarama isteği gönderildi (11/11 kabul), 12.'de kota doldu.
Kalan 2'si (elit-nar, düşkent) yarına. Teyit ~21.10: API'de "Page with
redirect" / "Duplicate" olmalı, SERP'te yeni adres öne geçmeli.

### Betikte düzeltilecek
`deney-ozet.py` eski adres dedektörü yalnızca 1. sıradaki sonuca bakıyor;
alt sıralardaki eski adresleri kaçırıyor (2 vaka). Tüm `isgal` listesine
bakmalı.
