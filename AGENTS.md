<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sitemap tazelik sinyali

`content/` altında bir dosyayı değiştirdiysen, **commit'ten önce**:

```bash
npm run lastmod
```

`content/lastmod.json`'u aynı commit'e ekle. Sitemap'in `lastModified` değerleri buradan okunuyor; dosya sistemi mtime'ı **kullanılamaz** çünkü Vercel her yayında repoyu sıfırdan çekiyor ve 1500+ adresin tamamına aynı build damgasını basıyor — Google böyle bir lastmod'u tümden yok sayıyor (gerekçe: `lib/content.ts`).

Paralel bir oturumun commit'lenmemiş işi ağaçta duruyorsa `npm run lastmod -- --yalniz-gecmis` kullan: varsayılan kip, çalışma ağacındaki her değişik dosyaya "bugün" damgası basar ve senin commit'ine girmeyecek sayfalar için yanlış tazelik sinyali üretir.

Bir **şablon** (JSX) topluca değişince içerik dosyaları değişmez ama sayfalar değişir: `app/sitemap.ts` içindeki `SABLON` tabanlarını ve statik sayfa tarihlerini elle güncelle.

**Ama küresel boilerplate tabanı ilerletmez.** Footer, başlık çubuğu, çerez
bandı gibi HER sayfada duran bir blok değiştiğinde `SABLON` tabanlarına
dokunma. Gerekçe ölçüldü: 27.08'de Yenimahalle footer'dan çıkarılınca dört
taban birden 27.08'e çekildi ve 31.08'de canlı sitemap'teki **1.178 adresin
1.146'sı aynı damgayı taşıyordu** — yani tazelik sinyali tümüyle düzleşmişti.
Taban yalnızca o AİLENİN görünen içeriğini değiştiren şablon işinde ilerler
(ör. ada sayfasından bir SSS silinmesi ada tabanını ilerletir, footer'a bağ
eklenmesi hiçbirini ilerletmez).
