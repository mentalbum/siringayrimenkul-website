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
