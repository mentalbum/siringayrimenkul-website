# GSC API kurulumu (bir kere, ~5 dakika, Özgün'ün tıklamaları gerekir)

Amaç: URL denetimlerini tarayıcı UI'si yerine resmî Search Console API'den
yapmak. Servis hesabı yöntemi seçildi çünkü OAuth ekranı/yenileme derdi yok:
tek JSON anahtar dosyası yeter.

## Özgün'ün yapacakları (Claude yapamaz — hesap açma/yetki verme işlemi)

1. https://console.cloud.google.com → **ozgundeniss@gmail.com** ile gir
   (GSC mülkünün sahibi bu hesap).
2. Yeni proje oluştur (adı önemsiz, ör. `gsc-api`). Faturalama GEREKMEZ.
3. "API'ler ve Hizmetler" → "Kitaplık" → **Google Search Console API** → Etkinleştir.
4. "Kimlik Bilgileri" → "Kimlik bilgisi oluştur" → **Hizmet hesabı**. Ad: `gsc-okuyucu`.
   Rol vermene gerek yok, "Bitti" de.
5. Oluşan hizmet hesabına tıkla → "Anahtarlar" → "Anahtar ekle" → **JSON** →
   dosya iner. Dosyayı şuraya taşı: `~/.config/gsc-servis-anahtari.json`
6. Hizmet hesabının e-postasını kopyala (`gsc-okuyucu@...iam.gserviceaccount.com`)
   → https://search.google.com/search-console → Ayarlar → Kullanıcılar ve izinler
   → "Kullanıcı ekle" → bu e-postayı **Tam** yetkiyle ekle.

Adım 6 kritik: servis hesabı GSC mülküne kullanıcı olarak eklenmeden API
"izin yok" der.

## Doğrulama (Claude yapar)

```bash
node scripts/gsc-api.mjs denetle https://www.siringayrimenkul.com/
```

"URL_IS_ON_GOOGLE" benzeri bir hüküm dönerse kanal açık demektir.

## Ne işe yarar / yaramaz

- ✅ URL denetimi: günde 2000 sorgu (UI'de tek tek elle idi).
- ✅ Performans verisi (sorgular/sayfalar) — CSV zip indirme derdi biter
  (Türkçe dosya adı zip'i kırıyordu).
- ✅ Sitemap durumu/gönderimi.
- ❌ Dizine ekleme İSTEĞİ — API'den gönderilemez, UI'den devam.
