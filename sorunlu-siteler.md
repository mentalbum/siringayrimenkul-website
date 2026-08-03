# Sorunlu Siteler — Zenginleştirme Süpürmesi Notları

Zenginleştirme sırasında yakalanan, çözümü sonraya bırakılan haritalama/veri sorunları.
Çözülen kayıt buradan silinir; çözüm commit'i not düşülür.

## Bekleyenler
### Niyet-düzeni turu (2026-07-29 — 4 kollu denetim, tüm şablonlar yeniden sıralandı)
Kullanıcı niyeti modeliyle 4 şablon denetlendi ve uygulandı:
- **Site (720):** sahibinden yönlendirmesi ilk ekrana çıktı ("Daire mi arıyorsunuz?" — ev sahibi
  CTA'sı DOM'da önce, Temmuz kararı korundu); künye ada grid'inin üstüne; "doğrulama · Derleyen"
  satırı artık koordinatsız sayfalarda da; alt sıra SSS → Rehberler → Komşu Siteler.
- **Mahalle (14):** ev sahibi bloğu 51-91 kartlık listenin ÜSTÜNE; içine rakamsız "Fiyatı Ne
  Belirler" şeridi (backlog #6 kapandı); hero cümlesine değerleme linki (ilk tıklanabilir ev
  sahibi öğesi); alt sıra SSS → CTA → Etaplar → Blog → Yakın Mahalleler.
- **Blog (44):** kapanış CTA'sı konuya göre niyet-uyumlu (satis→değerleme+süreç, kira→hizmet+araç,
  miras-tapu→iletişim+harç aracı, mahalle→değerleme+rehberler).
- **Dönüşüm:** /ev-degerleme'de form hero'nun hemen altına, hero'ya #degerleme-formu çapa CTA'sı,
  karar-destek linkleri "Henüz kararsız mısınız?" olarak formun altına, form kartına güven satırı
  (yetki no + 5,0 puan — yorum SAYISI kural gereği YOK); iki hub'a hero CTA'sı, kitaplıklar final
  CTA'nın altına.
Yapılmayanlar (bilinçli): mahalle listesi istemci filtresi (backlog #11'de duruyor), kitaplık
tematik gruplaması, blog mini-içindekiler — düşük öncelik, sonraki tur.

### İç bağlantı grafı optimizasyonu (2026-07-29 — 1.578 sayfa ölçüldü, önce/sonra)
Üretilmiş HTML'den tam graf çıkarıldı (header/footer hariç gövde linkleri). Bulgular ve sonuçlar:
- **REGRESYON YAKALANDI: blog frontmatter'daki `ilgiliMahalle` eski slug'larla kalmıştı**
  ("altay" vs yeni "altay-mahallesi") — 26 Tem URL göçünden beri mahalle↔blog modülleri sessizce
  boştu. 12 yazıda düzeltildi. DERS: slug göçlerinde İÇERİK frontmatter'ı da taranmalı.
- site→rehber linki: **0/720 → 720/720** (her site sayfasına deterministik 2 rehber + 1 hizmet
  linki; havuzdan slug-hash rotasyonu — her rehber 127-166 sayfadan doğal dağılımla link alıyor)
- site→hizmet: 0/720 → 720/720; hub'lara gelen link 9→365 (satmak) / 373 (kiraya)
- hub→rehber: satmak 9→19, kiraya 5→9 — iki hub'a veri-güdümlü "Rehber Kitaplığı" bölümü
  (lib/blog-konular.ts haritasından; yeni rehber otomatik girer)
- blog→site: mahalleli yazılara "Mahalleden site rehberleri" modülü (TKGM sınırlı ilk 4 site)
- yetim sayfa (≤1 gövde gelen-link): 8→0 (son ikisi /siteler dizin girişinden bağlandı)
Kalan bilinçli durum: 32 satış/kira rehberinde site linki yok — konusal olarak gerekmiyor, zorlama
link eklenmedi.

### E-E-A-T / Helpful Content denetimi (2026-07-29, 6 kollu tur — 15 eksik, önem sıralı)
**UYGULAMA DURUMU (aynı gün):** ✅ 1 (gizlilik sayfası + footer + form linki), ✅ 2 (çerez rıza
kapısı — kabul/ret iki yol da önizlemede uçtan uca test edildi; gtag yalnız kabulde enjekte),
✅ 3 (arabuluculuk bölümleri 2 rehbere + TBK/kanun atıfları + FAQ sorusu), ✅ 4 (feragatlar),
✅ 9 (dateModified mtime→frontmatter 'guncelleme'; görünür Güncellendi satırı; sözlük tarihi),
✅ 10 (90→85'ten fazla, 729→700'den fazla, site-config alt-sınır, llms kapsam), ✅ 11 (#yontem
bölümü + AI şeffaflığı), ✅ 12 (komisyon nötrlendi), ✅ 5-kod kısmı (jenerik 5 SSS FAQPage
şemasından çıktı, giriş/CTA'ya deterministik varyasyon), ✅ 6-kısmi (H2 beklenti yönetimi;
başlık değişikliği BİLİNÇLİ ERTELENDİ — URL göçü otururken 218 başlık değiştirmek uzun kuyruk
sıralamasını riske atar), ✅ 7-kod kısmı (blog yazar kartı, site sayfası 'Derleyen' satırı,
WebPage author/reviewedBy). ⏳ 13-kısmi (TÜİK linki/feragat araç sayfasına eklenecek; güncel
ORAN yazılmadı — aylık rutin istemiyorsun, o karar sende). KALAN ÖZGÜN KALEMLERİ: portre+yıl+
Hamza cümleleri (7), saha notları/vaka (5,8), yorum seçimi (14), nüfus yıl teyidi (15).
Genel durum: Expertise + teknik altyapı güçlü (byline→Person şeması, hukuki içerikte yanlış iddia
bulunamadı, yasak kalıplar sızmamış, linkler temiz). İki yapısal açık: yasal/güven katmanı (KVKK+çerez
hiç yok) ve Experience ayağının iddia düzeyinde kalması. Detaylı kanıtlar workflow çıktısında.

**KRİTİK:**
1. KVKK aydınlatma metni + gizlilik sayfası YOK (/gizlilik, /kvkk... hepsi 404); form ad+telefon
   topluyor. → /gizlilik rotası + footer yasal blok + form altına tek satır. [kod+Özgün onayı]
2. GA4 çerezleri rızasız yükleniyor; çerez politikası yok (KVKK Kurulu Çerez Rehberi: analitik çerez
   açık rıza ister). → rıza kapısı (hafif bant / Consent Mode v2) + aydınlatmaya çerez tablosu. [kod]
   NOT: reddedenlerde GA ölçüm kaybı olacak — Özgün'e bildirilecek ticari gerçek.
3. Tahliye/kira rehberlerinde 1 Eyl 2023'ten beri dava şartı olan ZORUNLU ARABULUCULUK hiç yok
   (44 yazıda 'arabulucu' 0 sonuç); pinpoint TBK atıfları eksik. → iki rehbere bölüm + madde
   referansları (her madde no eklenmeden önce mevzuattan doğrulanacak). [içerik]

**YÜKSEK:**
4. Feragat tutarsız: kira-artışı ve vergi yazılarında hukuki/mali feragat yok. [içerik, hızlı]
5. 720 site sayfasında özgün/şablon oranı ters (medyan 85 kelime özgün vs ~1.400 ortak kalıp);
   jenerik 5 SSS FAQPage şemasına giriyor. → jenerikleri şemadan çıkar, giriş/CTA'ya varyasyon,
   'sahaNotu' alanı (SADECE Özgün'ün bildiği sitelere). [kod + Özgün turları]
6. 720 başlık 'Satılık Daire' vaat ediyor, sayfada daire bilgisi yok. → veri olan sayfalarda H2'yi
   gerçek bilgiyle doldur (daire tipleri/blok/tapu); ince kayıtlarda başlığı rehber varyantına düşür. [kod+içerik]
7. Yazar kimliği yarım: portre yok, deneyim yılı yok, blog sonu bio kutusu yok, site sayfalarında
   sorumlu kişi yok. → Özgün: 1 portre + yıl + Hamza 2 cümle; kod: yazar kartı + reviewedBy + sameAs. 
8. Experience iddia düzeyinde: tek vaka anlatısı yok. → 'Sahadan bir örnek' kutuları (anonim,
   fiyatsız, GERÇEK — Özgün'den tek-soru turlarıyla). [ikisi]
9. Görünür güncellik katmanı eksik + dateModified mtime'dan (deploy'da yapay tazelenme riski!).
   → frontmatter 'guncelleme' alanı, görünür 'Güncellendi' satırı, sözlüğe gözden geçirme tarihi. [kod]
10. Sayı tutarsızlıkları: Ata sayfası 90 vs 87; blogda hayalet '729'; llms.txt '720+' vs dizin 517.
    → alt-sınır kalıbına tek geçişlik tarama + build'de otomatik sayım. [kod+içerik]

**ORTA:**
11. 'NASIL' ayağı boş: /hakkimizda#yontem bölümü (TKGM süreci + AI şeffaflığı paragrafı). [kod]
12. Komisyon çelişkisi: araç 'kural olarak kiracıdan' vs blog 'anlaşmaya göre' — blogdaki nötr
    çerçeve esas alınıp araç düzeltilir (geçmiş 'komisyon argümanı' kararıyla uyumlu). [içerik]
13. Kira artışı aracında güncel yasal tavan oranı + TÜİK linki + feragat yok — resmî endeks oranı
    fiyat yasağına GİRMEZ ama ay etiketi + aylık güncelleme rutini şart. [kod; rutin kararı Özgün]
14. 377 yorumun İÇERİĞİ sitede yok → sayısız/yıldızsız 2-3 METİN alıntısı (izinli, birebir,
    süreç anlatan) hizmet sayfalarına. [Özgün seçer, kod yerleştirir]
15. Nüfus/sıralama iddiaları kaynaksız-yılsız → '(TÜİK ADNKS, yıl)' atfı; teyit edilemeyen çıkarılır. [içerik]

### SEO güçlendirme sırası (2026-07-29 keşif turu — etki/efor sıralı bekleyen kalemler)
7 ajanlı ölçüm turu (SERP + autocomplete + PSI + AI-arama + en iyi örnekler) 12 kalem çıkardı;
1-2-3-10 uygulandı (CWV/GA erteleme, mahalle-özel başlıklar, ana sayfa USP açıklaması,
llms.txt + dateModified). Kalanlar sırayla:
- **#4 Ulaşım modülü:** lib/metro.ts (Batıkent-Sincan istasyon koordinatları, resmî EGO kaynağı)
  + site sayfalarına "En yakın metro: X — yaklaşık N m" chip'i; mahalle sayfalarına "Ulaşım ve
  Günlük Yaşam" H2 (POI adları doğrulanmadan yazılmaz — Özgün'le 6-7'lik teyit turları).
- **#5 İç bağ katmanı:** /eryamanda-ev-satmak hub-spoke (5 satış yazısı + tapu harcı aracı çift
  yönlü), site sayfalarına 3 linklik "Ev sahipleri için rehberler" bloğu, mahalle-yaşam MDX'lerine
  site linkleri.
- **#6 "Fiyatı Ne Belirler" modülü** (rakamsız) + mahalle SSS'ine işlem-niyetli 2 soru.
  Not: "eryaman satılık/kiralık daire" = portal duvarı, organik hedef DEĞİL (ölçüldü);
  hedef sınıf "mahalle + emlakçı".
- **#7 Site künyesi paketi:** kunye alanları (blok/konut/parsel m²/tapu tipi — %61-97 regex'le
  çekilebilir, ölçüldü) + görünür künye tablosu + numberOfAccommodationUnits + "kaç blok?" SSS.
  Yarı-otomatik çıkarım + parça parça onay.
- **#8 Ev sahibi içerik kümesi:** kira sözleşmesi yenileme (~25 autocomplete boşluğu),
  ev sahibinin hakları (çatı), depozito rehberi (TBK 342/347, ihtiyatlı dil).
- **#9 Değerleme formu progresif:** Adım 1 = site autocomplete + sat/kirala; Unbounce verisi
  3 alan %10,1 vs 9 alan %3,6.
- **#11 Mahalle site listesi filtresi** + komşu mahalle karşılaştırma tablosu (fiyatsız).
- **#12 4. araç:** Değer Artışı Kazancı (satış vergisi) hesaplayıcı — Yİ-ÜFE endeksleme,
  istisna/tarife sabitleri tek config'de.
- **Özgün'ün sahası:** emlakclick/bilgiemlak-firmalar/ilaneryaman dizin kayıtları; geçmiş işlem
  vitrini verisi (fiyatsız); GBP yorumlarından 2-3 alıntı seçimi; TR mobil SERP'te AI Overview
  manuel kontrolü; fotoğraf + backlink.
- **İzleme notu:** 26 Tem URL göçü dizinde henüz oturmadı (3 kol bağımsız gördü) — 2-3 hafta
  sıralama oynaklığı NORMAL, yanlış teşhisle içerik kararı alma. GSC sitemap artık 795 URL okuyor;
  IndexNow'a 795 URL bildirildi (29 Tem).

### Açık soru turu (2026-07-28) — 5 karar sorusu + sınırsız kayıtlar

✅ **ÇÖZÜLDÜ — Pozitif Life ↔ Anka Vega dupe DEĞİL.** Aynı adada komşu iki parsel:
Anka Vega 47544/2 (9.387 m², "11 katlı A + 15 katlı B + 4 katlı C blok", 4016. Cad. No:17,
Google'da 37 yorum), Pozitif Life 47544/4 (7.268 m², "14 katlı A1+A2, ofis-işyeri", 4022. Sk).
Anka Vega kaydına yanlışlıkla Pozitif Life'ın tapu verisi yazılmıştı; düzeltildi, sınırı da
47544/4'ten 47544/2'ye taşındı. İkisi de haritalı.

✅ **ÇÖZÜLDÜ — Botanik Sitesi hayaletti ama yerine GERÇEK bir kayıt kondu.** Cumhuriyet'te
düz "Botanik Sitesi" adlı yerleşim yok (ad Botanik metrosundan türeyen kısaltma; birebir
toponim 3 km doğuda Kardelen Mah.'de). Araştırma repoda EKSİK olan gerçek siteyi buldu:
**Botanik Evleri 43253/6** (6.901 m², "11 katlı betonarme mesken"). Slot bu siteye çevrildi
ve haritalandı; "Botanik Sitesi" alternatif ad olarak kaldı.

✅ **ÇÖZÜLDÜ — Türk Konut hayaletti, SİLİNDİ.** TÜRKKONUT = S.S. Yapı Kooperatifleri Merkez
Birliği, yani çatı marka. Şeyh Şamil'deki 14+ site zaten "Türkkonut X Sitesi" adıyla ayrı
kayıtlı; düz bu adla anılan tek bir yerleşim yok (Yandex'teki tek eşleşme otobüs durağı).
Markanın SEO'su Şeyh Şamil mahalle kaydının alternatifAdlar'ına taşındı, kayıt mahalleye
yönlendirildi.

✅ **ÇÖZÜLDÜ — Ortak Grup Yapı hayaletti, SİLİNDİ.** bilgiemlak'ın "Etikent 44756 Ada Ortak
Yapı Grup" dizin etiketinin bozulmuş hâli. O parselde (44756/2) gerçekte Umut Yapı Sitesi var
ve zaten kayıtlı → yönlendirildi.

✅ **ÇÖZÜLDÜ — Çelikler Sitesi yok, SİLİNDİ.** Google Maps / OSM / bilgiemlak / Yandex'in
dördünde de Eryaman'da "Çelikler" sıfır sonuç (Ankara'daki tek Çelikler Sitesi Bilkent
tarafında, 20 km uzakta). mahalleportal'ın 45824/1'e verdiği etiket yanlıştı; o parsel
Esenkent Sitesi'nin ve TKGM ile doğrulanmış. Ad Esenkent'in alternatifAdlar'ında,
kayıt Esenkent'e yönlendirildi.

✅ **ÇÖZÜLDÜ — 75. Yıl, Soyak'ın bloğu.** bilgiemlak hiyerarşisi: Soyak Blokları > 17462 Ada >
"A-2(8) Blok — 75. Yıl Apt.". Aynı adada listelenen 6 blok (75. Yıl, Ayyıldız, Cumhuriyet,
Güneş, Gökkuşağı, Şelale) TKGM'nin "6 adet betonarme apartman" niteliğiyle BİREBİR örtüşüyor.
Ayrı sınır verilmedi (doğru karar); metne blok adı ve kardeş bloklar işlendi.

✅ **ÇÖZÜLDÜ — 18477/1 RİTİM ERYAMAN'IN (Özgün, 2026-07-28).** Meğer Başkent Sular repoda
İKİ KEZ kayıtlıymış: Yavuz Selim'deki kayıt doğru (19524/2, "16 adet dubleks ev" — Google ve
Yandex de siteyi orada gösteriyor), Güzelkent'teki ikinci kayıt ise hatalıydı ve Ritim'in
parselini tutuyordu. Dupe silindi, 18477/1 Ritim'e verildi ("A ve B blok 14 katlı", 5.051 m²,
96 konut, Özer Grup), eski URL Yavuz Selim'deki kayda yönlendirildi. Ritim artık haritalı.
(Eski soru metni:) Parsel şu an repoda
Başkent Sular'a atanmış ama kanıtlar Ritim'i gösteriyor: Ritim'in adresi Yandex ve Google'da
"Güzelkent Mah. 510. Sok. No:1" (müteahhit Özer Grup, 96 konut kentsel dönüşüm, teslim
edilmiş) ve 510. Sokak'ın yalnızca iki cephe parseli var — 18476 (İpek Sitesi, kapı 2/2A/2B)
ve 18477 (kapı no 1). 18477/1 tapusu: "A ve B bloktan oluşan 14 katlı betonarme apartman",
5.051 m² — Ritim'in iki bloğuyla uyuşuyor. Başkent Sular ise Google'da YAVUZ SELİM'de
görünüyor (39.9989911/32.6144095) ve orası 19524/2 = "16 adet dubleks ev" — bambaşka bir yapı
tipi. İkisinden biri yanlış yerde; hangisi?

✅ **KAPANDI — Ata Mahallesi 44774/3 = Ata Life Sitesi.** Aynı parseli iddia eden ikinci
kayıt (bir kooperatif adıydı) Özgün'ün "öyle bir yer yok" demesi üzerine tamamen kaldırıldı:
sitenin hiçbir sayfasında, hiçbir içerik dosyasında adı geçmiyor, alternatif ad olarak da
tutulmadı. Eski URL yalnız 404 vermesin diye Ata Life'a yönlendiriliyor. **Yeniden açma.**

Parsel neden Ata Life'ın: ada 44774'te yalnız iki parsel var ve /2 Raylı Sistemciler'e
alanla çivilendi (dizin 6.742 m² vs repo poligonu 6.772 m², %0,4 sapma) → /3 elemeyle Ata
Life'a kalıyor; saha tabelası, Google kaydı (19 yorum, 4,6) ve 3768. Sokak adresi de onu
gösteriyor.

**DERS — bu turda ÜÇ kayıt aynı kalıptan çıktı.** eryaman.bilgiemlak.com.tr adını bilmediği
parseller için betimleyici başlık üretiyor ("N Ada Ortak Yapı Grup", kooperatif adları,
"10 Blok (45075 Ada)"). Bunlar dizin etiketi, SİTE ADI değil — üçü de gerçekte başka bir
yerleşimin parseliydi (bkz. Ortak Grup Yapı → Umut Yapı, Türk Konut → çatı marka). Kaynağı
koordinat/ada ipucu için kullan, ad kaynağı olarak kullanma; Özgün'ün listesi veya saha
tabelası doğrulamıyorsa yeni kayıt açma.

✅ **KAPANDI — ela-concept-evleri SİLİNDİ (Özgün, 2026-07-28).** Kanıt yetersiz ve parsel
uyduda boş. (Eski not:) Müteahhit Murat Kumsel İnşaat'ın 2014 tanıtımı:
"2651. Cadde, İşbir Sünger Sokak No:1, İşbir Sünger Fabrikası yanı", 5 blok (Zümrüt, Yakut,
İnci, Safir, Lal), 330 daire. bilgiemlak'ın "Ela Concept" poligonu 46653/2'ye denk düşüyor
AMA o parsel uyduda hâlâ boş ve TKGM "2 adet tek katlı kargir ahır" diyor — yani proje
gerçekleşmemiş olabilir. Sınır YAZILMADI; metin "proje" çerçevesinde yazıldı. Bu proje
tamamlandı mı, yoksa kayıt kapatılsın mı?

✅ **KAPANDI — kanat-yapi-evleri SİLİNDİ (Özgün, 2026-07-28): "hiçbir kayıt bulamadık".**
(Eski not:) Google/Yandex/OSM/bilgiemlak/ticaret sicili — hepsinde
sıfır. Ama ad, sahibinden.com'un Ata Mahallesi "Site Seçiniz" listesinden geldi (kayıt oradan
üretildi), yani uydurma değil. Portalda hâlâ görünüyor mu, gerçek bir yerleşim mi?

🔍 **KONUMU BULUNDU, SINIR ÇİZİLEMEDİ:** kurtulus-sitesi (Güzelkent 514. Sk., Google Maps
doğrulamalı) — TKGM o noktada hâlâ ada numarasız kadastro parseli ("Tarla") döndürüyor,
Güzelkent'in bu kuşağı imar parseline dönüşmemiş. Adres ve koordinat kaydedildi.

### Kalite turu bulguları (2026-07-17 akşam)
- ✔ Türkçe ek üretici (lib/turkce.ts) + 7 dosyada tapu-typo temizliği (Bolk/Betanarme/Karğir/
  Dublek/Luşan/Apartman×2) + komşu-siteler ağı.
- **DUPE KANIT TABLOSU (Özgün'e):**
  (a) ✅ concept-eryaman dupe ÇÖZÜLDÜ 2026-07-17 (Özgün onayı): ŞŞ kopyası silindi,
      YS/concept-eryaman'a kalıcı yönlendirme eklendi.
  (b) izoser (Şeker 45064/16, 825 m² Kİ) vs izo-ser (SOA 46362/1, 10 katlı) → İKİ FARKLI
      parsel; aynı müteahhidin iki projesi mi tek mi? → Özgün.
  (c) ilk-umut (46263/3, 7.601 m²) vs demirglass (46263/2) → AYNI ADANIN komşu parselleri;
      be ikisini tek başlıkta gösteriyor (İlk Umut (Demirglas)) → tek site mi? → Özgün.
  (d) ✔ sumeyra-sitesi (ŞŞ 46224) + sumeyra-2 (Ata 46259) İKİ AYRI GERÇEK SİTE — dupe değil,
      aday notu kapandı.


### Soru turu + final süpürme (2026-07-17 öğleden sonra)
- ✅ SORU TURU SONUÇLARI (Özgün): Eston birleşti; Ersan=Köşk (silindi); eryaman-renk silindi
  ('Renk Villaları diye geçiyor'); 18679=ARSLANLAR (önce Çağrıkent dedi, düzeltti; Google
  Çağrıkent pini yanlış, 'Çağrıkent yok' → dosya silindi); Elif Elvan=Seyitoğulları (46383'te
  zenginleşti); 'Utkukent 2 var 1 yok' → utku-kent-1 silindi; beloren=Belören Manzara kesin
  (erkent-umut silindi); bölge dışı 5'li silindi (sky-goksu/meric/ekiciler/kiratli/tuna-park);
  gestas-toki silindi (genel ad). Botanik sorusunda yoruldu → kalan otonom.
- ✅ ahikent 46644/1 DOĞRULANDI (Yandex 'Ahikent Sitesi SOA' pini tam mevcut parsele düştü;
  be'nin 'Laleevleri' etiketi yanlış/karışık) — tapu quote ile yazıldı. Ayrıca 'Öz Ahikent
  Sitesi' YS 39.99849/32.62021 YENİ ADAY (Özahikent'in kendisi olabilir).
- ✅ eser-yapi-evleri 44749/1 (57k boş arsa) → 44752/1 REMAP (Yandex tam-ad pini; 11 katlı Kİ
  apartman) + yazıldı. susuz/eser-yapi-sitesi hâlâ belirsiz (muhtemel dupe) → Özgün.
- ✅ alpar Kİ formatıyla yazıldı (47541/3).
- Yazıcı ipucu: Yandex 'Yazıcı Opensky Konutları' (Zirve Cad) — yazici-modern ile bağ? → sonra.
- KALAN 25: Botanik ikilisi (10-botanik + botanik-sitesi ↔ Botanik Evleri 43253/6 /Arissa/Yeni
  — isim kanıtı yetersiz, eşleştirme Özgün'e),   manzara/mercankent-manzara, cumhuriyet-SOA 17491, 4-devlet+goksu-metrokent (okul parselleri),
  tan-yildizi, yazici-modern, zekioglu, yildiz-life, hotki-meydan, kurtulus (pin tarlaya düşüyor),
  celikler, konut-sitesi (YS), 75-yil, turk-konut (ŞŞ), kanat, ortak-grup, enday, dostlar/tatlı-
  yamaç mahalle taşımaları — hepsi Özgün'ün yerel bilgisine kaldı.
### Villa turu (2026-07-17 gece — be villa dizini + TKGM marker eşleştirme)
- ✔ 5 adasız kayıt haritalandı+zenginleşti: eczacilar=19516/6 (20 dubleks), angora-güzelkent=19516/5
  (22 dubleks), erenkoy=19517/4 (16 villa), korukent=19517/1 (16 dubleks), kardelen-güzelkent=19504/1
  (16 dubleks). Yöntem: be sayfa Enlem/Boylam işaretçisi → point-in-polygon.
- **Özgün'e sorulacak (kanıt hazır):** kosk-sitesi + ersan-sitesi ↔ be 'Köşk (Ersan) Sitesi no:17'
  TEK site, 19516/4 (16 dubleks, 5.439 m²) → birleştirme onayı. renk-villalari +
  eryaman-renk-villalari ↔ be 'Renk Villaları no:14' TEK site, 19516/2 ('Otuzaltı Blok Kargir
  Villa', 12.624 m²) → birleştirme onayı.
- Portakal Çiçeği ailesi verisi TAMAMLANDI (3 be kümesi ↔ 3 dosyamız, eşleşme → Özgün):
  (a) 18450 'Portakal Çiçeği' bloklar 119, 119-1..119-5 (6 blok, be alan 5.621);
  (b) 18464 'Portakal Çiçeği' bloklar 7-1, 9-2, 11-3, 13-4, 15-5, 17-6 (6 blok, be alan 5.988);
  (c) 19517/2 '14.Blok Kargir Apartman' (villa bölgesi, 11.276 m²).
  Dosyalar: portakal-cicegi, portakal-cicegi-2, 1-portakal-cicegi → hangisi hangisi? Özgün.
- ✅ ESTON 2 BİRLEŞTİ 2026-07-17 (Özgün onayı): eston-2-sitesi silindi, ad eston-bloklari'nda altAd.
  be 'Eston 2 Blokları' = 4 ada: 17338 (6 apt), 17339 (5), 17340 (5), 17342 (3) — TKGM'den
  dördü de çekildi (KM). Bizim eston-bloklari 17342'de haritalı ve altAd'ı ZATEN 'Eston 2
  Blokları'; eston-2-sitesi ise adasız boş dosya. Birleşince: tek kayıt, 4 ada, MultiPolygon.
  (SOA/eston-sitesi 17487-90 AYRI — o 2. Etap Eston'u.) 17341=Çamlıca (be), 17333 muhtemelen Eston 1.
- ✔ goksu/bahar-sitesi = Polsan 1 Bahar 46481/1 (7 blok, 26.051 m²) — be marker kanıtı,
  haritalandı+zenginleşti. (eryaman/bahar-sitesi hâlâ adasız, AYRI site.)
- ✔ seyh-samil/onur-sitesi = 46215/5 ('A-C Bloklardan Oluşan 2 Adet Karğir Apartman',
  10.479 m²) — be marker parselin içinde; haritalandı+zenginleşti. Not: 46215/4 'Tarla' Kİ!
- Boşta parseller: 19516/1 (22 blok, 8.303 m²) ve 19517/3 (16 villa, 4.991 — Erenköy'ün ikizi
  olabilir; be Erenköy alanı 9.579 ≈ /3+/4 toplamı) → sonra.
- YENİ villa-adayları (repo'da yok): Bizim Şirinköy (19508), Doktorlar no:3 (19509), Eylül (19528),
  Göksu no:24 (19505) & no:7 (19524), Metrokent (19530), Özenkent 2 (19531), Saçak 91 (19523),
  Seda Terasevler (19529), Yunus Kent (19514), Büyük Ankara (18475), Ankara Anadolu (18474),
  Çağdaş Sistem (18472), Çözümkent (18480), Gardenya (18479), Şelale (18451), Boyut (18487),
  Nazlı Deniz (18488), Çağdaş-91 (18491), Didem (18489) → Özgün: kayıt açılsın mı?
- yuksel-kent-91 bizde 47614'te; be villa dizini ayrıca 'Yüksel Kent no:1' 19503 gösteriyor —
  iki ayrı site olabilir → sonra. YS korukent-sitesi (19508/1) ↔ be 'Korukent 91 no:10' —
  bizim YS kaydı muhtemelen Korukent 91, Güzelkent korukent (19517/1) ayrı → altAd sonra.
- ✔ gode-yasam şüphesi KAPANDI: 46620/2 tapusu gerçek bina kaydı (parti 54'te zenginleşti);
  goksu-arma sınırı 46454/1 TKGM geometrisiyle birebir doğrulandı.
- ✔ kent-konaklari = 46531/1 (5 blok A6-96..C7-92, 24.135 m² KM) — be+tapu birebir, haritalandı.
- **gestas-toki kimlik ipucu**: Gestaş İnş. A.Ş. = TOKİ Eryaman 6. Etap 1. Kısım (1.660 konut)
  müteahhidi; 'Atakent 2005 TOKİ+Gestaş, 286.000 m²' (emlakkulisi/egefen). Dosyamız muhtemelen
  Atakent TOKİ bloklarının halk ağzındaki adı → ayrı site mi genel ad mı? Özgün.
### Kalanları-hallet turu (2026-07-17 gece son — 16 kayıt daha)
- ✔ Kİ-arsa dürüst formatıyla yazıldı: cagdas-onur 45834/3 (be sayfası, 5 blok 6-1..6-10),
  gold-stone 46411/1 (5 blok), tekirdag-park 46193/1 (pin ✓), emin-guven (44754 — pin komşu
  /2'ye düştü, adalar /4'te bırakıldı, alansız yazıldı), batihan, bordo-gol (pin ✓),
  botanik-park (pin ✓), goksu-park-vadi 63404/3 (adasızdı, haritalandı), maviler-ipek (minimal,
  5611. Sok), akasya 46659/2→46653/1 REMAP (pin+2651. Cad; eski arsa parseli yanlıştı).
- ✔ Proje kimliğiyle yazıldı: mes-polaris (MES İnş, 4 blok 206 daire, Yeni Batı), goksu-marina
  (ARUS GRUP, etaplı; 2. etap 58 daire teslim 12/2026), may-tower (May Ankara AŞ, 12 kat 48
  daire), kayra-loft (minimal), yesil-vadim (minimal, Gülüm Cad — 46216 tapu karmaşası notta
  sürüyor), acar 46267/3 (be site sayfası: Eren 7A/Emre 7C/Altıntaş 7D = tapu A-C-D birebir,
  eski 'Gülistan' çelişkisi ÇÜRÜDÜ), eston-bloklari 4 adaya tamamlandı (17338-42).
- ✅ BÖLGE DIŞI 5 KAYIT SİLİNDİ 2026-07-17 (Özgün onayı): sky-goksu, meric, ekiciler, kiratli-akropolis, tuna-park. SKY GÖKSU BÖLGE DIŞI TEYİT: Sky-B (Land Home) projesi YUKARIYURTÇU'da (2 blok 11+10 kat,
  146 daire) — kayıt kapsam kararı → Özgün. Yıldız Life hâlâ hayalet.
- BOTANİK AİLESİ HARİTASI (3 dosya ↔ 4 Yandex kaydı, Özgün'e): 'Botanik Evleri'=43253/6
  (A-C 11'er katlı + D 4 katlı ofis, 6.901 KM — GERÇEK BİNA); 'Arissa Botanik' 39.98689/32.68566;
  'Yeni Botanik' 39.98706/32.68644; bizim 10-botanik (eski pin Arissa civarı; 43264/8 ana
  taşınmaz YANLIŞTI) + botanik-sitesi (adasız) → hangisi hangisi? Özgün.
### Yandex+OSM nokta zinciri turu (2026-07-17 gece geç — 18 kayıt çözüldü)
- YÖNTEM KİLİDİ AÇILDI: TKGM nokta API'si Referer başlığıyla ÇALIŞIYOR
  (https://parselsorgu.tkgm.gov.tr/ referer'ı şart). Yandex suggest-geo (anahtarsız) →
  ymapsbm1 URI protobuf'undan f32 lat/lng decode → nokta sorgusu → parsel. Nominatim de kullanıldı.
- ✔ Çözülenler: kainat=46418/1, rayli-sistemciler=44774/2, dogasu=44756/1, turku=43252/4 (Yuva),
  golkent=Gölkent 2=46457/1 (paylaşımlı, OSM iki Gölkent'i ayrı gösterdi), sarmasikli=44763/4,
  turuncu=44776/2, izgi-park=45889/2, dostlar-birikim=44776/3 (TAPU ATA — dosya susuz'da,
  taşınmalı mı → Özgün), duru-life=63268/3, tatli-yamac-palmiye=44784/1 (TAPU ATA — dosya
  susuz'da → Özgün), park-sera=43264/7, turk-konut-calisanlar=46512/9 (37.340 m² Türkkonut),
  bahar-eryaman=46380/2, sumeyra-2=46259/1 (Kİ), kucuk-ankara=19516/1 (villa kümesinin BOŞTA
  parseli — o soru kapandı), sehit-ferhat-koc=18645/1 (be'nin 'Eray-3'ü; eski ad altAd yazıldı),
  ataturk-altay=17313/1.
- Yeni ipuçları/çelişkiler:
  * beloren = Yandex 'Belören Manzara Evleri' (44780/2 = bilinen 7.955 m² Kİ arsa; erkent-umut
    aynı parsel şüphesi sürüyor) → hâlâ arsa, yazılamaz.
  * ata/manzara-evleri ↔ Yandex 'Göksu Manzara Evleri' 63379/7 (14 katlı KM) — mahalle çelişkisi → Özgün.
  * eser-yapi karmaşası: Yandex 'Eser Yapı Evleri' Ata 44752/1 (11 katlı Kİ apartman);
    bizde ata/eser-yapi (57k ARSA şüphelisi) + susuz/eser-yapi-sitesi (adasız) → Özgün.
  * kurtulus (Güzelkent) pini kadastroda 'Tarla'ya düştü (697/698 parseller) → çözülemedi.
  * meric = Yandex 'Meriç 88' AYYILDIZ Mh (bölge dışı güney!) — bizim yesilova/meric bu mu? → Özgün.
  * botanik-cumhuriyet: Yandex 2 aday — 'Arissa Botanik' + 'Yeni Botanik' (Cumhuriyet, ~80 m arayla);
    bizim düz 'Botanik Sitesi' hangisi? → Özgün.
  * ✔ PORTAKAL AİLESİ ÇÖZÜLDÜ (Yandex 1/2/3 pinleri be markerlarıyla birebir): 1-portakal=18464/1
    (kapı 7-17), portakal-cicegi-2=18450/1 (kapı 119 ailesi), portakal-cicegi(düz)=19517/2
    (14 blok, 'Portakal Çiçeği 3') — üçü de yazıldı.
  * ✔ kosk-sitesi=19516/4 yazıldı (Yandex 'Köşk Sitesi' pini birebir; Ersan için ayrı pin YOK
    → ersan-sitesi muhtemel dupe, silme onayı Özgün'de). ✔ renk-villalari=19516/2 yazıldı
    (36 blok villa; eryaman-renk-villalari aynı 687. Cad adresli muhtemel dupe → Özgün).
  * tuna-park-evleri: Yandex'te sadece 'Tuna Parkı 2013' (Tunahan'da PARK, site değil) →
    kayıt hayalet/park karışıklığı olabilir → Özgün. ekiciler: 'Ekiciler Park' YENİ BAĞLICA
    Mah (bölge dışı) → yesilova/ekiciler kaydı şüpheli → Özgün.
  * kiratli-akropolis: Nominatim 'Akropolis Konutları' ERGAZİ İmar 42966/1 ARSA (Batıkent tarafı,
    bölge dışı) → kayıt kapsam içi mi? → Özgün.
  * goksu-park-vadi pini 63404/3 ARSA Kİ (10.498 m²) → arsa/yeni proje listesine.
  * YENİ ADAYLAR (Yandex, repo'da yok): Yavuz Selim Sitesi (YS), Türkkonut Betim (Devlet),
    Türkkonut Havacılar 2 (Göksu), Türkkonut Selinkent (ŞŞ), Umut Yapı (Ata), Laçin Eryaman,
    Meydan Eryaman (Göksu), Eylül YS 39.99805/32.61881, Oyak 555 Konut (Eryaman 39.98032/32.62568),
    Hotki Ritm Residence (Yeşilova 4014. Cad No:12 — hotki ailesine ek).
  * ✔ kardelen-SOA = 'Kardelen Konutları' 46619/7 (3 blok, Şeker kadastro) — yazıldı.
  * ✔ intes-dogakent ÇÖZÜLDÜ: be 'Doğakent' bölge sayfası (dogakent-51) → 16414+16415+16418
    (4'er blok KM, toplam 12 numaralı blok, ~21.560 m²) — 3 adalı MultiPolygon yazıldı.
  * **Doğakent bölge dökümünden yeni kanıtlar**: 46383='Seyitoğulları Sitesi 4-10.Blok'
    (elif-elvan oraya mapped — YANLIŞ olabilir); 46384='ELİF ÖZGEN Sitesi 1/1-A/1-B/1-C' —
    bizim 'Elif Elvan' muhtemelen 'Elif Özgen'in bozuk yazımı, gerçek adası 46384! → Özgün
    (isim de düzelir mi?). 46382='Cumhuriyet Sitesi 12-20.Blok' (Doğakent'te GERÇEK bir
    Cumhuriyet Sitesi — SOA/cumhuriyet-sitesi 17491 kimlik şüphesiyle bağlantılı olabilir → Özgün).
    46381=Emek+Uğur Apt; 46385=Armina Park/Ayka-Park/Salkuma (yeni adaylar).
  * ada 44774: /1,4,5,6 yok; /2=raylı-sistemciler, /3=ata-life → ikinci kaydın parseli
    bulunamadı (belki komşu ada) → Özgün/Maps.
  * ✔ demirglass = be 'İlk Umut Sitesi (Demirglas Sit.)' 46263/2 (11 katlı A konut + 1 katlı
    B ticari, 6.162 m² KM; 46263/1=13.763 m² TARLA) — yazıldı. Dosya YS'de, bölge ŞŞ → taşıma? Özgün.
  * be Sümeyra sayfası başlığı '46424' YAZIM HATASI (marker 46224 bölgesini gösteriyor; 46424=
    Karkonut doğru). 'Sümeyra Sitesi' (A-3/B-1 blokları, ~46224) repo'da YOK — muhtemel Sümeyra 1,
    yeni aday; bizim sumeyra-2=46259/1 Yandex tam-ad pinliyle kaldı.
  * ŞŞ Konutları sayfasından YENİ ADAYLAR: Ata Yıldız Yaşam (46271), Demirer Park (46261),
    Düşkent + Övgü İletişim (46423), Umar (46272), Liderkent (46274), Tuğçekent (46215 —
    Onur'un adası!), Sümeyra-1 (46224). Teyitler: kuryap=46275 ✓, inci-park=46222 ✓ (be'yle birebir).
  * 46216 KARMAŞASI: be 'Cumhuriyet Sitesi (46216)' diyor; bizim yesil-vadim 46216/1'de ARSA
    bulmuştu. Cumhuriyet Sitesi belki başka parselde (/2+?), yesil-vadim kimliği belirsiz → Özgün.
  * Özahikent bölge sayfası (ŞŞ, marker 40.0004/32.6256): ahikent-sitesi'nin gerçek evi ŞŞ
    462xx bölgesi olabilir (46644=Laleevleri şüphesiyle uyumlu) → Özgün.
- Aranıp BULUNAMAYANLAR (2026-07-17 gece; dizin-düzeyi kayıt var, olgu yok — Özgün/Maps gerekli):
  75-yil (SOA), demirglass, celikler, konut-sitesi (YS), turk-konut (ŞŞ), turk-konut-calisanlar,
  intes-dogakent, bahar (eryaman), ataturk-sitesi, izgi-park (altay), duru-life, tuna-park,
  enday, dostlar-birikim, eser-yapi-susuz, tatli-yamac-palmiye, ekiciler, meric, kucuk-ankara-
  villalari, kurtulus, sehit-ferhat-koc, 1-portakal ailesi (Q), Ata 11'lisi (dogasu/kainat/
  kanat/manzara/mercankent/ortak-grup/rayli-sistemciler/sarmasikli/sumeyra-2/turuncu), SOA
  kardelen, goksu-park-vadi, kiratli-akropolis (Kıratlı Emlak İnş, Yeni Batı, '144 daire+6
  villa' TEK kaynak — yazılmadı), turku-sitesi, park-sera, botanik-cumhuriyet, gestas-toki (Q).

### Mega tur 2 notları (2026-07-17)
- ✔ 65'lik kota kuyruğu İŞLENDİ 2026-07-17 gece (kota tazelendi, 74/74 sorgu OK):
  58 yazıldı (6'sı dürüst ticari format: pasaj-eryaman, kocaklar-tower, lowland-business,
  rema-delux, address-yesilova + 1), 7 ARSA atlandı (aşağıda).
- YENİ ARSA/pin şüphelileri (kuyruktan): yesil-vadim-sitesi (46216/1, 20.134 m² Kİ ARSA!),
  alpar-sitesi (47541/3 Kİ), kayra-loft (47529/1 ana taşınmaz), may-tower (47538/1 ana
  taşınmaz) — muhtemelen yeni/bitmemiş projeler ya da pin hatası → Özgün.
  (bordo-gol, goksu-marina, maviler-ipek zaten eski listede.)
- YENİ ARSA/pin şüphelileri: 10-botanik (43264/8 ANA TAŞINMAZ), batihan (43255/2 Kİ),
  botanik-park-evleri (43254/6 Kİ), mes-polaris (62662/2 = SPOR TESİSİ!), akasya-SOA
  (46659/2 arsa — Bordo Life adasında). → Özgün/pin düzeltme.
- Kadastro kimlik haritası TAMAMLANDI: Eryaman=124123, Şeker=124128, Ata=205665,
  Susuz-köy=123431 (62xxx+64xxx!), Susuz-İmar=123432 (63xxx), Yuva=123403 (43xxx).
- ✔ ASM Gold parsel sorusu ÇÖZÜLDÜ 2026-07-17 gece: TKGM 45926/3 = "A Blok 9 Katlı + B Blok
  8 Katlı" (4.753 m²), 45926/2 = "9 Katlı Betonarme Apartman" (3.000 m², muhtemelen C blok).
  Site GERÇEKTEN iki parselde → asm-golt adalar 45926/2+3 oldu, MultiPolygon sınır çizildi,
  yetim gold sınır dosyası silindi. (45926/4 = Gençler, 17 katlı — hâlâ şüpheli listesinde.)

### atakent-2-sitesi — ✅ SİLİNDİ 2026-07-17 (Özgün: 'sadece Atakent 2 Sitesi diye bir site yok'; Cumhuriyet ve Metro kayıtları asıl)

### Susuz/Göksu toplu tur sonuçları (2026-07-17 sabah)
- 3. Susuz kimliği: 'Susuz' köy kadastrosu id=123431 (64xxx adaları; İmar=123432).
- PIN ŞÜPHELİLERİ (parsel konut değil): sky-goksu 63356/2 ARSA (Yukarıyurtçu şüphesiyle
  uyumlu), yildiz-life 63316/2 ARSA, goksu-metrokent 46479/2 = İLKÖĞRETİM OKULU(!),
  goksu-marina 64674/5 = 1.140m² ana taşınmaz arsa (Marina etap/pin sorusu) → Özgün/yeniden pin.
- merkez/angora/goksu-bilge şüphelileri korundu (yazılmadı).

### Yeni site adayı: Altaş İnşaat 'Relax Line' (2026-07-16)
- Yandex: 'Altaş İnşaat Relax Line, Şeker Mahallesi, 2 blok 65 konut' — repo'da kayıt YOK
  (Relax Göksu/Eryaman ile karıştırma — bu Altaş'ın ayrı projesi) → Özgün: kayıt açılsın mı?

### Susuz/Göksu toplu TKGM kuyruğu — kota bitti (2026-07-16 akşam)
- Susuz-İmar mahalleId=123432 KEŞFİ; 19 parsel çekildi (17 yazıldı + 2 ARSA:
  bordo-gol 63376/6 kat irtifaklı, maviler-ipek 63275/1 ana taşınmaz → Özgün).
- KALAN 55 kayıt scratchpad susuz-goksu-kalan.json'da — yarın kota tazeyken
  aynı script'le (63xxx→123432, 46xxx/48xxx/16828→124123) çek + Ata-formatı yaz.
- Not: yildiz-life pini 63316/2'ye düşüyor (ARSA), dosyada 63316/1 — teyit.

### Ata ARSA-nitelikli parseller (2026-07-16, parti 48 — 8 kayıt zenginleştirilemedi)
Tapuda bina kaydı yok (Arsa + çoğu kat irtifaklı = yeni proje/cins tashihsiz):
ata-life (12.748m²), beloren + erkent-umut (aynı 7.955m² arsa — İKİSİ AYNI PARSELDE, dupe/karışım şüphesi de var),
cagdas-onur (6.748m²), emin-guven (6.218m²), eser-yapi (57.342m² ANA TAŞINMAZ — dev boş arsa, pin yanlış olabilir),
gold-stone (23.540m²), tekirdag-park (21.949m²). → Özgün: bunlar yeni/bitmemiş proje mi, pinler doğru mu?
+ ayyildiz-sitesi (44759 Şenser/Selsen çakışması) yine atlandı.
+ genova tapuda 9 katlı OFİS-İŞYERİ çıktı (konut değil) — metne öyle yazıldı.

### yesilova/dogan-city + anka-vega — AYNI parsel 47544/2 (2026-07-16)
- İki kayıt da 47544/2'de haritalı; farklı isimli iki site (paylaşım?) ya da biri komşuya
  kaymış pin. Doğan City adresi 4016.Cd No:10 net → TKGM günü parsel/blok kontrolü.

### Susuz turu notları (2026-07-16)
- **MA1 Tower (goksu/ma1-tower) ipucu: müteahhidi büyük olasılıkla MA1 YAPI** (Majör Göksu'nun
  müteahhidi; hepsiemlak MA1 Yapı sayfası mevcut, geçmişi 'Neva PLAS 57 konut 2013-15') →
  bir sonraki turda MA1 Yapı proje listesinden teyit et.
- Lenora ailesi: 'Lenora Yaşam Konutları' + 'Lenora Nefes' iki ayrı proje; bizim lenora-goksu
  hangisi tam netleşmedi (tek-blok/2+1-3+1 bilgisi tek IG kaynağıydı, YAZILMADI).
- neovadi (63376, bordo-gol+paradise komşusu): veri ince, atlandı.

### Devlet kalanları — parti 38 notları (2026-07-16)
- **4-devlet-mahallesi-sitesi (18700/1): parsel tapuda '7 Katlı Betonarme OKUL, Üniversite,
  Araştırma'** — mapping yanlış görünüyor (okul parseli); sitenin gerçek adası → Özgün/TKGM.
- ✅ ornek-tes-is-sitesi SİLİNDİ 2026-07-17 (Özgün onayı; ad tes-is-bloklari'na alternatifAd).
- hotki-meydan (ADASIZ): be 18684'ü 'HOTKİ RESİDANCE' gösteriyor — ad farkı (Meydan vs Residance);
  cumhuriyet/hotki-bulvar da ayrı. Hotki ailesi netleşmeli → Özgün.
- 18674 'Lojman 8-A..D' (kayıt yok — lojman, kayıt açılmaz muhtemelen).
- Devlet 18680-85/18702/18704 ada sayfaları boş.

### firat-life-style-goksu-sitesi — ✅ SİLİNDİ 2026-07-17 (Özgün onayı; ad goksu-prestij'de alternatifAd)
- be'nin 'FIRAT LİFE STYLE GÖKSU konutları' dediği 46620/3, TKGM'de '5 Katlı A Blok +
  17'şer Katlı B,C,D,E' (15.523 m²) — goksu-prestij'in haritalı parseli ve '5 blok 192
  konut' verisiyle birebir örtüşüyor. → firat-life-style-goksu-sitesi dosyası SİLİNMELİ
  (Özgün onayı); 'Fırat Life Style Göksu' adı goksu-prestij'e alternatifAd yazıldı. ✔yarı-çözüldü
- 46524/1 (Eryaman kadastro): '3 Blok Kargir Apartman', 13.908 m² — be adı 'Oyak Atakent2
  Metro Sitesi'. atakent-metro-sitesi ile atakent-2-sitesi kayıtlarımız muhtemelen AYNI
  sitenin iki kaydı (dupe şüphesi); atakent-metro'nun eski koordinatı da (32.6263) yanlış
  bölgeyi gösteriyor. → Özgün: Atakent Metro = Atakent 2 mi? Onaydan sonra 46524/1 haritalanır.
- 46662 İnci Park araması: /3 'Yedi Katlı A Blok' KAT İRTİFAKI (muhtemelen be'deki 'İnşaat
  A/B' blokları), /1,/2,/4,/5 Arsa. İnci Park'ın 20A/B/C blokları 46662'nin kalan
  parsellerinde olabilir ya da be konumu yaklaşık → çözülemedi, inci-park 46623/4'te kaldı.
- zekioglu-rezidans (46657/1): parsel tapuda ARSA (kat irtifaklı) — bina pini şüpheli;
  be 46657'yi 'Neva Prestige Metro Rezidens' (yeni proje) gösteriyor. → Özgün.

### Mega dalga D-2 ipuçları (2026-07-15, Yeni Batı + Göksu kentsel gelişim taraması)
- **firat-life-style-goksu-sitesi'nin evi bulundu: be 46620'yi 'FIRAT LİFE STYLE GÖKSU
  konutları' gösteriyor** — relax-goksu (46622) mükerrer şüphesi YANLIŞmış, ayrı site!
  AMA 46620 bizde gode-yasam-konutlari'na haritalı → gode-yasam pini şüpheli;
  TKGM günü 46620 parselleri incele, firat-life-style'ı haritala, gode-yasam'ı araştır.
- zekioglu-rezidans (46657): be aynı adayı 'Neva Prestige Metro Rezidens 1-2.Blok'
  gösteriyor (Neva Prestij bizde 46643'te, müteahhit PDF'iyle) → Neva'nın 2. parseli mi,
  zekioglu pini mi yanlış? Özgün/TKGM.
- siyah-beyaz-evler (44781): be 'Adfa İnş. 1. Blok' gösteriyor → teyit gerekli.
- Çıplak ada sayfaları (blok döküsüz): Yeni Batı 62xxx modern projeleri ve Susuz 63xxx
  kentsel dönüşüm adaları be'de içeriksiz — bu ~60 kayıt Google/proje portalı yolu istiyor.

### Mega dalga D — şüpheliler + ipuçları (2026-07-15, be ada sayfaları taraması)
İPUÇLARI (kota günü işlenecek):
- **atakent-metro: be 6-etap sayfası 'Oyak Atakent2 Metro Sitesi 46524 Ada' diyor** —
  eski aday 46530 değil! TKGM'de 46524 sorgula, haritala.
- **inci-park-evleri-sitesi: be 46662'de 'İnci Park Evleri 20A/B/C' gösteriyor** —
  46623/4 çakışma sorusunun cevabı bu olabilir; TKGM günü 46662 kontrol.
ŞÜPHELİLER — 2026-07-17 gece BÜYÜK TEMİZLİK: Yandex pinleri 8 şüphelinin TAM parselimizin
içine düştü → mapping'ler bağımsız doğrulandı, tapu verisiyle zenginleştirildi (be'nin farklı
ad göstermesi metne yazılmadı, aşağıda not olarak duruyor):
✔ ayyildiz (44759/1, 6 blok 10-11 katlı KM) — be'nin 'Akgüner KYK+Selsen' iddiası nota düştü.
✔ ilbeyi (45890/2, 2 blok) — be 'İlbeyli→Doktorlar' bağlantısı Özgün'e soru olarak kalabilir.
✔ vizyon-prestige (45898/3, 16 katlı, tapu OFİS/rezidans Kİ) + ✔ mood-street (45898/2,
  14+4 katlı, tapu OFİS/rezidans KM) — Söğüt Cad ticari koridoru; dürüst rezidans formatı.
✔ beyaz-residence (45794/15, 11 katlı KM) — be 'Tertipler/Tusun' notu arşive.
✔ gencler-sitesi (45926/4, 17 katlı KM) — be 'Gerim' adı → Gençler=Gerim mi? Özgün (metinde yok).
✔ goksu-bilge (46457/1 paylaşımlı) + ✔ city-life (CUMHURİYET dosyası; 62658/2, A12+B13 KM).
KALAN ŞÜPHELİLER (Yandex'te de yok / çözümsüz):
- SOA/tan-yildizi (46662), yazici-modern (46664): hiçbir kaynakta yok.
- zekioglu-rezidans (46657), sky-goksu, yildiz-life, merkez-sitesi (Yandex: Merkez yalnız
  Ahi Mesut'ta ×3 — bizim kayıt muhtemelen yanlış/bölge dışı), angora-goksu (Yandex: yalnız
  Yapracık) — Özgün.
- ata/eser-yapi, genova, gold-life, panorama ×3, siyah-beyaz, twin-towers, armoni-life,
  atasehir (46412 'İnşaat'), endora-plus: ada sayfalarında blok dökümü yok.
- ✅ Şehr-i Huzur Gold = ASM Gold Urhal ÇÖZÜLDÜ 2026-07-17 (Özgün StreetView tabela kanıtı; birleştirildi, sehr-i-huzur-gold silindi).
- ✅ Şehr-i Huzur Prestij = ASM Prestij Urhal ÇÖZÜLDÜ 2026-07-17 (Özgün onayı; be 18-A/18-B + tapu '9 Katlı A Ve B Blok' örtüştü; dosya asm-prestij-konutlari olarak yeniden adlandı, eski ad alternatifAd, tapu alıntısıyla zenginleştirildi).
- eryaman/beyaz-residence (45794): be 'Tertipler/Tusun Apt' gösteriyor, Beyaz yok.
✅ elif-elvan ÇÖZÜLDÜ 2026-07-17 (Özgün: 'Seyitoğulları ile aynı site'): 46383/1'de kaldı, tapu quote + altAd yazıldı. (Elif Özgen 46384 AYRI — yeni aday.)
- eryaman/gencler-sitesi (45926): be 'Gerim Sitesi' gösteriyor.
- seyh-samil/acar-sitesi (46267): be 'Gülistan Apt.4-A' gösteriyor (Acar A-C-D bekleniyordu).
- SOA/cumhuriyet-sitesi (17491): be adayı Kutlutaş-2 kümesinde, apartmanlar İLÇE adlı
  (Çayeli, Gebze, Havran, Kaman...) — kayıt kimliği belirsiz.
- SOA/ahikent-sitesi (46644): be 46644'ü LALEEVLERİ gösteriyor → Ahikent mapping'i YANLIŞ şüphesi güçlendi.
- SOA/tan-yildizi (46662), yazici-modern (46664): be listelerinde yok.

### Göksu göl-kuşağı — parti 33 notları (2026-07-15)
- merkez-sitesi + angora-sitesi 46456/1'de haritalı AMA be 46456 blok listesinde
  Merkez/Angora YOK (liste: Ağaçlı Göl, Akdüzen, Kafdağı, Mutlu, Utkan, Uzuner, Yenigüç)
  → pin kayması ya da be eksiği; TKGM günü + Özgün'le teyit, ikisi de zenginleştirilMEDİ.
- goksu-bilge-sitesi de 46457'de haritalı ama be 46457 listesinde YOK (Akşafak/Gölkent2/Havacılar/Utkan var) → aynı şüphe grubunda.
- golkent-sitesi (ADASIZ): be'de 'Gölkent' (46455 = bizim golkent-1) ve 'Gölkent 2'
  (46457, bloklar 7-5/7-6) var → golkent-sitesi hangisi? Gölkent 2 mi, golkent-1 dupe mu?
- YENİ SİTE ADAYLARI (repo'da yok): Eceser (46453), Göksu Aura (46453, 3/3A),
  Utkukent (46453-46454, Çınar/Kardelen apt), Hava Destek (46455, 5-5/5-6),
  Akdüzen (46456, 5A/5B), Kafdağı (46456, 1B), Uzuner (46456, 5D — altay/uzuner-konutlari
  ilişkisi?), Gölkent 2 (46457) → Özgün: kayıt açılsın mı?
- Tamamlama kuyruğu (TKGM günü, 5 sorgu): 46453/1, 46454/1, 46455/1, 46456/1, 46457/1
  alan+nitelik → 10 site metnine eklenebilir. goksu-arma sınırı goksu-evleri kopyası
  (aynı parsel varsayımı) — TKGM günü 46454/1 geometrisiyle çapraz kontrol.

### Türkonut Göl Bölgesi — parti 32 notları (2026-07-15)
- YENİ SİTE ADAYLARI (repo'da yok, be ada sayfalarında var): İlksebat Sitesi (46486'da
  10/12/14 blokları), Yuvam Başar Sitesi (46489'da 59-4/59-5) → Özgün: kayıt açılsın mı?
- serender-sitesi bizde 46487/5'te haritalı; be Serender'in 8+10 bloklarını 46488'de
  gösteriyor → parsel teyidi (yarın TKGM 46487/5 + gerekirse düzeltme).
- Tamamlama kuyruğu (yarın 5 sorgu): 46486/2, 46488/2, 46489/1, 46491/2, 46487/5
  alan+nitelik çek → 17 site metnine ada alan cümlesi eklenebilir (rakamsız kurala uygun).

### SUSUZ modern küme — dikkatli araştırma günü gerek (2026-07-15 ön izleme)
- sky-goksu: Galaxy Yapı projesi ('Ödüllü SKY-B', 1+1/2+1/3+1, İNŞAAT SÜRÜYOR); bir IG
  kaynağı 'Yukarıyurtçu Mahallesi' diyor ama bizim kayıt Susuz'da haritalı → mahalle/kayıt
  teyidi şart. Ayrıca 'Galaxy Göksu' (2 blok 16 kat 126 daire 4+1) AYRI proje — karıştırma.
- goksu-marina: Arus Grup; 'Göksu Marina 2' etabı DEVAM EDEN inşaat (konutradar) —
  bizim kayıt 1. etap mı, hangi etap haritalı? Etap ayrımı yapılmadan zenginleştirme yok.
- Devam eden projelerde sayılar lansmanla değişebiliyor — teslim edilmişleri önceliklendir.

### 3. ETAP KUYRUĞU — kota doldu, yarına hazır analiz (2026-07-15)
TKGM kotası bu kümenin başında bitti (173xx sorguları FAIL = kota, kayıt yokluğu DEĞİL).
mahalleId de belirsiz (124123 Eryaman değil; Şeker 124128 de değil — nokta sorgusuyla keşfet:
tekser koordinatı 39.997848/32.624475). bilgiemlak 3-etap-44 küme analizi HAZIR:
- tekser-bloklari (SŞ): 6 ada DOSYADA TAM (17322-27) → sadece TKGM sayım + zenginleştirme.
- tepe-bloklari (SŞ): dosyada 17335; küme 17333-37, diğer 4 ada SAHİPSİZ → tepe'ye eklenebilir (QA kontrolüyle).
- ictas-bloklari (SŞ): ADASIZ duruyor; be 3.Etap İçtaş = 17346-50 (5 ada, tümü sahipsiz).
  ESKİ 'SOA ictas dupe' ŞÜPHESİ YANLIŞ ÇIKTI — SOA İçtaş 17498 AYRI. Bu dosya 3.Etap İçtaş
  olarak haritalanmalı (5 ada + koordinat + sınır) + zenginleştirilmeli. Silme listesinden ÇIKAR.
- ✅ alarko-sitesi SİLİNDİ 2026-07-17 (Özgün onayı; ad alarko-bloklari'na alternatifAd; kümenin 6 sahipsiz adası hâlâ genişletmeye açık)
- eston-bloklari (17342) + camlica-sitesi (17341): be 'Eston 2' kümesi 17338-42 içinde;
  17338-40 sahipsiz. eston-2-sitesi (ADASIZ dosya) muhtemelen bu kümenin asıl kaydı →
  eston-bloklari ile mükerrer mi? Özgün. Çamlıca ayrı site (Çamlık/Çiçek deseni).
- Eston 1 kümesi (17328-32, 5 ada) ve Yardımcı-3Etap (17321,17343-45,17358) ve
  Sutek-3Etap (17352-54): repo'da karşılık kaydı YOK görünüyor — Özgün'e sor
  (yeni kayıt mı açılmalı, başka adla mı varlar?).

### SOA İntes kümesi — be gruplaması kaba (2026-07-15, QA kapısı yakaladı)
- bilgiemlak 'İntes Blokları' 4 ada gösteriyor (17468-71) ama 17470 = bizim
  camlik-sitesi, 17471 = cicek-sitesi. İntes kaydına eklemiştim, QA çakışma verdi
  → GERİ ALINDI; İntes 17468+17469 ile kaldı.
- Muhtemelen İntes yapımcı firmanın kümesi; Çamlık/Çiçek o kümede ayrı adlandırılmış
  siteler. Çamlık/Çiçek zenginleştirilirken bu bağ metne yazılabilir (TKGM verileri
  hazır: 17470 = 5 apt 6.276 m², 17471 = 5 apt 6.751 m²).

### SOA İçtaş-Kazım Sarı kümesinin sahipsiz 3 adası (2026-07-15)
- bilgiemlak 'İçtaş, Kazım Sarı Blokları' kümesinde 4 ada gösteriyor: 17480 (7 apt),
  17481 (9 apt), 17482 (6 apt), 17498 (6 apt = bizim ictas kaydı).
- Bizim kazim-sari-sitesi ise 17483'te (4 kârgir apt — be kümesinde YOK).
- 17480/81/82 (toplam 22 apartman) hangi kayda ait? İçtaş'ın mı, Kazım Sarı'nın mı,
  ayrı bir site mi? → Özgün'e sor; şimdilik iki kayıt kendi tek adasıyla zenginleştirildi.

### tunahan/kur — ✅ ÇÖZÜLDÜ 2026-07-17 (Özgün: iki kayıt 'Kur Sitesi 46495 Ada' + 'Kur Sitesi 46496 Ada' olarak adlandırıldı; jenerik kopya kaldırıldı)
- kur-sitesi (46496/2) ile kur-sitesi-c2b-2h (46496/2) AYNI ada/parseli taşıyor;
  bilgiemlak Kur Blokları'nı tek yerleşim, iki ada (46495+46496) olarak gösteriyor.
- C1B-2K ve C2B-2H kayıtları zenginleştirildi; jenerik "kur-sitesi" muhtemelen silinmeli
  ya da iki grubun çatı kaydı olarak mı kalmalı? → Özgün onayı.

### devlet/cagkent-sitesi — tapu niteliği "Tarla" (2026-07-15)
- 18673/1 TKGM'de nitelik "Tarla" + Kat İrtifak (15.885 m²) — binalar var ama cins tashihi
  yapılmamış görünüyor. Metne nitelik/kat mülkiyeti YAZILMADI, sadece alan verildi.
- Özgün'e bilgi: bu sitede satışta tapu cinsi sorusu gelebilir (arsa tapulu kat irtifakı).


### devlet/arslanlar + cagrikent — AYNI ADA ÇAKIŞMASI (2026-07-14)
- İki dosya da 18679 adasını iddia ediyor; bilgiemlak 18679'u "Arslanlar Sitesi" gösteriyor.
- Çağrıkent'in gerçek adası TKGM/başka kaynakla bulunmadan ikisi de zenginleştirilmedi.
- Devlet'te ayrıca bekleyen TAM eşleşmeler (sıradaki partiler): eryaman-royal-city↔"Royal"
  (18693, takma ad!), gulhayat (18698), ikizler (18695), mavi-koy (18689), mavikent (18691),
  mil-kooperatifi↔"Mil Koop" (18687), oray (18701), ozdenizyildizi↔"Özdeniz Yıldızı" (18705),
  sari-cinar↔"Sarıçınar" (18692), selcuklu (18690), sergah-evleri↔"Eryaman Sergah" (18675),
  turgut-aslan (18694), yeni-huzur-bahcesi (18677), yesiloz↔"Yeşil Öz" (18686),
  yildiz-tatil (18706). Tunahan'da da 7 TAM eşleşme var.

### Parti 21 kayıt tamamlama — ✅ TAMAMLANDI 2026-07-15 (6/6 TKGM doğrudan uç noktayla doğrulandı; adalar+koordinat+sınır+alan/nitelik yazıldı)
altay (18519), gulsah-95 (18518), sirin-91 (18653), yenigun-isigi (18465),
yesil-guven-kent (18490), yesimkent (18520) — dosyalarda adalar/koordinat alanı YOK;
TKGM açılınca 124123/{ada}/1 ile doğrula → adalar + koordinat (merkez) + sınır GeoJSON üret,
açıklamaya alan+nitelik cümlesi ekle.

### Çift-adalı / belirsiz eşleşmeler — 2026-07-16 KISMEN ÇÖZÜLDÜ
✔ gozde-91: 18641+18642 haritalandı (iki parselde 6'şar blok, toplam 12, ~9.972 m²).
✔ ozuguzelkent: +18665 eklendi (iki parselde 6'şar blok, toplam ~10.307 m²).
✔ aksu: 18512 doğrudan sorguyla haritalandı (6 blok=8/8A-8E, 5.072 m²) + zenginleşti.
✔ baskent-sular: 18477 haritalandı — tapu 'A ve B Blok 14 KATLI' ikiz kule! + zenginleşti.
✅ 18679/1 = ARSLANLAR KESİNLEŞTİ (Özgün 2026-07-17: önce Çağrıkent sandı, sonra 'pardon,
  Arslanlar'mış' diye düzeltti; be etiketi doğruymuş). Google'ın 'Çağrıkent' pini YANLIŞ konumda.
  Çağkent (18673) ayrı site (Özgün). cagrikent-sitesi SİLİNDİ (Özgün 2026-07-17: 'Çağrıkent yok' — Google kaydı hayaletti).
KALAN (Özgün/ek kaynak):
✔ gozde-1=18651 (bloklar 8/8A-8E), gozde-2=18652 (10 ailesi) — be blok sayfaları
  (gozde-1-sit-18651-ada-8-blok-4948 vb.) 2026-07-17 kanıtladı; haritalandı+zenginleşti, Özgün'e sorulmadı.
✔ Şeniz ÇÖZÜLDÜ 2026-07-17 (Özgün be kroki kanıtı): TEK site, A1-A3 (18516) + B1-B3 (18517);
  seniz-konut-kooperatifi silindi (alternatifAd olarak seniz-sitesi'nde), haritalandı+zenginleşti.
- 18519 ad çelişkisi (be kroki 'AKKONAK KENT' vs be sayfa 'Altay Sitesi'): Özgün 2026-07-17
  'karıştırma, atla' dedi → kayıt Altay Sitesi olarak KALIR, alternatifAd eklenmez, KAPANDI.
✔ mesa çifti ÇÖZÜLDÜ 2026-07-17 (be küme sayfaları): mesa-calisanlari-kooperatifi=18506+18507
  (4/4A/4B + 6/6A/6B blokları); mesa-sitesi=18659-18662 (12 blok: 7F/9E/11D + G→O).
  ÇAPRAZ DEĞİLMİŞ. Aynı gece TKGM ile 18660-62 çekildi (hepsi /1, 3'er blok KM) →
  mesa-sitesi 4 adalı MultiPolygon sınırla TAMAMLANDI (toplam ~18.985 m²).
✔ ipek-yapi ÇÖZÜLDÜ 2026-07-17 (Özgün: 'evet aynı yer, İpek Yapı Sitesi diye geçiyor'):
  18476 haritalandı+zenginleşti, 'İpek Sitesi' alternatifAd.
✔ 46544 çift-kayıt MEŞRU ÇIKTI 2026-07-17: be iki siteyi de aynı adada gösteriyor —
  Hassas Çizgi 3 blok (A12-56/B15-54/C13-52) + Özgün İpek 4 blok (A13-44/A14-48/B16-46/C14-50)
  = tapudaki 7 blok. İki metin de blok paylaşımına göre düzeltildi (parti 54'te ikisi de
  parselin tamamını sahipleniyordu).
✔ pinarkent-91 ÇÖZÜLDÜ 2026-07-17 (Özgün: 'aynı site'): 18511 haritalandı+zenginleşti (6/6A-6E blokları), 'Pınar Sitesi' alternatifAd.
--- (eski metin) ---
- gozde-1 + gozde-2 ↔ be "gozde-sitesi 18651-18652" (hangi dosya hangi ada? TKGM nitelik+konum ile ayrıştır)
- gozde-91 ↔ 18641-18642 (iki ada, tek dosya — Anka 2001 tipi çoklu parsel olabilir)
- seniz-sitesi + seniz-konut-kooperatifi ↔ 18516-18517 (iki dosya iki ada mı, tek site mi?)
- mesa-sitesi ↔ be "mesa-cls 18506-18507(?)"; mesa-calisanlari-kooperatifi ↔ be "mesa-sitesi 18659" — adlar ÇAPRAZ, dikkat!
- ozuguzelkent: dosyada 18664, be "18664-18665" — 18665 (anka taramasında görülen 5.212 m² 6 blok parseli) muhtemelen bunun 2. adası → teyitle ekle
- ipek-yapi ↔ be "ipek-sitesi 18476" (ad farkı var, nitelikle teyit et)
- pinarkent-91 ↔ be "pinar-sitesi 18511" (ad farkı büyük, temkinli)
- portakal-cicegi ailesi: 3 dosya (portakal-cicegi, portakal-cicegi-2, 1-portakal-cicegi) ↔ be apartman "18450" + villa bölgesi "19517" — aile ayrıştırması gerekli

### Güzelkent VİLLA BÖLGESİ — 2026-07-16 BÜYÜK ÇÖZÜM (YS ölü bölgesi kapandı!)
✔ 13 Yavuz Selim dosyası doğrudan ada sorgusuyla haritalandı+zenginleşti (nokta sorgusu
ölüydü, ada sorgusu çalıştı): doktorlar(17 dubleks), gulvatan(19), kirkayak+guz-gol(24,
paylaşımlı 19506), kardelen(16 — Güzelkent 18453 Kardelen'den AYRI), metrokent(24),
ozenkent-2(32), guzel-ev(38), ozharitacilar(57/2 ada), sacak-91(42), seda-terasevler(42),
yunuskent(46, kat irtifakı), eylul-evleri(18 kârgir ev — eylul-sitesi apartman kaydından ayrı).
KALAN SORULAR:
- ✅ guzelkent/guz-gol-sitesi SİLİNDİ 2026-07-17 (Özgün onayı; YS villa kaydı kaldı)
- Güzelkent klasöründeki villa dosyaları (angora, eczacilar, erenkoy, kosk, ersan,
  renk-villalari, eryaman-renk-villalari, korukent, portakal-cicegi ailesi) be'de 19516/19517'de
  listeleniyor AMA be bölgeyi 'Yavuz Selim Mh.' etiketliyor → mahalle ataması + paylaşımlı
  19516 (Angora+Eczacılar+Köşk/Ersan+Renk) ve 19517 (Erenköy+Korukent+Portakal Çiçeği)
  haritalaması Özgün onayıyla.
- Villa bölgesinde repo'da OLMAYAN siteler: Bizim Şirinköy(19508), Karköy(19537), Keyfim(19507),
  Korukent 91(19508), Turaykent(19526), Yeni İlkay(19508), Yükselen(19524), Serenköy(19532-33-36),
  Göksu no:24(19505) → yeni kayıt adayları.
- Villa indexinde 'Başkent Sular no:13-15 (19524)' var — bizim baskent-sular 18477'de (14 katlı
  ikiz kule, be guzelkent sayfası teyitli). İKİ ayrı Başkent Sular olabilir → Özgün.
--- (eski not) ---
Villa bölgesi indexinde 40+ site var (Renk Villaları 19516, Erenköy 19517, Köşk-Ersan 19516,
Eczacılar 19516, Angora 19516, Korukent no-10/no-15, Guz-Göl 19506, ikinci bir "Kardelen no-17
19504" vb.). Bizim koordinatsız villa/atipik dosyaların (renk-villalari, eryaman-renk-villalari,
kucuk-ankara-villalari, erenkoy, eczacilar, kosk, ersan, angora, korukent, kardelen, guz-gol,
kurtulus, karasimsek, ritim-eryaman, sehit-ferhat-koc, yayikli ailesi, mesa ailesi...) gerçek
evi burası olabilir. DİKKAT: apartman bölgesindeki adlarla çakışanlar var (Kardelen 18453 vs
Kardelen no-17 19504) — dosya başına hangi bölge olduğu netleşmeden zenginleştirme YAPMA.


### Parti 17-22 TKGM tamamlama kuyruğu (2026-07-14 — kota dolu olduğundan yarına)
Parti 17-19 (elele, gardenya, gokkusagi, gulenkent, kusburnu, meltem, asilkent, evrimkent,
tez-konak, yeni-isikent, sahinbey, selale, eryapi, gordogu-sen, nazlideniz, oz-muhtar,
guzel-ankara, isi-kent, master-kent, ekin, metro-yasam, postakent, yesim-kent2,
yukselay, er-ay-3 + DEVLET: asiyan, cagkent, camdali, cinar, demirkent, denizim,
bilgi-sevgi-hosgoru) bilgiemlak blok
kayıtlarıyla zenginleştirildi; TKGM açılınca her birine tek sorguyla **alan + tapu niteliği +
kat mülkiyeti** cümlesi eklenecek (`api/parsel/{koordinat}` ya da 124123/{ada}/1).
DİKKAT: bilgiemlak "Alan" değeri TKGM'den sapıyor (Konuta Özlem: 5.638 vs 5.169 m²) —
alan HER ZAMAN TKGM'den yazılır, bilgiemlak alanı kullanılmaz.

### Eksik ikinci ada bulunanlar — ✅ TAMAMLANDI 2026-07-15 (18640/18502/18504/18521 TKGM'den çekildi, sınırlar MultiPolygon'a genişletildi, koordinatlar birleşik merkeze düzeltildi)
- **erkent-sitesi**: dosyada 18639, bilgiemlak 18639+18640 → 18640 TKGM'den doğrulanıp eklenecek.
- **ulas-sitesi**: dosyada 18503, bilgiemlak 18502+18503 → 18502 eklenecek (koordinatı da GB cebinde, bozuk).
- **safi-apak-sitesi**: dosyada 18505, bilgiemlak 18504+18505 → 18504 eklenecek (koordinat GB cebi).
Üçünde de sınır GeoJSON genişletmesi gerekir (Anka 2001/Akkonak yöntemi).

### guzelkent/aksu-sitesi (2026-07-14, parti 15'te atlandı)
- Dosyadaki koordinat (39.987639, 32.609934) TKGM'de **ada numarasız boş parsele** düşüyor
  ("Eryaman-/49", 8.125 m², Tarla) — muhtemelen park/yeşil alan parseli.
- Dosyada ve yerel kayıtta (bilgiemlak `yer/aksu-sitesi-18512-ada-610`) site **18512** adasında;
  ±260 m yarıçaplı TKGM taramasında 18512 bulunamadı.
- Yerel kayıtta bloklar: 8, 8A, 8B, 8C, 8-D, 8-E (6 blok).
- Yapılacak: 18512'nin gerçek konumu bulunup koordinat + sınır GeoJSON yeniden üretilecek,
  sonra zenginleştirilecek.

### guzelkent/baskent-sular-sitesi (2026-07-14, parti 16'da atlandı)
- Dosya koordinatı (39.993773, 32.614902) TKGM'de ada numarasız tarlaya düşüyor ("Eryaman-/50", 9.637 m²).
- Hedef ada 18477 (dosya + bilgiemlak uyumlu); ±180 m taramada bulunamadı, sonra TKGM günlük kotası doldu.
- Yerel sayfa: `yer/baskent-sular-sitesi-18477-ada-617`.

### guzelkent/cankaya-vefa-sitesi (2026-07-14, parti 16'da atlandı)
- Dosya koordinatı (39.991810, 32.606339) ada numarasız tarlaya düşüyor ("Eryaman-/883", 5.547 m²).
- bilgiemlak siteyi İKİ adada gösteriyor: **18521-18522** (`yer/cankaya-vefa-sitesi-18521-18522-ada-622`);
  dosyada yalnızca 18522/1 var → bulununca ada + sınır genişletmesi de gerekli.

### GÜZELKENT GB CEBİ — sistematik koordinat sorunu (2026-07-14)
- aksu, ekin, ulas, safi-apak koordinatları TKGM'de ya boş dönüyor ya numarasız tarlaya düşüyor;
  185xx ada cebinin dosyalardaki koordinatları topluca kaymış görünüyor.
- Bu cebe girmeden önce koordinat kaynağını düzelt; tek tek halka taramasıyla uğraşma.
- KOLAY YOL: TKGM'nin `api/parsel/{mahalleId}/{ada}/{parsel}/` doğrudan uç noktası GEÇERLİ
  (Eryaman mahalleId=124123) — 2026-07-14'te kota dolu olduğu için denenemedi; kota açılınca
  18512 (aksu), 18477 (başkent sular), 18521+18522 (çankaya vefa), 18501/18503/18505
  (ekin/ulaş/safi apak) doğrudan çekilip koordinat+sınır yeniden üretilebilir.

### eryaman/atakent-metro — ✅ ÇÖZÜLDÜ 2026-07-17 (46524/1 haritalandı+zenginleşti; Özgün: Atakent 2 Cumhuriyet AYRI site)
- 46523/8'e force edilmişti; bilgiemlak o adayı Oyak 555'e ait gösteriyor
  (bloklar A1/A2/B1/D1, TKGM nitelikle uyumlu).
- Yapılacak: Atakent Metro'nun kendi parseli aranacak, kota açılınca yeniden bakılacak.

## Çözülenler

### guzelkent/anadolu-sitesi ✅ (2026-07-14, parti 15'te çözüldü)
- Eski kayıt 18493/1'e bağlıydı; TKGM o parseli "4 Katlı Betonarme Dükkan" gösterdi (site değil).
- Yerel kayıt + TKGM taramasıyla gerçek parsel bulundu: **18474/1** (4.923 m², 6 Blok Kârgir
  Apartman, bloklar 6/6A/6B/7/12/12A). Koordinat, adalar ve sınır GeoJSON 18474'e taşındı.
- Not: 18493/1 dükkan parseli sitenin çarşısı olabilir ama aidiyeti doğrulanamadı — kayda alınmadı.
- [parti-24 notu] Güngörler Tower (SOA, 46643/5, Malazgirt 1071 Cd No:18): Google verisi ince — IG sigorta akışlarında '129 daire' ve '60 konut+2 ticari' quote'ları farklı projelere ait olabilir, güvenilmez → sayı yazılmadı, zenginleştirilmedi. Özgün'e sor: blok/daire yapısı? | firat-life-style-goksu-sitesi (SOA, adasız/koordinatsız): Fırat Life Style'ın Göksu projesi = relax-goksu-konutlari olabilir (aynı müteahhit) — mükerrer mi, ayrı proje mi? Özgün'e sor.

### İlk Umut / Demirglass ÇÖZÜLDÜ (2026-07-18)
Özgün: "Demirglass diye bir yer yok; demirglasın olduğu yerin ismi Lider Yaşam Evleri."
→ 46263/2 için İKİ kayıt açılmış olduğu ortaya çıktı (yavuz-selim/demirglass-sitesi + seyh-samil/lider-yasam-evleri, aynı tapu alıntısı). Demirglass kaydı SİLİNDİ (dupe+yanlış ad+yanlış mahalle — koordinat P-i-P testi her iki parseli ŞŞ sınırı içinde gösterdi); redirect yavuz-selim/demirglass-sitesi → seyh-samil/lider-yasam-evleri. Lider kaydındaki 'ticari yapı' nitelemesi düzeltildi (tapu: 11 katlı A APARTMAN + 1 katlı B ofis → konut sitesi + tek katlı ticari birim). İlk Umut (46263/3) AYRI site olarak kaldı, bitişik komşu. be'nin 'İlk Umut Sitesi (Demirglas Sit.)' tek-başlığı yanıltıcıydı; 'Demirglas' altAd olarak EKLENMEDİ (kullanılmayan ad — Renk Villaları kuralı).

### bilgiemlak kazısı (2026-07-19) — kalan 2 soru
1) **atakent-sitesi ↔ basak-sitesi MUHTEMEL DUPE**: ikisi de 46528/1, aynı tapu ("6 Blok Kargir Apartman", 26.289 m²). be 46528'i "Oyak Atakent2 Başak Sitesi" olarak adlandırıyor → 'Atakent Sitesi' kaydı muhtemelen aynı yerin jenerik adı. Özgün'e: 46528'de tabela ne diyor? (Birleşirse redirect: atakent-sitesi → basak-sitesi.)
2) **46537/1 (12 blok, 48.454 m²) + 46538/1 (6 blok, 23.764 m²) İSİMSİZ Oyak Atakent parselleri**: be sadece "Oyak Atakent1 46537 Ada"/"Oyak Atakent 46538 Ada" diyor, site adı vermiyor. TKGM geometrileri scratchpad'de (yeni-46537-1.json, yeni-46538-1.json). Özgün'den tabela adı gelince kayıt açılacak — 18 blokluk görünmeyen stok!
Ayrıca: be ada numaraları ESKİYEBİLİYOR (Sude: be '46468' → gerçek 48056/1; Havuzlu Bahçe: be '46461' → 48145/1 — imar yenilemesi). be tek başına ada kanıtı DEĞİL, nokta sorgusuyla teyit şart.

**DÜZELTME (Özgün, 2026-07-19): Eryaman'da 6. Etap YOKTUR.** be'nin '6. Etap Oyak Atakent' başlığı yanlış adlandırma. Etap ataması ve '6. Etabı olarak bilinen' ifadesi 8 kayıttan geri alındı; 'Oyak Atakent' bölge adı ve be site altAd'ları kaldı (onlara itiraz yok). Ders: be'nin BÖLGE BAŞLIKLARI da hatalı olabilir — bölge adlarını Özgün teyidi olmadan etap/idari yapıya çevirme.

### GSC sorgu keşifleri (2026-07-19, 28g CSV analizi) — araştırılacak 5 ad
Gösterim alıyoruz ama kayıtları yok (kullanıcılar arıyor, sayfamız dolaylı çıkıyor):
- ✔ sarıgüllük ÇÖZÜLDÜ: ata/sari-gulluk-konutlari (46430) imiş; 'Sarıgüllük Sitesi' altAd köprüsü kuruldu (parti 13).
- **nover westlife** (11) + "westlife sitesi" (4) — Yeni Batı bölgesi projesi olabilir
- **sky göksu** (7) — Göksu'da proje adayı
- **sorguçaspor sitesi ankara** (7) — spor kulübü kooperatifi?
- **başkent eryaman sitesi** (5) — jenerik mi, gerçek site mi belirsiz
Ayrıca: "uzunali göksu 2" (8) — mevcut uzunali-goksu-konutlari'nın 2. etabı mı?; "boyut 1 sitesi" (8) — Boyut'un numaralı hâli mi?; "kozlar towers" (4×) — Twin Towers'ın müteahhit adı mı (teyitsiz)?
"X fotoğraflar" sorguları (7 adet): kullanıcılar site FOTOĞRAFI arıyor — Özgün'e: sahibinden fotoğraflarından site sayfalarına görsel eklemek istersek ayrı konuşulmalı (telif bizim ilanlarımızsa sorun yok).

### ZAYIFLIK KUYRUĞU (GSC 28g sayfa verisi, 2026-07-19) — 171 sayfa
Scratchpad'de zayif-kuyruk.json (skor=gösterim×(poz-4); gösterim≥15, poz≥6.5). Parti 1+2 işlendi (16 kayıt). Mia Concept KOORDİNATSIZ (haritasız, komşu ağı dışında — pin kanıtı bulununca eklenecek). Sıradaki parti adayları: Özahikent(104/8.5), Efsane Evleri(111/8.2), Vera City(110/7.8), Eryaman Royal City(78/9.3), Mia Concept(104/8), Siyah Beyaz(137/6.9), Botanik Park(67/9.5), Mutlu(67/9.4), Panorama Prestij(57/10), Serhatkent(86/9.3), Kainat(85/8.3), Eser Yapı(109/7.3), Mavi Bayrak(90/8), Astim Metrolife(74/8.7), Hittown(98/9), Zirve Loft(74/8.5). NOT: Google SERP otomatik sorgusu bot-doğrulamaya takılıyor (CAPTCHA aşılmaz, aşılmayacak) — pozisyon kaynağı GSC'dir; SERP görsel kontrolü gerekiyorsa Özgün kendi tarayıcısında bakar.

### İNCE-KAYIT KUYRUĞU (2026-07-19) — zenginleştirme eksik yapılmış kayıtlar
Özgün'ün tespiti doğrulandı: 500 kr altı 431 kayıt var; 290'ında tapu cache'inde KULLANILMAMIŞ zengin döküm duruyor (scratchpad/ince-kuyruk.json). Parti 6-7 (16 kayıt) işlendi. Kalan ~274, uzunluk sırasıyla işlenecek. Veri-kuru ~141 kayıt (nitelik 'Arsa'/'Betonarme Apartman' tek kelime ya da cache yok) → şişirilmeyecek, araştırma turu bekliyor.
YANLIŞ PARSEL ŞÜPHESİ (tapu 'okul' gösteriyor!): goksu-metrokent-sitesi (nitelik: İlköğretim Okulu) ve 4-devlet-mahallesi-sitesi (nitelik: Okul/Üniversite) — ada/parsel eşleşmeleri yanlış olabilir, koordinat+parsel yeniden doğrulanmalı.

### Araştırmalı parti 9 notları (2026-07-19)
- **toki-konutlari (eryaman) ↔ oyak-sitesi AYNI PARSEL (46527/1)**: TOKİ≠OYAK; be 46527'yi 'Oyak Atakent2 Oyak Sitesi' diye adlandırıyor. TOKİ kaydı muhtemelen yanlış adlandırma/dupe — Özgün'e: Eryaman Mh.'de gerçekten 'TOKİ Konutları' denen ayrı bir yer var mı?
- **ARTE MAYBAK**: yapı denetim kaydında (ankaraustayapidenetim.com) 'Maybak Göksu / ARTE MAYBAK' projesi, yüklenici MAYBAK İNŞ. AŞ, 37.000 m² inşaat alanı. Bizim goksu/maybak-konutlari (4 blok koop) ile AYNI OLDUĞU BELİRSİZ — ARTE yeni/ayrı proje olabilir. Aday olarak bekliyor; pin/adres kanıtı gerekli.
- WebSearch yan ürünleri (ileriki kayıtlar için doğrulanabilir): Göksu Prestij=Fırat Life Style 192 daire/5 blok tamamı 4+1; Arkadya Göksu=Alpak Müh. 258 daire/6 blok; Meydan Göksu=~12.000 m² 130 daire+30 dükkan; Motto Göksu=Dinamik Grup 202 daire (kaynak: guncelprojebilgileri/projeskop/mottogoksu.com/meydaninsaat.com.tr).

### Araştırmalı parti 10 notları (2026-07-19)
- ✔ **46533 mega-adası ÇÖZÜLDÜ**: tapudaki '11 Blok' = Günötesi 4 + Işıkkent 3 + Yeşil Manolya 4 (be dökümü birebir). eryaman-evleri bu adadan ÇIKARILDI.
- ✔ **eryaman-evleri 46533→46539/1 düzeltildi** (be + TKGM '9 Blok Kargir' 37.690 m²; Kaya Evleri ile paylaşım 5+4). Boundary+koordinat yenilendi.
- ✔ Düşkent/Övgü ÇÖZÜLDÜ (parti 15 ajanı): 46223 adasında /3=Düşkent (3 blok), /2=Övgü İletişim (2 blok, 4.109 m² — TKGM nokta kanıtlı). Övgü'nün parseli+sınırı+koordinatı düzeltildi (sınır dosyası Düşkent'inkinin kopyasıymış). be'nin '46423' etiketi hatalıydı.
- **İkinci Doğankaya adayı**: be 46532'de de 'Doğankaya Sitesi' gösteriyor (bizde 46542 kayıtlı; 46532'de Akkonak var). Ada mı çift, ad mı hatalı — pin gerekli.
- WebSearch yan ürünü: Neva Prestij Yapı ailesi (Armonia Residence 650 daire, Neva Prestij Metro 100, Neva Panora Metro 100 — nevaprestij.com). Neva Palas bağlantısı İSPATSIZ (yazılmadı); Neva Panora kaydına sırası gelince kullanılabilir.
- **Sermina Life mahalle şüphesi (parti 15)**: bizde Ata, be 'Susuz Mh. Konutları' grubunda gösteriyor — mahalle sınırı P-i-P testiyle doğrulanmalı.
- Havayolları be sayfası bloklarını 2-A..2-D, Akçakent'i 7-A..7-L olarak veriyor (numaralı kooperatif kodları — metinlere işlendi).
- **İkinci Korukent adayı (parti 16)**: be'de ayrı 'Korukent Sitesi no:15 (19517 Ada)' var (5.408 m², bizim 19508 kaydının ~350 m güneyi) — sahada iki Korukent olabilir; 19517 için yeni kayıt adayı.
- **be↔TKGM mahalle çelişkileri birikiyor**: Sermina Life (be: Susuz, biz: Ata), Akonur (be: Susuz, TKGM canlı: Ata ✓ bizimki doğru), Maybak ikilisi (be tek yerleşke sayıyor). TKGM esas; P-i-P toplu denetim bir ara yapılabilir.

### Parti 17 bulguları (2026-07-23)
- ✔ **Altıntepe yanlış parsel DÜZELTİLDİ**: kayıt Gözde Evler'in (46432/1) kopyasıydı; kanıt zinciri (TKGM nokta + Yandex org pini + yerel kayıtlar) gerçek parseli 46434/1 gösterdi — Kİ/'Arsa' niteliği, 12.022 m², sınır+koordinat yenilendi. NOT: be 46434'ü 'Demirglas Sitesi' diye adlandırıyor; Özgün kuralı gereği (Demirglas diye yer yok) bu ad KULLANILMADI.
- **Turuncu Sitesi kaydı Akdam'ın parselini kopyalamış** (44776/2 — tapu/alan/sınır birebir): be'ye göre Turuncu aynı adada AYRI yerleşim (2-C..2-F blokları, adanın batısı). Turuncu'nun gerçek parseli pin kanıtıyla bulunup düzeltilmeli.
- **Ahikent ↔ KC Lale Evleri aynı parselde (46644/1)**: be o adayı 'KC Lale Evleri' + 'Laleevleri 17-A..17-D' sayıyor; 'Ahikent' adı sahada doğrulanamadı — muhtemel dupe/eski ad, Özgün'e.
- Akdam ailesi: be 'Yeni Akdam KYK' + bölge 'Etikent' (yeni bölge adı!); aynı adada be 'Gülkent Konutları' da listeliyor — repo'da gülkent kaydı var mı kontrol edilecek (yoksa aday).

### Büyük parti ilk dalga notları (2026-07-26, 19 kayıt uygulandı)
- Paketin ki-bayrağı ('Ve Arsası' kalıbından çıkarım) 3 parselde YANLIŞ alarm verdi (Güngörler, Yıldız Eryaman, +1) — ajanlar TKGM canlıyla düzeltip doğru yazdı; kalan dalgalar için paket bayrağına körü körüne güvenilmeyecek.
- **Serenköy genişletme adayı**: be+OSM siteyi ÜÇ adaya (19532-33-36, ~20,5 dönüm) yayıyor; bizim kayıt tek ada (19533/1, 18 dubleks). Diğer iki adanın tapuları çekilip kayda eklenebilir.
- **Çağlar Belde kimlik şüphesi**: 44763/4'ü be 'Erkent Umut + Sarmaşık Köşk' blokları olarak adlandırıyor — 'Çağlar Belde' adının bu parsele aidiyeti doğrulanamadı (eski Çağdaş Belde sorusuyla ilişkili olabilir). Pin/tabela kanıtı gerekli.
- garden-zirve: TKGM canlı erişilemedi (API yönlendirme değişikliği görüldü: online.tkgm.gov.tr) — Kİ/KM durumu askıda, ihtiyatlı yazıldı.
- **Belmi Kent ↔ Prestij Park AYNI PARSEL (44769/1)**: tapu/alan birebir; 'belmi emlak' GSC'de rakip emlakçı adı olarak da geçiyor — 'Belmi Kent' muhtemelen aynı sitenin eski/emlakçı adı ya da hatalı kayıt. Özgün'e: tabelada ne yazıyor? (Dupe ise redirect ile birleştirilir.) Metnine dokunulmadı, işlem dışı bırakıldı.
- **Çağlar Belde ↔ Sarmaşıklıköşk AYNI PARSEL (44763/4) doğrulandı**: be o parseli 'Erkent Umut + Sarmaşık Köşk' sayıyor — Sarmaşıklıköşk meşru sahip görünüyor; ata/caglar-belde-sitesi muhtemel yanlış ad/dupe. Özgün'e: 44763'te 'Çağlar Belde' tabelası var mı? (Ayrıca Akdam metnindeki Gülkent blok sayısı tapuya göre düzeltildi: 2 blok.)
- **İki yeni parsel çakışması (dilim 5)**: (a) bati-sistemciler ↔ mavi-bayrak AYNI 44773/3 — 'Batı Sistemciler' muhtemelen Mavi Bayrak'ın kooperatif adı (Raylı Sistemciler↔Atapark desenine benziyor); (b) dogasu-evleri ↔ dogasu-elmaslar-evleri AYNI 44756/1 — muhtemel dupe. İkisi de Özgün'e; metinler nötr yazıldı (alan/parsel tekrarından kaçınıldı).
- **Dilim 6 çakışmaları**: (a) bahar-sitesi ↔ polsan-1-bahar AYNI 46481/1 — kesin dupe, İŞLENMEDİ (Özgün onayıyla redirect); (b) park-sera-evleri ↔ arissa-botanik AYNI 43264/7 — park-sera'nın parseli yanlış olabilir, İŞLENMEDİ; (c) mes-polaris tapusu '5 Katlı SPOR TESİSİ /161 m²' gösteriyor — yanlış parsel (okul ailesine katıldı), İŞLENMEDİ. ✔ polsan-1-gozde'nin fazladan taşıdığı Ayışığı parseli (46478) kayıttan çıkarıldı; gerçek tapusu 46482/1 (6 blok, 23.398 m²) işlendi.
- **Son dilim çakışmaları**: (a) ayyildiz ↔ senser AYNI 44759/1 — Yandex önceki teyidi Ayyıldız'ı bu parsele pinliyordu, Şenser/Selsen kaydıyla çakışıyor (biri yanlış ya da paylaşım) — Özgün'e; ayyildiz metni nötr/alansız yazıldı. (b) tatli-yamac-palmiye ↔ palmiye-evleri AYNI 44784/1 — kesin dupe (eski taşıma sorusu), İŞLENMEDİ.
### Çözüm turu (2026-07-26 devam)
- ✔ **Serenköy 3 adaya genişletildi**: 19533 (18 dubleks) + 19532 (16) + 19536 (16) = 50 dubleks / ~17,2 dönüm; MultiPolygon sınır, TKGM tapuları çekildi.
- **Turuncu ÇÖZÜLEMEDİ**: be'nin kendi pini de 44776/2 (Akdam parseli) içine düşüyor — Turuncu blokları (2-C..2-F) muhtemelen fiilen Akdam parselinde (tapu niteliği yalnız A+B sayıyor; tapu eksik/güncellenmemiş olabilir) ya da ayrı parselde ama pin kaymış. TABELA sorusu.
- **Mes Polaris netleşemedi**: koordinatı 62662/2 'Spor Tesisi'ne düşüyor; komşu 62662/1 (Arsa 7.235) ve /3 (Arsa 4.209) Kİ-arsa. Proje muhtemelen bunlardan birinde — pin/tabela teyidi gerekli.
- **Park Sera dupe olasılığı GÜÇLENDİ**: kayıt koordinatı da Arissa Botanik'in 43264/7'sine düşüyor — Park Sera ≈ Arissa Botanik'in diğer adı olabilir. Özgün'e.

## Lale Kent Sitesi (ŞOA) — koordinat ofis parseline düşüyor (2026-07-23)
Kayıt: sehit-osman-avci/lale-kent-sitesi, adalar 46665/3. TKGM nokta sorgusu (kayıt koordinatı) → Şeker kad. 46665/3 "3 Katlı Betonarme Ofis İşyeri Ve Arsası", 1.000 m². "2 bloklu konut sitesi" tanımıyla uyumsuz — ya koordinat/parsel yanlış ya da siteye bitişik ofis parseli işaretlenmiş. Özgün'e: Lale Kent'in yeri/blokları?

## Angora adı iki ayrı yerde (2026-07-23)
Bizim kayıt: goksu/angora-sitesi — Türkonut Göl Bölgesi mega-parseli üyesi (koordinat parsel içinde, komşularıyla tutarlı yazıldı). bilgiemlak'ta ise "Güzelkent Villalar Angora Sitesi no:23 (19516 Ada)" — Yavuz Selim, 22 villa, 6.059 m², 39.9961/32.6032. İki ayrı yerleşim olabilir; YS Güzelkent'teki Angora bizde YOK → yeni kayıt adayı (Özgün teyidi: Göksu'daki "Angora" tabelası gerçek mi?).

## 10. Botanik Evleri (Cumhuriyet) — 43264/8 tapuda yok (2026-07-23)
Kayıt cumhuriyet/10-botanik-evleri, adalar 43264/8 → TKGM 404. Aynı adada 43264/7 = Arissa Botanik (Park Sera çakışması da bu adada). Botanik ailesi imar değişikliği geçirmiş olabilir; nokta sorgusu + be turu gerekiyor. Botanik ailesi zaten eski parked sorularda.

## Çığlık ↔ Günebakan (Cumhuriyet) — aynı parsel 43263/3 (2026-07-23)
İki kayıt da adalar=43263/3 (Yuva kad.); Günebakan'ın koordinatı da TKGM nokta sorgusunda aynı parsele düştü. Tapu: "Betonarme Apartman", 8.025 m² — tekil nitelik, iki ayrı site için tek tapu. Dupe ya da tabela farkı olabilir. Özgün'e: Çığlık ve Günebakan aynı yerleşim mi, ayrı mı?

## İkinci Korukent sorusu KAPANDI (2026-07-23)
guzelkent/korukent-sitesi zaten 19517/1 adasında kayıtlıymış; TKGM tapusu "16 Bl. Kargir Dub.Ev", 5.130 m² doğruladı. be'deki "Korukent no:15 (19517 Ada)" bununla aynı yerleşim — ayrı kayıt AÇILMAYACAK.

## Denetim turu bulguları (2026-07-23 — ultracode denetimi)

### Özgün'e sorulacak yeni çakışmalar
- **Anemon ↔ Karkonut (Ata, 46424/1):** İki kayıt aynı parsel, aynı 4 blok (10'ar katlı) — aynı site için iki ad olabilir. Dupe ise birleştirme+redirect.
- **Bosphorus Ankara ↔ Alpak & Neve Armonia (ŞOA, 46651/6):** İkisi de aynı parselde "650 konut" anlatıyor, metinler birbirinden habersiz. Aynı proje mi (On Altın ↔ Alpak+Neva ortaklığı), iki ayrı etap mı?
- **Özharitacılar (YS, 19501/1+19502/1):** Güzel Ev (38 dubleks) + Gülvatan (19 dubleks) = 57; Özharitacılar da "57 dubleks, 2 ada" diyor — kooperatif çatı adı mı, ayrı yerleşim mi?
- **Çelikler Sitesi (YS):** mahalleportal POI'si 45824/1'e düşüyor (11 katlı A-C + 10 katlı D); ama o parseli yerel rehber 'Esenkent' gösteriyor — kimlik çelişkili, koordinat bilerek eklenmedi.
- **Ortak Grup Yapı (Ata):** Tek kaynak yerel rehberin '44756 Ada Ortak Yapı Grup' dizin etiketi — o parsel (44756/2) bizde Umut Yapı'ya kayıtlı. Gerçek bir site adı olmayabilir; silinsin mi?
- **Manzara Evleri (Ata):** İki aday var — Bilge Türk Manzara Evleri (44784) ya da Mercan Kent; POI koordinatı ikisine de tam oturmuyor. Tabela teyidi gerekli.
- **Ma1 Tower (goksu/):** Yandex kaydı Susuz Mah. Hisar Cad. gösteriyor — mahalle taşınsın mı (goksu→susuz)? (Koordinat eklendi, sayfa URL'si değişmedi.)
- **Eser Yapı (susuz/):** Yandex + sahibinden 'Ata Mh. Eser Yapı Evleri' diyor — susuz→ata taşınsın mı?

### Hayalet kayıtlar — hiçbir kaynakta iz yok (silinsin mi?)
goksu/enday-sitesi, seyh-samil/turk-konut, cumhuriyet/botanik-sitesi, ata/kanat-yapi-evleri ("Kainat Yapı" 46418 olabilir — yazım hatası ihtimali), guzelkent/kurtulus-sitesi (sahibinden filtresinde adı var ama konum/kanıt yok — kalsın ama zenginleştirilemez).

### GSC bilinmeyenleri — sonuç
- nover westlife → YENİ KAYIT açıldı: cumhuriyet/nover-westlife (Nover Yapı, Necip Fazıl Cad, 16 kat/129 daire)
- sky göksu → YENİ KAYIT açıldı: susuz/sky-goksu (RDV İnşaat, Sancak Sok No:3)
- başkent eryaman → mevcut ata/baskent-sitesi; 'Başkent Eryaman' altAd eklendi
- sorguçaspor → ÇÖZÜLEMEDİ (hiçbir kaynakta yok)

### TKGM bekleyen nokta sorguları (API bugün 403 — kota)
hotki-meydan (18684/1 teyidi), altas-relax-line, mercankent (44780 parsel no), ritim-eryaman, ma1-tower, pozitif-life, eser-yapi, polsan-gozde 46482/1 canlı teyit. Kota açılınca koşulacak; koordinatlar Yandex/yerel rehber kaynaklı eklendi.

## Nover WestLife koordinatı — kaynaklar çelişkili (2026-07-23)
Yandex geo kaydı (geo/nover_west_life/3392152215) 32.663/39.9877 gösteriyor — bu nokta Eryaman'ın DOĞUSU (ŞOA/Şeker tarafı); oysa tüm proje kaynakları Yeni Batı / 5412. Sokak / Necip Fazıl Cad. diyor (batı yakası). Yandex kaydı yanlış konumlanmış olabilir → koordinat EKLENMEDİ. Sky Göksu için de Yandex'te doğrudan kayıt yok (adres: Sancak Sok. No:3). İkisi de sahada/harita üzerinde teyit bekliyor.

## KAPANDI: Anemon ↔ Karkonut (2026-07-23, Özgün teyidi)
"Orası sadece Anemon, diğer isim yanlış girilmiş." → karkonut.json + boundary silindi, /mahalleler/ata/karkonut → anemon-sitesi redirect'i eklendi, Anemon metnindeki 'Karkonut' atfı kaldırıldı.

## KAPANDI: Bosphorus ↔ Alpak & Neve Armonia (2026-07-23, Özgün teyidi)
"Orası Alpak & Neve Armonia Residence, Bosphorus değil." → bosphorus-ankara-konutlari.json + boundary silindi, URL Armonia'ya redirect. Not: 'Bosphorus Ankara' adı başka bir projeye aitse (On Altın A.Ş. iddiası) ileride doğru parseliyle yeniden açılabilir — şimdilik Eryaman kapsamında izi yok.

## KAPANDI: Çığlık ↔ Günebakan (2026-07-23, Özgün teyidi)
"Senin kaydettiğin yer Günebakan Sitesi." → ciglik-sitesi.json + boundary silindi, URL Günebakan'a redirect (sayfa zaten o parseli anlatıyordu). Günebakan tapu verisiyle zenginleştirildi. 'Çığlık Sitesi' adında ayrı bir yer başka konumda çıkarsa yeni kayıt açılır.

## Sorgu-evreni operasyonu (2026-07-23) — kalan büyük işler
805 gerçek autocomplete sorgusu tarandı; 9 yeni rehber + 8 sayfa güçlendirmesi yayınlandı. Özgün'le konuşulacak / sonraki tur adayları:
- **Eryaman 1./2./3. Etap sayfaları**: şablon hazır ama etap verisi yalnız Tunahan kayıtlarında; Altay (1. Etap), ŞOA (2. Etap), Şeyh Şamil (3. Etap) ada kayıtlarına doğrulanmış etap alanı işlenirse 3 yeni etap sayfası açılır ("eryaman 3 etap emlakçılar" gerçek arama). Kroki kaynakları: eryaman4/5.com benzeri; blok adları autocomplete'te (2. Etap: Demirer/Eston/İçtaş; 4: Öztaş/Yüksel/Yardımcı/Klima/Soyak).
- **Kira sözleşmesi örneği sayfası** (14 sorgu): indirilebilir PDF/Word şablonu hukuki sorumluluk taşır — Özgün kararı. Alternatif: "madde madde açıklamalı örnek" rehberi (şablonsuz) yazılabilir.
- **Kira artışı aracına aylık TÜFE bloğu** (ay-bazlı sorgular): aylık el bakımı ister — Özgün'ün "aylık yayın sistemi istemem" çizgisine takılabilir; TÜİK verisi otomatik çekilebilirse değerlendirilir.
- Rakip-marka ve dua sorguları bilinçli atlandı; alıcı-ağırlıklı 276 sorgu mevcut mahalle/site sayfalarınca karşılanıyor.

## Belediye kent rehberi keşfi (2026-07-24) — yeni kaynaklar + 4 yeni kart
İki belediye sistemi TKGM'den bağımsız parsel verisi veriyor (reçeteler memory'de): Etimesgut KEOS (geometri+alan; tarayıcı bağlamı şart) ve Yenimahalle TeoKbs (nokta→parsel + NİTELİK + tapu yüzölçümü; curl'lenebilir, yalnız Ata/Susuz vb. batı mahalleleri kapsar).

### Çözülenler
- Mercan Kent = **44780/2** (ARSA, 7.955 m² tapu yüzölçümü — Yenimahalle KBS + be çifte teyit) → kayda işlendi.
- Eser Yapı = **44752/1** ("11 katlı beton apartman ve arsası", 13.740 m²; be 'Eserkent Sitesi' 7-A/B/C) → kayda işlendi.
- Hotki Meydan 18684/1 → KEOS geometrisiyle boundary yazıldı, haritaya girdi.
- Cumhuriyet Sitesi 46382/1 → KEOS alanı ~13.697 m² → metin zenginleşti (nitelik hâlâ TKGM'de).

### Yeni Özgün kartları
- **Konut Sitesi (YS) ↔ Atadostlar:** be 'Atadostlar (46231-46232 birleşik)' diyor; bizim atadostlar kaydı 46232/1'de, 'Konut Sitesi' kaydı 46231/1'de (TKGM: A-B-C 3 kargir apartman = Atadostlar 1-A/B/C bloklarıyla uyumlu). 'Konut Sitesi' jenerik POI adı — gerçekte Atadostlar'ın 1. adası olabilir. (KEOS geometrisi scratchpad'te; kart çözülmeden boundary yazılmıyor.)
- **Ritim Eryaman ↔ Başkent Sular (18477):** Ritim koordinatı Başkent Sular kaydımızın 25 m yanı; Ritim 'Özer Grup 96 konut kentsel dönüşüm' — Başkent Sular'ın yıkılıp yeniden yapımı olabilir. Öyleyse birleştirme+redirect gerekir.
- **Ma1 Tower ada çelişkisi:** KBS nokta sorgusu 64517/1 (Arsa 5.534) diyor, be 63362 (10 m mesafe) diyor; OSM durakları 450 m uzakta. Kentsel dönüşümde çifte yenileme olabilir — TKGM kota açılınca nokta sorgusuyla kesinleştirilecek, şimdilik ada yazılmadı.
- Altaş Relax zayıf aday: be 46331 adası (92 m, 43,7 dönümlük dev ada) — tek kaynak, yazılmadı.

## Ma1 Tower konumu KESİNLEŞTİ (2026-07-24, Özgün teyidi — uydu görüntüsüyle)
Özgün, Google'da 'Göksu Hisar Evleri' etiketli parselin (iki yüksek blok + avlu, Ankara Çevre Yolu bitişiği, Hisar Cad.) Ma1'in yaptığı yer olduğunu teyit etti. Kayda 'Göksu Hisar Evleri' + 'MA1 Yapı' alternatif adları ve iki-blok/çevre-yolu detayları işlendi. KALAN: ada/parsel no (KBS 64517/1 vs be 63362 çelişkisi) — TKGM kotası açılınca nokta sorgusu kesinleştirecek (kuyrukta); mahalle ataması (goksu↔susuz) kartı da açık.

## TKGM kuyruğu KOŞULDU (2026-07-23 gece — kota gece penceresinde açıldı)
### Kapananlar
- **Altaş Relax = 46361/5** ("8 katlı A + 10 katlı B + 3 katlı C", 6.685 m²) — Akdal (46361/7) ve Meydan Cadde (46361/4) ile aynı ada. Kayıt+boundary işlendi; be'nin 46331 adayı yanlıştı.
- **Ma1 Tower = 64517/1** (Arsa, 5.534 m²) — KBS ile TKGM aynı sonucu verdi, be'nin 63362'si eski. Kayıt+boundary işlendi, haritaya girdi. Ada çelişkisi kartı KAPANDI (mahalle taşıma kartı hâlâ açık).
- Cumhuriyet Sitesi 46382/1 niteliği geldi: "1-5 blok kargir apartman" — metne işlendi; boundary TKGM geometrisiyle tazelendi.
- Hotki 18684/1 niteliği: Tarla (proje yeni, tapu henüz dönüşmemiş) — ihtiyat cümlesi yerinde, alan metne işlendi.
- Konut Sitesi 46231/1 boundary üretildi (tapu teyitli); KİMLİK kartı (Atadostlar mı?) hâlâ açık.

### Yeni/güncellenen kartlar
- **Pozitif Life ↔ Anka Vega (47544/4) YENİ ÇAKIŞMA:** Pozitif'in Yandex noktası TKGM'de 47544/4'e düştü — o parsel bizde Anka Vega'nın ("14 katlı A1+A2 betonarme ofis", 7.268 m²; koordinatlar 25 m). İki ad aynı yapıya mı ait (Meva/Pozitif ROİ), ayrı mı? Pozitif'e ada YAZILMADI.
- **Ritim Eryaman:** noktası adasız parsel "/51"e düştü (Tarla, 10.926 m² — kentsel dönüşüm tapuya henüz yansımamış). Başkent Sular'ın 18477/1'inden AYRI parsel → dönüşüm hipotezi zayıfladı ama Tarla niteliği yüzünden dışlanamadı; ada yazılamıyor (ada no yok). Kart açık.

## İki kart daha KAPANDI (2026-07-23 gece, kota penceresi)
- **10. Botanik 43264/8 GERÇEK:** önceki 404 yanlış kadastro ID'sindendi; nokta sorgusu Yuva kadastrosunda buldu (Arsa, 7.895 m²). Kayıt+boundary işlendi; Arissa (43264/7) komşuluğu metne girdi. '43264/8 tapuda yok' kartı kapandı.
- **Manzara Evleri (Ata) = 44776/3:** iki-aday ikilemi bitti — ne Bilge Türk ne Mercan Kent; kendi parseli var ("11 katlı A + 10 katlı B betonarme mesken", 9.331 m²). Koordinat+ada+boundary+metin işlendi, haritaya girdi. Not: 44776 adası Turuncu kartındaki adayla aynı (Akdam /2'de) — Turuncu sorusu hâlâ açık.

## Yenimahalle KBS ada dökümleri (2026-07-23 gece) — kartlara kanıt
8 tartışmalı adanın TAM parsel listesi alındı (kotasız kaynak; cache: scratchpad/kbs-ada-dokumleri.json, geometriler WGS84 dahil):
- **44756:** /1 "A 15 katlı + B 17 katlı mesken" 10.188 (Doğasu çifti BU parselde — tapu TEK site tarif ediyor → dupe kanıtı güçlendi) · /2 ARSA 16.809 (Umut Yapı ✓).
- **44759:** TEK parsel /1 "A,B,C,F 10 katlı + D,E 11 katlı" 19.214 — Ayyıldız↔Şenser: iki blok grubu tek tapuda; paylaşım deseni mümkün.
- **44769:** TEK parsel /1 "2 katlı dükkan + 7 blok apartman" 21.145 — Belmi Kent↔Prestij Park aynı tapuda.
- **44773/3:** "A-B-C-D 12'şer katlı mesken, Or…" 14.821 — Batı Sistemciler↔Mavi Bayrak.
- **44776:** /2 "A 8 katlı + B 7 katlı" 9.933 (Akdam; Turuncu pini burada) · /3 ARSA 9.331 (Manzara Evleri ✓ — dikkat: TKGM /3'e "11+10 katlı A-B mesken" diyor, KBS "ARSA" — KBS niteliği bayat olabilir, TKGM esas).
- **44784/1:** TEK parsel "11 katlı A-D-E + 14 katlı B-C" 19.783 — be'nin 'Bilge Türk Manzara' tarif ettiği 5 bloklu kompleks; Tatlı Yamaç↔Palmiye kartının nesnesi bu tek kompleks.
- **43264 (Botanik ailesi) 6 parsel:** /4 "A 10 katlı + B dükkan" 4.112 · /5 "13 katlı" 5.238 · /6 apartman 4.264 (Yeni Botanik ✓) · /7 "A 15 katlı + B 3 katlı dükkan" 7.002 (Arissa ✓; Park Sera pini burada) · /8 ARSA 7.895 (10. Botanik ✓) · /9 ARSA 4.649. Park Sera için boş adaylar: /4, /5, /9.
- **62662 (Mes Polaris):** KBS'de yalnız /2 Arsa 3.026 ve /3 Arsa 4.209 (TKGM /2'ye 'Spor Tesisi' demişti — kaynak farkı not edildi).

## TKGM eksik envanteri kapandı (2026-07-24 gece)
- Sınırsız kayıt KALMADI: Mercan Kent (44780/2) ve Eser Yapı (44752/1) TKGM geometrileriyle haritaya girdi (KBS ile birebir doğrulandı).
- 71 kaydın metnine işlenmemiş tapu verisi için 79 parsel cache'e çekildi (~/.cache/tkgm-eryaman) — sonraki içerik dalgasının hammaddesi hazır; sorgu gerekmeden yazılabilir.
- Bulunamayan 3 parsel (kadastro yenileme şüphesi): cumhuriyet 43267/1, goksu 16828/4, susuz 63340/6 — nokta sorgusuyla çözülebilir, acil değil.
- Adasız 17 kayıt: 9'u açık kart/araştırma (Ritim, Pozitif, ap-ist-port, bp/ela/mia, Çelikler, 75-yıl), 6'sı kaynaksız hayalet (silinme kararı Özgün'de), 2'si yeni koordinatsız kayıt (Nover, Sky).

## YENİ ÇAKIŞMA: Ada Loft ↔ Umut Yapı (Ata 44756/2) — 2026-07-24
Tapu-derinliği taramasında çıktı: ata/ada-loft-eryaman ile ata/umut-yapi-sitesi aynı parselde (44756/2, ARSA 16.809 m²). Ada Loft "2024 teslim, 3 blok 92 daire loft projesi"; Umut Yapı "Doğasu komşusu, 16,8 dönüm". Aynı arsanın eski/yeni adı mı, yoksa biri yanlış parselde mi? (Aynı adanın /1 parseli de Doğasu çifti çakışmasında.) İkisine de tapu cümlesi YAZILMADI.

## 4. Devlet Mahallesi Sitesi — tapu OKUL parseli (2026-07-25)
devlet/4-devlet-mahallesi-sitesi kaydının parseli TKGM'de "7 Katlı Betonarme Okul, Üniversite, Araştırma" (8.180 m²). Konut sitesi değil — kayıt ya yanlış parselde ya da site adı okul yerleşkesiyle karışmış. Metne tapu YAZILMADI. (Aynı desen goksu/goksu-metrokent-sitesi'nde de vardı — ikisi birlikte Özgün'e sorulacak.)

## Karma Modern (ŞOA) — tapu "Yönetim ve Hizmet Binası" (2026-07-25)
sehit-osman-avci/karma-modern parseli TKGM'de "Yönetim Ve Hizmet Binası" (14.982 m²) — konut/rezidans niteliği yok. Kayıt yanlış parselde olabilir ya da proje henüz tapuya yansımamış olabilir. Metne tapu YAZILMADI; nokta sorgusuyla teyit edilecek.

## TKGM ARAŞTIRMA TURU (2026-07-25, 7 ajan) — ÇÖZÜLENLER ve YENİ KARTLAR

### Yanlış bildiğimiz 3 şey düzeldi (KRİTİK)
1. **"Ölü bölge" diye bir şey YOK.** Yavuz Selim batı şeridi ve Güzelkent'te nokta sorgusu HTTP 401 ("kadastro müdürlüğünden edinilebilir") dönüyor ama AYNI parsel doğrudan ada/parsel sorgusuyla tam veriyle geliyor. Kısıt coğrafi değil, parsel bazlı ve yalnız nokta ucunu etkiliyor. Bundan sonra 401 alınca doğrudan ada sorgusu denenecek.
2. **Yuva kadastro ID'si 123403** (Cumhuriyet'in 43xxx adaları). Hafızadaki "123432" YANLIŞTI — o Susuz-İmar. 43267/1 bu yüzden "bulunamıyordu".
3. **Göksu'nun 16828 adası Şeker kadastrosunda** (124128), Eryaman'da değil.

### Uygulanan düzeltmeler
- Nover WestLife=62661/1, AP İst Port=62687/1, Pozitif Life=47544/4, Karma Modern=46657/5 (okul/yönetim binası tapusu yanlıştı), Göksu Metrokent=46477/1+46480/1 (okul parselinden alındı), 75. Yıl=17462/1 (Soyak parseli, blok olduğu metinde açık), Yeşil Göksu +45819/1, Concept Eryaman +46446/1.
- **Yavuz Selim villa üçlüsü 1:1 oturdu:** Özharitacılar=19501/1 (38 dubleks), Güzel Ev=19501/2 (16 dubleks — daha önce bilinmeyen parsel), Gülvatan=19502/1 (19 dubleks, adanın tek sahibi). Üç kayıt da yeniden yazıldı, çakışma kalktı.
- Anka Vega'dan yanlış 47544/4 ataması çıkarıldı (kendi konumu 4016. Cadde'nin kuzeyinde, ayrı parsel).

### Özgün'e sorulacak YENİ kartlar
- **Ritim Eryaman ↔ Başkent Sular (18477/1):** dört kaynak Ritim'i bu parselde gösteriyor, tapu "A+B blok 14 katlı" Ritim'in 96 konut anlatımıyla birebir. Ama parsel şu an Başkent Sular kaydında. Ritim = Başkent Sular'ın kentsel dönüşümü mü?
- **Ada Loft ↔ Umut Yapı (44756/2):** ada dökümünde 2 parsel var (/1 Doğasu, /2 Arsa-Kİ). Kanıtlar 44756/2'yi Ada Loft'a veriyor — Umut Yapı'nın gerçek yeri neresi?
- **Çelikler ↔ Esenkent:** iki bağımsız rehber aynı parseli (45824/1) iki farklı adla anıyor; Çelikler'in bağımsız kanıtı yok. Aynı site mi?
- **Lale Kent:** kayıttaki parsel bir dükkân bloğu (A101/iş merkezi). Gerçek Lalekent 240 m kuzeyde ve muhtemelen mevcut kc-lale-evleri kaydı. Silinsin mi?
- **Atadostlar ↔ Konut Sitesi (46231/46232):** iki ikiz parsel; tek site iki parselde mi, iki ayrı kooperatif mi?

### KESİN DUPE'lar (veri kanıtlı — silme onayı bekliyor)
- **Bahar ↔ Polsan 1 Bahar (46481/1):** ada tek parsel, komşu boş parsel yok. Kanonik ad: Polsan 1 Bahar.
- **Belmi Kent ↔ Prestij Park (44769/1):** ada tek parsel, çevre parseller dolu. Kanonik: Prestij Park Konutları.
- **Tatlı Yamaç Palmiye ↔ Palmiye Evleri (44784/1):** ada tek parsel. Kanonik: ata/palmiye-evleri.

### YENİ KAYIT ADAYLARI (geometri+tapu hazır, ad kararı Özgün'de)
- Göksu Sitesi (Yavuz Selim 19505/1, 24 dubleks) — mevcut YS Göksu Sitesi'nden AYRI, ad ayrımı gerek
- Öz Muhtarlar Sitesi (Güzelkent 18470/1+18471/1, 6+6 blok) — mevcut oz-muhtar-sitesi 18670'te, AYRI site
- Kardelen Sitesi (Güzelkent 18453/1, 6 blok apartman) — mevcut guzelkent/kardelen 19504 villa bölgesinde, AYRI
- Göksu Sitesi (Güzelkent 18478/1, 6 blok) — üçüncü Göksu Sitesi!
- Eray 4 Sitesi (Güzelkent 18658/1, A/B/C 6 katlı)
Geometri dosyaları hazır: scratchpad/cikti/*.geojson

## Mahalle gövde araştırması (2026-07-25) — 6 mahalle yeniden yazıldı
Düzeltilen YANLIŞ bilgiler: (1) Ata'da "müstakil doku" — 90 kaydın sadece 2'sinde müstakil geçiyor, baskın doku 10-15 katlı blok; (2) Ata'da "metro imkânlarından kolayca yararlanan" — mahalle içinde istasyon YOK, en yakınlar 1,4-2,8 km; (3) Ata "kuzeybatı komşusu" → kuzey; (4) Altay "nüfusu azalıyor" çerçevesi — 2013'ten beri kesintisiz artıyor (2025: 14.525); (5) Güzelkent "2022-2023'te 15.400'ü aşan" — o yıllarda 15.384 ve 15.167 idi, yani ALTINDA; (6) Devlet "2023'te istikrara kavuştu" — artış sürüyor (2025: 16.044); (7) Göksu 33.203 bayat (2025: 34.124); (8) Susuz "İstanbul Yolu'na yakınlığı" — yol mahallenin İÇİNDEN geçiyor.
Eklenen doğrulanmış bilgiler: Ata'nın 2017 kuruluş hikâyesi (Susuz'dan ayrılma, 2015 referandumu), Devlet'te metro istasyonu + Eryaman Stadyumu sınır içinde, Göksu'da Eryaman 1-2 istasyonu + 500 bin m²'lik Göksu Parkı, Altay = Eryaman 1. Etap (resmî pazar/okul adresleriyle), Güzelkent'te 15 park/100+ dönüm ve yıl taşıyan site adları, Susuz'un köy kökeni.
KALAN: blog/eryamanda-hangi-mahalle.mdx tablosundaki nüfuslar 2023 tarihli (yanlış değil ama bayat) — 14 mahallenin tamamı için güncel ADNKS toplanınca tazelenecek. Nüfus kaynağı: nufusune.com (TÜİK ADNKS aktarımı) + Vikipedi çapraz doğrulama; metinlerde rakam yerine "güncel ADNKS verilerine göre X bini aşan" kalıbı kullanıldı — bayatlamaz.

## İç bağ grafı: matematiksel güçlendirme turu (2026-07-29)
Ağırlıklı PageRank (gövde 3x, nav/footer 1x, d=0.85, 1.578 sayfa) + BFS derinlik ölçüldü; iki yapısal zayıflık bulunup giderildi.

### Teşhis (önce)
- **Noindex ada kümesi PR tuzağıydı:** kenar ağırlığının %22'si ada sayfalarına akıyordu, PR kütlesinin %15,6'sı orada park ediyordu. Suçlu ada→ada iç dolaşımı: 9.306 link (sayfa başına 12 "aynı etaptaki adalar").
- **Site katmanı dengesizdi:** salt coğrafi en-yakın komşu seçimi merkezî siteleri kayırıyordu — gelen bağ 3-20 arası, PR maks/min 2,9x; zayıf kuyruğun tamamı Ata'nın kenar siteleri.
- Derinlik zaten kusursuz: tüm indexlenebilir sayfalar anasayfadan ≤2 tık (müdahale gerekmedi).

### Müdahale
1. **Ada sayfası: "aynı etaptaki adalar" 12→4.** Sayfanın çıkış ağırlığı site/mahalle bağlarına kaydı; değer noindex kümesinde dönmek yerine dizine geri akıyor.
2. **Komşu Siteler = 4 en yakın + 2 altın-oran atlaması (expander graf).** Mahalle sıralamasında adım=round(n×0,382); her site i+adım ve i+2·adım'a bağlanır → her site TAM 2 garanti gelen bağ alır (i−adım, i−2·adım'dan), graf çapı küçülür. UI aynı: 6 kart, mesafe yazmadığı için karışım görünmez.

### Sonuç (üretim build'inde yeniden ölçüldü)
- ada'ya kenar ağırlığı %22,0 → **%10,2**; ada PR kütlesi %15,6 → **%12,2** (−3,4 puan dizine döndü)
- her indexlenebilir tip kazandı: site %23,2→%23,9, mahalle %19,6→%20,5, blog %7,2→%7,5, değerleme %6,0→%6,3, anasayfa %5,6→%5,9
- site katmanı: min PR 215→**237** (+%10), maks/min 2,9x→**2,5x**, gelen bağ tabanı 3→**5**
- doğrulama: canlı DOM 6 kart + 0 konsol hatası; ada sayfasında 4 ada bağı

## Künye paketi + karşılaştırma aracı + AEO açılışı (2026-07-30)
ChatGPT istişaresinden onaylanan üçlü uygulandı: lib/kunye.ts (720 kayıttan tapu tabanlı yapısal çıkarım), /araclar/site-karsilastirma (fiyatsız karşılaştırma aracı), /eryaman-site-dokusu (fiyatsız rapor — basın için kaynak-gösterme bölümü var), site sayfalarında "önce cevap" açılış cümlesi (679 sayfada künyeli, kalanı eski kalıp).

### Parser iki çürütme turundan geçti (7+8 ajan, 268 kayıt incelendi)
Yakalanan ve kod korumasına dönüşen hata sınıfları lib/kunye.ts baş yorumunda listeli (binlik ayraç, ticari blok katı, komşu site sayıları, paylaşılan ada alanı, proje/inşaat alanı, sahte villa/rezidans, isimden sayı, kısmi etap/parsel sayıları, JS \b'nin Türkçe harflerde çalışmaması). Kapsama (720 kayıt): cümle 679, tapu 530, alan 474, blok 429, kat 329, konut 86. Tip dağılımı: 615 apartman / 54 rezidans / 35 villa.

### İçerik ÇELİŞKİ kartları (kayıt metni kendi içinde tutarsız — düzeltme turu bekliyor)
- **"X-Y kat aralığında bloklar (tapu kaydı)" şablon artıkları** aciklama'daki tapu alıntısıyla çelişiyor: seyirtepe-baspinar (2-17 vs 17'şer), mood-altinok (2-21 vs 21'er), twin-towers (1-35 vs 35'er), gold-life (4-18 vs 18'er), ilona (1-14 vs 14'er), finest (2-13 vs 11-13), park-goksu (3-16 vs 15-16), batimahal (2-16 vs 15-16), bulvar-1071 (4-15 — bu DOĞRU olabilir, tapuda 4 katlı D blok var). Parser bu kalıbı artık hiç okumuyor; kayıtlar yine de temizlenmeli.
- **bahcen-eryaman-konutlari**: ozellik "1 katlı yapı (tapu kaydı)" — aciklama 16-20 katlı 10 blok sayıyor.
- **kasmir-mavi-orkide**: ozellik "~55.000 m² proje alanı" TKGM parseli değil; gerçek parsel alanı kayıtta yok.
- **zen-park-plus**: dev verisi 16 kat vs tapu 18 kat aynı kayıtta.
- **ankalux-residence**: metin "bir rezidans projesidir" diyor, tapu "betonarme apartman" — hangisi doğru? (parser metnin kendi tanımına uyup rezidans diyor)
- **eston-sitesi**: aciklama "4 Adet Betonarme Apartman + tek parsel" vs ozellik "4 ayrı ada — 18 apartman + parseller".

## Analitik ölçüm kararı (2026-07-30)
GA rakamları çerez rızası kapısı sonrası düştü (7g ort. ~48/gün → görünen 20). Özgün'le konuşuldu; bandı kaldırma önerisi REDDEDİLDİ (KVKK + rakip şikayet riski + gizlilik sayfasıyla çelişki). Onaylanan çözüm: (1) Vercel Web Analytics (çerezsiz, rızasız herkesi sayar) — kod eklendi, PANEL AÇMA ADIMI ÖZGÜN'DE; (2) band davetkârlaştırıldı ("Ziyaretinizi sayabilir miyiz?"). Gizlilik sayfasına çerezsiz ölçüm bölümü eklendi.

## Çerez bandı kaldırıldı (2026-07-30, Özgün'ün açık talimatı)
KVKK riski iki kez ayrıntılı anlatıldı (Kurul rehberi, rakip şikayet vektörü, gizlilik sayfası çelişkisi); Özgün "çerezleri kaldır" diye net talimat verdi — bilinçli ticari karar. Uygulama: band silindi, gtag.js herkeste idle-yüklemeyle (LCP deseni korundu), /gizlilik dürüstlüğü korundu (çerezlerin rızasız kullanıldığı açıkça yazıyor + tarayıcı/opt-out yolu + çerezsiz Vercel ölçümü bölümü). GA yarından itibaren tekrar tam ölçüm gösterecek.

## TKGM tapu tamamlama turu (2026-07-30) — site-adı SERP hakimiyeti işi
Hedef: "X sitesi" aramalarında üst sıra. GSC ölçümü (28g, 1.456 site-adı sorgusu, 18,7B gösterim): ilk 3'te sadece 20 sorgu; 1.028 sorgu 7-12. konumda (ilan portallarının altında). Vurma listesi scratchpad/gsc-site-sorgu-analizi.md'de.

Tapu niteliği metinde olmayan 190 kayda TKGM nokta sorgusu (koordinattan; dönen adaNo ↔ kayıt adalar[] çapraz eşleşme şartı):
- 154 uygun → 144'üne yazıldı: 110 "Kat mülkiyetli parsel (TKGM)", 33 "Kat irtifaklı parsel (TKGM)", 8 alan satırı (geri alınan 2 düşüldü)
- 10 ajanlık çapraz denetim (146/146): 2 GERİ ALMA — kasmir-mavi-orkide (koordinat 63933/2 beş katlı OFİS parseline düştü; sitenin konut parseli ayrı olmalı → parsel yapısı kartı), lale-kent (46665/3 "3 Katlı Ofis İşyeri", 1.000 m² — dükkân bloğu teşhisini TEYİT ETTİ, silinme kartı güçlendi)
- Metin düzeltmeleri (TKGM kanıtıyla): nover-westlife (arsa→kat mülkiyeti geçmiş, kayıt güncellendi), bulut-kule (tapu 2 değil 4 blok: A16+B13+C13 mesken + D2 işyeri — \r\n kaçağı), oyak-goksupark (14→15 konut bloğu), meva-sehir (107 dönümü aşan→yaklaşık 107 dönümlük)
- 32 kayıt kota (403) kuyruğunda → YARIN: scratchpad/tapu-sonuclar.json "kota" satırları yeniden koşulacak
- Yeni kartlar: ozahikent — TKGM 46224 (12 katlı B blok) kayıttaki 12 adada YOK, eksik ada adayı; ritim-eryaman — koordinat boş/tarla parsele düşüyor (18477/1 hedefti), koordinat kontrol edilmeli
- Ana Taşınmaz dönen 9 kayıt (may-tower, ma1-tower, panorama-prestij, kayra-loft...): kat mülkiyeti/irtifakı HENÜZ kurulmamış (yeni projeler) — tapu satırı bilerek yazılmadı

Sıradaki SERP kaldıraçları (bu tur değil): og:image üretimi (718 sayfa görselsiz — OSM tabanlı sınır haritası adayı), alternatifAdlar süpürmesi (556 eksik; aynı-ad tuzağı korumalı), ilk-3'teki 20 sorgunun profil analizi.

## TKGM tamamlama — 2. parti (2026-07-30 akşam)
Kota kuyruğundaki 32 kayıt koşuldu: 27 nokta sorgusu uygun→yazıldı; 4 inatçı hata (401/404) DOĞRUDAN parsel sorgusuyla çözüldü (Özharitacılar 19501/1 ✓38 dubleks, Güzel Ev 19501/2 ✓16, Gülvatan 19502/1 ✓19, Kutlutaş 17499/1 ✓7 apartman+8 dubleks — hepsi Kat Mülkiyet, defterdeki villa üçlüsü teyidiyle birebir). Betontaş koordinatı sağlık ocağına düşmüştü → doğru adadan (17516/1) sorgu: Kat Mülkiyet, "8 Blok Kargir Apartman" = kayıttaki 8 ada ✓.

4 ajanlık çapraz denetim (32/32) eklenen satırları temiz buldu; 6 ESKİ metin hatasını TKGM kanıtıyla yakalattı ve düzeltildi:
- altas-relax-line + meydan-ada: tapu "Ofis İşyeri" (rezidans tipi) iken metin düz "konut" diyordu → nitelik bilgisi eklendi
- frekans-eryaman: "12-13 katlı iki blok" → gerçek: 2 katlı çarşı A + 13 katlı B
- concept-eryaman: 16 → 17 kat (tapu)
- address-eryaman: 13'er → tapuda 16'şar kat
- mesa-bloklari: tek parselin alan satırı geri alındı (üç adalı site, toplam ~25 dönüm zaten kayıtlı)

SONUÇ: tapu-bilgisiz kayıt 190 → (aşağıdaki envanter çıktısına göre) yalnız gerçekten TKGM'de kaydı okunamayanlar kaldı. Ritim koordinat kartı ve Özahikent 46224 eksik-ada kartı Özgün'de.

## Yetki belgesi yazısı aramadan çekildi (2026-07-31, Özgün kararı)
TTBS/yetki-belgesi sorguları Türkiye genelinden alakasız tık + telefon araması getiriyordu; hedef kitle yalnız Eryaman ev sahibi. Çözüm: BlogFrontmatter.dizinDisi=true (noindex+follow, sitemap dışı) — yazı sitede güven içeriği olarak duruyor, müşteriye linkle gösterilebilir. Google'dan düşmesi birkaç gün–2 hafta; IndexNow bildirildi. Aynı bayrak ileride benzer sayfalar için genel mekanizma. Araç sayfalarına dokunulmadı (huninin parçası, zaten tık almıyorlar).

## GERİ ALMA (2026-07-31 akşam): yetki belgesi yazısı yeniden dizinde
Özgün noindex kararını aynı gün geri aldı: "görüntülenmelerimiz düşmesin." Sayfa tekrar index+sitemap'te (commit d17d4e2); dizinDisi mekanizması kodda duruyor ama hiçbir yazıda etkin değil. KURAL: bundan sonra hiçbir sayfayı aramadan çekme önerme (ada sayfaları eski kararı hariç).

## TTBS yazısı TAMAMEN silindi (2026-07-31 gece, Özgün kararı — geri almanın geri alınması)
Reklam-eşdeğeri analizde TTBS sorgularının müşteri değeri sıfır çıktı; Özgün "gösterimler düşmesin" kuralını bu sayfa için bilerek deldi: "ttbs hikayesi... tamamen silelim, gereksiz bir hit alıyor." Yapılan: mdx silindi, blog-konular'dan çıkarıldı, komisyon + emlakçı seçimi yazılarındaki iç linkler düz metne çevrildi (belge no 0603771 ve e-Devlet sorgulama notu emlakçı seçimi yazısına taşındı), 301 → /blog/evinizi-satarken-dogru-emlakci-secimi. dizinDisi bayrağı kodda duruyor, kullanan yazı yok.

## İlk sayfa harekâtı (2026-07-31) — "mahalle/site + emlakçı" SERP taraması ve paket
Canlı Google taraması (Özgün'ün Chrome'u, 27 sorgu):
- **Siteler: 12/12 İLK SAYFADA** (6'sı 1. sıra; ort ~1,8): aktürk sitesi 3, aktürk blokları 1, selvi 2, sümeyra-2 2, göksu hisar 1, koz modern 1, twin towers 2, mavi bayrak 1, bahçen 4, özkardeşler 1, armoni life 1, kardelen 2. Bu sınıf kazanılmış durumda.
- **Mahalleler: 8/15 ilk sayfada** — 1. sıra: tunahan, devlet, şeker, susuz; 3: altay, yavuz selim; 9-10: güzelkent, eryaman mah. **ÇIKMAYAN 7**: göksu, yeşilova, şeyh şamil, şehit osman avcı, ata, cumhuriyet, yeni batı. Ortak desen: Türkiye'de yaygın adlar + Yenimahalle grubu (coğrafi ayrıştırma zayıf).
- GSC teyidi: 28 günde "mahalle+emlakçı" sorgu sınıfında SIFIR gösterim satırı (yalnız "eryaman emlakçı" 5,9).

Uygulanan paket (commit d7670b9): title bölge soneki (| Eryaman / | Yenimahalle Ankara), hero etiketi (Eryaman · Etimesgut · Ankara / Yenimahalle · Ankara), Service+areaServed JSON-LD, gövdeye "X Mahallesi Emlakçısı: Şirin Gayrimenkul" bölümü (NAP+yetki no+5,0 puan; SAYI YOK), anasayfa tam-adlı mahalle çapaları + "Eryaman'ın tamamı ve komşu Yenimahalle mahalleleri" düzeltmesi, iki hizmet sayfasına "Hangi Mahallelerde Çalışıyoruz?" tam-adlı köprü blokları, girisVaadi 4/4 varyantta "emlakçı".
Denetim workflow'u (17 sayfa) 4 hata yakalattı → düzeltildi: bulunmaHali "Göksu'nda"→"Göksu'da" (IYELIK_DEGIL istisnası), anasayfa rozeti "5.0 · 377 Google Yorumu"→"5,0 · Google Yorumları" (yorum sayısı kuralı — JSON-LD reviewCount zengin sonuç için duruyor), yeniceri-kule çift ortaç, twin-towers "Eryaman bölgesinin"→"bölgenin".
İZLEME: 2-3 hafta sonra 7 zayıf sorgu yeniden taranacak; hâlâ çıkmayan olursa sıradaki kaldıraçlar: GBP hizmet bölgesi tanımları (Özgün paneli), mahalle sayfalarına og:image, harici yerel bağlantılar.

## Site başlıkları hedef biçime geçti + mahalle mahalle tarama programı (2026-07-31)
720 site title'ı: "X Emlakçı — Satılık ve Kiralık Daire | <Eryaman|mahalle>" (commit e9b9a78; kök şablon marka soneki ekliyor, zararsız). **ŞEKER MAHALLESİ BASELINE (16/16 tarandı):** 1. sıra: Altaş Relax Line, Dört Mevsim, Golden Life, İzoser · 2. sıra: Address Enda, Akdal, Altaş Rezidans, Diamond, Meydan Ada, Volga, Zirve Loft · 4: Bahçen · **İLK SAYFADA YOK (4): Hill Tower, Meydan Cadde, Oasis Rezidans, Rainbow Sitesi** — hepsi jenerik adlı; yeni başlık biçimi + bölge soneki tam bu sınıfa.
TARAMA PROGRAMI: günde 1-2 mahalle (~50-90 sorgu, insan hızında; 720'yi tek seferde taramak bot korumasına takılır) → ~2 haftada tam kapsama. Sıra: Şeker ✓ → Altay+Tunahan → Yeşilova+Devlet → Yavuz Selim → Şeyh Şamil → ŞOA → Eryaman → Göksu → Güzelkent → Cumhuriyet → Susuz → Ata. Her mahalle taraması buraya tablo olarak eklenecek; 2-3 hafta sonra Şeker yeniden taranıp önce/sonra karşılaştırılacak.

## Canlı tarama — Altay + Tunahan (2026-07-31, baseline)
**ALTAY (26): 24/26 ilk sayfada.** 1.sıra: Age Blokları, Aktürk Blokları, Atatürk, Doktorlar, Fırat Life Style Botanik, Kutlutaş, Mesa, Mood Street, Palmiye Evleri, Sutek Blokları · 2: Address Eryaman, Betontaş, Cabadağ, Erland, İzgi Park, Pembe Rüya, Uzuner, Vizyon Prestige · 3: Eryaman Park Evleri, İlbeyi, Lila Park, Motto Butik · 4: Oasis Tower, Vatan · **YOK: Arya Nüans Residence, Frekans Eryaman**
**TUNAHAN (26 kayıt/25 sorgu): 25/26 ilk sayfada.** 1.sıra: Elit Yaşam, Kur Sitesi (2 kayıt), Neopolitan, Sutek Sitesi, Yardımcı · 2: Age Sitesi, Camlı Klima, Haznedaroğlu, Maviçam, Metromall, Özar, Sarıgül, STFA, Tunahan Sitesi · 3: Dema Park, Ilgazlar, Öztaş, Su Damlası, Yüksel · 4: Canberk, Klima, Soyak · 7: Okyanus Plaza · **YOK: Gökdemir Premium**
**KÜMÜLATİF (3 mahalle, 68 kayıt): 61/68 ilk sayfada (%90).** Çıkmayan 7'nin ortak deseni: jenerik/markasız ya da çok yeni proje adları (Hill Tower, Meydan Cadde, Oasis Rezidans, Rainbow, Arya Nüans, Frekans, Gökdemir Premium). Yeni title biçimi (X Emlakçı önde + bölge soneki) tam bu sınıfı hedefliyor; 2-3 hafta sonra bu 7 + Şeker yeniden taranacak. SIRADAKİ TARAMA: Yeşilova + Devlet.

## Canlı tarama — Yeşilova (2026-07-31, baseline): 23/23 İLK SAYFADA (tam isabet)
1.sıra (13): Address Yeşilova, Alpar, Barla, Doğan Life, Eryaman Port, Green Place, Hotki Ritm, Kardelen, Koçaklar Tower, Lowland Business, Meva Şehir, Rema Delux, Sakalar Tower · 2 (5): Anka Vega, Gökdemir Tower, Green Hill, Penta 5, Sertower · 4: Kayra Loft, Pozitif Life · 5: Lokasyon Eryaman · 8: Doğan City, May Tower
**KÜMÜLATİF (4 mahalle, 91 kayıt): 84/91 ilk sayfada (%92), 33'ü 1. sıra.** Bugün ~156 arama yapıldı — günlük tarama burada kapandı (bot koruması). SIRADAKİ: Devlet (45) + Yavuz Selim (59'un ilk yarısı).

## Canlı tarama — Devlet (2026-07-31, baseline): 41/45 ilk sayfada (%91)
**1. sıra (23):** 4. Devlet Mah. Sitesi, Alis, Bayrak, Bilgi Sevgi Hoşgörü, Çayılkay, Demirkent, Eryaman Royal City, Gülhayat, Hotki Meydan, İlk Bahar, Mavikent, Mil-Koop, Örnek Arı, Öz Gimat, Özarda Göktürk, Sahil, Sergah, Sözova, Tes-İş, Turgut Aslan, Türkkonut İstaş, Yeşilöz, Yıldız Tatil · 2 (7): Arslanlar, Cevizlidere, Çınar, Oray, Özdenizyıldızı, Sarı Çınar, Yeni Huzur Bahçesi · 3 (10): Aşiyan, Betim, Çamdalı, Dastarlı, Denizim, Güneyce, İkizler, Mavi Köy, Selçuklu, Türkkonut Sinem · 4: Vatan · **YOK (4): Çağkent, Referans Ankara, Sedirkent, Yüceyurt**
**KÜMÜLATİF (5 mahalle, 136 kayıt): 125/136 ilk sayfada (%92), 56'sı 1. sıra.** Çıkmayan 11'in deseni değişmedi: jenerik/çakışan adlar. SIRADAKİ: Yavuz Selim (59).

## Canlı tarama — Yavuz Selim (2026-07-31, baseline): 52/59 ilk sayfada (%88)
1. sıra (18): Akçakent 87, Başkent Sular, Bizim Şirinköy, Doktorlar, Elit Nar Çiçeği, Endora, Gülvatan, Güz-Göl, İlkiz, İlkiz 2, Kardeşkent, Saçak 91, Seda Terasevler, Terasevler Eryaman, Turaykent, Utku, Yüksel Kent 91, Yurt Prestij · 2 (17): Altıntepe, Ayata Kent, Doğakent Çamlık, Erkaraca, Havayolları, Kardelen, Keyfim, Kırkayak, Korukent, Metrokent Villaları, Özenkent (2 kayıt), Özharitacılar, Taşkent, Yeni İlkay, Yeni Kaynak, Yeşil Göksu Koop, Yükselen · 3 (11): Acat, Concept, Esenkent, Eylül Evleri, Eylül Sitesi, Genç Avrasya, Göksu Sitesi, Serenköy, Serhatkent, Serpil, Uyum 90 · 4-6: Karköy, Pasaj, Safir, Sahibin · 10: Atadostlar · **YOK (7): Doğapark, Güzel Ev, Konut Sitesi, Küçükevlerimiz, Sahil Kent, Yavuz Selim Sitesi, Yunuskent**
**KÜMÜLATİF (6 mahalle, 195 kayıt): 177/195 ilk sayfada (%91), 74'ü 1. sıra.** Bugün ~260 arama — hiç bot engeli yok. KALAN 8 mahalle (525 kayıt): Ata 87, Güzelkent 80, Cumhuriyet 70, Göksu 68, ŞOA 68, Şeyh Şamil 55, Eryaman 51, Susuz 46.

## Canlı tarama — Susuz (2026-07-31, baseline): 43/46 ilk sayfada (%93)
**1. sıra (31):** Alya Park, Batımahal Başpınar, Bella Garden, Bordo Göl, Dostlar Birikim, Duru Life, Ende Yaşam, Eser Yapı, Göksu Marina, Green Life Göksu, Lenora Göksu, Lilyum, Liva Göksu, Mabeyn Başpınar, Maviler İpek, Merdin, Mira Göksu, Neovadi, Neva Palas, Nil My Home, Öniz Nirvana, Paradise Göksu, Perla Life, Sarıtaş Seyir, Serline, Şirin Ana Villaları, Sky Göksu, Tatlı Yamaç Palmiye, Vera Life Göksu, White Dream, Yıldız Life · 2 (10): Ap Forest Gate, Başkent Göksu, Bulut Kule, Göksu Hisar, Koruçam, Lake Life, Mahal Çağ, Majör Göksu, Palas Eryaman, Park Göksu · 3 (2): Mavera Göksu, Starlife · **YOK (3): Başak Life, Çağ Life, Mood Altınok**
**KÜMÜLATİF (7 mahalle, 241 kayıt): 220/241 ilk sayfada (%91), 105'i 1. sıra.** KALAN 7 mahalle (479): Ata 87, Güzelkent 80, Cumhuriyet 70, Göksu 68, ŞOA 68, Şeyh Şamil 55, Eryaman 51.

## Canlı tarama — Eryaman Mahallesi (2026-07-31, baseline): 48/51 ilk sayfada (%94)
1. sıra (18 kayıt): Armina Park, ASM Gold+Prestij (Urhal), Doğankaya, Elif Elvan, Endora Park, Gençler, Hassas Çizgi, İntes Doğakent, Işıkkent, Kayaevleri, Laçin, Lapis Garden, Maximum, Özgün İpek, Paşa Konakları, Türk Konut Çalışanlar, Yeşil Manolya · 2 (10): Akasya, Akkonaklar, Ankapark, Arya, Beyaz Residence, Doğakent, Elif Özgen, Güzel Ankara, Kent Konakları, Yeni Yayıklı · 3 (12): Atakent 1-2-Metro-Vadi, Bahar, Başak, Cumhuriyet Sitesi, Günötesi, Oyak Sitesi, Pınar, Ra-Da Life, Yeni Portakal Çiçeği · 4-5 (5): Oyak 555, Platin+Platin 2, Atakent Sitesi, Çağlar · 9: Ay Sitesi · **YOK (3): Eryaman Evleri, İlke Sitesi, TOKİ Konutları** (üçü de ultra-jenerik; TOKİ sorgusunu doğal olarak resmi TOKİ sonuçları domine ediyor)
**KÜMÜLATİF (8 mahalle, 292 kayıt): 268/292 ilk sayfada (%92), 123'ü 1. sıra.** KALAN 6 mahalle (428): Ata 87, Güzelkent 80, Cumhuriyet 70, Göksu 68, ŞOA 68, Şeyh Şamil 55.

## Canlı tarama — Şeyh Şamil (2026-07-31, baseline): 51/55 ilk sayfada (%93)
1. sıra (13): Alarko Blokları, Barış, İlksebat, İnci Park, Lider Yaşam, Liderkent, Mavera, Övgü İletişim, Özanadolu, Özlüce Güzelevim, Tekser, Tepe Blokları, Yağan Kent · 2 (13): Çağlar Emin, Demirel Park, İlkdoğuş, İlona, Nisan, Öz Tamer, Özahikent, Tuğçe Kent, Turkuaz, Umut, Uzunbey, Yeni Burak, Yeşil Vadim · 3 (18): Ak Kent, Atayıldız, Borankent, Çamlıca, Eston, Genç Efes, Gül, İçtaş, İlk Umut, Köşk Birlik, Kuryap, Öz Çözüm, Serender, Sümeyra, Tanışkent, Umar, Ünsal Rezidans, Yaygınkent · 4-7 (7): Alperenler, Melis, Onur, Selinkent, Yeşil Aşiyan, Yunus Emre Çağdaş, Zadegan · **YOK (4): Acar, Düşkent, Kaçkar, Sitekonut**
**KÜMÜLATİF (9 mahalle, 347 kayıt): 319/347 ilk sayfada (%92), 136'sı 1. sıra.** KALAN 5 mahalle (373): Ata 87, Güzelkent 80, Cumhuriyet 70, Göksu 68, ŞOA 68.

## Canlı tarama — Göksu (2026-07-31, baseline): 59/68 ilk sayfada (%87)
1. sıra (22 kayıt): Akdüzen, Alina, Eceser, Enday, Evinora, Finest, Göksu Metrokent, GSV Spor, Ilgaz Life, Kafdağı, Koru Eryaman, MA1 Tower, Mercan Smart House, Park Mira, SERGöksu, Sude, Utkan, Uzunali 1+2, Vaditepe Başpınar, Yeniçeri Kule, Zirveden Göksu · 2 (16): Admira, Angora, Göksu Aura, Göksu Bilge, Göksu Manzara, Kaşmir Göl, Kaşmir Mavi Orkide, Maybak, Oyak Göksupark, Park Evo, Paro Life, Polsan Ayışığı, Şelale, Seyirtepe, Tulip Life, Yenigüç · 3 (10): Akşafak, Arissa, Buse, Göksu Park Vadi, Göksu Vadi, Gölkent 1+2, Konum, Polsan Gözde, Utku Kent 2 · 4-8 (11): Doğa, Endora Göksu, Göksu Arma, Mutlu, Polsan Bahar, Yeşil Göl, Havacılar, Park İnci, Ağaçlı Göl, İrem · **YOK (9): Bahar, Bordo Loca, Göksu Evleri, Göksupark Konutları, Hava Destek, Havuzlu Evler, Hekimler ve Sağlıkçılar, Merkez, Meydan Eryaman**
**KÜMÜLATİF (10 mahalle, 415 kayıt): 378/415 ilk sayfada (%91), 158'i 1. sıra.** Göksu beklendiği gibi en zorlu bölge (ad belirsizliği + jenerikler). KALAN 4 mahalle (305): Ata 87, Güzelkent 80, Cumhuriyet 70, ŞOA 68.

## Canlı tarama — Şehit Osman Avcı (2026-07-31, baseline): 57/67 ilk sayfada (%85)
1. sıra (23): 75. Yıl, Alpak&Neve, Bordo Life, Bordo Platinum, BP Residence, Çamlık, Garden Zirve, Gökdemirler Suit, Happy Life, Hill Tower Göksu, İnci Life, İnci Park, İntes, İzo-Ser, Karma Modern, Kıratlı, Metropark Concept, Metropark Plus, Neva Butik Home, Ödevci, Relax Eryaman, Tan Yıldızı, Vera City · 2 (16): Akın 688, Arkadya, Atalay, Bulvar 1071, Bulvar 312, Çizgi Ötesi, Demirer, Göde Yaşam, Göksukent, Maybak, Neva Panora, Neva Prestij, Yazıcı Modern, Yıldız Eryaman, Z.Yayla, Zekioğlu · 3 (12): Address Göksu, Ardıç, Cumhuriyet, Daldikenler, Dalgıç, Elit Yaşam 1+2, Eston, Göksu Prestij, Kazım Sarı, KC Lale, Nefeskent · 4-10 (6): Akasya, Soyak, Relax Göksu, Türeli, Çiçek, Safir Rezidans · **YOK (9): Ahikent, Çınar, Göldekent, Güngörler Tower, İçtaş, Kardelen, Koz Modern (ŞOA kaydı; Tunahan'daki eksiz sorguda 1.sıra), Mia Concept, Üçyıldız** · Lale Kent taranmadı (silinme adayı kart)
**KÜMÜLATİF (11 mahalle, 482 kayıt): 435/481 ölçülende ilk sayfa (%90), 181'i 1. sıra.** KALAN 3 mahalle (237): Ata 87, Güzelkent 80, Cumhuriyet 70.

## Canlı tarama — Cumhuriyet (2026-07-31, baseline): 65/70 ilk sayfada (%93)
1. sıra (36): 10. Botanik Evleri, Ahsen, Akın Garden, Anadolu Vizyon, Ankalüx, AP Green Tower, Astim Platinium, Batıhan, Çakırpark, City Life, Diamond Göksu, Ender Doğuş, Endora Batı, Gülbaran, Güzel Belde, Hittown, Hityaşam, Hityenibatı Haktanır, Huzur Park, Konar Manzara, Mes Polaris, Nar Gülü 1, Natura Göksu, Natural, Nover WestLife, Oasis Korupark, Öz Uğur, Paryap West Life, Plus Life Ankara, Türkü, Ütopya, Vera West, Vizyon Tower, Yeşil Koru, Zen Park Göksu, Zen Park Plus · 2 (17): Altın Başak, Angora Göksu, AP İstGate, AP İstWay, Arissa Botanik, Astim Metrolife, Ata Yıldız Batı, Başakşehir Ankara, Batı Life, Botanik Evleri, Bulvar Yaşam, Gölde Lüxe, GreenPark, Grup Dayanışma, Günebakan, Yeni Botanik, Zirveden Batı · 3 (9): Akasya, AP İst Port, Astim Flora, Astim Skypark, Çimtaş Göksu, Güney Park, Nisanur, Park Sera, Vera Point · 4-10 (3): Vera Vista(4), Motto Göksu(5), Wind Göksu(5) · **YOK (5): Ataköy Konutları, Botanik Park Evleri, Hotki Bulvar, Kaşmir Yonca, Mood Göksu**
Not: tab kapanınca kaçan Altın Başak sorgusu yeniden koşuldu (2. sıra). "Botanik" dörtlüsünde ayrışma net: Botanik Evleri 2, Yeni Botanik 2, 10. Botanik 1 — ama Botanik Park Evleri YOK (ad çakışması, diğer üç kayda yenik).
**KÜMÜLATİF (12 mahalle, 552 kayıt): 500/551 ölçülende ilk sayfa (%91), 217'si 1. sıra.** KALAN 2 mahalle (167): Ata 87, Güzelkent 80.

## Canlı tarama — Güzelkent (2026-07-31, baseline): 76/80 ilk sayfada (%95)
Jenerik adlara +eryaman eki, benzersizlere eksiz sorgu. 1. sıra (23): Akkonak, Angora, Ankolular, Büyük Ankara, Çağdaş 95, Çağdaş Sistem, Er-Ay 3, Erkent, Evrimkent, Gardenya, Gerçek 92, İpek Yapı, Isı Kent, Korukent, Köşk, Metro Yaşam, Nazlıdeniz, Özügüzelkent, Postakent, Ritim Eryaman, Şehit Ferhat Koç, Yenigün Işığı, Yeşil Güven Kent · 2 (20): Anadolu, Boyut, Çözüm Kent, Didem, Doğuş 91, Eryapı, Gözde 2, Güzel Ankara, Karaşimşek, Mesa, Mesa Çalışanları Koop., Öz Muhtar, Özle İletişim, Pınarkent 91, Şahinbey, Yayıklı 2, Yayıklı 4, Yeşim Kent2, Yeşimkent, Yükselay · 3 (23): Ak 91, Aknergiz, Aksu, Altay, Anka-2001, Arzutaş, Çankaya Vefa, Elele, Erenköy, Gökkuşağı, Gözde 1, Gözde 91, Kardelen, Konuta Özlem, Meltem, Portakal Çiçeği, Safi Apak, Şelale, Şeniz, Şirin 91, Tez Konak, Ulaş, Yeni Isıkent · 4-10 (10): Gülenkent(4), Master Kent(4), 1. Portakal Çiçeği(5), Durtaş 91(5), Gülşah 95(5), Kurtuluş(5), Portakal Çiçeği 2(5), Kuşburnu(6), Renk Villaları(6), Ekin(8) · **YOK (4): Asilkent, Eczacılar, Gördoğu Şen, Küçük Ankara Villaları**
**KÜMÜLATİF (13 mahalle, 632 kayıt): 576/631 ölçülende ilk sayfa (%91), 240'ı 1. sıra.** KALAN 1 mahalle: Ata 87.

## Canlı tarama — Ata (2026-07-31, baseline): 81/87 ilk sayfada (%93) — 50'si 1. SIRA (rekor)
Yenimahalle grubu: jeneriklere +ankara/+yenimahalle eki. 1. sıra (50): Ada Loft Eryaman, Akdam, Aker Mücevher, Akonur, Alkon, Armoni Life, Ata Life, Aydınkent, Batı Sistemciler, Belmi Kent, Billur, Çağlayan, Demirkent On, Doğasu Elmaslar, Doğasu Evleri, Efsane Evleri, Elit Yaşam 3, Endora Plus, Eser Yapı Evleri, Etikent, Gold Life, Gold Stone, Gülkent, Güzel Akyüzüm, Hansa, Havuz Kent, Kozlar Towers, Manzara Evleri, Mavi Bayrak, Mavi Ladin, Mercankent Manzara, Mutlu, Palmiye Evleri, Panorama Garden/Gold/Life/Plus/Prestij (5'i de!), Paşa Evleri, Seçkin Atasaylar, Şelale, Selvi Evleri, Şenser, Sermina Life, Siyah Beyaz Evler, Trend Life, Tuana Evleri, Umut Yapı, Vizyon Başpınar, Yaylakent · 2 (25): Anemon, Atasayanlar, Ataşehir Eryaman, Belören Manzara, Çağlar Belde, Dilara, Kainat Evler 2, Kainat Evleri, Liva Life, Mercan Life Buse, Özkardeşler, Parkyaman, Prestij Park, Raylı Sistemciler, Ruşen Park, Rüyakent, Sarı Güllük, Sarmaşıklıköşk, Söğüt Bahçe, Sümeyra 2, Taflan, Tekirdağ Park, Turuncu Site, Twin Towers Eryaman, Zirve Park · 3 (5): Çağdaş Onur, Emin Güven, Gözde Evler, Güldede, Şirin Güneşkent · 4 (1): Genova · **YOK (6): Arıkovanı, Ayyıldız, Başkent, Bayer, Çiğdem, Mizan**

## ✅ TAM KARNE — 720 kayıt tarandı (2026-07-31, tek günde ~780 sorgu, sıfır bot engeli)
**14 mahalle, 719 kayıt (Lale Kent hariç 718 ölçüldü): 657/718 İLK SAYFADA (%92), 290'ı 1. SIRA (%40).** İlk sayfada olmayan 61 kayıt (%8). Mahalle sıralaması (ilk sayfa %): Yeşilova 100 · Güzelkent 95 · Eryaman 94 · Susuz-Şeker-ŞŞamil-Cumhuriyet-Ata 93 · Altay-Tunahan ~94 · Devlet 91 · Y.Selim 88 · Göksu 87 · ŞOA 85.
**Çıkmayan 61'in sınıflandırması (final analiz):**
- **İç yamyamlık (~10):** başka mahalledeki AYNI/BENZER adlı kaydımız SERP'i alıyor → Hill Tower (Şeker; ŞOA Hill Tower Göksu 1.), Koz Modern (ŞOA; Tunahan kaydı 1.), Kardelen (ŞOA; Yeşilova 1. + Güzelkent 3.), Çınar (ŞOA; Devlet Çınar 2.), İçtaş (ŞOA; ŞŞamil 3.), Ahikent (ŞOA; Özahikent ŞŞamil 2.), Botanik Park Evleri (Cumhuriyet; 3 komşu Botanik önde), Göksu Evleri + Göksupark Konutları (Göksu; Oyak Göksupark vb. önde), Bahar (Göksu; Polsan Bahar vb.). AKSİYON: bu kayıtlara ayırt edici gövde içeriği + alternatifAdlar; Google'ın benzer sayfa katlaması site: sorgusuyla doğrulanacak.
- **Ultra-jenerik ad (~20):** SERP'i kurum/marka domine ediyor → TOKİ Konutları, Konut Sitesi, Eryaman Evleri, İlke, Güzel Ev, Merkez, Havuzlu Evler, Başkent, Çiğdem, Ayyıldız, Eczacılar, Bayer, Mizan, Acar, Kaçkar, Yavuz Selim Sitesi, Küçükevlerimiz, Yunuskent, Sahil Kent, Doğapark. Gerçek kullanıcı bölge ekiyle arar; bu sınıfta ekli sorgu davranışı 2-3 hafta sonraki turda ölçülecek.
- **Yeni/zayıf sayfa (~31):** Arya Nüans, Frekans, Gökdemir Premium, Çağkent, Referans Ankara, Sedirkent, Yüceyurt, Başak Life, Çağ Life, Mood Altınok, Düşkent, Sitekonut, Bordo Loca, Hava Destek, Hekimler ve Sağlıkçılar, Meydan Eryaman, Göldekent, Güngörler Tower, Mia Concept, Üçyıldız, Ataköy Konutları, Hotki Bulvar, Kaşmir Yonca, Mood Göksu, Asilkent, Gördoğu Şen, Küçük Ankara Villaları, Meydan Cadde, Oasis Rezidans, Rainbow, Arıkovanı. AKSİYON: 61 URL IndexNow ile yeniden bildirildi; asıl beklenti bugün yayına giren hedef-biçim title'ların yeniden taranması. 2-3 hafta sonra 61'lik liste yeniden taranacak.

## 1. SIRA ARAŞTIRMASI (2026-07-31 gece) — 430 hedefi için kanıt tabanı
**Veri 1 — iç analiz (12 ajanlı workflow, 718 gözlem):** İçerik uzunluğu/madde sayısı konum sınıflarını AYIRT ETMİYOR (p≈0.36-0.72; temmuz süpürmesi korpusu homojenleştirmiş) → genel metin uzatma İŞE YARAMAZ. alternatifAdlar ham korelasyonu (%67 vs %55) karıştırıcı çıktı — jenerik tabaka içinde anlamsız (p≈0.32); süpürme hijyen, kaldıraç değil. Ad profili belirleyici: markalı+İngilizce %57 #1 (en ucuz kazanım), sayılı adlar %100 ilk sayfa, salt-coğrafi adlar (Göksu Sitesi tipi, n=18) %11 #1 — bunlarda birincilik HEDEFLENMEZ. Çıkmayan 61'in 40'ı markalı ad → indeksleme şüphesi (GSC denetimi = en büyük tekil kazanım adayı). Hedef matematiği: +140 birincilik = 2-3'teki 302'nin %46'sı; kaynak ~200 markalı/İngilizce/sayılı.
**Veri 2 — rakip taraması (70 örneklem sorgu, ilk-8 hostname; scratchpad/serp/rakip-taramasi.txt):** 2. sıradayken önümüzdeki #1: sahibinden.com ~%60 (genel liste ya da mağaza alt alanı), eryaman.bilgiemlak.com.tr ~%20, müteahhit/yönetim sitesi ~%10, IG/diğer ~%10. Yani 2→1 işi = portal listesini CTR+alaka ile geçme işi. bilgiemlak önde olduğunda sayfaları ince dizin sayfası — geçilebilir sınıf.
**ERKEN SİNYAL:** Sabah yayına giren hedef-biçim title'larla AYNI GÜN içinde örneklemde net yükseliş: Keyfim 2→1, Demirel Park 2→1, Polsan Ayışığı 2→1, Lila Park 3→1, Bahçen 4→1, Okyanus Plaza 7→2, May Tower 8→2, Atadostlar 10→4, Hill Tower 0→3 (yamyamlık düzeltmesi hedefi!), Mood Altınok 0→3, İlke 0→4. Karşı yönde 5-6 küçük düşüş (Meydan Ada/Haznedaroğlu/Turkuaz/Park Göksu 2→3, Yıldız Eryaman 2→4) — dalgalanma payı var, kesin ölçüm 2-3 hafta sonra.
**PLAN (onaylanan sıra): A1 title/snippet farklılaştırma (302 kayıt; parantezli ayırt edici, 50-60 karakter) · A2 iç bağlantı anchor varyasyonu (Zyppy kanıtı, sıfır maliyet) · A3 GSC indeks denetimi (çıkmayan 61 + ölçülemeyen 6) · A4 information gain (geliştirici/yıl/daire sayısı — SPESİFİK veri, uzatma değil) · A5 hijyen. YAPILMAYACAK: CTR manipülasyonu, genel uzatma, organik için ek GBP yatırımı, FAQ şema beklentisi, Good banttaki hız işi.**

## A3 İNDEKS DENETİMİ UYGULANDI (2026-07-31 gece) — kök neden: tarama bütçesi
**site: taraması (65 URL):** İlk sayfada çıkmayan 61 + ölçülemeyen 4 kayıttan **42'si Google dizininde HİÇ YOK** (23'ü dizinli ama sıralanamıyor). 42'nin TAMAMI sitemap'te mevcut (797 URL'lik canlı sitemap doğrulandı; loc'lar www'lu, kanonikle uyumlu — host sorunu yok). Dizinsiz 42 listesi: scratchpad yok42 + bu bölüm. GSC URL denetimi örnekleri: hill-tower "URL Google tarafından bilinmiyor", frekans-eryaman "Keşfedildi - şu anda dizine eklenmiş değil (sitemap ilişkili)".
**GSC Sayfalar raporu (24.07 verisi): dizinsiz 643 = Keşfedildi-taranmadı 563 (ANA SORUN) + Tarandı-eklenmedi 43 + kanonik-alternatif 22 + 404 7 + yönlendirme 5 + noindex 3.** Teşhis kesinleşti: Google 563 sayfanın varlığını biliyor ama taramıyor — tarama bütçesi/otorite kısıtı. Ada-sayfası kararı (noindex+sitemap dışı) bu bütçeyi site sayfalarına açmak içindi; rapor 24.07'de kaldığından etkisi henüz görünmüyor.
**Yapılan:** Öncelikli 10 markalı-adlı dizinsiz sayfaya GSC'den "dizine eklenmesini iste" gönderildi (Hill Tower, Oasis Rezidans, Meydan Cadde, Arya Nüans, Frekans, Gökdemir Premium, Mood Göksu, Kaşmir Yonca, Hotki Bulvar, Bordo Loca) → günlük kota doldu ("Kota Aşıldı"). KUYRUKTA (sonraki günler, günde ~10): Mia Concept, Güngörler Tower + kalan 30 dizinsiz (öncelik markalı adlar; ultra-jenerikler en sona). İzleme: istek atılan 10'un dizine giriş/SERP durumu birkaç gün içinde kontrol edilecek.

## A1+A2 UYGULANDI (2026-08-01 sabahı, commit 0e0c3f4) + 720 URL IndexNow
**A1 (snippet güveni):** Site sayfası meta description'ı yeniden kuruldu: "X'te eviniz mi var? Değerini siteyi blok blok tanıyan YETKİ BELGELİ emlakçınızla netleştirin (TTBS No 0603771). Aynı gün dönüş: 0532 363 96 60." — portal listelerinden farklılaşma. yetkiBelgeNo artık siteConfig'te tek kaynak. En uzun ~30 adda telefon kırpılıyor (truncateForMeta), güven öğesi korunuyor — kabul edildi.
**A2 (anchor çeşitliliği):** Komşu Siteler bölümü kart gridinden ÖNCE 6 farklı kalıplı doğal metin köprüsü basıyor: "X'te satılık daire / Y'de kiralık daire / Z emlakçısı / Q'da emlak danışmanlığı / W'de daire değerleme / V'nin güncel piyasası" (ANCHOR_KALIPLARI, sayfa slug'ına göre kayan atama — aynı komşu her sayfadan farklı kalıp alır; Google ilk anchor'ı esas aldığından metin köprüler kartlardan önce). Dev'de doğrulandı: Türkçe ekler kusursuz ("Vera Point'te", "Residence'ta", "Konutları'nın"). 720 site URL'si IndexNow'a bildirildi (200).
**GSC kota denemesi:** Mia Concept isteği "Kota Aşıldı" — günlük kota henüz yenilenmemiş. KUYRUK aynen: Mia Concept, Güngörler Tower + 30 dizinsiz (günde ~10, sonraki oturumlar).

## A4 INFORMATION GAIN — 1. dalga UYGULANDI (2026-08-01, commit 0fe0014)
Hedef evren: 2. sırada takılan 181 kayıttan proje verisi (geliştirici/yıl/daire) eksik 166'sı. 1. dalga 40 kayıt, 13 ajanlı workflow: 8 araştırmacı (WebSearch, kaynak URL+alıntı zorunlu, Eryaman konum teyidi şart — Sky Göksu tuzağı koruması) → süzgeç (konumTeyitli + güven≥orta) → 4 uygulayıcı (ihtiyat kalıplarıyla aciklama+ozellikler; CTA sonda kalır) → 1 kural denetçisi. SONUÇ: **11/40 kayıtta doğrulanmış YENİ veri işlendi** (Address Enda, Akdal değil—, Diamond, Volga, Zirve Loft, Address Eryaman, Erland, Vizyon Prestige, Sarıgül, Doğakent Çamlık, Anka Vega, Sertower); 29 kayıtta güvenilir kaynak çıkmadı — boş bırakıldı (dürüst sonuç). Denetçi address-eryaman'da 2 kusur düzeltti (cümle başı + tekrar); yasak-kalıp taraması 11/11 temiz. 11 URL IndexNow (200). Örnek eklemeler: "ALR İnşaat, 2019 teslim (geliştirici tanıtımı)", "Zirve İnşaat, 105 daire (sektörel referans)", "İK Grup Yapı — 93 konut + 9 mağaza". KALAN: 2. dalga 40 kayıt hazır (a4-dalga2.json); 166'nın kalanı sonraki oturumlar. GSC kotası bu tur de kapalıydı (Mia Concept "Kota Aşıldı") — kuyruk 32 URL yarına.

## A4 — 2. dalga UYGULANDI (2026-08-01, commit a9f4524) + Frekans dizine girdi
2. dalga 40 kayıt: **12'sinde doğrulanmış yeni veri** (AP Forest Gate — Şani İnşaat/2023/78 konut; Beyaz Residence, Park Göksu, Ankapark, İlona, Kent Konakları, Arya, Palas Eryaman, Akasya Evleri, Demirel Park, Özahikent, Umut). Denetçi 4 kusur düzeltti: Park Göksu + İlona'da özellikler-tapu kat çelişkisi, Özahikent'te tekrar, Umut'ta "Iki→İki" imla. 28 kayıt dürüst boş. 12 URL IndexNow (200). **ARA ÖLÇÜM: dün istek atılan 10 dizinsizden Frekans Eryaman bir gecede Google dizinine GİRDİ** (site: teyitli); kalan 9 kuyrukta. A4 toplamı: 80 kayıt tarandı, 23 zenginleşti. Dalga 3 (40) + dalga 4 (46) listeleri hazır.

## 🎯 A3 SONUÇ ÖLÇÜMÜ (2026-08-01) — indeksleme isteği KANITLANDI: 10/10 dizine girdi, 8'i ilk sayfada, 4'ü 1. SIRA
Dün GSC'den "dizine eklenmesini iste" gönderilen 10 dizinsiz sayfanın 24 saat sonraki durumu (site: + canlı SERP ölçümü):
| Sayfa | Önce | Şimdi |
|---|---|---|
| Hill Tower (Şeker) | dizinde YOK | **1. sıra** |
| Meydan Cadde (Şeker) | dizinde YOK | **1. sıra** |
| Gökdemir Premium (Tunahan) | dizinde YOK | **1. sıra** |
| Frekans Eryaman (Altay) | dizinde YOK | **1. sıra** |
| Oasis Rezidans (Şeker) | dizinde YOK | 2. sıra |
| Arya Nüans (Altay) | dizinde YOK | 2. sıra |
| Kaşmir Yonca (Cumhuriyet) | dizinde YOK | 2. sıra |
| Hotki Bulvar (Cumhuriyet) | dizinde YOK | 4. sıra |
| Mood Göksu (Cumhuriyet) | dizinde YOK | dizinde, henüz sıralanmıyor |
| Bordo Loca (Göksu) | dizinde YOK | dizinde, henüz sıralanmıyor |
**SONUÇ: 10/10 dizine girdi (%100), 8/10 ilk sayfaya girdi, 4/10 doğrudan 1. SIRA.** Teşhis doğrulandı: bu sayfaların sorunu sıralama değil, Google'ın sayfayı hiç taramamış olmasıydı (tarama bütçesi). Manuel indeksleme isteği bu darboğazı 24 saatte açıyor. **KALAN 32 dizinsiz sayfa için aynı sonuç bekleniyor — kota (günde ~10) yenilendikçe devam edilecek. Bu, 430 hedefindeki en yüksek getirili tek iş.**
Not: bugün kota yine dolu çıktı (Mia Concept denendi, "Kota Aşıldı"); Google 24 saatlik pencerede yeniliyor.

## ✅ A4 KAMPANYASI TAMAMLANDI (2026-08-01) — 166 kayıt tarandı, 63'ü zenginleşti
| Dalga | Bölge | Taranan | Veri işlenen |
|---|---|---|---|
| 1 | Şeker/Altay/Tunahan/Yeşilova/Devlet/Y.Selim | 40 | 11 |
| 2 | Y.Selim/Susuz/Eryaman/Ş.Şamil | 40 | 12 |
| 3 | Ş.Şamil/Göksu/ŞOA/Cumhuriyet | 40 | 19 |
| 4 | Cumhuriyet/Güzelkent/Ata | 46 | 21 |
| **TOPLAM** | | **166** | **63 (%38)** |
Verim yeni-dönem bölgelerde belirgin yüksek (dalga 3-4: %44-46; dalga 1-2: %28-30) — eski kooperatif sitelerinde internet kaydı yok, dürüstçe boş bırakıldı. 4. dalga bir kez kota hatasıyla boş döndü, model değişimiyle yeniden koşuldu (working tree temizdi, kalıntı yok).
**Denetçi katma değeri (4 dalga toplamı): 14 düzeltme** — en kritikleri olgusal: Twin Towers kat aralığı (1-35 → 35'er), Mercan Life (18 → 17+18), Kainat Evleri'nde VAR OLMAYAN "Kainat 2 Evleri"ne atıf (→ Kainat Evler 2), Park Göksu + İlona + Seyirtepe'de özellik-tapu kat çelişkileri. Ayrıca Tekirdağ Park'ta kayıp `sözlüğümüzdeki kat irtifakı maddesinde` kalıbı eklenerek iç bağlantı geri kazanıldı.
**Elle müdahale:** Ataşehir Eryaman'da "yaklaşık 20.000 m² peyzaj" (23.733 m² parselin %84'ü — zorlama) rakamı çıkarıldı, "geniş bir bölümü" olarak yumuşatıldı; kaynak çerçevesi korundu.
63 URL IndexNow'a bildirildi (4 partide, hepsi 200).

## İndeksleme turu 2 (2026-08-01) — GSC kotası kapalı, kotasız kanallar kullanıldı
GSC "dizine eklenmesini iste" bugün yine "Kota Aşıldı" verdi (Mia Concept denendi; Google 24 saatlik pencerede yeniliyor, dünkü 10'luk parti kotayı doldurmuş). Kotasız kanallar devreye alındı:
1. **Sitemap yeniden gönderildi** — GSC Site Haritaları'ndan tekrar gönderim: "Son okuma tarihi 1 Ağu 2026, Başarılı, 797 sayfa" (öncesi 31 Tem). Bugünkü 63 zenginleştirmenin taze lastmod'ları Google'a bildirilmiş oldu.
2. **32 dizinsiz URL IndexNow'a** yeniden bildirildi (Bing/Yandex anında; HTTP 200). Liste: scratchpad/dizinsiz32.json.
3. **İç bağlantı denetimi (kotasız kaldıraç kontrolü):** canlı HTML'de linkler Google'ın görebileceği biçimde basılıyor — /siteler 517 link (kalan 203 Yenimahalle grubu /siteler/yenimahalle'de; 517+203=720 ✓), ŞOA mahalle sayfasında 68 link ve dizinsiz 6 markalı kaydın (Mia Concept, Güngörler, Bossphorus, Göldekent, Ahikent, Üçyıldız) hepsi mevcut. **Yani keşif sorunu YOK — darboğaz sadece tarama bütçesi.** Teşhis üçüncü kez doğrulandı.
SONRAKİ ADIM: kota yenilenince öncelik sırasıyla 10'ar istek (markalı adlar önce: Mia Concept, Güngörler Tower, Bossphorus, Göldekent, Ahikent, Üçyıldız, Başak Life, Çağ Life, Ataköy, Botanik Park → sonra jenerikler).

## 📊 TUR-2 TAM YENİDEN TARAMA (2026-08-01) — 63 YENİ 1. SIRA, toplam 353/720
Özgün'ün talebiyle 1. sırada OLMAYAN 430 kaydın tamamı yeniden tarandı (419 ölçüm tamamlandı; 11'i etiket çakışması nedeniyle çift sayılmadı). Sorgu kuralı dünküyle hizalandı (jenerik/kısa adlara bölge eki, marka soneklilere eksiz); sorgu listesi scratchpad/serp/yeniden-tarama-hedef.json, ham sonuçlar tur2-sonuclar.txt.
**SONUÇ:** 1. sıra **63** · 2. sıra 167 · 3. sıra 93 · 4-10 60 · çıkmayan 36. İlk sayfa %91.
**TOPLAM SİTE KARNESİ: 290 + 63 = 353/720 kayıt 1. SIRADA (%49).** Bir gün önce %40 idi.
Yükseliş/düşüş dengesi (ilk 213 ölçümde tutuldu): 84 yükseliş / 21 düşüş — 4:1 lehimize.
**Öne çıkan sıçramalar:** Hill Tower 0→1, Meydan Cadde 0→1, Gökdemir Premium 0→1, Frekans 0→1 (indeksleme isteği etkisi); Koz Modern 0→1 ve İçtaş 0→1 (yamyamlık düzeltmesi etkisi); Botanik Park 0→3, Üçyıldız 0→2, Kaçkar 0→3, Düşkent 0→10, Sedirkent 0→6, Yüceyurt 0→2, Güzel Ev 0→6, Konut Sitesi 0→6, Sahil Kent 0→3, Yavuz Selim Sitesi 0→3, Yunuskent 0→2, İlke 0→3, Acar 0→8, Mood Altınok 0→3; May Tower 8→2, Okyanus Plaza 7→2, Ay Sitesi 9→2, Pozitif Life 4→1, Platin 2 4→1, Klima 4→1, Lila Park 3→1.
**HÂLÂ ÇIKMAYAN 36** (dünkü 61'den düştü): ahikent, ak-kent, akasya(Cumhuriyet), arıkovanı, ataköy, ayyıldız, başak-life, başkent, bayer, borankent, bordo-loca, çağ-life, çağkent, doğapark, eczacılar, eryaman-evleri, göksu-evleri, göksu-sitesi, göldekent, gözde-evler, güngörler, hava-destek, hekimler, küçük-ankara, küçükevlerimiz, meydan-eryaman, mia-concept, mizan, mood-göksu, referans-ankara, safir-rezidans, sarmaşıklıköşk, sitekonut, soyak, starlife, toki. Bunların ~20'si GSC indeksleme kuyruğunda (kota bekliyor), kalanı ultra-jenerik ad sınıfı.
NOT: Bazı kayıtlarda gün içi dalgalanma gözlendi (Keyfim 1→2, Mood Göksu 3→0, Soyak 4→0) — Google mikro-sorgularda saatlik oynuyor; kesin eğilim için 2-3 hafta sonraki tur esas alınacak.

## GSC indeksleme kuyruğu — DURUM (2026-08-01 gece)
Kota BUGÜN kapalı: Güngörler Tower denendi, "Kota Aşıldı". Google günlük ~10 isteklik kotayı 24 saatlik pencerede (pratikte UTC gün dönümü) yeniliyor; dün atılan 10 istek pencereyi doldurmuş. GSC arayüz notu: URL kutusunda Enter tetiklemiyor, **"Arama" butonuna (ref) tıklamak** gerekiyor; ardından "Dizine eklenmesini iste" → ~60 sn test → sonuç.
KOTASIZ KANAL: bugünkü taramada hâlâ çıkmayan 36 kaydın tamamı IndexNow'a bildirildi (HTTP 200). Kuyruk listesi: scratchpad/gsc-kuyruk.json.
**YARIN İLK İŞ — öncelik sırasıyla 10 istek:** Güngörler Tower, Mia Concept, Göldekent, Ahikent, Başak Life, Çağ Life, Ataköy Konutları, Starlife, Safir Rezidans, Bordo Loca (hepsi markalı ad — dünkü 10'luk partide markalı adların %80'i ilk sayfaya, %40'ı 1. sıraya çıkmıştı). Sonraki gün: Hava Destek, Meydan Eryaman, Göksu Evleri, Hekimler, Gözde Evler, Sarmaşıklıköşk, Arıkovanı, Ayyıldız, Başkent, Bayer. En sona ultra-jenerikler (TOKİ, Eryaman Evleri, Göksu Sitesi, Konut Sitesi tipi).

## alternatifAdlar süpürmesi UYGULANDI (2026-07-31, commit 2d31442)
330 kayda tek güvenli varyant sınıfı eklendi: tür soneki değişimi → "Aktürk Blokları" tipine "X Sitesi", soneksizlere (Motto Göksu) "İsim + Sitesi", sayılılara doğal biçim ("Elit Yaşam Konutları 3" → "Elit Yaşam 3 Sitesi"). Başka kaydın GERÇEK adıyla çakışan 11 üretim atlandı (yamyamlık koruması — "Aktürk Sitesi" zaten ayrı kayıt). "Sitesi/Site" ile biten ~380 kayda üretim yapılmadı (arama substring'i zaten eşleşir; ters yön uydurma olurdu). Kullanım: site içi arama eşleşmesi + JSON-LD alternateName + keywords meta; dev'de doğrulandı, 330 URL IndexNow (200). Envanter: 720 kaydın 494'ünde artık alternatifAdlar dolu.

## Yamyamlık düzeltmesi UYGULANDI (2026-07-31, commit 30f9e9a)
Tam-ad çakışma envanteri: 14 grup / 30 kayıt. İlçe süzgeciyle 9 grup / 19 sayfa birebir ÖZDEŞ title+description üretiyordu (ikisi de "| Eryaman" sonekli): Angora, Bahar, Cumhuriyet Sitesi, Doktorlar, Kardelen (4 kayıt), Korukent, Soyak, Vatan, Çınar. Şablon düzeltmesi: `isimBirdenCokMahallede()` (lib/content.ts) → çakışan adlarda sonek "| <MahalleKısa> Eryaman", description başına mahalle adı ("Göksu Bahar Sitesi'nde eviniz mi var?"). Yenimahalle dalı zaten mahalle adıyla ayrışıyordu. Dev server'da doğrulandı (Kardelen×2, Bahar, Çınar ayrıştı; Aktürk regresyonsuz); tsc temiz; 30 URL IndexNow'a bildirildi (HTTP 200). Hill Tower/Ahikent/Botanik Park gibi TAM eşleşme olmayan benzer-ad vakaları şablonla çözülemez — 2-3 haftalık yeniden taramada ölçülecek.

## 📋 TAM KARNE — TÜM SAYFALAR + MAHALLELER (2026-08-01 akşam, Özgün talebi)
699 site sorgusu + 14 mahalle sorgusu tek turda ölçüldü (bugünün 3. tam taraması; günlük toplam ~1.500 sorgu, sıfır bot engeli). Kayıt: repo kökünde **sira-karnesi.md** (1. olanlar / olmayanlar tam liste), ham veri scratchpad/serp/tur2-sonuclar.txt + tur3-site-sonuc.txt + tur3-mahalle-sonuc.txt.
**SİTE: 1. sıra 243 · 2. sıra 253 · 3. sıra 106 · 4-10 60 · çıkmayan 37 → ilk sayfa %95 (rekor).**
**MAHALLE: 1. sıra 4/14** (Devlet, Eryaman, Şeker, Yavuz Selim) · Altay 3 · Tunahan 4 · Güzelkent 9 · çıkmayan 7 (Ata, Cumhuriyet, Göksu, ŞOA, Şeyh Şamil, Susuz, Yeşilova). Mahalle sorgularında rakip portal ağırlığı çok yüksek (sahibinden/remax/hepsiemlak ilk 3'ü kapıyor) — site sorgularından yapısal olarak zor sınıf.
**KRİTİK METODOLOJİ NOTU:** Dün 1. sırada olan 290 kaydın bugünkü ölçümünde koruma oranı **%59**; kalan %41 2-3. sıraya kaymış. Aynı gün içinde bile oynama görüldü (Keyfim 1→2, Mood Göksu 3→0→0, Soyak 4→0). Sebep: bugün 720 sayfanın title/description/içeriği topluca değişti + 720 URL IndexNow'a bildirildi → Google tüm korpusu yeniden değerlendiriyor. **Bu yüzden bugünkü 243 rakamı "dip" ölçümdür, kalıcı seviye değil.** Sağlıklı karşılaştırma için 2-3 hafta sonra aynı sorgu listesiyle tekrar ölçülecek (sorgu listeleri: yeniden-tarama-hedef.json + tur3-birinciler.json).

## 📌 İNDEKSLEME DURUMU (2026-08-01 akşam ölçümü)

**GSC ERİŞİM SORUNU:** Search Console mülküne (`sc-domain:siringayrimenkul.com`)
tarayıcıdaki üç Google hesabının da erişimi yok — ozgundeniss@gmail.com,
ozgundeniss1@gmail.com, 1hamza.sirin@gmail.com hepsinde "Maalesef bu mülke
erişiminiz yok". Mülk var ama yetki başka bir hesapta. **Özgün'ün çözmesi
gereken tek şey bu** — çözülürse "dizine eklenmesini iste" düğmesi günde ~10
sayfayı 24 saatte dizine sokuyor (ölçüldü: 10/10, 4'ü doğrudan 1. sıraya).

**ÖLÇÜM (canlı `site:` sorgusu, 36 aday tek tek soruldu):**
31 Temmuz'daki 36 dizinsizden **15'i dizine girdi**: Çağ Life, Ataköy Konutları,
Mood Göksu, Referans Ankara, Çağkent, Ayyıldız, Bayer, Göksu Evleri, Hekimler,
Eryaman Evleri, Başkent Sitesi, Sitekonut, Ak Kent, Soyak Blokları (Tunahan),
Bordo Loca.

**HÂLÂ DİZİNSİZ 21** (lib/tarama-oncelikli.ts'te kayıtlı):
- ŞOA (6): güngörler-tower, mia-concept-konutlari, goldekent-sitesi,
  ahikent-sitesi, safir-rezidans, soyak-sitesi
- Ata (4): arıkovani, gözde-evler, mizan, sarmaşıklıköşk
- Susuz (3): başak-life, starlife, başkent-göksu
- Göksu (2): hava-destek, meydan-eryaman
- Yavuz Selim (2): doğapark, göksu-sitesi
- Güzelkent (2): eczacılar, küçük-ankara-villaları
- Eryaman (1): toki-konutlari · Cumhuriyet (1): akasya · Şeyh Şamil (1): borankent

**YAPILAN (GSC'siz kotasız kaldıraç):** site sayfasındaki 6 komşu kartından biri
artık aynı mahalledeki dizinsiz bir sayfaya ayrılıyor (lib/tarama-oncelikli.ts +
[site]/page.tsx). Cumhuriyet'te 70 sayfa tek hedefe, ŞOA'da 68 sayfa altı hedefe
bağ veriyor. Örneklem ölçümü (ŞOA 12 sayfa): 21 yeni bağ, dağılım 3-5 dengeli.
Ayrıca 22 URL IndexNow'a yeniden bildirildi (HTTP 200).

**BAKIM:** sayfa dizine girince lib/tarama-oncelikli.ts'ten ÇIKARILMALI.

### ✅ GSC ERİŞİMİ ÇÖZÜLDÜ (2026-08-01 gece)

**Doğru mülk: `https://www.siringayrimenkul.com/` (URL ÖNEKİ mülkü), `sc-domain:` DEĞİL.**
ozgundeniss@gmail.com bu mülke erişiyor. Domain mülkü (sc-domain:siringayrimenkul.com)
ayrı bir kayıt ve ona erişim yok — bugün saatlerce onu denediğimiz için "erişim yok"
sanmıştık. www'suz URL öneki mülkü de var ama neredeyse boş (87 tıklama, 1 sayfa).

**Panel verisi:** 1.132 web arama tıklaması (son 28 gün), dizine eklenen 1.070 sayfa,
dizine eklenmeyen 643 sayfa.

**Arayüz notu güncellendi:** URL denetim kutusunda **Enter ÇALIŞIYOR** (eski not yanlış).
Akış: kutuya URL yaz → Enter → ~18 sn → "DİZİNE EKLENMESİNİ İSTE" → ~60 sn → onay modalı
→ "Kapat". Doğrudan `/search-console/inspect?...&id=<url>` bağlantısı 404 veriyor,
panelden gitmek şart.

**BUGÜN GÖNDERİLEN 10 İNDEKSLEME İSTEĞİ** (hepsi "Dizine eklenmesi istendi" onayı aldı
— günlük kota tamamlandı): Güngörler Tower, Mia Concept Konutları, Safir Rezidans,
Başak Life, Starlife, Göldekent Sitesi, Ahikent Sitesi, Meydan Eryaman, Başkent Göksu,
Doğapark Sitesi.

**Sitemap durumu (GSC Site Haritaları):** /sitemap.xml — Başarılı, 797 sayfa keşfedildi,
son okuma 2 Ağu 2026. Sitemap tarafında sorun YOK; yeniden göndermeye gerek yok.

Hepsinin denetim sonucu aynıydı: **"Keşfedildi - şu anda dizine eklenmiş değil",
Son tarama: Yok.** Yani Google sayfayı sitemap'ten biliyor ama HİÇ TARAMAMIŞ —
tarama bütçesi teşhisi dördüncü kez doğrulandı. (Starlife, Ahikent ve Meydan
Eryaman'da "URL Google tarafından bilinmiyor" + "yönlendiren site haritası
algılanmadı" çıktı; bu üçü sitemap eşleşmesi henüz oluşmamış sayfalar.)

**KUYRUKTA 12 SAYFA (yarın, kota yenilenince):** Göksu Sitesi (Yavuz Selim), Arıkovanı,
Gözde Evler, Mizan, Sarmaşıklıköşk (hepsi Ata), Hava Destek (Göksu), TOKİ Konutları
(Eryaman), Akasya (Cumhuriyet), Borankent (Şeyh Şamil), Eczacılar + Küçük Ankara
Villaları (Güzelkent), Soyak Sitesi (ŞOA).

**İZLEME:** 10 isteğin sonucu 24 saat içinde bakılmalı. Geçen partide 10/10 dizine
girmişti, 8'i ilk sayfaya, 4'ü doğrudan 1. sıraya. Dizine girenler
lib/tarama-oncelikli.ts'ten çıkarılacak.


## 🔧 ADA SAYFASI KANONİKLEŞTİRMESİ (2026-08-02)

**Sorun (298 sitelik canlı SERP ölçümü):** 51 sitede, site adı arandığında Google
site sayfası yerine o sitenin ADA sayfasını gösteriyordu. Şeyh Şamil'de oran %45.

**Kök neden:** 28 Temmuz'da ada sayfaları noindex + sitemap dışı yapılmıştı; bu
ters etki doğurdu. Google noindex'i ancak sayfayı yeniden tarayınca görebilir,
sitemap dışında kalınca o tarama hiç gelmedi. Sayfalar dizinde kaldı.

**Uygulanan çözüm (yönlendirme DEĞİL):**
- Tek siteli ada sayfalarının canonical'ı → site sayfası
- noindex kaldırıldı (noindex+canonical çelişkili sinyal)
- Tek siteli ada sayfaları sitemap'e alındı, priority 0.2 (797 → 1.544 URL)
- Paylaşımlı parseller değişmedi (kendi canonical'ı + noindex + sitemap dışı)
- 747 ada URL'i IndexNow'a bildirildi

**Neden yönlendirme değil:** Özgün'ün kararı ada sayfalarının KALMASI yönündeydi
(başlıkları site adıyla açılacak şekilde düzeltilmişti). Kanonikleştirme sayfayı
yerinde bırakır ama arama motoruna asıl sürümün site sayfası olduğunu söyler.

**GEÇİCİ — TAKİP GEREKİYOR:** GSC'de ada sayfaları "alternatif sayfa, uygun
kanonik etiketi var" durumuna geçince app/sitemap.ts'teki adaSayfalari bloğu
tekrar kapatılmalı, yoksa tarama bütçesi boşuna orada kalır.

## 📊 SIRA KARNESİ — 9 MAHALLE TARANDI (2026-08-02)

Yöntem: "<site adı> emlakçı" (bölge eki YOK — Özgün'ün düzeltmesi), canlı SERP.

| Mahalle | Ölçüm | Doğru sayfayla 1. sıra | Oran |
|---|---|---|---|
| Susuz | 46 | 34 | %73 |
| Devlet | 33 | 18 | %55 |
| Yeşilova | 22 | 12 | %55 |
| Şeker | 16 | 7 | %44 |
| Eryaman | 40 | 17 | %43 |
| Şehit Osman Avcı | 69 | 27 | %39 |
| Tunahan | 26 | 4 | %15 |
| Altay | 26 | 4 | %15 |
| Şeyh Şamil (kısmi 20) | 20 | 2 | %10 |
| **TOPLAM** | **298** | **126** | **%42** |

**Örüntü:** Markalı/benzersiz adlı mahalleler (Susuz: Alya Park, Lake Life, Sky
Göksu…) %73; jenerik ve birbirine benzeyen adlı mahalleler (Tunahan/Altay:
Age/Aktürk/Klima/Sutek/Soyak — hepsi hem "Sitesi" hem "Blokları" varyantıyla iki
mahallede) %15. Bu, alias çakışması teşhisini doğruluyor.

**Sorun dağılımı (298 ölçüm):** ada sayfası 51 · yanlış site sayfası 14 ·
mahalle sayfası 7 · hiç çıkmıyor 9. Yani %27'sinde yanlış sayfa gösteriliyor.

**KALAN TARAMA:** Ata 86, Güzelkent 79, Cumhuriyet 69, Göksu 68, Yavuz Selim 57,
Şeyh Şamil 34. Veri: scratchpad/mahalle-turu/BIRLESIK-KARNE.json + mahalle bazlı.

## 📈 DÜN→BUGÜN KARŞILAŞTIRMASI (2026-08-02)

**SİTELER — aynı ölçütle (siringayrimenkul.com 1. sırada mı):**
| | 1 Ağustos | 2 Ağustos |
|---|---|---|
| 1. sıra | 243/699 = %35 | 157/348 = **%45** (+10 puan) |
| İlk sayfa | %95 | %96 |

Yeni ve daha katı ölçüt (DOĞRU sayfayla 1. sıra): 145/348 = %41. Aradaki 4 puan,
1. sırada olup yanlış sayfamızın göründüğü kayıtlar.

Dünkü not ("243 dip ölçümdür, Google korpusu yeniden değerlendiriyor") doğrulandı —
toparlanma başlamış.

**MAHALLELER (14 sorgu) — skor 3/14 → 3/14, ama iç hareket var:**
| Mahalle | 1 Ağu | 2 Ağu |
|---|---|---|
| Ata | ilk sayfada yok | **1. sıra** 🚀 |
| Devlet | 1. | 1. sıra |
| Eryaman | 1. | 1. sıra (ama ANASAYFA çıkıyor, mahalle sayfası değil) |
| Şeyh Şamil | ilk sayfada yok | 2. sıra |
| Altay | 3. | 2. sıra |
| Yavuz Selim | 1. | 2. sıra |
| Güzelkent | 9. | 9. (ve orada YEŞİMKENT SİTE SAYFASI çıkıyor) |
| Yeşilova | ilk sayfada yok | 10. |
| Şeker | 1. | çıkmıyor |
| Tunahan | 4. | çıkmıyor |
| Cumhuriyet · Göksu · ŞOA · Susuz | ilk sayfada yok | çıkmıyor |

**MAHALLE SAYFASI TEŞHİSİ:** içerik hacmi tek başına açıklamıyor — Tunahan 1.069
karakterle çıkmıyor, Devlet 1.077 karakterle 1. sırada. Ata (1. sıra) en uzun metne
sahip (1.545 krk, 5 paragraf). Hipotez: mahalle adının Türkiye genelinde yaygınlığı
(Göksu, Cumhuriyet, Şeker, Susuz her ilde var) + metinde il/ilçe belirsizliği.
8 zayıf mahalle için teşhis + zenginleştirme workflow'u başlatıldı.

**TKGM:** 720 kaydın tamamı denetlendi. Adası olmayan tek kayıt Kurtuluş Sitesi;
koordinatı TKGM'ye göre "Tarla" nitelikli boş parsele düşüyordu, silindi ve sayfaya
"tapu kaydı henüz eşleştirilemedi" notu kondu. 18480-18493 aralığının tamamı başka
sitelere ait; boşta kalan 18497/1 ("Kargir Apartman", 4.761 m²) hiçbir kayda bağlı
değil — Özgün'e soruldu.

**GSC:** günlük indeksleme kotası dolu ("yarın tekrar deneyin"). Panelde tıklama
1.132 → 1.243. Kuyrukta 12 sayfa.
