# Sosyal Hesap Hijyeni — Uygulama Talimatı
*Tarih: 2026-08-22. Teşhisin kaynağı: sosyal-medya-plani.md §0 + bu tarihli dış tarama (Google dizini üzerinden; Instagram/Facebook'a doğrudan erişim oturum ortamında engelli). Etiketler: **[SEN]** = telefon/panel oturumu gerektirir, yalnız hesap sahibi yapabilir; **[CLAUDE]** = kod/site tarafı, sonuç bildirilince yapılır.*

## Özet teşhis (2026-08-22)

- **Instagram:** Hesabımız `@eryamansiringayrimenkul` (Özgün teyidi, 22.08). Google'da indeksli DEĞİL — muhtemel sebep 7 Ağustos "dolandırıcılık şüphesi" kısıtı sürecinde dizinden düşme. İndekste görünen tek IG sonucu: `@sirin.gayrimenkul`, görünen adı birebir "Eryaman Şirin Gayrimenkul" — **kimliği belirsiz.**
- **Facebook:** `profile.php?id=61585267540417` indeksli değil; `facebook.com/siringayrimenkull` ("Şirin Gayrimenkul | Ankara", ~9 beğeni) indeksli. **Hipotez:** ikisi AYNI sayfa — kullanıcı adı (vanity URL) alınmış bir sayfada Google ID'li adresi değil kanonik kullanıcı adlı adresi indeksler; 61… ile başlayan ID'ler yeni nesil sayfadır. Dışarıdan kesinleştirilemedi, §C'deki 1 dakikalık testle netleşir.
- **Ek bulgu:** `sites.google.com/view/siringayrimenkul` adresinde indeksli bir Google Sites sayfası var ("ŞİRİN GAYRİMENKUL"). Kim/ne zaman açtı belirsiz; içeriğine erişilemedi (§E).
- **Repo kodu temiz:** sitede `/models/` biçimli Matterport linki yok (`app/hakkimizda` zaten `/show/?m=` kullanıyor). `/models/` linki yalnız sosyal bio/paylaşımlarda kullanılmış olabilir — §A/6.

---

## A. Instagram — kendi hesabını dizine sokmak **[SEN, ~5 dk]**

1. Instagram → Profil → ☰ → **Ayarlar**. Hesap türü **Profesyonel (İşletme)** ve hesap **herkese açık** olmalı (Temmuz 2025'ten beri Google yalnız herkese açık profesyonel hesapları indeksliyor).
2. Ayarlar'ın arama kutusuna **"arama motoru"** yaz → **"Arama motorlarının profilinize bağlantı vermesine izin ver"** AÇIK olmalı. (İşletme hesabında varsayılan açıktır; 7 Ağustos kısıt sürecinde değişmiş olabilir — asıl şüpheli bu ayar.)
3. Çıkış yapılmış bir tarayıcıdan (gizli sekme) `instagram.com/eryamansiringayrimenkul` aç:
   - Giriş duvarı/karşılama görmek NORMAL — sorun değil.
   - **"Üzgünüz, bu sayfaya ulaşılamıyor"** görürsen kısıt tam kalkmamış demektir → uygulamadan tekrar itiraz et (Ayarlar → Yardım → Sorun bildir).
4. Ad alanı (name field) kontrolü: profil düzenle → Ad = **"Şirin Gayrimenkul | Eryaman Emlak"** tarzı anahtar kelimeli biçim (bio biçim kararı: platform-profil-metinleri.md §2 — bio'ya TELEFON YAZILMAZ, 7 Ağustos'u o tetikledi).
5. Bio linkinin `https://www.siringayrimenkul.com` olduğunu doğrula.
6. Bio'da veya gönderi/paylaşımlarda Matterport linki kullanılmışsa biçimi düzelt: `my.matterport.com/models/...` → `my.matterport.com/show/?m=...` (models biçimi tıklayana giriş duvarı gösterir).

## B. @sirin.gayrimenkul kimlik tespiti **[SEN, ~3 dk]**

1. Uygulamada `@sirin.gayrimenkul` profilini aç → sağ üst **⋯** → **"Bu hesap hakkında"**: katılım tarihi, ülke ve **eski kullanıcı adları** görünür. Profil fotoğrafına, gönderilere ve bio'ya bak.
2. Sonuca göre üç yol:

   **B1. Ofisin eski/unutulmuş hesabıysa** (erişimin varsa giriş yap):
   - Bio'yu şu yap: `Yeni adresimiz: @eryamansiringayrimenkul`
   - Şu metinle tek gönderi at ve sabitle:
     > Bu hesap taşındı. Eryaman'dan güncel içerikler ve 3D ev turları için: **@eryamansiringayrimenkul** · Şirin Gayrimenkul | Eryaman · siringayrimenkul.com
   - **Hesabı HEMEN SİLME.** Şu an marka aramasında Google'daki tek Instagram sonucu bu hesap; kendi hesabımız dizine girene kadar (aylık karnede teyit) yönlendirme tabelası olarak dursun, sonra kapatılır.
   - Erişim yoksa (şifre kayıp): giriş ekranından kurtarma dene; olmazsa B2'deki taklit yolu YERİNE Instagram'ın hesap kurtarma kanalını zorla — kendi eski hesabını taklit diye şikayet etme.

   **B2. Taklit/sahte hesapsa** (bizim değil ve adımızı kullanıyor):
   - Profil → ⋯ → **Şikayet Et → "Birinin kimliğine bürünüyor" → "Bir işletmenin"**.
   - Elde hazır dursun: Taşınmaz Ticareti Yetki Belgesi (No: 0603771), vergi levhası, tabela/ofis fotoğrafı.
   - EİDS döneminde sahte emlak hesabıyla kapora dolandırıcılığı yaygın — sonuç gelmezse ATEM'e ve gerekirse savcılığa bildirmek meşru; aceleye gerek yok ama takipte kal.

   **B3. Başka meşru işletmeyse** (ör. benzer adlı ayrı firma): görünen adındaki "Eryaman Şirin Gayrimenkul" ifadesini ayrıştırmasını iste (telefonla, nazikçe). Ayrışmazsa B2 yolu açık — görünen ad birebir bizim marka + bölgemiz.

3. Sonucu (B1/B2/B3 hangisi çıktı) not et — aylık sosyal karneye girecek ve plandaki §0/1 maddesi kapanacak.

## C. Facebook doğrulaması **[SEN, ~2 dk]** → sonucu Claude'a bildir

> **DURUM (2026-08-22, ekran görüntüsüyle teyit):** Sayfa adı "Eryaman Emlakçı
> Şirin Gayrimenkul" yapıldı, kullanıcı adı **eryamanemlakci** alındı, bio'da
> NAP + yetki belgesi var. `lib/site-config.ts` yeni vanity adrese çevrildi.
> KALAN üç kontrol: (1) `facebook.com/siringayrimenkull` hâlâ açılıyor mu? —
> açılıyorsa AYRI bir sayfa demektir (aşağıdaki C3 uygulanır: bizimse
> birleştir/kapat, değilse taklit bildir); yönlendiriyor/404 veriyorsa eski
> kullanıcı adıydı, konu kapandı. (2) `profile.php?id=61585267540417` yeni
> sayfaya mı gidiyor? — gitmiyorsa ortada eski bir mükerrer sayfa var,
> birleştir/sil. (3) Kategori "Emlak Danışmanı" görünüyor → planlanan
> **"Emlak Acentesi"** (ofis kategorisi; GBP ile tutarlı). Ayrıca C2'deki
> vitrin işleri (Hakkında'ya §3 metni + site linki, WhatsApp/Ara butonları,
> saatler) hâlâ yapılacaklar listesinde.

1. Tarayıcıda `facebook.com/profile.php?id=61585267540417` aç (sayfa yöneticisi hesabıyla ya da çıkış yapılmış tarayıcıdan):
   - Adres çubuğu kendiliğinden **`/siringayrimenkull/`**'a dönüyorsa → **AYNI SAYFA**, kayıp sayfa yok. C2'ye geç.
   - Dönmüyorsa: sayfa paneli → **Ayarlar → Kullanıcı adı** alanına bak. Kullanıcı adı boşsa ve `siringayrimenkull` başka bir sayfaysa → C3'e geç.
2. **AYNI SAYFAYSA yapılacaklar:**
   - **[CLAUDE]** Bana "aynı sayfa, kullanıcı adı siringayrimenkull" de → `lib/site-config.ts`'teki `facebookUrl`'i vanity adrese çeviririm (`profile.php?id=` biçimi arama görünürlüğü üretmiyor).
   - İSTERSEN kullanıcı adını `eryamansiringayrimenkul` olarak değiştir (Ayarlar → Kullanıcı adı): sahibinden mağazası ve Instagram ile birebir aynı olur (NAP tutarlılığı). Sayfa ~9 beğeniyle yeniyken değişimin maliyeti sıfıra yakın. Değiştirirsen bana YENİ adı bildir, site linkini ona göre yazarım.
   - Sayfa adını planlanan biçime çevir: **"Şirin Gayrimenkul — Eryaman Emlakçı"** (platform-profil-metinleri.md §3 — henüz uygulanmadığı dışarıdan görülüyor).
   - Hakkında metnini §3'teki onaylı metinle doldur (şu anki açıklama jenerik yer tutucu).
   - Kategori: **Emlak Acentesi**; adres, çalışma saatleri, **Ara** butonu ve **WhatsApp** butonu (Ayarlar → WhatsApp → numara doğrulama).
   - İki görünürlük kontrolü: Ayarlar → sayfa **yayında mı** (yayından kaldırılmış sayfa dizine hiç girmez) ve **ülke/yaş kısıtlaması** var mı (kısıt varsa çıkış yapmış kullanıcı da Google botu da sayfayı göremez).
3. **FARKLI SAYFAYSA yapılacaklar:**
   - Kendi sayfana (ID'li) kullanıcı adı al: önerim `eryamansiringayrimenkul`.
   - `siringayrimenkull` bizim adımızı kullanan başka bir kayıtsa: sayfadan **Şikayet Et → sahte sayfa/kimliğe bürünme** bildir.
   - **[CLAUDE]** Aldığın kullanıcı adını bana bildir → site linkini güncellerim.

## D. GBP + Yandex — sosyal profil linkleri **[SEN, ~5 dk]**

İndekslenmeyi hızlandıran en ucuz dış sinyal:

1. **Google Business Profile:** Profili düzenle → İletişim → **Sosyal profiller** → Instagram, TikTok, Facebook linklerini ekle (Instagram: `https://www.instagram.com/eryamansiringayrimenkul/`; Facebook: C'de netleşen adres).
2. **Yandex Business** (yandex.com.tr/sprav): aynı üç linki işletme kartına ekle.
3. bulurum.com / sektortanitim.com kayıtları yapıldıysa oralara da aynı linkler.

## E. Google Sites sayfası **[SEN, ~2 dk]**

`sites.google.com/view/siringayrimenkul` — marka aramasında çıkıyor, kim açtı belirsiz (muhtemelen geçmişte künye/citation için bizden biri).

1. Sayfayı aç, içeriğine bak. Bizimse: NAP'ı ortak standarda çek (platform-profil-metinleri.md), siteye ve doğru sosyal profillere link verdiğinden emin ol — bedava bir künye + backlink.
2. Hangi Google hesabıyla açıldığını bul (muhtemelen ofis Gmail'i); erişim yoksa ve içerik yanlış/eskiyse Google'a kaldırma bildirimi bir seçenek — ama içerik doğruysa dursun, zararı yok.
3. Bizim değilse ve yanıltıcıysa not et — B2/C3'teki taklit dosyasına eklenir.

## F. Kapanış

- B ve C sonuçlarını Claude'a bildir → plan (§0) ve site-config güncellenir, artifact tazelenir.
- Instagram indekslenme takibi: bir sonraki aylık karne turunda `site:instagram.com/eryamansiringayrimenkul` kontrolü (serp-olcum disipliniyle). Beklenti: ayarlar düzgünse birkaç hafta.
- Bu dosyadaki işler bitince sosyal-medya-plani.md "İlk 2 hafta" listesinin Gün 1-2 maddeleri kapanmış olur.
