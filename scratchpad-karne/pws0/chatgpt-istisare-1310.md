# ChatGPT istişaresi — 13.10.2026 (4. tur, "SEO önerilerini önceliklendirme" sohbeti, model GPT-5.6 / akıl yürütme Yüksek)

Özgün'ün isteğiyle (13.10: "ChatGPT premium aldım, onunla sohbet edebilirsin") Claude brifing gönderdi; ChatGPT 2 dk 27 sn düşündü.
Brifing: 07.10 sonrası yapılanlar (Başlık deneyi 2 + tarama sorunu, Google'ın gösterdiği başlık ölçümü, eski adres kaldıracının
ölmesi, karne düzeltmeleri, yansız örnek, hatırlanırlık tabanı, GBP UTM/kategori durumu, yorum politikası çelişkisi, yalın
"emlakçı" kaybı, 08.10 araştırmasının elenenleri) + 5 soru (A–E). Uygulama kararı Özgün'ün (15.08 kuralı).

## ChatGPT'nin yanıtı (özet; tam metin sohbette)

**Genel görüş:** web SEO'da azalan marjinal getiri bölgesi; "bölgenin en iyi emlakçısı" algısını büyütecek şey GBP dönüşümü,
yorum sürekliliği ve gerçek faaliyet kanıtı. Yeni sayfa/şema/başlık kovalama ikinci plan.

**A) Başlık ayrışması:** tarama isteği dışında gizli kaldıraç yok (Google: doğru lastmod, taranabilir iç bağ, URL Denetimi
recrawl; Indexing API yalnız JobPosting/canlı yayın). Eşli 11'lik yaklaşımı bozma; tedavi koluna özel iç bağ/lastmod verme
(deney kirlenir). Okuma: birincil = atama bazlı ITT, t0 = her URL'nin 07.10 sonrası ilk doğrulanmış taraması; "Google yeni
başlığı gösterdi mi"yi dahil olma koşulu YAPMA (tedavinin parçası). İkincil = rendered_title_state (test / Google-rewrite /
eski görünümlü). 04.11 ara, 17.11 asıl; 17.11'de taranmamış URL çoksa takvimi uzat, testi değiştirme.

**B) Web dışı 3 iş:**
1. [Özgün] Nötr yorum isteme SOP'si: her gerçek müşteriden aynı cümleyle, işlemden sonra; site/mahalle/ad yazdırma yok,
   olumlu yorum isteme yok, seçicilik yok, teşvik yok. Ölçüm: istek sayısı → 14 gün içinde yeni yorum, dönüşüm oranı,
   aylık tempo (payda böyle çözülür).
2. [Özgün] GBP'yi edinim panosuna çevir: web sitesi adresine UTM (ChatGPT önerisi utm_source=google&utm_medium=organic&
   utm_campaign=gbp&utm_content=website) + her ay Performans'tan arama terimleri, çağrı, web tıkı, yol tarifi arşivi.
   Ölçüm: call+message+website click ay/ay.
3. [Özgün] Instagram = ilan panosu değil faaliyet kanıtı: haftada 2 gerçek çalışma kanıtı (işlem tamamlandı, çekim/değerleme
   süreci, saha bilgisi, evrak süreci); fiyat yok, "1 numara" iddiası yok; gerçek işlem yoksa paylaşma.
   Ölçüm: Instagram kaynaklı DM/WhatsApp, profil ziyareti, takipçi dışı erişim, 28g marka araması trendi.

**C) Kategori:** "Emlak Bürosu" vs "Gayrimenkul Danışmanı" için kanıt YOK; Google yalnız "birincil kategori yerel sıralamayı
etkiler, en spesifik kategoriyi seç" diyor. Yapılandırılmış yerel sonuçta bugün "Şirin Gayrimenkul – Eryaman Gayrimenkul
Danışmanı" görünüyor; rakiplerde iki kategori de var. KARAR: kutu #1 iken birincil kategoriyle OYNAMA; mevcut neyse dondur;
kategori değişikliği yeniden doğrulama isteyebilir.

**D) Yalın "emlakçı":** iki sıra ölçümü uyarıdır, trafik kaybı kanıtı değil (GSC düşük hacimli sorguyu gizleyebilir; GSC'de
görülen sorguyu tekrar aramak aynı sonucu vermez). Ayrı "sentetik görünürlük endeksi": aynı 10 Eryaman koordinatı × aynı
mobil cihaz × aynı dil × yalnız organik × haftalık; ölçüt ilk-10 nokta payı ve medyan organik konum. Tek nokta 3→11 önemsiz;
10 noktanın 8'inden 2'sine düşmek gerçek. Sentetik düşüp GSC gösterimi + temas sabitse ticari kayıp sayma.

**E) 30 günlük TEK yeni deney:** GBP'ye yerel WhatsApp sohbeti (Profili düzenle → İletişim → Sohbet → WhatsApp), benzersiz
hazır mesajla ("Merhaba, Google İşletme Profilinizden yazıyorum. Eryaman'da bir dairem var…"). Gerekçe: ana edinim yüzeyi GBP,
WhatsApp zaten çalışıyor; Map Pack → web → WhatsApp sürtünmesini kaldırır. Ölçüm: o hazır mesajla başlayan yeni WhatsApp
konuşması sayısı; ikincil GBP "Messages"; kontrol: toplam calls+messages+website clicks ARTMALI (telefonu WhatsApp'a
kaydırmak başarı değil). Web tarafını 17.11'e kadar büyük ölçüde dondur.

## Claude'un değerlendirmesi (ölçümlerimizle karşılaştırma)

- A: bizim okuma kuralıyla uyumlu (fark-ın-farkı, yayın-sonrası ilk tarama). İki ek alındı: "Google'ın yeni başlığı
  göstermesi" dahil olma koşulu DEĞİL; `bas_tam`'dan rendered_title_state ikincil ölçüt olarak türetilecek
  (baslik-deneyi-0710.json okuma_kurali). Takvim uzatma kuralı eklendi: 17.11'de taranmamış URL payı yüksekse okuma ertelenir.
- B1: 08.10 politika bulgumuzla birebir aynı; Özgün'ün kararını bekliyor (project_gbp_yorum_mahalle_kampanyasi).
  "İstek → 14 günde yorum" oranı yeni ve ölçülebilir; yorum-toplama.md'ye istek sayısı kaydı önerilecek.
- B2: UTM parametresi BİZİM şemada kalmalı (`utm_source=google&utm_medium=gbp`): 27.07–11.08 tabanı, GA4 medium=gbp süzgeci
  ve hatirlanirlik-uret.py o değerle çalışıyor; ChatGPT'nin medium=organic önerisi GA4'te organik aramayla karışır. Reddedildi.
- B3: Instagram planımız (07.10 §3.8) ile uyumlu; "gerçek işlem yoksa paylaşma" kuralı iyi. Özgün'ün içgörü verisi bekleniyor.
- C: Planımız "bilinçli değilse Emlak Bürosu'na dönsün" diyordu; ChatGPT "dokunma" diyor. İkisi de kanıtsız. Daha güvenli olan
  dokunmamak: kutu #1 korunuyor, yeniden doğrulama riski var. Plan maddesi buna göre YUMUŞATILDI: yalnız ekran görüntüsü +
  değişiklik bildirimi kontrolü; kategori değişikliği önerilmez.
- D: 20.10 çekirdek turu (3 nokta) + halka turu (8 nokta) buna yakın; ChatGPT 10 nokta × haftalık diyor. Haftalık 10 sorgu
  bütçeye sığar; "kalıcı kayıp" iki koşullu kuralımız (uule + GSC) ChatGPT'nin "sentetik + gerçek veri" ilkesiyle aynı.
  Uygulama: bolge-tur.mjs'e BOLGE_ON_AYAR=emlakci_haftalik (yalın "emlakçı" × 28.08 tabanının 8 noktası, haftalık) eklendi; 10 yerine 8 nokta, çünkü taban 8 noktayla ölçüldü.
- E: Yeni, ölçülebilir, kurallarla çelişmiyor; GBP paneli değişikliği → Özgün'ün açık onayı şart. Özellik Türkiye'de/bu
  kategoride görünmeyebilir; panelde "Sohbet" seçeneği var mı diye bakılacak. Kaldıraç defterine "acik, karar Özgün'de" yazıldı.

## 2. tur (14.10 00:34, Özgün "konuş" dedi) — karar ayrıntıları

**1) GBP WhatsApp sohbeti:** (a) Türkiye/kategori uygunluğu: ChatGPT "bilmiyorum" dedi; Google özelliği "belirli bölgelerde,
bazı profillerde" diyor; panel yolu Profili düzenle → İletişim → Sohbet → WhatsApp; "Sohbet" alanı yoksa zorla açmanın yolu yok.
(b) Kullanıcı tarafı: Search/Maps sonuçlarında click-to-chat düğmesi gösterilebiliyor; yerleşim profil/bölge bazlı, dört yüzeyde
(mobil Search, mobil Maps, masaüstü Search/Maps) oturum kapalı kontrol edilmeli. (c) 24 saat şartı: yeni WhatsApp entegrasyonu
için böyle bir kural bulunamadı; o kural 31.07.2024'te kapatılan Google mesajlaşma ürünüydü. Tek kişilik ofis için profil kapanma
riski gösteren güncel kural yok. (d) Benzersiz hazır mesaj: "Merhaba, Google İşletme Profilinizden yazıyorum. Eryaman'da bir
dairem var; satış veya kiralama için görüşmek istiyorum." — sitedekilerden farklı olsun; sayım WhatsApp'ta elle; GBP "Mesajlar"
raporunun WhatsApp'ı ayırdığı belgeli değil. (e) Telefonu yer mi: güvenilir veri yok, varsayım yapma. 30 günlük okuma: önceki
30 / sonraki 30 gün; ana KPI (GBP arama tıkı + benzersiz WhatsApp konuşması) / 1.000 profil görüntülemesi; kanal kayması başarı
sayılmaz, toplam doğrudan temas oranı artmalı.

**2) Nötr yorum isteme metni (Özgün onaylarsa yorum-toplama.md'ye girer):**
> Bugünkü işlem sürecinde bizimle çalıştığınız için teşekkür ederiz.
> Deneyiminizi Google'da paylaşmak isterseniz aşağıdaki bağlantıyı kullanabilirsiniz:
> https://www.siringayrimenkul.com/yorum
> Şirin Gayrimenkul
Hatırlatma: 5–7 gün sonra yalnız bir kez, aynı tonda. Kayıt: işlem_tarihi | satış/kiralama | yorum_istendi_tarihi |
hatırlatma_tarihi | yorum_geldi E/H | yorum_tarihi. Ölçüt: yorum geldi / yorum istendi. Personele yorum kotası KONMAZ
(Google manipülasyon sayıyor).

**3) Instagram faaliyet kanıtı (şablon 1, satış):** Görsel: sitenin dış cephesi/ortak alanından gerçek saha fotoğrafı, kişisel
veri yok; üzerinde küçük "Satış süreci tamamlandı". Metin: "Eryaman'da bir konut için yürüttüğümüz satış süreci tamamlandı.
Portföyün hazırlanmasından görüşmelerin yürütülmesine, evrak kontrolünden tapu sürecine kadar işlemi başından sonuna takip ettik.
Eryaman'da evini satmayı düşünen mülk sahipleri satış süreciyle ilgili bizimle iletişime geçebilir. Şirin Gayrimenkul".
Ölçüm: profil ziyareti + DM/WhatsApp başlatma; saha gönderisinde takipçi dışı erişim + kaydetme; ikincil temas / 1.000 erişim;
beğeni sayısı ölçüt değil. ChatGPT üç şablon istendiği hâlde YALNIZ satış şablonunu yazdı; kiralama ve saha şablonları aşağıda Claude tarafından aynı kalıpla yazıldı.

**Claude notu:** Şablon metinleri kurallara uygun (fiyat/ücretsiz/sayı iddiası/yorum sayısı/ad-adres yok; ton ölçülü-kurumsal).
"Mülk sahipleri" ifadesi bizim dilde "ev sahipleri"; yayına girerse öyle yazılır. Üç konu da panel/saha işi: karar Özgün'de.

**Şablon 2, kiralama (Claude yazdı, ChatGPT'nin kalıbıyla):** Görsel: sitenin dış cephesi ya da ortak alanı, gerçek saha
fotoğrafı; üzerinde küçük "Kiralama süreci tamamlandı". Metin: "Eryaman'da bir konut için yürüttüğümüz kiralama süreci
tamamlandı. Kira bedelinin belirlenmesinden kiracı görüşmelerine, sözleşmeden teslime kadar süreci ev sahibi adına takip ettik.
Eryaman'da evini kiraya vermeyi düşünen ev sahipleri kiralama süreciyle ilgili bizimle iletişime geçebilir. Şirin Gayrimenkul".
Ölçüm: profil ziyareti + DM/WhatsApp başlatma; ikincil temas / 1.000 erişim.

**Şablon 3, saha bilgisi (Claude yazdı):** Görsel: belirli bir sitede çekilmiş gerçek saha fotoğrafı (blok cephesi, çevre
düzeni, ulaşım noktası); üzerinde site adı. Metin: "<Site adı>, <Mahalle> — bu hafta sahadaydık. Sitenin blok düzeni, tapu
niteliği ve çevresi hakkında güncel bilgiler sitemizdeki site sayfasında. Bu sitede daireniz varsa satış ya da kiralama için
bize yazabilirsiniz. Şirin Gayrimenkul". Ölçüm: takipçi dışı erişim + kaydetme; profil ziyareti; ikincil temas / 1.000 erişim.
Kural: fiyat, "ücretsiz", sayı/üstünlük iddiası, yorum sayısı, müşteri adı/adres yok; "kule" yok; Yenimahalle yok;
gerçek saha ziyareti yoksa paylaşılmaz.
