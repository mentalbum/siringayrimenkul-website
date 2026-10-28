# Ev sahibi iletişim düzenlemesi — 28 Ekim 2026

Değerleme formunda ad ve telefon zorunluluğu kaldırıldı. Satış ve kiralama eşit,
başlangıçta seçilmemiş seçeneklerdir. `?niyet=satis|kiralama` geçerli bir seçim
taşıyorsa ön seçim yapılır. Mevcut `?mahalle=&site=` aktarımı ve mahalle değişince
siteyi temizleme davranışı korunur. Genel iletişim formu diğer talepleri de kabul eder.

İsim, telefon, m², oda sayısı ve not isteğe bağlı, başlangıçta kapalı ayrıntılardır.
WhatsApp ve SMS aynı talep doğrulamasını kullanır. Düğmeler uygulamaya geçişi anlatır;
mesajın gönderilmesi ziyaretçinin uygulamadaki gönder düğmesine bağlıdır.

Ana sayfa ve hakkımızda bölümündeki site sayısıyla üstünlük ifadeleri, görünür
Google puanı ve yıldızlar kaldırıldı. Google yorumlarına doğrudan bağlantı korunur
ve artık Places API yanıtına bağlı değildir. Değerleme formu mobilde açıklama
kartlarının önünde gelir ve danışmanın adını gösterir.

## Ölçüm

| Olay | Ne sayar? | Parametreler |
| --- | --- | --- |
| `contact_form_view` | Formun ekranla ilk kesişmesi, her bileşen açılışında bir kez | `form` |
| `contact_form_start` | Ziyaretçinin ilk alan değişikliği; URL ile ön doldurma sayılmaz | `form` |
| `contact_form_submit` | WhatsApp/SMS uygulamasına geçiş girişimi; geçmiş olay adı korunur | `form`, `kanal`, `niyet`, `mahalle`, `site`, `asama=uygulamaya_gecis` |

`form`: `degerleme` veya `iletisim`; `niyet`: `satis`, `kiralama` veya `diger`.
Ad, telefon ve serbest metin olay parametrelerine eklenmez. Mevcut analiz yükleme
ve rıza davranışı bu paket tarafından değiştirilmez. Olayların raporda özel boyut
olarak kullanılması için GA4 yönetiminde ayrıca tanımlanması gerekir.

`contact_form_submit` teslim edilmiş mesaj, gerçek görüşme veya yeni portföy değildir.
Yeni sürümün yayın tarihi rapora işaretlenmelidir. Önceki dönemlerde talep satışa
otomatik atanıyordu; yeni niyet dağılımıyla doğrudan karşılaştırılmamalıdır.

Gerçek görüşmede danışmanın kaydedeceği alanlar: ilk keşif kaynağı, görüşme öncesi
web sitesine bakılıp bakılmadığı, ev sahibi/alıcı/kiracı, satış/kiralama, mahalle/site,
görüşme/randevu/portföy sonucu ve varsa ilerlememe nedeni. Bunlar kamuya açık web
sitesinde veya analiz olaylarında kişisel bilgi olarak tutulmamalıdır.

## Deneylerin korunması

`content/`, site sayfası şablonu, başlık deneyi kodu ve deney kolları değiştirilmedi.
Site sayfalarının başlık/açıklama/gövdesi ve komşu kartları bu paketten etkilenmez.
Sitemap'te yalnız değişen dört statik sayfanın ve mahalle şablonunun tarihi ilerler;
site, ada ve etap tabanları korunur. Başlık deneyinin 4 Kasım ara ve 17 Kasım nihai
okuması için yeni karar eşiği veya sonuç üretilmedi.

Açık PR #118'in site/mahalle WhatsApp düğmesi ayrımı bu pakete alınmadı. O PR daha
sonra birleştirilirken ortak form dosyasındaki çakışma çözümünde bu paketin isteğe
bağlı alanları, nötr ilk seçimi ve olay parametreleri korunmalıdır.
