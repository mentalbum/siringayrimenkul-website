import { track } from "@vercel/analytics";

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
 *
 * 2026-10-07 — VERCEL AYNASI: rıza bandı geri geldiği için GA artık yalnız
 * "Kabul et" diyenleri sayar (lib/cerez-rizasi.ts). Telefon/WhatsApp/sahibinden
 * tıklamaları gibi dönüşüm olaylarının TAMAMI görülebilsin diye her "event"
 * komutu Vercel Web Analytics'e de (track) kopyalanır: çerezsiz, kimliksiz,
 * rıza gerektirmez (/gizlilik "çerezsiz toplu ölçüm"). Özel olaylar Vercel'in
 * Hobby planında toplanmaz, Pro'da panelde görünür — kod her iki planda
 * zararsız. gtag tarafı değişmedi: rıza yoksa gtag.js hiç yüklenmez, kuyruk
 * boşa akar.
 */
export function sendGAEvent(..._args: unknown[]): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ||= []).push(arguments);
  // eslint-disable-next-line prefer-rest-params
  const [komut, ad, params] = arguments as unknown as [unknown, unknown, unknown];
  if (komut !== "event" || typeof ad !== "string") return;
  try {
    const ozellikler: Record<string, string | number | boolean | null> = {};
    if (params && typeof params === "object") {
      for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null)
          ozellikler[k] = v;
      }
    }
    track(ad, ozellikler);
  } catch {
    // Ayna ölçüm hiçbir zaman asıl akışı bozmaz.
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
