/**
 * TTBS/yetki belgesi yazısının mezar taşı — 410 Gone.
 *
 * Yazı 2026-07-31'de Özgün'ün kararıyla silindi: "ttbs sorgulama",
 * "emlak yetki belgesi sorgulama" gibi Türkiye geneli sorgular müşteri değeri
 * olmayan trafik getiriyordu. Ama silmek yetmedi — adres /blog'a 301'lendiği
 * için Google onu canlı saymaya devam etti (10 gün sonra hâlâ günde ~90
 * gösterim) ve o sorguların sinyalini blog dizinine taşıdı.
 *
 * Bu yüzden yönlendirme next.config.ts'ten kaldırıldı ve adres artık açıkça
 * "bu sayfa kalıcı olarak yok" diyor. 410, 404'e göre daha kesin bir sinyal:
 * Google adresi daha çabuk düşürür ve yeniden taramaya daha az bütçe harcar.
 *
 * Bir statik segment, [slug] dinamik segmentinden önce gelir; yazı zaten
 * silindiği için generateStaticParams bu slug'ı üretmiyor, çakışma yok.
 *
 * Gövde ziyaretçi için var: eski bir bağlantıdan gelen insan boş ekran değil
 * yol tarifi görsün. Aynı gerekçeyle kapatılan başka bir adres olursa bu
 * dosya kopyalanabilir.
 */

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
  <p>Emlakçı yetki belgesi sorgulama yazısı yayından tamamen kaldırıldı.
     Biz Eryaman ve çevresindeki konutlarla ilgileniyoruz; bölgeye dair
     yazılarımıza ve site rehberimize aşağıdan ulaşabilirsiniz.</p>
  <a href="/blog">Eryaman Blog</a>
  <a class="ikincil" href="/">Anasayfa</a>
</main>
</body>
</html>`;

export function GET() {
  return new Response(GOVDE, {
    status: 410,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Bir gün önbellek: arama motoru sinyali sabit, insan trafiği yok denecek
      // kadar az. Kalıcı önbellek istemiyoruz ki adres ileride bir gün geri
      // açılırsa (açılmayacak ama) taş kesilmiş yanıt takılı kalmasın.
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
