# Sosyal Medya Büyüme Planı — TikTok / Instagram / Facebook
*Araştırma tarihi: 2026-08-21. 8 paralel web araştırması (Matterport, TikTok, Instagram, Facebook, mevzuat, dünya/TR emsalleri, mevcut profillerin dış görünümü, tamlık denetimi); önemli iddialara kaynak iliştirildi. Proje kuralları gözetildi: sosyal medyada İLAN pazarlaması yok, "bu bir ilan değil" çerçeveli tanıtım/uzmanlık içeriği serbest.*

**Sorulan soru:** Matterport turunu telefonda ekran kaydıyla gezdirip paylaşmak + evin olduğu site/mahalleyi çekmek iyi bir büyüme yolu mu?

**Kısa cevap:** İçgüdü doğru, format eksik. 3D tur + mahalle çekimi tam da elimizdeki benzersiz varlıklara (723 site kaydı, 14 mahalle sayfası) oturan doğru hammadde. Ama **parmakla gezdirilen çıplak ekran kaydı tek başına büyüme formatı değil** — kanca yok, yüz/ses yok, kalite düşük, ilk 3 saniyede kaydırılıyor. Büyüyen emlak hesaplarının tamamı "mahallenin tur rehberi" konumlanması + tekrarlayan seri + yüz/sesle büyüdü; Matterport bu kurgunun içindeki "wow" malzemesi olmalı, kurgunun kendisi değil. Ayrıca Şubat 2026 sonrası EİDS denetimleri sosyal medyayı da kapsıyor — eski caption kalıbımız (#satılıkdaire...) risk taşıyor, aşağıda karar kuralı var.

---

## 0. ACİL — bu hafta çözülecek hesap hijyeni sorunları

Araştırma sırasında profillerin dışarıdan görünümü tarandı (Google indeksi üzerinden; platformlara doğrudan erişim proxy engeline takıldı). Dört somut sorun çıktı:

1. **Instagram handle çelişkisi.** Sitenin linklediği `@eryamansiringayrimenkul` Google'da SIFIR görünürlük; indekste ise "Eryaman Şirin Gayrimenkul (`@sirin.gayrimenkul`)" adlı hesap var.
   **[GÜNCELLEME 2026-08-22]** Özgün teyidi: bizim hesap `@eryamansiringayrimenkul` — site linki DOĞRU, değişmeyecek. Kalan iki iş: (a) hesabın indekslenme ayarları + dış link sinyali, (b) `@sirin.gayrimenkul` kimlik tespiti (eski hesabımız mı, taklit mi, başka firma mı). Adım adım talimat ve hazır metinler: **sosyal-hesap-hijyeni.md §A-B**.
2. **Facebook: verilen sayfa ID'si hiç indeksli değil.** `profile.php?id=61585267540417` Google'da yok; indekste `facebook.com/siringayrimenkull/` ("Şirin Gayrimenkul | Ankara", ~9 beğeni) var.
   **[GÜNCELLEME 2026-08-22]** "Kayıp sayfa" hipotezi düzeltildi: bunlar muhtemelen AYNI sayfa — kullanıcı adı alınmış sayfada Google ID'li adresi değil kanonik vanity adresi indeksler (61… ID'ler yeni nesil sayfa). 1 dakikalık doğrulama + iki senaryonun yapılacakları: **sosyal-hesap-hijyeni.md §C**.
   **[ÇÖZÜLDÜ 2026-08-22, aynı gün]** Özgün panelden sayfa adını "Eryaman Emlakçı Şirin Gayrimenkul" yaptı, kullanıcı adı **eryamanemlakci** alındı (ekran görüntüsüyle teyit); `lib/site-config.ts` yeni adrese çevrildi. Kalan üç küçük kontrol sosyal-hesap-hijyeni.md §C'deki DURUM notunda (siringayrimenkull'un akıbeti, eski ID yönlendirmesi, kategori "Emlak Acentesi").
3. **Matterport linki yanlış biçimde.** `my.matterport.com/models/uMJJ4w2xjQE` hesap kitaplığı adresi — tıklayan takipçi **login duvarı** görür. Kamuya paylaşım biçimi: `https://my.matterport.com/show/?m=uMJJ4w2xjQE` (turun gizliliği Public/Unlisted olmalı). Sitedeki örnek tur zaten doğru biçimde (`app/hakkimizda/page.tsx`). Bio ve caption'lardaki tüm tur linklerini `/show/?m=` biçimine geçir.
4. **Eski TikTok caption kalıbı EİDS riski taşıyor.** Nisan 2025 videosunun indeksli caption'ı "satılık ve kiralık daireleri... karar verebilirsiniz" diyor ve #satılıkdaire #eryamansatılık taşıyor — hem proje kuralıyla ("ilan yok") hem Şubat 2026 sonrası denetim rejimiyle uyumsuz. Eski videoların caption/hashtag'lerini temizle, şablonu §6'daki karar kuralına bağla.

Ek: TikTok profili "eryaman şirin gayrimenkul" aramasında 1. sırada — en görünür sosyal varlığımız. 80 karakterlik bio'da site linkinin durduğundan ve profil fotoğrafının diğer platformlarla aynı logo olduğundan emin ol.

---

## 1. Matterport ekran kaydı — değerlendirme ve yükseltme reçetesi

**Doğru olan:** Matterport'un kendi resmi önerisi de ekran kaydı — tek tıkla "tur → MP4" düğmesi 2026'da da yok ([support.matterport.com](https://support.matterport.com/s/article/How-do-I-create-a-video-of-my-Matterport-Space?language=en_US)). Telefonda dikey kayıt natif 9:16 veriyor (Reels/TikTok için kırpma gerekmez). 3D akışın dollhouse→oda geçişleri sosyal medyada gerçekten "thumb-stopping".

**Eksik olan ve reçete:**

1. **Parmakla gezdirmeyi bırak → Highlight Reel + otomatik Guided Tour kaydet.** Workshop'ta 6-8 duraklı rota kur (giriş → salon → mutfak → balkon/manzara → banyo); Play ile otomatik oynatımı kaydet. Kamera geçişlerini yazılım yumuşatır — parmak sarsıntısı, ani dönüşler, dokunma UI'ları tamamen kalkar. Hız fazla gelirse kurguda odalarda yavaşlat.
2. **Kayıt linkine URL parametreleri ekle** — UI tamamen temizlenir:
   `https://my.matterport.com/show/?m=MODELID&brand=0&hr=0&title=0&play=1&ts=1`
   (`brand=0` iletişim kutusunu, `hr=0` alt şeridi, `title=0` başlığı gizler; `play=1&ts=1` turu otomatik başlatır. Dollhouse fly-in açılışını istiyorsan `qs` EKLEME — o "içine girme" anı en paylaşılabilir kanca.)
3. **Telefonda kayıt disiplini:** Rahatsız Etmeyin açık, turu kayıttan önce bir kez baştan sona gezdirip önbelleğe aldır (doku geç yükleme takılmasını önler), Android'de kayıt ayarından 1080p + en yüksek bitrate.
4. **Hazır bedava malzeme: Teaser MP4'ler.** Matterport her tur için 3 adet 10-15 sn'lik teaser video ve 4K snapshot üretiyor — tur sahibinin hesabından indirilir (turlar çekim servisinin hesabındaysa onlardan iste). Sıfır emekle Reels/TikTok hammaddesi.
5. **Haftalık "kalite atışı" için bilgisayar:** Chrome donanım hızlandırma açık (chrome://gpu), DevTools cihaz modunda 1080x1920, OBS + donanım encoder, 60fps — telefon kaydından belirgin akıcı ve UI'sız.

**Ama asıl mesele format:** çıplak ekran kaydı değil, **hibrit kurgu varsayılan şablon** (§3). Salt ekran kaydı/teaser yalnız A/B testinin kontrol kolu olarak kullanılır; 2-3 haftalık testte kazanan format yazılı standarda bağlanır.

---

## 2. Strateji: "Eryaman'ın tur rehberi" konumlanması

Dünyada kanıtlanmış model ilan pazarlaması değil, hiper-yerel rehberlik:

- **Levi Lascsak** ("Living in Dallas", YouTube): sıfır satıştan ilk tam yılında 64 işlem/33,5M$ — sıfır reklam, sıfır soğuk arama; sonuçlar 4-6 ay gecikmeli geldi.
- **Karin Carr** (Savannah): haftada 1 video, iPad'le; TEK mahalle-rehberi videosu 100K$+ komisyon getirdi. Belirleyici olan prodüksiyon değil, arama niyetine cevap veren konu seçimi.
- **Glennda Baker** (Atlanta): ev turu değil, kameraya anlatılan gerçek alım-satım anekdotları; 1 yılda 122→565K takipçi; ayda tek 11 saatlik toplu çekim.

Türkiye'de patlayan formatlar lüks tur ve mizahlı tur; **"bu semtte yaşamak / semt analizi" şeridi Türkçe'de büyük ölçüde boş** — Eryaman ölçeğinde ilk hareket avantajı bizde. Üstelik 723 sitenin tapu/blok kaydı + 14 mahalle sayfası, hiçbir rakibin kopyalayamayacağı bir seri hammaddesi: web'deki "konut hafızası" konumlanmasının video karşılığı.

**İçerik karması kuralı (2025-2026 emlak rehberlerinin ortak formülü):** "satılık/satıldı" tipi içerik toplamın %10-15'i geçmez (bizde proje gereği zaten ~%0); kalanı eğitim + hiper-yerel (mahalle/site) + insan/ofis hikayesi + sosyal kanıt. Bu karma DM'ye gönderilme ("Eryaman'a taşınacak arkadaşına gönder") üretir — sends/reach 2026'da Reels'in en ağır sinyali.

---

## 3. Her videonun format şablonu (üç platformda ortak)

- **0-3 sn kanca:** logo/"hoş geldiniz" YOK (sıfır bilgi taşıyan açılışlar en kötü performans). Gerçek çekim en çarpıcı kare VEYA dollhouse fly-in + ekran ortasında 6-8 kelimelik kalın metin sorusu ("Bu 3+1'in planındaki hatayı bulabilir misin?"). Emlak reels'lerinde metin kancası +%38 izlenme.
- **Yüz + ses:** her videoda ilk 2-3 sn ve kapanışta yüz-kameraya (veya köşede küçük pencere); gövde Matterport/mahalle görüntüsü olabilir. Araştırma "başta ölçülü yüz varlığı optimal" diyor; müşteri getiren emlak hesaplarının tamamı yüz+ses merkezli — emlakta dönüşüm güven işi.
- **Süre:** standart tur 21-34 sn (bu bantta %62 tamamlanma; 60 sn+ %48'e düşüyor). Eğitim 20-30 sn, mahalle turu 60-120 sn. Tamamlanma oranı tek KPI: %60 altı format kısalır/kanca değişir, %70+ format seri üretilir.
- **Müzik kuralı (yazılı standart):** işletme hesabı trend ses KULLANAMAZ — TikTok Temmuz 2025 kuralıyla işletmeler Commercial Music Library'ye kilitli, ihlalde video susturuluyor; Meta tarafında Sound Collection sınırı var. Ana ses her zaman kendi anlatımımız; fon gerekiyorsa yalnız CML/Sound Collection.
- **TikTok/IG SEO:** ana anahtar kelime ("eryaman ev turu", "eryaman [mahalle]") caption'ın İLK cümlesinde + ilk 3 sn'de SESLİ + ekran yazısında. "Ev turu" Türkiye TikTok'unda dev organik arama kategorisi; "eryaman ev turu" düşük rekabetli yerel niş. Hashtag 3-5 taneyle sınırlı (Instagram Aralık 2025'ten beri 5 üstünü zaten engelliyor).
- **Konum etiketi her gönderide, en spesifik haliyle** (şehir değil: mahalle/etap/park). TikTok "Nearby Feed"i Aralık 2025'te 4 AB ülkesinde açtı — Türkiye'ye geldiğinde konum sinyali hazır olsun.
- **Altyazı açık, video başına tek fikir, dikey 9:16.**
- **CTA ekseni bölge-uzmanlık:** "Ev arayan arkadaşına gönder", "Eryaman hakkında sorunu yorumlara yaz". **"Fiyat için DM" ASLA** (§6).

---

## 4. Seriler (en az 6 bölüm taahhüt — alışkanlık 6 bölümden önce oluşmuyor)

| Seri | Format | Kaynak varlık |
|---|---|---|
| **Eryaman'da Yaşamak — Böl. N** | Haftalık mahalle/etap turu 60-120 sn: pazar, park, okul, ulaşım (Başkentray/EGO), site dokusu, "kimin için uygun" — fiyat/ilan yok | 14 mahalle sayfası + blog "yaşam" yazıları |
| **Haftanın Sitesi #N** | Site dış/ortak alan + "bu site kimin için" yorumu; tapu/blok bilgisi hafızasından 1 ilginç detay | 723 site kaydı — kopyalanamaz |
| **Eğitim (20-30 sn, tek konu)** | "Tapu masrafını kim öder?", "Kira kontratında bu madde", "Ekspertiz nedir", "e-Devlet'ten emlakçıya ilan yetkisi nasıl verilir" (2026 gündemi — bizi 'kurallara hakim uzman' yapar) | Blog süreç yazıları |
| **Tahmin oyunu** | "Eryaman'da bu tip 3+1 sizce ne kadar?" — bölge ortalaması/temsili daire üzerinden, "bu bir ilan değil, bölge fiyat okuryazarlığı" çerçevesi; fiyat sonda. Emlakta en yüksek yorum getiren format; gelen her tahmine tek tek cevap ver | Gerçekleşen satış hafızası (rakamları bölge ortalaması olarak ver) |
| **Anekdot (Baker formatı)** | Ayda 1 toplu çekim günü: kameraya anlatılan gerçek Eryaman alım-satım dersleri, isimsiz, 45-60 sn | 30 yıllık ofis hafızası |
| **Kamera arkası** | "Bir evi 3D'ye nasıl taşıyoruz" — Matterport çekim süreci; teknoloji konumlanması, ilan değil | Mevcut çekim rutini |

Seri kimliği üç platformda aynı: sabit ad + numara + kapak şablonu; Instagram'da Highlight, TikTok'ta playlist, YouTube'da oynatma listesi.

---

## 5. Platform ayarları

### TikTok (mevcut en güçlü kanal — marka aramasında 1. sıra)
- Algoritmanın 1 numaralı sinyali izlenme süresi/tamamlanma; paylaşım (özellikle DM'ye gönderme) beğeniden ~3 kat ağır. Viral eşik 2026'da %70+ tamamlanmaya çıktı — 20-30 sn'lik tam izlenen video, 60 sn'lik vasat turu döver.
- Konu tutarlılığı (emlak + Eryaman dar nişi) hesaba "bu konuda uzman" etiketi kazandırıyor; araya alakasız viral denemeler serpiştirme.
- Saat: Salı 09:00, Perşembe 12:00, Pazar 16:00 + akşam 19:00-21:00'i 2-3 hafta test et, sonra kendi Takipçi Etkinliği verine sabitle (genel tablolar zayıf kanıt).
- Uygulama içinden emsal taraması: "emlak", "evturu", "ankaraemlak" etiketlerinde son 3 ayın en çok izlenenleri — web'den doğrulanamadı, içeriden bakılmalı.

### Instagram
- **Ad alanını (name field) "Şirin Gayrimenkul | Eryaman Emlak" yap** — aramada en ağır alan; Temmuz 2025'ten beri profesyonel hesap içerikleri Google'da da indeksleniyor ("eryaman emlakçı" profil görünürlüğü hedefine doğrudan hizmet).
- **Trial Reels'i devreye al:** video önce yalnız takipçi-olmayanlara gider, 72 saatte iyi giderse auto-share; kullanan üreticilerin %80'i takipçi dışı erişimini artırdı. Yeni kanca/format denemeleri için birebir. Aynı videoyu ikinci kez yükleme (tekrar tespiti var).
- Reels keşif, carousel dönüşüm: haftada 1 eğitici carousel ("Eryaman'da ev bakarken sorulacak 7 soru") — 2 kat kaydetme, takipçi dönüşümü.
- Stories günde 2-3: anket/slider/soru sticker'ları kişi bazında görülür → doğal DM açılış listesi. Highlights vitrini: Mahalleler, 3D Turlar, SSS, Biz Kimiz.
- Ayda 1-2 yerel collab (kafe, anaokulu, spor salonu, yerel mikro-influencer): ortak gönderi iki profilde birden çıkar, etkileşim havuzlanır — küçük hesaba en hızlı yerel kitle transferi. TR'de markaların %76'sı nano-influencer'la (1-10K) çalışıyor; hedefimiz zaten milyonluk viral değil, Eryaman'da yoğun tanınırlık.
- Comment-to-DM otomasyonu (ManyChat tarzı, resmi API'li) kur ama **yalnız eğitim/rehber içeriklerinde** — §6'daki karar kuralı.

### Facebook
- **Türkiye'de Facebook 25-44 ağırlıklı, %53 yetişkin erişimi — üç platform içinde "alıcı/ev sahibi yaşındaki" kitleye en yakın olanı.** Ama sayfa organik erişimi ~%2: sayfadan patlama bekleme.
- Kurgu: **sayfa = vitrin** (WhatsApp butonu — Ayarlar > WhatsApp'tan bugün ekle, Ara butonu, adres, saatler, değerlendirmeler, haftada 2-3 Reels) + **asıl büyüme kişisel profilde** (profesyonel mod açık) gruplar ve Reels üzerinden. Çoğu semt grubu sayfa hesabıyla paylaşımı zaten engelliyor.
- **Gruplar:** kişisel profille 5-10 Eryaman/Etimesgut grubuna gir (site sakin grupları, okul/anne-baba, alışveriş-dayanışma; ilan gruplarını yalnız nabız için izle). Haftalık rutin: 3-4 soruya yorumla cevap (tapu, kira, hangi etap), ayda 1-2 değer gönderisi, sıfır ilan. Rampa 60-120 gün — ilk telefonlar 2. aydan itibaren. "İlan paylaşmama" kuralımız burada avantaj: grupların "reklam yasak" kuralına zaten takılmıyoruz.
- Orta vadede kendi grubunu kur ("Eryaman'da Yaşam / Soru-Cevap"): %85-90 emlak-dışı yerel değer. Grup erişimi sayfa erişiminin aksine düşmüyor — algoritma daralmasından en az etkilenen, tamamen bizim kontrolümüzdeki kanal.
- **TikTok filigranlı video yükleme** — Meta Temmuz 2025'ten beri orijinal-olmayan içeriğe resmi erişim cezası uyguluyor. Daima kaynak dosyadan (CapCut/galeri) yükle; üzerine sesli anlatım/altyazı eklemek orijinallik sinyalini de çözüyor.
- "Eryaman Etimesgut" gibi DM ile içerik kabul eden yerel haber hesaplarına mahalle çekimlerini düzenli servis et (etiket/anılma karşılığı) — hazır yerel kitleye en ucuz erişim.

### Bedava 4. ve 5. kanal (araştırmanın tamlık denetiminden)
- **YouTube Shorts:** zaten üretilen her dikey video kaynak dosyadan Shorts'a da gider (3 dk'ya kadar; Google aramasına çıkıyor). TikTok/Reels'in 48-72 saatlik ömrünün aksine aylarca arama trafiği üretir — "Eryaman'da Yaşamak" için en kalıcı raf. Ayda 1 de uzun video (8-12 dk, "Eryaman'a taşınmayı düşünenlere") — Lascsak/Carr modelinin arama-dönüşüm katmanı.
- **Google Business Profile:** "eryaman emlakçı" sorgusunda ilk ekranı sosyal profiller değil harita paketi kaplar — GBP zaten kanal önceliğimiz; sosyal üretimden beslemesi bedava: her turdan 30 sn'lik dikey kesit GBP'ye de yüklenir (maks 30 sn/75 MB/min 720p), haftada 1-2 fotoğraf + 1 gönderi profili "aktif" işaretler. Yorum rutini zaten kurulu (yorum-toplama.md).

---

## 6. Mevzuat şeridi — EİDS + KVKK (İHLAL = HESAP ENGELİ RİSKİ)

Şubat 2026'dan beri satılık konut ilanı EİDS yetki doğrulamasına tabi ve Ticaret Bakanlığı bunu **Instagram/Facebook/WhatsApp dahil "elektronik ortamda verilen tüm ilanlara"** uyguluyor (Yönetmelik m.12). 2026 ilk yarısı: 232 işletmeye 28,3 milyon TL ceza, Meta'ya 5 milyon TL, **1.426 hesaba erişim engeli** — hesap engeli, büyüttüğümüz kitlenin bir gecede kaybı demek. İhlal başına ceza 286.206 TL'ye kadar (genel aralık 17.988–902.256 TL).

**Bir paylaşımı "ilan" yapan unsurlar (hukukçu yorumları):** fiyat, açık adres/konum detayı, m², oda sayısı, "satılık/kiralık" ibaresi, "DM'den ulaşın" çağrısı. "Bu bir ilan değil" YAZMAK tek başına korumaz — içerikte bu unsurların olmaması korur. Mevcut çerçevemiz büyük ölçüde uyumlu; kritik olan disiplin.

**İki şerit karar kuralı (her paylaşım yayın öncesi bundan geçer):**

- **Marka/uzmanlık şeridi (varsayılan):** fiyat yok, adres yok, m²/oda yok, satılık/kiralık ibaresi yok, DM çağrısı yok. Mahalle/site serileri, eğitim, anekdot, kamera arkası — mevzuatın hiç dokunmadığı büyüme şeridi. Portföydeki bir dairenin marka-içerik turunda evi teşhis ettirecek detay (kapı no, site tabelası yakın çekimi) kadrajdan çıkar; site/etap adını portföyle bağlantısız serilere sakla.
- **İlan şeridi (bilinçli istisna, kullanılacaksa):** caption + story sticker'ına sahibinden'deki **EİDS doğrulamalı ilan linki** eklenir; görsel/açıklama ilanla birebir örtüşür. Bu, paylaşımı resmen "ilan paylaşımı" yapar — proje kuralı gereği varsayılanımız değil; kullanıp kullanmamak Özgün'ün içerik başına kararı.
- **Comment-to-DM otomasyonu yalnız eğitim/rehber içeriklerinde** ("REHBER yaz, Eryaman taşınma rehberini göndereyim") — belirli bir portföy dairesinin turu altında asla (DM çağrısı paylaşımı ilana dönüştüren en net tetikleyicilerden).
- **Portföy satılınca/sözleşme bitince** o eve ait tur ve tanıtımlar 1 iş günü içinde arşivlenir (yönetmelikteki durdurma yükümlülüğü elektronik ortamı kapsıyor). Aylık "içerik-portföy eşleştirme" kontrolü.
- **KVKK rutini:** yetkilendirme sözleşmesine görüntü çekimi + sosyal medya paylaşımını açıkça kapsayan rıza maddesi; çekim öncesi kişisel eşya kontrolü (aile fotoğrafı, isimlik, fatura, reçete); yayın öncesi 30 sn'lik yüz/plaka/çocuk kontrolü (site ortak alanı ve mahalle çekimlerinde komşular ve özellikle çocuklar tanınabilir yayınlanmaz).
- Ağustos 2026 itibarıyla Bakanlık sosyal medya görsel kullanım ölçütlerini güncellemeye hazırlanıyor (ilan detayı + doğrulanmış link modeli) — ticaret.gov.tr ve ATEM duyuruları aylık takip, netleşince şablon revizesi.

---

## 7. Sürdürülebilir tempo — "haftada 3-4 üretim, 5 kanala dağıtım"

Platform önerilerini TOPLAMA (toplamı haftada 10-15 parça = yarı zamanlı iş = kopma noktası). Tek hedef:

**Haftada TEK 2-3 saatlik çekim bloğu → 3-4 video → her biri kaynak dosyadan TikTok + IG Reels + FB Reels + YouTube Shorts'a + 30 sn kesiti GBP'ye.**

Örnek hafta: 1 ev turu (hibrit kurgu) + 1 mahalle/site bölümü + 1 eğitim + (2 haftada bir) tahmin oyunu veya anekdot. Her site ziyaretinden 3-4 içerik çıkar: daire turu + site dış turu + "bu site kimin için" yorumu + tahmin kesiti. Günlük ek iş yalnız 2-3 Story + yorum cevapları.

Üç ay aksamadan sürmeden tempoyu ARTIRMA. Büyüme 4-6 ay gecikmeli gelir (Lascsak/Carr verisi); seriler 6. bölümden önce değerlendirilmez.

**Tek seferlik ekipman (~birkaç bin TL):** kablosuz yaka mikrofonu (DJI Mic/Rode sınıfı — sesli anlatım stratejisinin ön koşulu), ucuz gimbal veya stabilizasyon açık + yavaş yürüyüş, 0.5x geniş açı ile oda bağlamı.

---

## 8. Ölçüm — aylık sosyal karne (sira-karnesi.md disiplininin sosyal kopyası)

- Bio ve açıklamalardaki tüm site/tur linklerine **UTM** ekle (`utm_source=tiktok/instagram/facebook/youtube`) — yoksa "hangi kanal telefon getirdi" hiç bilinemez.
- Her ayın 1'inde tek tabloya: 4 platform takipçi/erişim + tamamlanma oranı + sends + GBP arama görüntülenme/yol tarifi/arama sayısı + WhatsApp konuşma sayısı. (Takipçi sayıları dışarıdan hiçbir kanaldan okunamadı — içeriden elle kaydedilmeli.)
- KPI öncelik sırası: tamamlanma oranı → sends/DM'ye gönderme → profil ziyareti → WhatsApp/telefon. İzlenme sayısı tek başına metrik değil.
- Yayın saatlerini 2 haftalık kendi Insights A/B'siyle sabitle; genel saat tablolarını çöpe at.

---

## Uygulama sırası (ilk 2 hafta)

1. **Gün 1:** §0 hesap hijyeni — Instagram handle doğrulama, Facebook vanity URL, Matterport linklerini `/show/?m=` yap, FB sayfasına WhatsApp butonu.
2. **Gün 2:** Eski TikTok caption/hashtag temizliği; IG ad alanı "Şirin Gayrimenkul | Eryaman Emlak"; bio'lara yetki belgesi no kontrolü.
3. **Gün 3:** Yaka mikrofonu siparişi; Matterport hesabından teaser MP4 + 4K snapshot arşivini indir; kayıt link şablonunu kur.
4. **Gün 4-5:** İlk hibrit kurgu video (§3 şablonu) + "Eryaman'da Yaşamak Böl. 1" çekimi; YouTube kanalı aç.
5. **Hafta 2:** Haftalık ritme geç (§7); kişisel profille Eryaman gruplarına katıl; Trial Reels ile 2-3 kanca testi; UTM'leri kur.
