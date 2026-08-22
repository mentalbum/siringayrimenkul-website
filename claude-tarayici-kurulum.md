# Claude'a Tarayıcı Kontrolü Kurulumu — "sen yap" gerçekten çalışsın
*Tarih: 2026-08-22. Amaç: Facebook sayfa paneli, Google Business Profile, Yandex gibi oturum gerektiren panel işlerini Claude'un Özgün'ün bilgisayarındaki, oturumu açık tarayıcıda BİZZAT tıklayarak yapabilmesi. Bilgiler resmî dokümanlardan doğrulandı (code.claude.com/docs/en/chrome). ÖNEMLİ: claude.ai/code üzerindeki uzak (web) oturumlar tarayıcıya bağlanamaz — kurulumdan sonra bu işler bilgisayardaki YEREL oturumda yapılır.*

## A yolu (önerilen): Claude Chrome eklentisi

Claude, senin gerçek Chrome'unda, senin açık oturumlarınla (Facebook, GBP…) görünür bir pencerede çalışır; her adımı izlersin.

1. **Eklentiyi kur:** Chrome'da [claude.ai/chrome](https://claude.ai/chrome) → eklentiyi ekle → Claude hesabınla giriş yap.
   - Plan şartı: Pro/Max/Team (Pro hesaplara dağıtım kademeli — sende görünmüyorsa B yoluna geç).
   - Chrome ve Edge resmî destekli; Firefox desteklenmiyor.
2. **Bilgisayara Claude'u kur** (en kolayı masaüstü uygulaması):
   - [claude.com/download](https://claude.com/download) → indir, kur, aynı Claude hesabıyla giriş yap. Eklenti otomatik bağlanır.
   - (Terminal tercih edersen — Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`, macOS: `curl -fsSL https://claude.ai/install.sh | bash`. Oturumda tarayıcıyı `claude --chrome` ile aç; kalıcı yapmak için `/chrome` → "Enabled by default".)
3. **İzin modunu ayarla:** İlk kullanımda **"Manually approve"** (her adımda onay) modunda başla; alışınca otomatik onaya geçersin. Eklenti ayarlarındaki "Your approved sites" listesine önce yalnız `facebook.com` ve `business.google.com` ekle — dar başla.
4. **Repo'yu bilgisayara al (önerilir):** `git clone https://github.com/mentalbum/siringayrimenkul-website` — Claude'u bu klasörde başlatırsan talimat dosyalarını (sosyal-hesap-hijyeni.md vb.) kendisi okur. Klonlamadan da çalışır; o zaman aşağıdaki hazır mesajı kullan.
5. **İlk iş — hazır mesaj** (yerel oturuma yapıştır):

   > Chrome'umda facebook.com/eryamanemlakci sayfamın yönetim panelini aç ve şunları yap: (1) kategoriyi "Emlak Danışmanı"ndan "Emlak Acentesi"ne çevir; (2) Sayfa bilgisi'ne web sitesi https://www.siringayrimenkul.com, çalışma saatleri Pzt-Cmt 09:00-19:00 / Pazar 09:00-17:00 ve repo'daki platform-profil-metinleri.md §3'teki Hakkında metnini ekle; (3) Ayarlar → WhatsApp'tan 0532 363 96 60'ı doğrula ve eylem düğmesini "WhatsApp'tan mesaj gönder" yap; (4) facebook.com/siringayrimenkull ile facebook.com/profile.php?id=61585267540417 adreslerini aç, ne gördüğünü raporla (sosyal-hesap-hijyeni.md §C DURUM notundaki kontroller). Yayın/paylaşım niteliğinde hiçbir şey gönderme; her kaydetmeden önce bana göster.

## B yolu (eklenti açılmadıysa): Playwright MCP

Claude ayrı bir Chromium penceresi açar; o pencerede Facebook'a **kendin giriş yaparsın** (şifre Claude'a asla verilmez, Facebook'un kendi sayfasına sen yazarsın). Profil kalıcıdır — bir kez giriş yeter.

1. Claude Code'u kur (yukarıdaki komutlar). Node.js 18+ gerekli (`node --version` ile bak).
2. Terminalde: `claude mcp add playwright -- npx -y @playwright/mcp@latest`
3. Claude'u başlat, "tarayıcıyı aç, facebook.com'a git" de; açılan pencerede giriş yap; sonra A/5'teki hazır mesajı ver.

## Güvenlik kuralları (değişmez)

- **Şifreni hiçbir zaman Claude'a yazma/söyleme** — girişleri her zaman sen yaparsın; Claude açık oturumu kullanır.
- İlk haftalarda her adımı onaylayarak çalıştır; özellikle "kaydet/yayınla" tıklamalarında.
- Claude'a gönderi paylaşma/mesaj yollama yetkisini varsayılan verme — panel/ayar işleriyle sınırla; içerik yayını ayrıca konuşulur.
- Site izin listesini dar tut: yalnız o gün çalışılacak paneller.

## Doğrulanamayanlar / notlar

- Pro planda eklenti dağıtımının Ağustos 2026'da herkese ulaşıp ulaşmadığı doğrulanamadı — sende görünmüyorsa B yolu her planda çalışır.
- Windows'ta WSL üzerinden eklenti çalışmaz; normal Windows kurulumu kullan.
