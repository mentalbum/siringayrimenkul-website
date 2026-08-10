import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * KALDIRILAN BLOG ADRESLERİ — 410 Gone.
 *
 * Bu 25 yazı "Türkiye geneli, müşteri değeri olmayan trafik" gerekçesiyle
 * silindi (TTBS yazısı 2026-07-31; 24 genel konulu yazı 2026-08-07). Hepsi
 * next.config.ts'te /blog'a 301'leniyordu ve işe yaramadı: TTBS adresi
 * silinmesinden on gün sonra bile GSC'de günde ~90 gösterim alıyordu.
 * Yönlendirme adresi Google'ın gözünde canlı tutuyor ve o sorguların
 * sinyalini blog dizinine taşıyor — trafik ölmüyor, adres değiştiriyor.
 *
 * 410, 404'ten kesin bir sinyaldir: Google adresi daha çabuk düşürür ve
 * yeniden taramaya bütçe harcamaz (tarama bütçesi bu sitenin darboğazı).
 *
 * KURALLAR
 * - Bu adresleri robots.txt'e ASLA ekleme: engellenen adresin 410'u
 *   görülemez, adres dizinde asılı kalır.
 * - Bir yazı YAŞAYAN bir varise taşınıyorsa buraya değil, next.config.ts'teki
 *   redirects listesine 301 olarak yazılır. Burası sadece "içerik yok,
 *   yerine de bir şey yok" durumu içindir.
 * - Yeni kapatılan adres: aşağıdaki listeye bir satır ekle, yeter.
 */
const KALDIRILAN_YAZILAR = new Set([
  // Yetki belgesi / TTBS (2026-07-31)
  "/blog/emlakci-yetki-belgesi-sorgulama",
  // Genel konulu blog temizliği (2026-08-07): blog SADECE Eryaman'la ilgili
  // olacak. YENİDEN AÇMA.
  "/blog/dairenizi-kiraya-verirken-dikkat-edilmesi-gerekenler",
  "/blog/emlakci-komisyonu-nasil-isler",
  "/blog/emlakci-yetki-sozlesmesi-rehberi",
  "/blog/emlakcisiz-ev-satilir-mi",
  "/blog/emlakciya-vekalet-verme-rehberi",
  "/blog/ev-satarken-gerekli-evraklar",
  "/blog/ev-satarken-odenecek-vergiler",
  "/blog/evimi-satmak-mi-kiraya-vermek-mi",
  "/blog/eviniz-satilmiyor-mu",
  "/blog/evinizi-kiraya-verdikten-sonra",
  "/blog/evinizi-satarken-dogru-emlakci-secimi",
  "/blog/evinizi-satisa-hazirlamak",
  "/blog/evinizin-degerini-nasil-ogrenebilirsiniz",
  "/blog/hisseli-ipotekli-ev-satisi",
  "/blog/kat-irtifakindan-kat-mulkiyetine-gecis",
  "/blog/kira-artisi-nasil-hesaplanir",
  "/blog/kira-sozlesmesinde-dikkat-edilmesi-gerekenler",
  "/blog/kira-tespit-davasi-rehberi",
  "/blog/kiraci-evi-gostermiyor-ne-yapmaliyim",
  "/blog/kiraci-tahliye-sureci",
  "/blog/kiraci-tahliye-taahhutnamesi-rehberi",
  "/blog/kiracili-ev-satilir-mi",
  "/blog/miras-kalan-ev-nasil-satilir",
  "/blog/tapu-ada-parsel-nasil-okunur",
]);

/** Eski bir bağlantıdan gelen insan boş ekran değil yol tarifi görsün. */
const GOVDE = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Bu Sayfa Kaldırıldı</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
         background: #f7f7f5; color: #1c2b45;
         font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 34rem; padding: 2rem 1.5rem; text-align: center; }
  h1 { font-size: 1.6rem; margin: 0 0 1rem; }
  p { line-height: 1.7; color: #45526b; margin: 0 0 1.5rem; }
  a { display: inline-block; margin: 0 .35rem; padding: .7rem 1.4rem; border-radius: 999px;
      background: #d4a437; color: #1c2b45; font-weight: 600; text-decoration: none; }
  a.ikincil { background: transparent; border: 1px solid #d5d5cf; color: #1c2b45; }
</style>
</head>
<body>
<main>
  <h1>Bu sayfa kaldırıldı</h1>
  <p>Aradığınız yazı yayından tamamen kaldırıldı. Biz Eryaman ve çevresindeki
     konutlarla ilgileniyoruz; bölgeye dair yazılarımıza ve site rehberimize
     aşağıdan ulaşabilirsiniz.</p>
  <a href="/blog">Eryaman Blog</a>
  <a class="ikincil" href="/">Anasayfa</a>
</main>
</body>
</html>`;

export function proxy(request: NextRequest) {
  // Sondaki eğik çizgiyi burada temizlemeye gerek yok: Next, proxy'den ÖNCE
  // "/adres/" biçimini 308 ile "/adres"e normalleştiriyor, o da buraya düşüp
  // 410 dönüyor (ölçüldü).
  if (KALDIRILAN_YAZILAR.has(request.nextUrl.pathname)) {
    return new NextResponse(GOVDE, {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Bir gün önbellek: sinyal sabit, insan trafiği yok denecek kadar az.
        // Kalıcı önbellek istemiyoruz ki liste değişirse yanıt takılı kalmasın.
        "cache-control": "public, max-age=0, s-maxage=86400",
      },
    });
  }

  return NextResponse.next();
}

// Yalnızca blog adresleri: yaşayan yazılar da bu eşikten geçiyor ama iş bir
// Set aramasından ibaret. Sitenin geri kalanı (mahalle/site/ada sayfaları,
// statik dosyalar) proxy'ye hiç uğramıyor.
export const config = {
  matcher: "/blog/:path*",
};
