/** @next/third-parties'in sendGAEvent'inin bağımsız eşdeğeri.
 *
 * Neden kendi kopyamız var: kütüphanenin GoogleAnalytics bileşeni gtag.js'i
 * hidrasyonla birlikte (afterInteractive) yüklüyor ve ana sayfa mobil LCP'sine
 * ölçülmüş ~1,6 sn maliyet bindiriyordu. Biz gtag.js'i boşta (lazyOnload)
 * yüklüyoruz; dataLayer ise gövdedeki satır içi bootstrap ile İLK byte'tan
 * itibaren hazır. Erken tıklama olayları dataLayer'da kuyruklanır, gtag.js
 * gelince sırayla işlenir — hiçbir olay kaybolmaz.
 *
 * Dikkat: gtag.js yalnız gerçek `arguments` nesnesini komut sayar (düz dizi
 * saymaz). O yüzden burada arrow function DEĞİL, klasik function + arguments
 * kullanılıyor — kütüphanenin kendi uygulamasıyla birebir aynı davranış.
 */
export function sendGAEvent(..._args: unknown[]): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ||= []).push(arguments);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
