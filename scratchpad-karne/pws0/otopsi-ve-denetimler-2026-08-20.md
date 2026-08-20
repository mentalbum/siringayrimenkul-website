# Araştırma işleri 2-5: otopsi + denetim sonuçları (20.08.2026)

Uluslararası araştırma raporunun 2-5 numaralı işleri. Ham veri: scratchpad/otopsi.json,
icbag-sayim.txt.

## İş 3 — 155 dizinsizin otopsisi: SONUÇ TERS ÇIKTI

723 sayfanın gelen iç bağı build çıktısından sayıldı, dizin durumu ve kayıt
zenginliğiyle çakıştırıldı:

| alan | dizinde (568) | dizin dışı (155) |
|---|---:|---:|
| gelen iç bağ | 18,2 (medyan 17) | **26,8 (medyan 25)** |
| açıklama | 887 kr | 883 kr |
| özellik sayısı | 5,9 | 5,9 |
| koordinat / TKGM sınırı | ~%100 | ~%100 |
| **90 g gösterim** | **124,6 (medyan 79)** | **31,4 (medyan 3)** |

- Bağ kırılımı: 30+ bağ alan 68 sayfanın %69'u dizin dışı — çünkü tarama-öncelik
  mekanizması dizinsizlere zaten ekstra bağ pompalıyor. **Bağ pompası dizine
  sokmuyor** (nedensellik ters).
- İçerik zenginliği farkı SIFIR — "sayfa başına yeni metin" reddi üçüncü kez doğrulandı.
- Tek gerçek ayırıcı **sorgu talebi** (medyan 3'e 79). Google aranmayan sayfayı
  erteliyor — Illyes'in "tarama talebi" modeliyle birebir.

**İş 2 (iç bağ paketi) bu bulguyla DARALTILDI:**
- (a) "aynı mahalleden 6 komşu site bloğu" → ZATEN VAR (site şablonu, 6 kart).
- (c) "dizinsiz 155'e doğrudan bağ" → ZATEN VAR (lib/tarama-oncelikli.ts, 155
  ölçülmüş kayıt) ve otopsi bunun dizine sokmadığını gösterdi; artırılmayacak.
- (b) "çapa metnine mahalle bağlamı" → YAPILMADI: 6 kalıplık rotasyonlu çapa
  çeşitliliği zaten kurulu (Zyppy bulgusunun karşılığı); 7. varyantın marjinal
  getirisi, 723 sayfalık şablon değişikliği + sitemap tabanı ilerletme maliyetini
  karşılamıyor. Raporun +%7 emsalindeki mekanizma (bölge sayfaları arası bağ ağı)
  bizde mahalle↔etap↔site üçgeniyle zaten mevcut.

## İş 4 — ETag/304 + yönlendirme zinciri: TEMİZ

- `If-None-Match` → **304 dönüyor**; ETag içerik hash'i (deploy'da değişmeyen
  sayfa aynı kalır). "Her yayında yeni ETag" tuzağı YOK.
- Kanonik host'ta (https+www) eski adres → yeni adres **tek atlama 308**.
  http/apex girişlerinde 2-3 atlama var; normal (protokol+host normalizasyonu),
  sitemap'ler kanonik host kullandığı için Google'ın gördüğü yol tek atlama.

## İş 5 — hijyen + varlık + GBP

- **Sitemap hijyeni:** ana sitemap'teki 1.553 adresin 1.553'ünün build'de HTML
  karşılığı var; canlıda 30 rastgele örneklem 30/30 `200`. Temiz.
- **Organization/sameAs:** RealEstateAgent (@id'li) + logo + hasMap + 6 profilli
  sameAs ZATEN kuruluydu (layout.tsx). Tek ekleme: alternateName'e sosyal
  profillerin görünen adı ("Eryaman Emlakçı Şirin Gayrimenkul").
- **GBP UTM + landing tespiti:** GSC verisi GBP bağının ZATEN
  `/?utm_source=google&utm_medium=gbp` olduğunu gösteriyor — tespit ve etiket işi
  kapalı. Sterling Sky bulgusu gereği landing DEĞİŞTİRİLMEYECEK: anasayfa
  "eryaman emlakçı"da organik 1,9'da; iyi sıralanan sayfaya GBP bağlamanın
  organiği düşürebildiği iki kez ölçülmüş — mevcut düzen zaten güvenli taraf.
